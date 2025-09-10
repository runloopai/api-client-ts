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
  httpPath: '/v1/objects/{id}',
  operationId: 'getObject',
};

export const tool: Tool = {
  name: 'retrieve_objects',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nRetrieve a specific Object by its unique identifier.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/object_view',\n  $defs: {\n    object_view: {\n      type: 'object',\n      description: 'An Object represents a stored data entity with metadata.',\n      properties: {\n        id: {\n          type: 'string',\n          description: 'The unique identifier of the Object.'\n        },\n        content_type: {\n          type: 'string',\n          description: 'The content type of the Object.',\n          enum: [            'unspecified',\n            'text',\n            'binary',\n            'gzip',\n            'tar',\n            'tgz'\n          ]\n        },\n        name: {\n          type: 'string',\n          description: 'The name of the Object.'\n        },\n        state: {\n          type: 'string',\n          description: 'The current state of the Object.'\n        },\n        size_bytes: {\n          type: 'integer',\n          description: 'The size of the Object content in bytes (null until uploaded).'\n        },\n        upload_url: {\n          type: 'string',\n          description: 'Presigned URL for uploading content to S3 (only present on create).'\n        }\n      },\n      required: [        'id',\n        'content_type',\n        'name',\n        'state'\n      ]\n    }\n  }\n}\n```",
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
  return asTextContentResult(await maybeFilter(jq_filter, await client.objects.retrieve(id)));
};

export default { metadata, tool, handler };
