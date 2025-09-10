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
  httpPath: '/v1/devboxes/{id}/lsp/apply-code-action',
  operationId: 'ApplyCodeAction',
};

export const tool: Tool = {
  name: 'apply_code_action_devboxes_lsp',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nApply a code action to a given code segment not all code actions are supported yet\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/code_action_application_result',\n  $defs: {\n    code_action_application_result: {\n      type: 'object',\n      properties: {\n        success: {\n          type: 'boolean'\n        },\n        error: {\n          type: 'string'\n        },\n        filesChanged: {\n          type: 'array',\n          items: {\n            type: 'string'\n          }\n        }\n      },\n      required: [        'success'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      command: {
        $ref: '#/$defs/base_command',
      },
      edit: {
        $ref: '#/$defs/base_workspace_edit',
      },
      isPreferred: {
        type: 'boolean',
      },
      kind: {
        type: 'string',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id', 'title'],
    $defs: {
      base_command: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
          },
          title: {
            type: 'string',
          },
          arguments: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: true,
            },
          },
        },
        required: ['command', 'title'],
      },
      base_workspace_edit: {
        type: 'object',
        properties: {
          changes: {
            $ref: '#/$defs/record_string_text_edit_array',
          },
        },
      },
      record_string_text_edit_array: {
        type: 'object',
        description: 'Construct a type with a set of properties K of type T',
        additionalProperties: true,
      },
    },
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(
    await maybeFilter(jq_filter, await client.devboxes.lsp.applyCodeAction(id, body)),
  );
};

export default { metadata, tool, handler };
