// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as Errors from './error';
import * as Uploads from './uploads';
import { type Agent } from './_shims/index';
import * as Core from './core';
import * as API from './resources/index';

export interface ClientOptions {
  /**
   * Defaults to process.env['RUNLOOP_API_KEY'].
   */
  bearerToken?: string | undefined;

  /**
   * Override the default base URL for the API, e.g., "https://api.example.com/v2/"
   *
   * Defaults to process.env['RUNLOOP_BASE_URL'].
   */
  baseURL?: string | null | undefined;

  /**
   * The maximum amount of time (in milliseconds) that the client should wait for a response
   * from the server before timing out a single request.
   *
   * Note that request timeouts are retried by default, so in a worst-case scenario you may wait
   * much longer than this timeout before the promise succeeds or fails.
   */
  timeout?: number;

  /**
   * An HTTP agent used to manage HTTP(S) connections.
   *
   * If not provided, an agent will be constructed by default in the Node.js environment,
   * otherwise no agent is used.
   */
  httpAgent?: Agent;

  /**
   * Specify a custom `fetch` function implementation.
   *
   * If not provided, we use `node-fetch` on Node.js and otherwise expect that `fetch` is
   * defined globally.
   */
  fetch?: Core.Fetch | undefined;

  /**
   * The maximum number of times that the client will retry a request in case of a
   * temporary failure, like a network error or a 5XX error from the server.
   *
   * @default 2
   */
  maxRetries?: number;

  /**
   * Default headers to include with every request to the API.
   *
   * These can be removed in individual requests by explicitly setting the
   * header to `undefined` or `null` in request options.
   */
  defaultHeaders?: Core.Headers;

  /**
   * Default query parameters to include with every request to the API.
   *
   * These can be removed in individual requests by explicitly setting the
   * param to `undefined` in request options.
   */
  defaultQuery?: Core.DefaultQuery;
}

/**
 * API Client for interfacing with the Runloop API.
 */
export class Runloop extends Core.APIClient {
  bearerToken: string;

  private _options: ClientOptions;

  /**
   * API Client for interfacing with the Runloop API.
   *
   * @param {string | undefined} [opts.bearerToken=process.env['RUNLOOP_API_KEY'] ?? undefined]
   * @param {string} [opts.baseURL=process.env['RUNLOOP_BASE_URL'] ?? https://api.runloop.ai] - Override the default base URL for the API.
   * @param {number} [opts.timeout=1 minute] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {number} [opts.httpAgent] - An HTTP agent used to manage HTTP(s) connections.
   * @param {Core.Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {Core.Headers} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Core.DefaultQuery} opts.defaultQuery - Default query parameters to include with every request to the API.
   */
  constructor({
    baseURL = Core.readEnv('RUNLOOP_BASE_URL'),
    bearerToken = Core.readEnv('RUNLOOP_API_KEY'),
    ...opts
  }: ClientOptions = {}) {
    if (bearerToken === undefined) {
      throw new Errors.RunloopError(
        "The RUNLOOP_API_KEY environment variable is missing or empty; either provide it, or instantiate the Runloop client with an bearerToken option, like new Runloop({ bearerToken: 'My Bearer Token' }).",
      );
    }

    const options: ClientOptions = {
      bearerToken,
      ...opts,
      baseURL: baseURL || `https://api.runloop.ai`,
    };

    super({
      baseURL: options.baseURL!,
      timeout: options.timeout ?? 60000 /* 1 minute */,
      httpAgent: options.httpAgent,
      maxRetries: options.maxRetries,
      fetch: options.fetch,
    });

    this._options = options;

    this.bearerToken = bearerToken;
  }

  account: API.Account = new API.Account(this);
  blueprints: API.Blueprints = new API.Blueprints(this);
  code: API.Code = new API.Code(this);
  devboxes: API.Devboxes = new API.Devboxes(this);
  functions: API.Functions = new API.Functions(this);
  projects: API.Projects = new API.Projects(this);

  protected override defaultQuery(): Core.DefaultQuery | undefined {
    return this._options.defaultQuery;
  }

  protected override defaultHeaders(opts: Core.FinalRequestOptions): Core.Headers {
    return {
      ...super.defaultHeaders(opts),
      ...this._options.defaultHeaders,
    };
  }

  protected override authHeaders(opts: Core.FinalRequestOptions): Core.Headers {
    return { Authorization: `Bearer ${this.bearerToken}` };
  }

  static Runloop = this;
  static DEFAULT_TIMEOUT = 60000; // 1 minute

  static RunloopError = Errors.RunloopError;
  static APIError = Errors.APIError;
  static APIConnectionError = Errors.APIConnectionError;
  static APIConnectionTimeoutError = Errors.APIConnectionTimeoutError;
  static APIUserAbortError = Errors.APIUserAbortError;
  static NotFoundError = Errors.NotFoundError;
  static ConflictError = Errors.ConflictError;
  static RateLimitError = Errors.RateLimitError;
  static BadRequestError = Errors.BadRequestError;
  static AuthenticationError = Errors.AuthenticationError;
  static InternalServerError = Errors.InternalServerError;
  static PermissionDeniedError = Errors.PermissionDeniedError;
  static UnprocessableEntityError = Errors.UnprocessableEntityError;

  static toFile = Uploads.toFile;
  static fileFromPath = Uploads.fileFromPath;
}

export const {
  RunloopError,
  APIError,
  APIConnectionError,
  APIConnectionTimeoutError,
  APIUserAbortError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  BadRequestError,
  AuthenticationError,
  InternalServerError,
  PermissionDeniedError,
  UnprocessableEntityError,
} = Errors;

export import toFile = Uploads.toFile;
export import fileFromPath = Uploads.fileFromPath;

export namespace Runloop {
  export import RequestOptions = Core.RequestOptions;

  export import Account = API.Account;
  export import ResourceSize = API.ResourceSize;

  export import Blueprints = API.Blueprints;
  export import BlueprintBuildLog = API.BlueprintBuildLog;
  export import BlueprintBuildLogsListView = API.BlueprintBuildLogsListView;
  export import BlueprintBuildParameters = API.BlueprintBuildParameters;
  export import BlueprintListView = API.BlueprintListView;
  export import BlueprintPreviewView = API.BlueprintPreviewView;
  export import BlueprintView = API.BlueprintView;
  export import BlueprintCreateParams = API.BlueprintCreateParams;
  export import BlueprintListParams = API.BlueprintListParams;
  export import BlueprintPreviewParams = API.BlueprintPreviewParams;

  export import Code = API.Code;
  export import CodeMountParameters = API.CodeMountParameters;

  export import Devboxes = API.Devboxes;
  export import DevboxAsyncExecutionDetailView = API.DevboxAsyncExecutionDetailView;
  export import DevboxExecutionDetailView = API.DevboxExecutionDetailView;
  export import DevboxListView = API.DevboxListView;
  export import DevboxSnapshotListView = API.DevboxSnapshotListView;
  export import DevboxSnapshotView = API.DevboxSnapshotView;
  export import DevboxView = API.DevboxView;
  export import DevboxCreateSSHKeyResponse = API.DevboxCreateSSHKeyResponse;
  export import DevboxReadFileContentsResponse = API.DevboxReadFileContentsResponse;
  export import DevboxUploadFileResponse = API.DevboxUploadFileResponse;
  export import DevboxCreateParams = API.DevboxCreateParams;
  export import DevboxListParams = API.DevboxListParams;
  export import DevboxDiskSnapshotsParams = API.DevboxDiskSnapshotsParams;
  export import DevboxDownloadFileParams = API.DevboxDownloadFileParams;
  export import DevboxExecuteAsyncParams = API.DevboxExecuteAsyncParams;
  export import DevboxExecuteSyncParams = API.DevboxExecuteSyncParams;
  export import DevboxReadFileContentsParams = API.DevboxReadFileContentsParams;
  export import DevboxSnapshotDiskParams = API.DevboxSnapshotDiskParams;
  export import DevboxUploadFileParams = API.DevboxUploadFileParams;
  export import DevboxWriteFileParams = API.DevboxWriteFileParams;

  export import Functions = API.Functions;
  export import FunctionListView = API.FunctionListView;
  export import FunctionInvokeAsyncParams = API.FunctionInvokeAsyncParams;
  export import FunctionInvokeSyncParams = API.FunctionInvokeSyncParams;

  export import Projects = API.Projects;
  export import ProjectListView = API.ProjectListView;

  export import FunctionInvocationExecutionDetailView = API.FunctionInvocationExecutionDetailView;
  export import LaunchParameters = API.LaunchParameters;
  export import ProjectLogsView = API.ProjectLogsView;
}

export default Runloop;
