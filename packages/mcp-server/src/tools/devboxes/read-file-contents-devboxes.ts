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
  httpPath: '/v1/devboxes/{id}/read_file_contents',
  operationId: 'devboxReadFileContents',
};

export const tool: Tool = {
  name: 'read_file_contents_devboxes',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nRead file contents from a file on a Devbox as a UTF-8. Note 'downloadFile' should be used for large files (greater than 100MB). Returns the file contents as a UTF-8 string.\n\n# Response Schema\n```json\n{\n  type: 'string'\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      file_path: {
        type: 'string',
        description:
          'The path on the Devbox filesystem to read the file from. Path is relative to user home directory.',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id', 'file_path'],
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.devboxes.readFileContents(id, body)));
};

export default { metadata, tool, handler };
