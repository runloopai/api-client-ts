// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'blueprints',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/blueprints/{id}',
  operationId: 'getBlueprint',
};

export const tool: Tool = {
  name: 'retrieve_blueprints',
  description: 'Get the details of a previously created Blueprint including the build status.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
    },
    required: ['id'],
  },
  annotations: {
    readOnlyHint: true,
  },
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, ...body } = args as any;
  return asTextContentResult(await client.blueprints.retrieve(id));
};

export default { metadata, tool, handler };
