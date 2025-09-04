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
  httpPath: '/v1/devboxes/{id}/lsp/formatting',
  operationId: 'GetFormatting',
};

export const tool: Tool = {
  name: 'formatting_devboxes_lsp',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nGet formatting changes for a given document.\nhttps://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_formatting\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/formatting_response',\n  $defs: {\n    formatting_response: {\n      type: 'array',\n      items: {\n        $ref: '#/$defs/text_edit'\n      }\n    },\n    text_edit: {\n      type: 'object',\n      description: 'A text edit applicable to a text document.\\nThe TextEdit namespace provides helper function to create replace,\\ninsert and delete edits more easily.',\n      properties: {\n        newText: {\n          type: 'string',\n          description: 'The string to be inserted. For delete operations use an\\nempty string.'\n        },\n        range: {\n          $ref: '#/$defs/range'\n        }\n      },\n      required: [        'newText',\n        'range'\n      ]\n    },\n    range: {\n      type: 'object',\n      description: 'A range in a text document expressed as (zero-based) start and end positions.\\n\\nIf you want to specify a range that contains a line including the line ending\\ncharacter(s) then use an end position denoting the start of the next line.\\nFor example:\\n```ts\\n{\\n    start: { line: 5, character: 23 }\\n    end : { line 6, character : 0 }\\n}\\n```\\nThe Range namespace provides helper functions to work with\\n{@link Range} literals.',\n      properties: {\n        end: {\n          $ref: '#/$defs/position'\n        },\n        start: {\n          $ref: '#/$defs/position'\n        }\n      },\n      required: [        'end',\n        'start'\n      ]\n    },\n    position: {\n      type: 'object',\n      description: 'Position in a text document expressed as zero-based line and character\\noffset. Prior to 3.17 the offsets were always based on a UTF-16 string\\nrepresentation. So a string of the form `a𐐀b` the character offset of the\\ncharacter `a` is 0, the character offset of `𐐀` is 1 and the character\\noffset of b is 3 since `𐐀` is represented using two code units in UTF-16.\\nSince 3.17 clients and servers can agree on a different string encoding\\nrepresentation (e.g. UTF-8). The client announces it\\'s supported encoding\\nvia the client capability [`general.positionEncodings`](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#clientCapabilities).\\nThe value is an array of position encodings the client supports, with\\ndecreasing preference (e.g. the encoding at index `0` is the most preferred\\none). To stay backwards compatible the only mandatory encoding is UTF-16\\nrepresented via the string `utf-16`. The server can pick one of the\\nencodings offered by the client and signals that encoding back to the\\nclient via the initialize result\\'s property\\n[`capabilities.positionEncoding`](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#serverCapabilities). If the string value\\n`utf-16` is missing from the client\\'s capability `general.positionEncodings`\\nservers can safely assume that the client supports UTF-16. If the server\\nomits the position encoding in its initialize result the encoding defaults\\nto the string value `utf-16`. Implementation considerations: since the\\nconversion from one encoding into another requires the content of the\\nfile / line the conversion is best done where the file is read which is\\nusually on the server side.\\n\\nPositions are line end character agnostic. So you can not specify a position\\nthat denotes `\\\\r|\\\\n` or `\\\\n|` where `|` represents the character offset.\\nThe Position namespace provides helper functions to work with\\n{@link Position} literals.',\n      properties: {\n        character: {\n          $ref: '#/$defs/uinteger'\n        },\n        line: {\n          $ref: '#/$defs/uinteger'\n        }\n      },\n      required: [        'character',\n        'line'\n      ]\n    },\n    uinteger: {\n      type: 'number',\n      description: 'Defines an unsigned integer in the range of 0 to 2^31 - 1.'\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      uri: {
        $ref: '#/$defs/file_uri',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id', 'uri'],
    $defs: {
      file_uri: {
        type: 'string',
      },
    },
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.devboxes.lsp.formatting(id, body)));
};

export default { metadata, tool, handler };
