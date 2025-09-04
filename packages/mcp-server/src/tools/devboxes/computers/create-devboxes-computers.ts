// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'devboxes.computers',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/devboxes/computers',
  operationId: 'createComputer',
};

export const tool: Tool = {
  name: 'create_devboxes_computers',
  description:
    "Create a Computer and begin the boot process. The Computer will initially launch in the 'provisioning' state while Runloop allocates the necessary infrastructure. It will transition to the 'initializing' state while the booted Computer runs any Runloop or user defined set up scripts. Finally, the Computer will transition to the 'running' state when it is ready for use.",
  inputSchema: {
    type: 'object',
    properties: {
      display_dimensions: {
        type: 'object',
        description: 'Customize the dimensions of the computer display.',
        properties: {
          display_height_px: {
            type: 'integer',
            description: 'The height of the display being controlled by the model in pixels.',
          },
          display_width_px: {
            type: 'integer',
            description: 'The width of the display being controlled by the model in pixels.',
          },
        },
        required: ['display_height_px', 'display_width_px'],
      },
      name: {
        type: 'string',
        description: 'The name to use for the created computer.',
      },
    },
    required: [],
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const body = args as any;
  return asTextContentResult(await client.devboxes.computers.create(body));
};

export default { metadata, tool, handler };
