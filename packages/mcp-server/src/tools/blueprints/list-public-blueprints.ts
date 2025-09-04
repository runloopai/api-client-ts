// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'blueprints',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/blueprints/list_public',
  operationId: 'listPublicBlueprints',
};

export const tool: Tool = {
  name: 'list_public_blueprints',
  description: 'List all public Blueprints that are available to all users.',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        description: 'The limit of items to return. Default is 20.',
      },
      name: {
        type: 'string',
        description: 'Filter by name',
      },
      starting_after: {
        type: 'string',
        description: 'Load the next page of data starting after the item with the given ID.',
      },
    },
    required: [],
  },
  annotations: {
    readOnlyHint: true,
  },
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const body = args as any;
  const response = await client.blueprints.listPublic(body).asResponse();
  return asTextContentResult(await response.json());
};

export default { metadata, tool, handler };
