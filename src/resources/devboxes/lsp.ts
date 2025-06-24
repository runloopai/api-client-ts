// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import * as Core from '../../core';
import * as LspAPI from './lsp';

export class Lsp extends APIResource {
  /**
   * Apply a code action to a given code segment not all code actions are supported
   * yet
   */
  applyCodeAction(
    id: string,
    body: LspApplyCodeActionParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<CodeActionApplicationResult> {
    return this._client.post(`/v1/devboxes/${id}/lsp/apply-code-action`, { body, ...options });
  }

  /**
   * Get code actions for a part of a document. This method calls the
   * `getCodeActions` method of the `LanguageService` class, which in turn
   * communicates with the TypeScript language server to retrieve code actions for a
   * given document.
   * https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_codeAction
   */
  codeActions(
    id: string,
    body: LspCodeActionsParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<CodeActionsResponse> {
    return this._client.post(`/v1/devboxes/${id}/lsp/code-actions`, { body, ...options });
  }

  /**
   * Get diagnostics for a given file URI from the language server
   */
  diagnostics(
    id: string,
    body: LspDiagnosticsParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DiagnosticsResponse> {
    return this._client.post(`/v1/devboxes/${id}/lsp/diagnostics`, { body, ...options });
  }

  /**
   * Get document symbols for a given document.
   */
  documentSymbols(
    id: string,
    body: LspDocumentSymbolsParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DocumentSymbolResponse> {
    return this._client.post(`/v1/devboxes/${id}/lsp/document-symbols`, { body, ...options });
  }

  /**
   * Get the contents of a file at a given path relative to the root directory
   */
  file(
    id: string,
    body: LspFileParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<FileContentsResponse> {
    return this._client.post(`/v1/devboxes/${id}/lsp/file`, { body, ...options });
  }

  /**
   * Get the definition of a symbol at a given position in a file
   * https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_definition
   */
  fileDefinition(
    id: string,
    body: LspFileDefinitionParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<FileDefinitionResponse> {
    return this._client.post(`/v1/devboxes/${id}/lsp/file-definition`, { body, ...options });
  }

  /**
   * Get a list of all files being watched by the language server
   */
  files(id: string, options?: Core.RequestOptions): Core.APIPromise<LspFilesResponse> {
    return this._client.get(`/v1/devboxes/${id}/lsp/files`, options);
  }

  /**
   * Get formatting changes for a given document.
   * https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_formatting
   */
  formatting(
    id: string,
    body: LspFormattingParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<FormattingResponse> {
    return this._client.post(`/v1/devboxes/${id}/lsp/formatting`, { body, ...options });
  }

  /**
   * Get a list of code actions for a given diagnostic
   */
  getCodeActionsForDiagnostic(
    id: string,
    body: LspGetCodeActionsForDiagnosticParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<LspGetCodeActionsForDiagnosticResponse> {
    return this._client.post(`/v1/devboxes/${id}/lsp/get-code-actions-for-diagnostic`, { body, ...options });
  }

  /**
   * Get the symbol, reference, and diagnostic information for a given code segment
   * in a file at a given depth
   */
  getCodeSegmentInfo(
    id: string,
    body: LspGetCodeSegmentInfoParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<CodeSegmentInfoResponse> {
    return this._client.post(`/v1/devboxes/${id}/lsp/get-code-segment-info`, { body, ...options });
  }

  /**
   * Get the symbol, reference, and diagnostic information for a given code segment
   * in a file at a given depth
   */
  getSignatureHelp(
    id: string,
    body: LspGetSignatureHelpParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<SignatureHelpResponse> {
    return this._client.post(`/v1/devboxes/${id}/lsp/get-signature-help`, { body, ...options });
  }

  /**
   * This method provides a health check for the language server, including its
   * status, uptime, the directory being watched, and the name of the module.
   */
  health(id: string, options?: Core.RequestOptions): Core.APIPromise<HealthStatusResponse> {
    return this._client.get(`/v1/devboxes/${id}/lsp/health`, options);
  }

  /**
   * Get references for a given symbol. This method calls the `getReferences` method
   * of the `LanguageService` class, which in turn communicates with the TypeScript
   * language server to retrieve references for a given symbol in the document.
   * https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_references
   */
  references(
    id: string,
    body: LspReferencesParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<ReferencesResponse> {
    return this._client.post(`/v1/devboxes/${id}/lsp/references`, { body, ...options });
  }

  /**
   * Set the watch directory for the language server to a new path and restart the
   * server
   */
  setWatchDirectory(
    id: string,
    body: LspSetWatchDirectoryParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<string> {
    return this._client.post(`/v1/devboxes/${id}/lsp/set-watch-directory`, { body, ...options });
  }
}

export interface BaseCodeAction {
  title: string;

  command?: BaseCommand;

  edit?: BaseWorkspaceEdit;

  isPreferred?: boolean;

  kind?: string;
}

export interface BaseCommand {
  command: string;

  title: string;

  arguments?: Array<unknown>;
}

export interface BaseDiagnostic {
  message: string;

  range: BaseRange;

  code?: number | string;

  /**
   * The diagnostic's severity.
   */
  severity?: DiagnosticSeverity;

  source?: string;
}

export interface BaseLocation {
  range: BaseRange;

  uri: string;
}

export interface BaseMarkupContent {
  kind: string;

  value: string;
}

export interface BaseParameterInformation {
  label: string;

  documentation?: string | BaseMarkupContent;
}

export interface BaseRange {
  end: BaseRange.End;

  start: BaseRange.Start;
}

export namespace BaseRange {
  export interface End {
    character: number;

    line: number;
  }

  export interface Start {
    character: number;

    line: number;
  }
}

export interface BaseSignature {
  label: string;

  documentation?: string | BaseMarkupContent;

  parameters?: Array<BaseParameterInformation>;
}

export interface BaseWorkspaceEdit {
  /**
   * Construct a type with a set of properties K of type T
   */
  changes?: RecordStringTextEditArray;
}

export interface CodeActionApplicationResult {
  success: boolean;

  error?: string;

  filesChanged?: Array<string>;
}

/**
 * Contains additional diagnostic information about the context in which a {@link
 * CodeActionProvider.provideCodeActions code action} is run. The CodeActionContext
 * namespace provides helper functions to work with {@link CodeActionContext}
 * literals.
 */
export interface CodeActionContext {
  /**
   * An array of diagnostics known on the client side overlapping the range provided
   * to the `textDocument/codeAction` request. They are provided so that the server
   * knows which errors are currently presented to the user for the given range.
   * There is no guarantee that these accurately reflect the error state of the
   * resource. The primary parameter to compute code actions is the provided range.
   */
  diagnostics: Array<Diagnostic>;

  /**
   * Requested kind of actions to return.
   *
   * Actions not of this kind are filtered out by the client before being shown. So
   * servers can omit computing them.
   */
  only?: Array<CodeActionKind>;

  /**
   * The reason why code actions were requested.
   */
  triggerKind?: CodeActionTriggerKind;

  [k: string]: unknown;
}

/**
 * The kind of a code action.
 *
 * Kinds are a hierarchical list of identifiers separated by `.`, e.g.
 * `"refactor.extract.function"`.
 *
 * The set of kinds is open and client needs to announce the kinds it supports to
 * the server during initialization. A set of predefined code action kinds
 */
export type CodeActionKind = string;

export interface CodeActionsForDiagnosticRequestBody {
  diagnostic: BaseDiagnostic;

  uri: string;
}

export interface CodeActionsRequestBody {
  uri: string;

  /**
   * Contains additional diagnostic information about the context in which a {@link
   * CodeActionProvider.provideCodeActions code action} is run. The CodeActionContext
   * namespace provides helper functions to work with {@link CodeActionContext}
   * literals.
   */
  context?: CodeActionContext;

  /**
   * A range in a text document expressed as (zero-based) start and end positions.
   *
   * If you want to specify a range that contains a line including the line ending
   * character(s) then use an end position denoting the start of the next line. For
   * example:
   *
   * ```ts
   * {
   *     start: { line: 5, character: 23 }
   *     end : { line 6, character : 0 }
   * }
   * ```
   *
   * The Range namespace provides helper functions to work with {@link Range}
   * literals.
   */
  range?: Range;
}

export type CodeActionsResponse = Array<BaseCodeAction | BaseCommand>;

/**
 * The reason why code actions were requested.
 */
export type CodeActionTriggerKind = 1 | 2;

/**
 * Structure to capture a description for an error code. The CodeDescription
 * namespace provides functions to deal with descriptions for diagnostic codes.
 */
export interface CodeDescription {
  /**
   * An URI to open with more information about the diagnostic error.
   */
  href: URi;

  [k: string]: unknown;
}

export interface CodeSegmentInfoRequestBody {
  symbolName: string;

  uri: FileUri;

  symbolType?: SymbolType;
}

/**
 * Response for getting the code segment information for a given symbol in a file
 * including symbol information, references, diagnostics, and actions for the code
 * segment
 */
export interface CodeSegmentInfoResponse {
  actions: Array<BaseCodeAction>;

  diagnostics: Array<BaseDiagnostic>;

  references: Array<BaseLocation>;

  /**
   * Represents programming constructs like variables, classes, interfaces etc. that
   * appear in a document. Document symbols can be hierarchical and they have two
   * ranges: one that encloses its definition and one that points to its most
   * interesting range, e.g. the range of an identifier.
   */
  symbol: DocumentSymbol;

  uri: FileUri;

  hover?: CodeSegmentInfoResponse.Hover;

  signature?: SignatureHelpResponse;
}

export namespace CodeSegmentInfoResponse {
  export interface Hover {
    contents: unknown;

    range?: LspAPI.BaseRange;
  }
}

/**
 * Represents a diagnostic, such as a compiler error or warning. Diagnostic objects
 * are only valid in the scope of a resource. The Diagnostic namespace provides
 * helper functions to work with {@link Diagnostic} literals.
 */
export interface Diagnostic {
  /**
   * The diagnostic's message. It usually appears in the user interface
   */
  message: string;

  /**
   * The range at which the message applies
   */
  range: Range;

  /**
   * The diagnostic's code, which usually appear in the user interface.
   */
  code?: Integer | string;

  /**
   * An optional property to describe the error code. Requires the code field (above)
   * to be present/not null.
   */
  codeDescription?: CodeDescription;

  /**
   * A data entry field that is preserved between a `textDocument/publishDiagnostics`
   * notification and `textDocument/codeAction` request.
   */
  data?: LSpAny;

  /**
   * An array of related diagnostic information, e.g. when symbol-names within a
   * scope collide all definitions can be marked via this property.
   */
  relatedInformation?: Array<DiagnosticRelatedInformation>;

  /**
   * The diagnostic's severity. Can be omitted. If omitted it is up to the client to
   * interpret diagnostics as error, warning, info or hint.
   */
  severity?: DiagnosticSeverity;

  /**
   * A human-readable string describing the source of this diagnostic, e.g.
   * 'typescript' or 'super lint'. It usually appears in the user interface.
   */
  source?: string;

  /**
   * Additional metadata about the diagnostic.
   */
  tags?: Array<DiagnosticTag>;

  [k: string]: unknown;
}

/**
 * Represents a related message and source code location for a diagnostic. This
 * should be used to point to code locations that cause or related to a
 * diagnostics, e.g when duplicating a symbol in a scope. The
 * DiagnosticRelatedInformation namespace provides helper functions to work with
 * {@link DiagnosticRelatedInformation} literals.
 */
export interface DiagnosticRelatedInformation {
  /**
   * The location of this related diagnostic information.
   */
  location: Location;

  /**
   * The message of this related diagnostic information.
   */
  message: string;

  [k: string]: unknown;
}

/**
 * The diagnostic's severity.
 */
export type DiagnosticSeverity = 1 | 2 | 3 | 4;

export interface DiagnosticsResponse {
  diagnostics: Array<BaseDiagnostic>;

  uri: string;
}

/**
 * The diagnostic tags.
 */
export type DiagnosticTag = 1 | 2;

/**
 * Represents programming constructs like variables, classes, interfaces etc. that
 * appear in a document. Document symbols can be hierarchical and they have two
 * ranges: one that encloses its definition and one that points to its most
 * interesting range, e.g. the range of an identifier.
 */
export interface DocumentSymbol {
  /**
   * The kind of this symbol.
   */
  kind: SymbolKind;

  /**
   * The name of this symbol. Will be displayed in the user interface and therefore
   * must not be an empty string or a string only consisting of white spaces.
   */
  name: string;

  /**
   * The range enclosing this symbol not including leading/trailing whitespace but
   * everything else like comments. This information is typically used to determine
   * if the clients cursor is inside the symbol to reveal in the symbol in the UI.
   */
  range: Range;

  /**
   * The range that should be selected and revealed when this symbol is being picked,
   * e.g the name of a function. Must be contained by the `range`.
   */
  selectionRange: Range;

  /**
   * Children of this symbol, e.g. properties of a class.
   */
  children?: Array<DocumentSymbol>;

  /**
   * @deprecated Indicates if this symbol is deprecated.
   */
  deprecated?: boolean;

  /**
   * More detail for this symbol, e.g the signature of a function.
   */
  detail?: string;

  /**
   * Tags for this document symbol.
   */
  tags?: Array<SymbolTag>;

  [k: string]: unknown;
}

export type DocumentSymbolResponse = Array<DocumentSymbolResponse.DocumentSymbolResponseItem>;

export namespace DocumentSymbolResponse {
  export interface DocumentSymbolResponseItem {
    /**
     * A symbol kind.
     */
    kind: LspAPI.SymbolKind;

    name: string;

    range: LspAPI.BaseRange;

    selectionRange: LspAPI.BaseRange;
  }
}

/**
 * A tagging type for string properties that are actually document URIs.
 */
export type DocumentUri = string;

export interface FileContentsResponse {
  contents: string;

  fullPath: string;

  path: FilePath;
}

export interface FileDefinitionRequestBody {
  character: number;

  line: number;

  uri: string;
}

export type FileDefinitionResponse = Array<BaseLocation>;

export type FilePath = string;

/**
 * Requesting a file parameter with a URI with absolute or relative path example
 * with absolute uri: file://Users/user/project/src/index.ts
 */
export interface FileRequestBody {
  uri: FileUri;
}

export type FileUri = string;

export type FormattingResponse = Array<TextEdit>;

export interface HealthStatusResponse {
  dirtyFiles: Array<string>;

  moduleName: string;

  pendingWork: { [key: string]: unknown };

  status: string;

  uptime: string;

  watchDirectory: string;
}

/**
 * Defines an integer in the range of -2^31 to 2^31 - 1.
 */
export type Integer = number;

/**
 * Represents a location inside a resource, such as a line inside a text file. The
 * Location namespace provides helper functions to work with {@link Location}
 * literals.
 */
export interface Location {
  /**
   * A range in a text document expressed as (zero-based) start and end positions.
   *
   * If you want to specify a range that contains a line including the line ending
   * character(s) then use an end position denoting the start of the next line. For
   * example:
   *
   * ```ts
   * {
   *     start: { line: 5, character: 23 }
   *     end : { line 6, character : 0 }
   * }
   * ```
   *
   * The Range namespace provides helper functions to work with {@link Range}
   * literals.
   */
  range: Range;

  /**
   * A tagging type for string properties that are actually document URIs.
   */
  uri: DocumentUri;

  [k: string]: unknown;
}

/**
 * The LSP any type.
 *
 * In the current implementation we map LSPAny to any. This is due to the fact that
 * the TypeScript compilers can't infer string access signatures for interface
 * correctly (it can though for types). See the following issue for details:
 * https://github.com/microsoft/TypeScript/issues/15300.
 *
 * When the issue is addressed LSPAny can be defined as follows:
 *
 * ```ts
 * export type LSPAny =
 *   | LSPObject
 *   | LSPArray
 *   | string
 *   | integer
 *   | uinteger
 *   | decimal
 *   | boolean
 *   | null
 *   | undefined;
 * export type LSPObject = { [key: string]: LSPAny };
 * export type LSPArray = LSPAny[];
 * ```
 *
 * Please note that strictly speaking a property with the value `undefined` can't
 * be converted into JSON preserving the property name. However for convenience it
 * is allowed and assumed that all these properties are optional as well.
 */
export type LSpAny = unknown;

/**
 * Position in a text document expressed as zero-based line and character offset.
 * Prior to 3.17 the offsets were always based on a UTF-16 string representation.
 * So a string of the form `a𐐀b` the character offset of the character `a` is 0,
 * the character offset of `𐐀` is 1 and the character offset of b is 3 since `𐐀` is
 * represented using two code units in UTF-16. Since 3.17 clients and servers can
 * agree on a different string encoding representation (e.g. UTF-8). The client
 * announces it's supported encoding via the client capability
 * [`general.positionEncodings`](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#clientCapabilities).
 * The value is an array of position encodings the client supports, with decreasing
 * preference (e.g. the encoding at index `0` is the most preferred one). To stay
 * backwards compatible the only mandatory encoding is UTF-16 represented via the
 * string `utf-16`. The server can pick one of the encodings offered by the client
 * and signals that encoding back to the client via the initialize result's
 * property
 * [`capabilities.positionEncoding`](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#serverCapabilities).
 * If the string value `utf-16` is missing from the client's capability
 * `general.positionEncodings` servers can safely assume that the client supports
 * UTF-16. If the server omits the position encoding in its initialize result the
 * encoding defaults to the string value `utf-16`. Implementation considerations:
 * since the conversion from one encoding into another requires the content of the
 * file / line the conversion is best done where the file is read which is usually
 * on the server side.
 *
 * Positions are line end character agnostic. So you can not specify a position
 * that denotes `\r|\n` or `\n|` where `|` represents the character offset. The
 * Position namespace provides helper functions to work with {@link Position}
 * literals.
 */
export interface Position {
  /**
   * Character offset on a line in a document (zero-based).
   *
   * The meaning of this offset is determined by the negotiated
   * `PositionEncodingKind`.
   *
   * If the character value is greater than the line length it defaults back to the
   * line length.
   */
  character: Uinteger;

  /**
   * Line position in a document (zero-based).
   *
   * If a line number is greater than the number of lines in a document, it defaults
   * back to the number of lines in the document. If a line number is negative, it
   * defaults to 0.
   */
  line: Uinteger;

  [k: string]: unknown;
}

/**
 * A range in a text document expressed as (zero-based) start and end positions.
 *
 * If you want to specify a range that contains a line including the line ending
 * character(s) then use an end position denoting the start of the next line. For
 * example:
 *
 * ```ts
 * {
 *     start: { line: 5, character: 23 }
 *     end : { line 6, character : 0 }
 * }
 * ```
 *
 * The Range namespace provides helper functions to work with {@link Range}
 * literals.
 */
export interface Range {
  /**
   * The range's end position.
   */
  end: Position;

  /**
   * The range's start position.
   */
  start: Position;

  [k: string]: unknown;
}

/**
 * Construct a type with a set of properties K of type T
 */
export type RecordStringTextEditArray = { [key: string]: Array<TextEdit> };

export interface ReferencesRequestBody {
  character: number;

  line: number;

  uri: string;
}

export type ReferencesResponse = Array<BaseLocation>;

export interface SetWatchDirectoryRequestBody {
  path: FilePath;
}

export interface SignatureHelpRequestBody {
  character: number;

  line: number;

  uri: string;
}

export interface SignatureHelpResponse {
  signatures: Array<BaseSignature>;

  activeParameter?: number;

  activeSignature?: number;
}

/**
 * A symbol kind.
 */
export type SymbolKind =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26;

/**
 * Symbol tags are extra annotations that tweak the rendering of a symbol.
 */
export type SymbolTag = 1;

export type SymbolType = 'function' | 'variable' | 'class' | 'interface' | 'type';

/**
 * A text edit applicable to a text document. The TextEdit namespace provides
 * helper function to create replace, insert and delete edits more easily.
 */
export interface TextEdit {
  /**
   * The string to be inserted. For delete operations use an empty string.
   */
  newText: string;

  /**
   * The range of the text document to be manipulated. To insert text into a document
   * create a range where start === end.
   */
  range: Range;

  [k: string]: unknown;
}

/**
 * Defines an unsigned integer in the range of 0 to 2^31 - 1.
 */
export type Uinteger = number;

/**
 * A tagging type for string properties that are actually URIs
 */
export type URi = string;

export interface WatchedFileResponse {
  filename: string;

  fullPath: string;

  path: string;
}

export type LspFilesResponse = Array<WatchedFileResponse>;

export type LspGetCodeActionsForDiagnosticResponse = Array<BaseCodeAction>;

export type LspSetWatchDirectoryResponse = string;

export interface LspApplyCodeActionParams {
  title: string;

  command?: BaseCommand;

  edit?: BaseWorkspaceEdit;

  isPreferred?: boolean;

  kind?: string;
}

export interface LspCodeActionsParams {
  uri: string;

  /**
   * Contains additional diagnostic information about the context in which a {@link
   * CodeActionProvider.provideCodeActions code action} is run. The CodeActionContext
   * namespace provides helper functions to work with {@link CodeActionContext}
   * literals.
   */
  context?: CodeActionContext;

  /**
   * A range in a text document expressed as (zero-based) start and end positions.
   *
   * If you want to specify a range that contains a line including the line ending
   * character(s) then use an end position denoting the start of the next line. For
   * example:
   *
   * ```ts
   * {
   *     start: { line: 5, character: 23 }
   *     end : { line 6, character : 0 }
   * }
   * ```
   *
   * The Range namespace provides helper functions to work with {@link Range}
   * literals.
   */
  range?: Range;
}

export interface LspDiagnosticsParams {
  uri: FileUri;
}

export interface LspDocumentSymbolsParams {
  uri: FileUri;
}

export interface LspFileParams {
  path: FilePath;
}

export interface LspFileDefinitionParams {
  character: number;

  line: number;

  uri: string;
}

export interface LspFormattingParams {
  uri: FileUri;
}

export interface LspGetCodeActionsForDiagnosticParams {
  diagnostic: BaseDiagnostic;

  uri: string;
}

export interface LspGetCodeSegmentInfoParams {
  symbolName: string;

  uri: FileUri;

  symbolType?: SymbolType;
}

export interface LspGetSignatureHelpParams {
  character: number;

  line: number;

  uri: string;
}

export interface LspReferencesParams {
  character: number;

  line: number;

  uri: string;
}

export interface LspSetWatchDirectoryParams {
  path: FilePath;
}

export declare namespace Lsp {
  export {
    type BaseCodeAction as BaseCodeAction,
    type BaseCommand as BaseCommand,
    type BaseDiagnostic as BaseDiagnostic,
    type BaseLocation as BaseLocation,
    type BaseMarkupContent as BaseMarkupContent,
    type BaseParameterInformation as BaseParameterInformation,
    type BaseRange as BaseRange,
    type BaseSignature as BaseSignature,
    type BaseWorkspaceEdit as BaseWorkspaceEdit,
    type CodeActionApplicationResult as CodeActionApplicationResult,
    type CodeActionContext as CodeActionContext,
    type CodeActionKind as CodeActionKind,
    type CodeActionsForDiagnosticRequestBody as CodeActionsForDiagnosticRequestBody,
    type CodeActionsRequestBody as CodeActionsRequestBody,
    type CodeActionsResponse as CodeActionsResponse,
    type CodeActionTriggerKind as CodeActionTriggerKind,
    type CodeDescription as CodeDescription,
    type CodeSegmentInfoRequestBody as CodeSegmentInfoRequestBody,
    type CodeSegmentInfoResponse as CodeSegmentInfoResponse,
    type Diagnostic as Diagnostic,
    type DiagnosticRelatedInformation as DiagnosticRelatedInformation,
    type DiagnosticSeverity as DiagnosticSeverity,
    type DiagnosticsResponse as DiagnosticsResponse,
    type DiagnosticTag as DiagnosticTag,
    type DocumentSymbol as DocumentSymbol,
    type DocumentSymbolResponse as DocumentSymbolResponse,
    type DocumentUri as DocumentUri,
    type FileContentsResponse as FileContentsResponse,
    type FileDefinitionRequestBody as FileDefinitionRequestBody,
    type FileDefinitionResponse as FileDefinitionResponse,
    type FilePath as FilePath,
    type FileRequestBody as FileRequestBody,
    type FileUri as FileUri,
    type FormattingResponse as FormattingResponse,
    type HealthStatusResponse as HealthStatusResponse,
    type Integer as Integer,
    type Location as Location,
    type LSpAny as LSpAny,
    type Position as Position,
    type Range as Range,
    type RecordStringTextEditArray as RecordStringTextEditArray,
    type ReferencesRequestBody as ReferencesRequestBody,
    type ReferencesResponse as ReferencesResponse,
    type SetWatchDirectoryRequestBody as SetWatchDirectoryRequestBody,
    type SignatureHelpRequestBody as SignatureHelpRequestBody,
    type SignatureHelpResponse as SignatureHelpResponse,
    type SymbolKind as SymbolKind,
    type SymbolTag as SymbolTag,
    type SymbolType as SymbolType,
    type TextEdit as TextEdit,
    type Uinteger as Uinteger,
    type URi as URi,
    type WatchedFileResponse as WatchedFileResponse,
    type LspFilesResponse as LspFilesResponse,
    type LspGetCodeActionsForDiagnosticResponse as LspGetCodeActionsForDiagnosticResponse,
    type LspSetWatchDirectoryResponse as LspSetWatchDirectoryResponse,
    type LspApplyCodeActionParams as LspApplyCodeActionParams,
    type LspCodeActionsParams as LspCodeActionsParams,
    type LspDiagnosticsParams as LspDiagnosticsParams,
    type LspDocumentSymbolsParams as LspDocumentSymbolsParams,
    type LspFileParams as LspFileParams,
    type LspFileDefinitionParams as LspFileDefinitionParams,
    type LspFormattingParams as LspFormattingParams,
    type LspGetCodeActionsForDiagnosticParams as LspGetCodeActionsForDiagnosticParams,
    type LspGetCodeSegmentInfoParams as LspGetCodeSegmentInfoParams,
    type LspGetSignatureHelpParams as LspGetSignatureHelpParams,
    type LspReferencesParams as LspReferencesParams,
    type LspSetWatchDirectoryParams as LspSetWatchDirectoryParams,
  };
}
