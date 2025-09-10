// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'blueprints',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/blueprints/{id}/logs',
  operationId: 'blueprintLogs',
};

export const tool: Tool = {
  name: 'logs_blueprints',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nGet all logs from the building of a Blueprint.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/blueprint_build_logs_list_view',\n  $defs: {\n    blueprint_build_logs_list_view: {\n      type: 'object',\n      properties: {\n        blueprint_id: {\n          type: 'string',\n          description: 'ID of the Blueprint.'\n        },\n        logs: {\n          type: 'array',\n          description: 'List of logs generated during Blueprint build.',\n          items: {\n            $ref: '#/$defs/blueprint_build_log'\n          }\n        }\n      },\n      required: [        'blueprint_id',\n        'logs'\n      ]\n    },\n    blueprint_build_log: {\n      type: 'object',\n      properties: {\n        level: {\n          type: 'string',\n          description: 'Log line severity level.'\n        },\n        message: {\n          type: 'string',\n          description: 'Log line message.'\n        },\n        timestamp_ms: {\n          type: 'integer',\n          description: 'Time of log (Unix timestamp milliseconds).'\n        }\n      },\n      required: [        'level',\n        'message',\n        'timestamp_ms'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
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
  annotations: {
    readOnlyHint: true,
  },
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.blueprints.logs(id)));
};

export default { metadata, tool, handler };
