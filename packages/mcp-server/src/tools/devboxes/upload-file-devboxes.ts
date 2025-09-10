// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'devboxes',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/devboxes/{id}/upload_file',
  operationId: 'devboxUploadFile',
};

export const tool: Tool = {
  name: 'upload_file_devboxes',
  description:
    'Upload file contents of any type (binary, text, etc) to a Devbox. Note this API is suitable for large files (larger than 100MB) and efficiently uploads files via multipart form data.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      path: {
        type: 'string',
        description: 'The path to write the file to on the Devbox. Path is relative to user home directory.',
      },
      file: {
        type: 'string',
      },
    },
    required: ['id', 'path'],
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, ...body } = args as any;
  return asTextContentResult((await client.devboxes.uploadFile(id, body)) as object);
};

export default { metadata, tool, handler };
