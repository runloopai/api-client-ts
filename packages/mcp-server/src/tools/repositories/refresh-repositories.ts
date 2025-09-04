// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'repositories',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/repositories/{id}/refresh',
  operationId: 'refreshRepositoryConnection',
};

export const tool: Tool = {
  name: 'refresh_repositories',
  description:
    "Refresh a repository connection by inspecting the latest version including repo's technical stack and developer environment requirements.",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      blueprint_id: {
        type: 'string',
        description: 'ID of blueprint to use as base for resulting RepositoryVersion blueprint.',
      },
      github_auth_token: {
        type: 'string',
        description: 'GitHub authentication token for accessing private repositories.',
      },
    },
    required: ['id'],
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, ...body } = args as any;
  return asTextContentResult((await client.repositories.refresh(id, body)) as object);
};

export default { metadata, tool, handler };
