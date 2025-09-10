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
  httpPath: '/v1/devboxes/{id}/snapshot_disk',
  operationId: 'createDiskSnapshot',
};

export const tool: Tool = {
  name: 'snapshot_disk_devboxes',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nCreate a disk snapshot of a devbox with the specified name and metadata to enable launching future Devboxes with the same disk state.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/devbox_snapshot_view',\n  $defs: {\n    devbox_snapshot_view: {\n      type: 'object',\n      properties: {\n        id: {\n          type: 'string',\n          description: 'The unique identifier of the snapshot.'\n        },\n        create_time_ms: {\n          type: 'integer',\n          description: 'Creation time of the Snapshot (Unix timestamp milliseconds).'\n        },\n        metadata: {\n          type: 'object',\n          description: 'User defined metadata associated with the snapshot.',\n          additionalProperties: true\n        },\n        source_devbox_id: {\n          type: 'string',\n          description: 'The source Devbox ID this snapshot was created from.'\n        },\n        name: {\n          type: 'string',\n          description: '(Optional) The custom name of the snapshot.'\n        }\n      },\n      required: [        'id',\n        'create_time_ms',\n        'metadata',\n        'source_devbox_id'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      metadata: {
        type: 'object',
        description: '(Optional) Metadata used to describe the snapshot',
        additionalProperties: true,
      },
      name: {
        type: 'string',
        description: '(Optional) A user specified name to give the snapshot',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id'],
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.devboxes.snapshotDisk(id, body)));
};

export default { metadata, tool, handler };
