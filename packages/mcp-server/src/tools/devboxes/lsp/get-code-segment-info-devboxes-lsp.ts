// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'devboxes.lsp',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/devboxes/{id}/lsp/get-code-segment-info',
  operationId: 'GetCodeSegmentInfo',
};

export const tool: Tool = {
  name: 'get_code_segment_info_devboxes_lsp',
  description:
    'Get the symbol, reference, and diagnostic information for a given code segment in a file at a given depth',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      symbolName: {
        type: 'string',
      },
      uri: {
        $ref: '#/$defs/file_uri',
      },
      symbolType: {
        $ref: '#/$defs/symbol_type',
      },
    },
    required: ['id', 'symbolName', 'uri'],
    $defs: {
      file_uri: {
        type: 'string',
      },
      symbol_type: {
        type: 'string',
        enum: ['function', 'variable', 'class', 'interface', 'type'],
      },
    },
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, ...body } = args as any;
  return asTextContentResult(await client.devboxes.lsp.getCodeSegmentInfo(id, body));
};

export default { metadata, tool, handler };
