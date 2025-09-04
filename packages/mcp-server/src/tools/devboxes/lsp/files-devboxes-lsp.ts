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
  httpPath: '/v1/devboxes/{id}/lsp/files',
  operationId: 'GetFiles',
};

export const tool: Tool = {
  name: 'files_devboxes_lsp',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nGet a list of all files being watched by the language server\n\n# Response Schema\n```json\n{\n  type: 'array',\n  items: {\n    $ref: '#/$defs/watched_file_response'\n  },\n  $defs: {\n    watched_file_response: {\n      type: 'object',\n      properties: {\n        filename: {\n          type: 'string'\n        },\n        fullPath: {\n          type: 'string'\n        },\n        path: {\n          type: 'string'\n        }\n      },\n      required: [        'filename',\n        'fullPath',\n        'path'\n      ]\n    }\n  }\n}\n```",
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
  return asTextContentResult(await maybeFilter(jq_filter, await client.devboxes.lsp.files(id)));
};

export default { metadata, tool, handler };
