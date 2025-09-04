// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'secrets',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/secrets/{name}',
  operationId: 'updateSecret',
};

export const tool: Tool = {
  name: 'update_secrets',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nUpdate the value of an existing Secret by name. The new value will be encrypted at rest.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/secret_view',\n  $defs: {\n    secret_view: {\n      type: 'object',\n      description: 'A Secret represents a key-value pair that can be securely stored and used in Devboxes as environment variables.',\n      properties: {\n        id: {\n          type: 'string',\n          description: 'The unique identifier of the Secret.'\n        },\n        create_time_ms: {\n          type: 'integer',\n          description: 'Creation time of the Secret (Unix timestamp in milliseconds).'\n        },\n        name: {\n          type: 'string',\n          description: 'The globally unique name of the Secret. Used as the environment variable name in Devboxes.'\n        },\n        update_time_ms: {\n          type: 'integer',\n          description: 'Last update time of the Secret (Unix timestamp in milliseconds).'\n        }\n      },\n      required: [        'id',\n        'create_time_ms',\n        'name',\n        'update_time_ms'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      value: {
        type: 'string',
        description:
          "The new value for the Secret. This will replace the existing value and be encrypted at rest. Example: 'my-updated-secure-password'",
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['name', 'value'],
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { name, jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.secrets.update(name, body)));
};

export default { metadata, tool, handler };
