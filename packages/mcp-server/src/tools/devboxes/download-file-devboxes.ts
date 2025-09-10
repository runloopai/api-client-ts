// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asBinaryContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'devboxes',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/devboxes/{id}/download_file',
  operationId: 'devboxDownloadFile',
};

export const tool: Tool = {
  name: 'download_file_devboxes',
  description: 'Download file contents of any type (binary, text, etc) from a specified path on the Devbox.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      path: {
        type: 'string',
        description:
          'The path on the Devbox filesystem to read the file from. Path is relative to user home directory.',
      },
    },
    required: ['id', 'path'],
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, ...body } = args as any;
  return asBinaryContentResult(await client.devboxes.downloadFile(id, body));
};

export default { metadata, tool, handler };
