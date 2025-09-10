// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'devboxes.executions',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/devboxes/{devbox_id}/executions/{execution_id}/stream_stdout_updates',
  operationId: 'streamStdOutUpdates',
};

export const tool: Tool = {
  name: 'stream_stdout_updates_devboxes_executions',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nTails the stdout logs for the given execution with SSE streaming\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/execution_update_chunk',\n  $defs: {\n    execution_update_chunk: {\n      type: 'object',\n      properties: {\n        output: {\n          type: 'string',\n          description: 'The latest log stream chunk.'\n        },\n        offset: {\n          type: 'integer',\n          description: 'The byte offset of this chunk of log stream.'\n        }\n      },\n      required: [        'output'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      devbox_id: {
        type: 'string',
      },
      execution_id: {
        type: 'string',
      },
      offset: {
        type: 'string',
        description: 'The byte offset to start the stream from',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['devbox_id', 'execution_id'],
  },
  annotations: {
    readOnlyHint: true,
  },
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { devbox_id, execution_id, jq_filter, ...body } = args as any;
  return asTextContentResult(
    await maybeFilter(
      jq_filter,
      await client.devboxes.executions.streamStdoutUpdates(devbox_id, execution_id, body),
    ),
  );
};

export default { metadata, tool, handler };
