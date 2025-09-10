// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'devboxes.computers',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/devboxes/computers/{id}/screen_interaction',
  operationId: 'doScreenInteraction',
};

export const tool: Tool = {
  name: 'screen_interaction_devboxes_computers',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nPerform the specified screen interaction on the Computer identified by the given ID.\n\n# Response Schema\n```json\n{\n  type: 'object',\n  properties: {\n    error: {\n      type: 'string'\n    },\n    latest_screenshot_base64_img: {\n      type: 'string'\n    },\n    output: {\n      type: 'string'\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      action: {
        type: 'string',
        description: 'The screen action to perform.',
        enum: ['screenshot', 'cursor_position'],
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id', 'action'],
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(
    await maybeFilter(jq_filter, await client.devboxes.computers.screenInteraction(id, body)),
  );
};

export default { metadata, tool, handler };
