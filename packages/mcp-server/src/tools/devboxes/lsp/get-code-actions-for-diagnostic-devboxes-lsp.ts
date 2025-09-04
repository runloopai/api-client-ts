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
  httpPath: '/v1/devboxes/{id}/lsp/get-code-actions-for-diagnostic',
  operationId: 'GetCodeActionsForDiagnostic',
};

export const tool: Tool = {
  name: 'get_code_actions_for_diagnostic_devboxes_lsp',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nGet a list of code actions for a given diagnostic\n\n# Response Schema\n```json\n{\n  type: 'array',\n  items: {\n    $ref: '#/$defs/base_code_action'\n  },\n  $defs: {\n    base_code_action: {\n      type: 'object',\n      properties: {\n        title: {\n          type: 'string'\n        },\n        command: {\n          $ref: '#/$defs/base_command'\n        },\n        edit: {\n          $ref: '#/$defs/base_workspace_edit'\n        },\n        isPreferred: {\n          type: 'boolean'\n        },\n        kind: {\n          type: 'string'\n        }\n      },\n      required: [        'title'\n      ]\n    },\n    base_command: {\n      type: 'object',\n      properties: {\n        command: {\n          type: 'string'\n        },\n        title: {\n          type: 'string'\n        },\n        arguments: {\n          type: 'array',\n          items: {\n            type: 'object',\n            additionalProperties: true\n          }\n        }\n      },\n      required: [        'command',\n        'title'\n      ]\n    },\n    base_workspace_edit: {\n      type: 'object',\n      properties: {\n        changes: {\n          $ref: '#/$defs/record_string_text_edit_array'\n        }\n      }\n    },\n    record_string_text_edit_array: {\n      type: 'object',\n      description: 'Construct a type with a set of properties K of type T',\n      additionalProperties: true\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      diagnostic: {
        $ref: '#/$defs/base_diagnostic',
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
    required: ['id', 'diagnostic', 'uri'],
    $defs: {
      base_diagnostic: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
          },
          range: {
            $ref: '#/$defs/base_range',
          },
          code: {
            anyOf: [
              {
                type: 'number',
              },
              {
                type: 'string',
              },
            ],
          },
          severity: {
            $ref: '#/$defs/diagnostic_severity',
          },
          source: {
            type: 'string',
          },
        },
        required: ['message', 'range'],
      },
      base_range: {
        type: 'object',
        properties: {
          end: {
            type: 'object',
            properties: {
              character: {
                type: 'number',
              },
              line: {
                type: 'number',
              },
            },
            required: ['character', 'line'],
          },
          start: {
            type: 'object',
            properties: {
              character: {
                type: 'number',
              },
              line: {
                type: 'number',
              },
            },
            required: ['character', 'line'],
          },
        },
        required: ['end', 'start'],
      },
      diagnostic_severity: {
        type: 'string',
        description: "The diagnostic's severity.",
        enum: [1, 2, 3, 4],
      },
    },
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(
    await maybeFilter(jq_filter, await client.devboxes.lsp.getCodeActionsForDiagnostic(id, body)),
  );
};

export default { metadata, tool, handler };
