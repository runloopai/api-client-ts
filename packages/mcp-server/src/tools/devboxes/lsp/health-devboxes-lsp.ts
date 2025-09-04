// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'devboxes.lsp',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/devboxes/{id}/lsp/health',
  operationId: 'GetHealth',
};

export const tool: Tool = {
  name: 'health_devboxes_lsp',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nThis method provides a health check for the language server, including its status, uptime,\nthe directory being watched, and the name of the module.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/health_status_response',\n  $defs: {\n    health_status_response: {\n      type: 'object',\n      properties: {\n        dirtyFiles: {\n          type: 'array',\n          items: {\n            type: 'string'\n          }\n        },\n        moduleName: {\n          type: 'string'\n        },\n        pendingWork: {\n          type: 'object',\n          additionalProperties: true\n        },\n        status: {\n          type: 'string'\n        },\n        uptime: {\n          type: 'string'\n        },\n        watchDirectory: {\n          type: 'string'\n        }\n      },\n      required: [        'dirtyFiles',\n        'moduleName',\n        'pendingWork',\n        'status',\n        'uptime',\n        'watchDirectory'\n      ]\n    }\n  }\n}\n```",
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
  return asTextContentResult(await maybeFilter(jq_filter, await client.devboxes.lsp.health(id)));
};

export default { metadata, tool, handler };
