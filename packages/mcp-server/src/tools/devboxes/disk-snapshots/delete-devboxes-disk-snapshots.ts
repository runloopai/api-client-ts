// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'devboxes.disk_snapshots',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/devboxes/disk_snapshots/{id}/delete',
  operationId: 'deleteSnapshot',
};

export const tool: Tool = {
  name: 'delete_devboxes_disk_snapshots',
  description: 'Delete a previously taken disk snapshot of a Devbox.',
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
  return asTextContentResult((await client.devboxes.diskSnapshots.delete(id)) as object);
};

export default { metadata, tool, handler };
