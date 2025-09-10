// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'devboxes.lsp',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/devboxes/{id}/lsp/document-symbols',
  operationId: 'GetDocumentSymbols',
};

export const tool: Tool = {
  name: 'document_symbols_devboxes_lsp',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nGet document symbols for a given document.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/document_symbol_response',\n  $defs: {\n    document_symbol_response: {\n      type: 'array',\n      items: {\n        type: 'object',\n        properties: {\n          kind: {\n            $ref: '#/$defs/symbol_kind'\n          },\n          name: {\n            type: 'string'\n          },\n          range: {\n            $ref: '#/$defs/base_range'\n          },\n          selectionRange: {\n            $ref: '#/$defs/base_range'\n          }\n        },\n        required: [          'kind',\n          'name',\n          'range',\n          'selectionRange'\n        ]\n      }\n    },\n    symbol_kind: {\n      type: 'string',\n      description: 'A symbol kind.',\n      enum: [        1,\n        2,\n        3,\n        4,\n        5,\n        6,\n        7,\n        8,\n        9,\n        10,\n        11,\n        12,\n        13,\n        14,\n        15,\n        16,\n        17,\n        18,\n        19,\n        20,\n        21,\n        22,\n        23,\n        24,\n        25,\n        26\n      ]\n    },\n    base_range: {\n      type: 'object',\n      properties: {\n        end: {\n          type: 'object',\n          properties: {\n            character: {\n              type: 'number'\n            },\n            line: {\n              type: 'number'\n            }\n          },\n          required: [            'character',\n            'line'\n          ]\n        },\n        start: {\n          type: 'object',\n          properties: {\n            character: {\n              type: 'number'\n            },\n            line: {\n              type: 'number'\n            }\n          },\n          required: [            'character',\n            'line'\n          ]\n        }\n      },\n      required: [        'end',\n        'start'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      uri: {
        $ref: '#/$defs/file_uri',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id', 'uri'],
    $defs: {
      file_uri: {
        type: 'string',
      },
    },
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(
    await maybeFilter(jq_filter, await client.devboxes.lsp.documentSymbols(id, body)),
  );
};

export default { metadata, tool, handler };
