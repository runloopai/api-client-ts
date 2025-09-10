// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'devboxes.logs',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/devboxes/{id}/logs',
  operationId: 'listDevboxLogs',
};

export const tool: Tool = {
  name: 'list_devboxes_logs',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nGet all logs from a running or completed Devbox.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/devbox_logs_list_view',\n  $defs: {\n    devbox_logs_list_view: {\n      type: 'object',\n      properties: {\n        logs: {\n          type: 'array',\n          description: 'List of logs for the given devbox.',\n          items: {\n            type: 'object',\n            properties: {\n              level: {\n                type: 'string',\n                description: 'Log line severity level.'\n              },\n              source: {\n                type: 'string',\n                description: 'The source of the log.',\n                enum: [                  'setup_commands',\n                  'entrypoint',\n                  'exec',\n                  'files',\n                  'stats'\n                ]\n              },\n              timestamp_ms: {\n                type: 'integer',\n                description: 'Time of log (Unix timestamp milliseconds).'\n              },\n              cmd: {\n                type: 'string',\n                description: 'The Command Executed'\n              },\n              cmd_id: {\n                type: 'string',\n                description: 'Identifier of the associated command the log is sourced from.'\n              },\n              exit_code: {\n                type: 'integer',\n                description: 'The Exit Code of the command'\n              },\n              message: {\n                type: 'string',\n                description: 'Log line message.'\n              },\n              shell_name: {\n                type: 'string',\n                description: 'The Shell name the cmd executed in.'\n              }\n            },\n            required: [              'level',\n              'source',\n              'timestamp_ms'\n            ]\n          }\n        }\n      },\n      required: [        'logs'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      execution_id: {
        type: 'string',
        description: 'ID of execution to filter logs by.',
      },
      shell_name: {
        type: 'string',
        description: 'Shell Name to filter logs by.',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id'],
  },
  annotations: {
    readOnlyHint: true,
  },
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.devboxes.logs.list(id, body)));
};

export default { metadata, tool, handler };
