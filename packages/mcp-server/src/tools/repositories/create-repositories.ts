// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'repositories',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/repositories',
  operationId: 'createRepositoryConnection',
};

export const tool: Tool = {
  name: 'create_repositories',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nCreate a connection to a Github Repository and trigger an initial inspection of the repo's technical stack and developer environment requirements.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/repository_connection_view',\n  $defs: {\n    repository_connection_view: {\n      type: 'object',\n      description: 'The ID of the Repository.',\n      properties: {\n        id: {\n          type: 'string',\n          description: 'The ID of the Repository.'\n        },\n        name: {\n          type: 'string',\n          description: 'The name of the Repository.'\n        },\n        owner: {\n          type: 'string',\n          description: 'The account owner of the Repository.'\n        }\n      },\n      required: [        'id',\n        'name',\n        'owner'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the repository.',
      },
      owner: {
        type: 'string',
        description: 'Account owner of the repository.',
      },
      blueprint_id: {
        type: 'string',
        description: 'ID of blueprint to use as base for resulting RepositoryVersion blueprint.',
      },
      github_auth_token: {
        type: 'string',
        description: 'GitHub authentication token for accessing private repositories.',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['name', 'owner'],
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.repositories.create(body)));
};

export default { metadata, tool, handler };
