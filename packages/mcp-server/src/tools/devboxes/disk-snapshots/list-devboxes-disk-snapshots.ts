// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'devboxes.disk_snapshots',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/devboxes/disk_snapshots',
  operationId: 'getDevboxDiskSnapshotList',
};

export const tool: Tool = {
  name: 'list_devboxes_disk_snapshots',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nList all snapshots of a Devbox while optionally filtering by Devbox ID and metadata.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/devbox_snapshot_list_view',\n  $defs: {\n    devbox_snapshot_list_view: {\n      type: 'object',\n      properties: {\n        has_more: {\n          type: 'boolean'\n        },\n        remaining_count: {\n          type: 'integer'\n        },\n        snapshots: {\n          type: 'array',\n          description: 'List of snapshots matching filter.',\n          items: {\n            $ref: '#/$defs/devbox_snapshot_view'\n          }\n        },\n        total_count: {\n          type: 'integer'\n        }\n      },\n      required: [        'has_more',\n        'remaining_count',\n        'snapshots',\n        'total_count'\n      ]\n    },\n    devbox_snapshot_view: {\n      type: 'object',\n      properties: {\n        id: {\n          type: 'string',\n          description: 'The unique identifier of the snapshot.'\n        },\n        create_time_ms: {\n          type: 'integer',\n          description: 'Creation time of the Snapshot (Unix timestamp milliseconds).'\n        },\n        metadata: {\n          type: 'object',\n          description: 'User defined metadata associated with the snapshot.',\n          additionalProperties: true\n        },\n        source_devbox_id: {\n          type: 'string',\n          description: 'The source Devbox ID this snapshot was created from.'\n        },\n        name: {\n          type: 'string',\n          description: '(Optional) The custom name of the snapshot.'\n        }\n      },\n      required: [        'id',\n        'create_time_ms',\n        'metadata',\n        'source_devbox_id'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      devbox_id: {
        type: 'string',
        description: 'Devbox ID to filter by.',
      },
      limit: {
        type: 'integer',
        description: 'The limit of items to return. Default is 20.',
      },
      'metadata[key]': {
        type: 'string',
        description:
          'Filter snapshots by metadata key-value pair. Can be used multiple times for different keys.',
      },
      'metadata[key][in]': {
        type: 'string',
        description: 'Filter snapshots by metadata key with multiple possible values (OR condition).',
      },
      starting_after: {
        type: 'string',
        description: 'Load the next page of data starting after the item with the given ID.',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: [],
  },
  annotations: {
    readOnlyHint: true,
  },
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { jq_filter, ...body } = args as any;
  const response = await client.devboxes.diskSnapshots.list(body).asResponse();
  return asTextContentResult(await maybeFilter(jq_filter, await response.json()));
};

export default { metadata, tool, handler };
