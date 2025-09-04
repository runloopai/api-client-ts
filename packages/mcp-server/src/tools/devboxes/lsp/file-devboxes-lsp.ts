// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'devboxes.lsp',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/devboxes/{id}/lsp/file',
  operationId: 'GetFile',
};

export const tool: Tool = {
  name: 'file_devboxes_lsp',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nGet the contents of a file at a given path relative to the root directory\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/file_contents_response',\n  $defs: {\n    file_contents_response: {\n      type: 'object',\n      properties: {\n        contents: {\n          type: 'string'\n        },\n        fullPath: {\n          type: 'string'\n        },\n        path: {\n          $ref: '#/$defs/file_path'\n        }\n      },\n      required: [        'contents',\n        'fullPath',\n        'path'\n      ]\n    },\n    file_path: {\n      type: 'string'\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      path: {
        $ref: '#/$defs/file_path',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id', 'path'],
    $defs: {
      file_path: {
        type: 'string',
      },
    },
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.devboxes.lsp.file(id, body)));
};

export default { metadata, tool, handler };
