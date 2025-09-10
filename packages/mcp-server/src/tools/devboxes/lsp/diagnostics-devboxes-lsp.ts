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
  httpPath: '/v1/devboxes/{id}/lsp/diagnostics',
  operationId: 'GetDiagnostics',
};

export const tool: Tool = {
  name: 'diagnostics_devboxes_lsp',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nGet diagnostics for a given file URI from the language server\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/diagnostics_response',\n  $defs: {\n    diagnostics_response: {\n      type: 'object',\n      properties: {\n        diagnostics: {\n          type: 'array',\n          items: {\n            $ref: '#/$defs/base_diagnostic'\n          }\n        },\n        uri: {\n          type: 'string'\n        }\n      },\n      required: [        'diagnostics',\n        'uri'\n      ]\n    },\n    base_diagnostic: {\n      type: 'object',\n      properties: {\n        message: {\n          type: 'string'\n        },\n        range: {\n          $ref: '#/$defs/base_range'\n        },\n        code: {\n          anyOf: [            {\n              type: 'number'\n            },\n            {\n              type: 'string'\n            }\n          ]\n        },\n        severity: {\n          $ref: '#/$defs/diagnostic_severity'\n        },\n        source: {\n          type: 'string'\n        }\n      },\n      required: [        'message',\n        'range'\n      ]\n    },\n    base_range: {\n      type: 'object',\n      properties: {\n        end: {\n          type: 'object',\n          properties: {\n            character: {\n              type: 'number'\n            },\n            line: {\n              type: 'number'\n            }\n          },\n          required: [            'character',\n            'line'\n          ]\n        },\n        start: {\n          type: 'object',\n          properties: {\n            character: {\n              type: 'number'\n            },\n            line: {\n              type: 'number'\n            }\n          },\n          required: [            'character',\n            'line'\n          ]\n        }\n      },\n      required: [        'end',\n        'start'\n      ]\n    },\n    diagnostic_severity: {\n      type: 'string',\n      description: 'The diagnostic\\'s severity.',\n      enum: [        1,\n        2,\n        3,\n        4\n      ]\n    }\n  }\n}\n```",
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
  return asTextContentResult(await maybeFilter(jq_filter, await client.devboxes.lsp.diagnostics(id, body)));
};

export default { metadata, tool, handler };
