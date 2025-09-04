// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'devboxes',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/devboxes/{id}/remove_tunnel',
  operationId: 'removeDevboxTunnel',
};

export const tool: Tool = {
  name: 'remove_tunnel_devboxes',
  description: 'Remove a previously opened tunnel on the Devbox.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      port: {
        type: 'integer',
        description: 'Devbox port that tunnel will expose.',
      },
    },
    required: ['id', 'port'],
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, ...body } = args as any;
  return asTextContentResult((await client.devboxes.removeTunnel(id, body)) as object);
};

export default { metadata, tool, handler };
