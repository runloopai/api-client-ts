// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'devboxes',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/devboxes/{id}/create_tunnel',
  operationId: 'createDevboxTunnel',
};

export const tool: Tool = {
  name: 'create_tunnel_devboxes',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nCreate a live tunnel to an available port on the Devbox.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/devbox_tunnel_view',\n  $defs: {\n    devbox_tunnel_view: {\n      type: 'object',\n      properties: {\n        devbox_id: {\n          type: 'string',\n          description: 'ID of the Devbox the tunnel routes to.'\n        },\n        port: {\n          type: 'integer',\n          description: 'Port of the Devbox the tunnel routes to.'\n        },\n        url: {\n          type: 'string',\n          description: 'Public url used to access Devbox.'\n        }\n      },\n      required: [        'devbox_id',\n        'port',\n        'url'\n      ]\n    }\n  }\n}\n```",
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
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id', 'port'],
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.devboxes.createTunnel(id, body)));
};

export default { metadata, tool, handler };
