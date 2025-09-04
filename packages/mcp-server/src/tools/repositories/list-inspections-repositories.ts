// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'repositories',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/repositories/{id}/inspections',
  operationId: 'listRepositoryInspections',
};

export const tool: Tool = {
  name: 'list_inspections_repositories',
  description:
    'List all inspections of a repository connection including automatically generated insights for each inspection.',
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
  return asTextContentResult(await client.repositories.listInspections(id));
};

export default { metadata, tool, handler };
