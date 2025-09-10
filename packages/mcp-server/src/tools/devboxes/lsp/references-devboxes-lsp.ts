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
  httpPath: '/v1/devboxes/{id}/lsp/references',
  operationId: 'GetReferences',
};

export const tool: Tool = {
  name: 'references_devboxes_lsp',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nGet references for a given symbol. This method calls the `getReferences` method of the `LanguageService` class, which in turn\ncommunicates with the TypeScript language server to retrieve references for a given symbol\nin the document. https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_references\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/references_response',\n  $defs: {\n    references_response: {\n      type: 'array',\n      items: {\n        $ref: '#/$defs/base_location'\n      }\n    },\n    base_location: {\n      type: 'object',\n      properties: {\n        range: {\n          $ref: '#/$defs/base_range'\n        },\n        uri: {\n          type: 'string'\n        }\n      },\n      required: [        'range',\n        'uri'\n      ]\n    },\n    base_range: {\n      type: 'object',\n      properties: {\n        end: {\n          type: 'object',\n          properties: {\n            character: {\n              type: 'number'\n            },\n            line: {\n              type: 'number'\n            }\n          },\n          required: [            'character',\n            'line'\n          ]\n        },\n        start: {\n          type: 'object',\n          properties: {\n            character: {\n              type: 'number'\n            },\n            line: {\n              type: 'number'\n            }\n          },\n          required: [            'character',\n            'line'\n          ]\n        }\n      },\n      required: [        'end',\n        'start'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      character: {
        type: 'number',
      },
      line: {
        type: 'number',
      },
      uri: {
        type: 'string',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id', 'character', 'line', 'uri'],
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.devboxes.lsp.references(id, body)));
};

export default { metadata, tool, handler };
