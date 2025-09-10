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
  httpPath: '/v1/devboxes/{id}/lsp/get-signature-help',
  operationId: 'GetSignatureHelp',
};

export const tool: Tool = {
  name: 'get_signature_help_devboxes_lsp',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nGet the symbol, reference, and diagnostic information for a given code segment in a file at a given depth\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/signature_help_response',\n  $defs: {\n    signature_help_response: {\n      type: 'object',\n      properties: {\n        signatures: {\n          type: 'array',\n          items: {\n            $ref: '#/$defs/base_signature'\n          }\n        },\n        activeParameter: {\n          type: 'number'\n        },\n        activeSignature: {\n          type: 'number'\n        }\n      },\n      required: [        'signatures'\n      ]\n    },\n    base_signature: {\n      type: 'object',\n      properties: {\n        label: {\n          type: 'string'\n        },\n        documentation: {\n          anyOf: [            {\n              type: 'string'\n            },\n            {\n              $ref: '#/$defs/base_markup_content'\n            }\n          ]\n        },\n        parameters: {\n          type: 'array',\n          items: {\n            $ref: '#/$defs/base_parameter_information'\n          }\n        }\n      },\n      required: [        'label'\n      ]\n    },\n    base_markup_content: {\n      type: 'object',\n      properties: {\n        kind: {\n          type: 'string'\n        },\n        value: {\n          type: 'string'\n        }\n      },\n      required: [        'kind',\n        'value'\n      ]\n    },\n    base_parameter_information: {\n      type: 'object',\n      properties: {\n        label: {\n          type: 'string'\n        },\n        documentation: {\n          anyOf: [            {\n              type: 'string'\n            },\n            {\n              $ref: '#/$defs/base_markup_content'\n            }\n          ]\n        }\n      },\n      required: [        'label'\n      ]\n    }\n  }\n}\n```",
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
  return asTextContentResult(
    await maybeFilter(jq_filter, await client.devboxes.lsp.getSignatureHelp(id, body)),
  );
};

export default { metadata, tool, handler };
