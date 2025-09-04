// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'secrets',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/secrets',
  operationId: 'listSecrets',
};

export const tool: Tool = {
  name: 'list_secrets',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nList all Secrets for the authenticated account. Secret values are not included for security reasons.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/secret_list_view',\n  $defs: {\n    secret_list_view: {\n      type: 'object',\n      description: 'A paginated list of Secrets.',\n      properties: {\n        has_more: {\n          type: 'boolean',\n          description: 'True if there are more results available beyond this page.'\n        },\n        remaining_count: {\n          type: 'integer',\n          description: 'Number of Secrets remaining after this page.'\n        },\n        secrets: {\n          type: 'array',\n          description: 'List of Secret objects. Values are omitted for security.',\n          items: {\n            $ref: '#/$defs/secret_view'\n          }\n        },\n        total_count: {\n          type: 'integer',\n          description: 'Total number of Secrets across all pages.'\n        }\n      },\n      required: [        'has_more',\n        'remaining_count',\n        'secrets',\n        'total_count'\n      ]\n    },\n    secret_view: {\n      type: 'object',\n      description: 'A Secret represents a key-value pair that can be securely stored and used in Devboxes as environment variables.',\n      properties: {\n        id: {\n          type: 'string',\n          description: 'The unique identifier of the Secret.'\n        },\n        create_time_ms: {\n          type: 'integer',\n          description: 'Creation time of the Secret (Unix timestamp in milliseconds).'\n        },\n        name: {\n          type: 'string',\n          description: 'The globally unique name of the Secret. Used as the environment variable name in Devboxes.'\n        },\n        update_time_ms: {\n          type: 'integer',\n          description: 'Last update time of the Secret (Unix timestamp in milliseconds).'\n        }\n      },\n      required: [        'id',\n        'create_time_ms',\n        'name',\n        'update_time_ms'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        description: 'The limit of items to return. Default is 20.',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: [],
  },
  annotations: {
    readOnlyHint: true,
  },
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.secrets.list(body)));
};

export default { metadata, tool, handler };
