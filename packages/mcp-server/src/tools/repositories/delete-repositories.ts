// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'repositories',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/repositories/{id}/delete',
  operationId: 'deleteRepositoryConnection',
};

export const tool: Tool = {
  name: 'delete_repositories',
  description:
    'Permanently Delete a Repository Connection including any automatically generated inspection insights.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
    },
    required: ['id'],
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, ...body } = args as any;
  return asTextContentResult((await client.repositories.delete(id, body)) as object);
};

export default { metadata, tool, handler };
