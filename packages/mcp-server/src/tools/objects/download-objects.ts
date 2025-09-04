// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'objects',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/objects/{id}/download',
  operationId: 'generateDownloadUrl',
};

export const tool: Tool = {
  name: 'download_objects',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nGenerate a presigned download URL for an Object. The URL will be valid for the specified duration.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/object_download_url_view',\n  $defs: {\n    object_download_url_view: {\n      type: 'object',\n      description: 'A response containing a presigned download URL for an Object.',\n      properties: {\n        download_url: {\n          type: 'string',\n          description: 'The presigned download URL for the Object.'\n        }\n      },\n      required: [        'download_url'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      duration_seconds: {
        type: 'integer',
        description: 'Duration in seconds for the presigned URL validity (default: 3600).',
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
  return asTextContentResult(await maybeFilter(jq_filter, await client.objects.download(id, body)));
};

export default { metadata, tool, handler };
