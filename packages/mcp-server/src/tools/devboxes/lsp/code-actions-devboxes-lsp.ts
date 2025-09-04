// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'devboxes.lsp',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/devboxes/{id}/lsp/code-actions',
  operationId: 'GetCodeActions',
};

export const tool: Tool = {
  name: 'code_actions_devboxes_lsp',
  description:
    'Get code actions for a part of a document.\nThis method calls the `getCodeActions` method of the `LanguageService` class, which in turn\ncommunicates with the TypeScript language server to retrieve code actions for a given document.\nhttps://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_codeAction',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      uri: {
        type: 'string',
      },
      context: {
        $ref: '#/$defs/code_action_context',
      },
      range: {
        $ref: '#/$defs/range',
      },
    },
    required: ['id', 'uri'],
    $defs: {
      code_action_context: {
        type: 'object',
        description:
          'Contains additional diagnostic information about the context in which\na {@link CodeActionProvider.provideCodeActions code action} is run.\nThe CodeActionContext namespace provides helper functions to work with\n{@link CodeActionContext} literals.',
        properties: {
          diagnostics: {
            type: 'array',
            description:
              'An array of diagnostics known on the client side overlapping the range provided to the\n`textDocument/codeAction` request. They are provided so that the server knows which\nerrors are currently presented to the user for the given range. There is no guarantee\nthat these accurately reflect the error state of the resource. The primary parameter\nto compute code actions is the provided range.',
            items: {
              $ref: '#/$defs/diagnostic',
            },
          },
          only: {
            type: 'array',
            description:
              'Requested kind of actions to return.\n\nActions not of this kind are filtered out by the client before being shown. So servers\ncan omit computing them.',
            items: {
              $ref: '#/$defs/code_action_kind',
            },
          },
          triggerKind: {
            $ref: '#/$defs/code_action_trigger_kind',
          },
        },
        required: ['diagnostics'],
      },
      diagnostic: {
        type: 'object',
        description:
          'Represents a diagnostic, such as a compiler error or warning. Diagnostic objects\nare only valid in the scope of a resource.\nThe Diagnostic namespace provides helper functions to work with\n{@link Diagnostic} literals.',
        properties: {
          message: {
            type: 'string',
            description: "The diagnostic's message. It usually appears in the user interface",
          },
          range: {
            $ref: '#/$defs/range',
          },
          code: {
            anyOf: [
              {
                $ref: '#/$defs/integer',
              },
              {
                type: 'string',
              },
            ],
            description: "The diagnostic's code, which usually appear in the user interface.",
          },
          codeDescription: {
            $ref: '#/$defs/code_description',
          },
          data: {
            $ref: '#/$defs/l_sp_any',
          },
          relatedInformation: {
            type: 'array',
            description:
              'An array of related diagnostic information, e.g. when symbol-names within\na scope collide all definitions can be marked via this property.',
            items: {
              $ref: '#/$defs/diagnostic_related_information',
            },
          },
          severity: {
            $ref: '#/$defs/diagnostic_severity',
          },
          source: {
            type: 'string',
            description:
              "A human-readable string describing the source of this\ndiagnostic, e.g. 'typescript' or 'super lint'. It usually\nappears in the user interface.",
          },
          tags: {
            type: 'array',
            description: 'Additional metadata about the diagnostic.',
            items: {
              $ref: '#/$defs/diagnostic_tag',
            },
          },
        },
        required: ['message', 'range'],
      },
      range: {
        type: 'object',
        description:
          'A range in a text document expressed as (zero-based) start and end positions.\n\nIf you want to specify a range that contains a line including the line ending\ncharacter(s) then use an end position denoting the start of the next line.\nFor example:\n```ts\n{\n    start: { line: 5, character: 23 }\n    end : { line 6, character : 0 }\n}\n```\nThe Range namespace provides helper functions to work with\n{@link Range} literals.',
        properties: {
          end: {
            $ref: '#/$defs/position',
          },
          start: {
            $ref: '#/$defs/position',
          },
        },
        required: ['end', 'start'],
      },
      position: {
        type: 'object',
        description:
          "Position in a text document expressed as zero-based line and character\noffset. Prior to 3.17 the offsets were always based on a UTF-16 string\nrepresentation. So a string of the form `a𐐀b` the character offset of the\ncharacter `a` is 0, the character offset of `𐐀` is 1 and the character\noffset of b is 3 since `𐐀` is represented using two code units in UTF-16.\nSince 3.17 clients and servers can agree on a different string encoding\nrepresentation (e.g. UTF-8). The client announces it's supported encoding\nvia the client capability [`general.positionEncodings`](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#clientCapabilities).\nThe value is an array of position encodings the client supports, with\ndecreasing preference (e.g. the encoding at index `0` is the most preferred\none). To stay backwards compatible the only mandatory encoding is UTF-16\nrepresented via the string `utf-16`. The server can pick one of the\nencodings offered by the client and signals that encoding back to the\nclient via the initialize result's property\n[`capabilities.positionEncoding`](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#serverCapabilities). If the string value\n`utf-16` is missing from the client's capability `general.positionEncodings`\nservers can safely assume that the client supports UTF-16. If the server\nomits the position encoding in its initialize result the encoding defaults\nto the string value `utf-16`. Implementation considerations: since the\nconversion from one encoding into another requires the content of the\nfile / line the conversion is best done where the file is read which is\nusually on the server side.\n\nPositions are line end character agnostic. So you can not specify a position\nthat denotes `\\r|\\n` or `\\n|` where `|` represents the character offset.\nThe Position namespace provides helper functions to work with\n{@link Position} literals.",
        properties: {
          character: {
            $ref: '#/$defs/uinteger',
          },
          line: {
            $ref: '#/$defs/uinteger',
          },
        },
        required: ['character', 'line'],
      },
      uinteger: {
        type: 'number',
        description: 'Defines an unsigned integer in the range of 0 to 2^31 - 1.',
      },
      integer: {
        type: 'number',
        description: 'Defines an integer in the range of -2^31 to 2^31 - 1.',
      },
      code_description: {
        type: 'object',
        description:
          'Structure to capture a description for an error code.\nThe CodeDescription namespace provides functions to deal with descriptions for diagnostic codes.',
        properties: {
          href: {
            $ref: '#/$defs/u_ri',
          },
        },
        required: ['href'],
      },
      u_ri: {
        type: 'string',
        description: 'A tagging type for string properties that are actually URIs',
      },
      l_sp_any: {
        type: 'object',
        description:
          "The LSP any type.\n\nIn the current implementation we map LSPAny to any. This is due to the fact\nthat the TypeScript compilers can't infer string access signatures for\ninterface correctly (it can though for types). See the following issue for\ndetails: https://github.com/microsoft/TypeScript/issues/15300.\n\nWhen the issue is addressed LSPAny can be defined as follows:\n\n```ts\nexport type LSPAny = LSPObject | LSPArray | string | integer | uinteger | decimal | boolean | null | undefined;\nexport type LSPObject = { [key: string]: LSPAny };\nexport type LSPArray = LSPAny[];\n```\n\nPlease note that strictly speaking a property with the value `undefined`\ncan't be converted into JSON preserving the property name. However for\nconvenience it is allowed and assumed that all these properties are\noptional as well.",
        additionalProperties: true,
      },
      diagnostic_related_information: {
        type: 'object',
        description:
          'Represents a related message and source code location for a diagnostic. This should be\nused to point to code locations that cause or related to a diagnostics, e.g when duplicating\na symbol in a scope.\nThe DiagnosticRelatedInformation namespace provides helper functions to work with\n{@link DiagnosticRelatedInformation} literals.',
        properties: {
          location: {
            $ref: '#/$defs/location',
          },
          message: {
            type: 'string',
            description: 'The message of this related diagnostic information.',
          },
        },
        required: ['location', 'message'],
      },
      location: {
        type: 'object',
        description:
          'Represents a location inside a resource, such as a line\ninside a text file.\nThe Location namespace provides helper functions to work with\n{@link Location} literals.',
        properties: {
          range: {
            $ref: '#/$defs/range',
          },
          uri: {
            $ref: '#/$defs/document_uri',
          },
        },
        required: ['range', 'uri'],
      },
      document_uri: {
        type: 'string',
        description: 'A tagging type for string properties that are actually document URIs.',
      },
      diagnostic_severity: {
        type: 'string',
        description: "The diagnostic's severity.",
        enum: [1, 2, 3, 4],
      },
      diagnostic_tag: {
        type: 'string',
        description: 'The diagnostic tags.',
        enum: [1, 2],
      },
      code_action_kind: {
        type: 'string',
        description:
          'The kind of a code action.\n\nKinds are a hierarchical list of identifiers separated by `.`, e.g. `"refactor.extract.function"`.\n\nThe set of kinds is open and client needs to announce the kinds it supports to the server during\ninitialization.\nA set of predefined code action kinds',
      },
      code_action_trigger_kind: {
        type: 'string',
        description: 'The reason why code actions were requested.',
        enum: [1, 2],
      },
    },
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, ...body } = args as any;
  return asTextContentResult(await client.devboxes.lsp.codeActions(id, body));
};

export default { metadata, tool, handler };
