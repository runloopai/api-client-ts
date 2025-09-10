// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'repositories',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/repositories',
  operationId: 'listRepositoryConnections',
};

export const tool: Tool = {
  name: 'list_repositories',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nList all available repository connections.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/repository_connection_list_view',\n  $defs: {\n    repository_connection_list_view: {\n      type: 'object',\n      properties: {\n        has_more: {\n          type: 'boolean'\n        },\n        remaining_count: {\n          type: 'integer'\n        },\n        repositories: {\n          type: 'array',\n          description: 'List of repositories matching filter.',\n          items: {\n            $ref: '#/$defs/repository_connection_view'\n          }\n        },\n        total_count: {\n          type: 'integer'\n        }\n      },\n      required: [        'has_more',\n        'remaining_count',\n        'repositories',\n        'total_count'\n      ]\n    },\n    repository_connection_view: {\n      type: 'object',\n      description: 'The ID of the Repository.',\n      properties: {\n        id: {\n          type: 'string',\n          description: 'The ID of the Repository.'\n        },\n        name: {\n          type: 'string',\n          description: 'The name of the Repository.'\n        },\n        owner: {\n          type: 'string',\n          description: 'The account owner of the Repository.'\n        }\n      },\n      required: [        'id',\n        'name',\n        'owner'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        description: 'The limit of items to return. Default is 20.',
      },
      name: {
        type: 'string',
        description: 'Filter by repository name',
      },
      owner: {
        type: 'string',
        description: 'Filter by repository owner',
      },
      starting_after: {
        type: 'string',
        description: 'Load the next page of data starting after the item with the given ID.',
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
  const response = await client.repositories.list(body).asResponse();
  return asTextContentResult(await maybeFilter(jq_filter, await response.json()));
};

export default { metadata, tool, handler };
