// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ClientOptions } from '@runloop/api-client';
import Runloop from '@runloop/api-client';
import { codeTool } from './code-tool';
import docsSearchTool from './docs-search-tool';
import { getInstructions } from './instructions';
import { McpOptions } from './options';
import { blockedMethodsForCodeTool } from './methods';
import { HandlerFunction, McpRequestContext, ToolCallResult, McpTool } from './types';

export const newMcpServer = async (stainlessApiKey: string | undefined) =>
  new McpServer(
    {
      name: 'runloop_api_client_api',
      version: '1.12.0',
    },
    {
      instructions: await getInstructions(stainlessApiKey),
      capabilities: { tools: {}, logging: {} },
    },
  );

/**
 * Initializes the provided MCP Server with the given tools and handlers.
 * If not provided, the default client, tools and handlers will be used.
 */
export async function initMcpServer(params: {
  server: Server | McpServer;
  clientOptions?: ClientOptions;
  mcpOptions?: McpOptions;
  stainlessApiKey?: string | undefined;
}) {
  const server = params.server instanceof McpServer ? params.server.server : params.server;

  let _client: Runloop | undefined;
  let _clientError: Error | undefined;

  const getClient = (): Runloop => {
    if (_clientError) throw _clientError;
    if (_client) return _client;

    try {
      _client = new Runloop({
        ...params.clientOptions,
        defaultHeaders: {
          ...params.clientOptions?.defaultHeaders,
          'X-Stainless-MCP': 'true',
        },
      });
      return _client;
    } catch (e) {
      _clientError = e instanceof Error ? e : new Error(String(e));
      throw _clientError;
    }
  };

  const providedTools = selectTools(params.mcpOptions);
  const toolMap = Object.fromEntries(providedTools.map((mcpTool) => [mcpTool.tool.name, mcpTool]));

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: providedTools.map((mcpTool) => mcpTool.tool),
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const mcpTool = toolMap[name];
    if (!mcpTool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    let client: Runloop;
    try {
      client = getClient();
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Failed to initialize client: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }

    return executeHandler({
      handler: mcpTool.handler,
      reqContext: {
        client,
        stainlessApiKey: params.stainlessApiKey ?? params.mcpOptions?.stainlessApiKey,
      },
      args,
    });
  });
}

/**
 * Selects the tools to include in the MCP Server based on the provided options.
 */
export function selectTools(options?: McpOptions): McpTool[] {
  const includedTools = [];

  if (options?.includeCodeTool ?? true) {
    includedTools.push(
      codeTool({
        blockedMethods: blockedMethodsForCodeTool(options),
        codeExecutionMode: options?.codeExecutionMode ?? 'stainless-sandbox',
      }),
    );
  }
  if (options?.includeDocsTools ?? true) {
    includedTools.push(docsSearchTool);
  }
  return includedTools;
}

/**
 * Runs the provided handler with the given client and arguments.
 */
export async function executeHandler({
  handler,
  reqContext,
  args,
}: {
  handler: HandlerFunction;
  reqContext: McpRequestContext;
  args: Record<string, unknown> | undefined;
}): Promise<ToolCallResult> {
  return await handler({ reqContext, args: args || {} });
}
