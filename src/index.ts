// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { type Agent } from './_shims/index';
import * as Core from './core';
import * as Errors from './error';
import * as Uploads from './uploads';
import * as API from './resources/index';
import {
  BlueprintBuildLog,
  BlueprintBuildLogsListView,
  BlueprintBuildParameters,
  BlueprintCreateParams,
  BlueprintListParams,
  BlueprintListView,
  BlueprintPreviewParams,
  BlueprintPreviewView,
  BlueprintView,
  Blueprints,
} from './resources/blueprints';
import { Code, CodeMountParameters } from './resources/code';
import { Repositories } from './resources/repositories';
import {
  DevboxAsyncExecutionDetailView,
  DevboxCreateParams,
  DevboxCreateSSHKeyResponse,
  DevboxCreateTunnelParams,
  DevboxDiskSnapshotsParams,
  DevboxDownloadFileParams,
  DevboxExecuteAsyncParams,
  DevboxExecuteSyncParams,
  DevboxExecutionDetailView,
  DevboxKeepAliveResponse,
  DevboxListParams,
  DevboxListView,
  DevboxReadFileContentsParams,
  DevboxReadFileContentsResponse,
  DevboxSnapshotDiskParams,
  DevboxSnapshotListView,
  DevboxSnapshotView,
  DevboxTunnelView,
  DevboxUploadFileParams,
  DevboxUploadFileResponse,
  DevboxView,
  DevboxWriteFileParams,
  Devboxes,
} from './resources/devboxes/devboxes';
import {
  FunctionInvokeAsyncParams,
  FunctionInvokeSyncParams,
  FunctionListView,
  Functions,
} from './resources/functions/functions';
import { ProjectListView, Projects } from './resources/projects/projects';

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

  blueprints: API.Blueprints = new API.Blueprints(this);
  code: API.Code = new API.Code(this);
  devboxes: API.Devboxes = new API.Devboxes(this);
  repositories: API.Repositories = new API.Repositories(this);
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

Runloop.Blueprints = Blueprints;
Runloop.Code = Code;
Runloop.Devboxes = Devboxes;
Runloop.Repositories = Repositories;
Runloop.Functions = Functions;
Runloop.Projects = Projects;
export declare namespace Runloop {
  export type RequestOptions = Core.RequestOptions;

  export {
    Blueprints as Blueprints,
    type BlueprintBuildLog as BlueprintBuildLog,
    type BlueprintBuildLogsListView as BlueprintBuildLogsListView,
    type BlueprintBuildParameters as BlueprintBuildParameters,
    type BlueprintListView as BlueprintListView,
    type BlueprintPreviewView as BlueprintPreviewView,
    type BlueprintView as BlueprintView,
    type BlueprintCreateParams as BlueprintCreateParams,
    type BlueprintListParams as BlueprintListParams,
    type BlueprintPreviewParams as BlueprintPreviewParams,
  };

  export { Code as Code, type CodeMountParameters as CodeMountParameters };

  export {
    Devboxes as Devboxes,
    type DevboxAsyncExecutionDetailView as DevboxAsyncExecutionDetailView,
    type DevboxExecutionDetailView as DevboxExecutionDetailView,
    type DevboxListView as DevboxListView,
    type DevboxSnapshotListView as DevboxSnapshotListView,
    type DevboxSnapshotView as DevboxSnapshotView,
    type DevboxTunnelView as DevboxTunnelView,
    type DevboxView as DevboxView,
    type DevboxCreateSSHKeyResponse as DevboxCreateSSHKeyResponse,
    type DevboxKeepAliveResponse as DevboxKeepAliveResponse,
    type DevboxReadFileContentsResponse as DevboxReadFileContentsResponse,
    type DevboxUploadFileResponse as DevboxUploadFileResponse,
    type DevboxCreateParams as DevboxCreateParams,
    type DevboxListParams as DevboxListParams,
    type DevboxCreateTunnelParams as DevboxCreateTunnelParams,
    type DevboxDiskSnapshotsParams as DevboxDiskSnapshotsParams,
    type DevboxDownloadFileParams as DevboxDownloadFileParams,
    type DevboxExecuteAsyncParams as DevboxExecuteAsyncParams,
    type DevboxExecuteSyncParams as DevboxExecuteSyncParams,
    type DevboxReadFileContentsParams as DevboxReadFileContentsParams,
    type DevboxSnapshotDiskParams as DevboxSnapshotDiskParams,
    type DevboxUploadFileParams as DevboxUploadFileParams,
    type DevboxWriteFileParams as DevboxWriteFileParams,
  };

  export { Repositories as Repositories };

  export {
    Functions as Functions,
    type FunctionListView as FunctionListView,
    type FunctionInvokeAsyncParams as FunctionInvokeAsyncParams,
    type FunctionInvokeSyncParams as FunctionInvokeSyncParams,
  };

  export { Projects as Projects, type ProjectListView as ProjectListView };

  export type AfterIdle = API.AfterIdle;
  export type FunctionInvocationExecutionDetailView = API.FunctionInvocationExecutionDetailView;
  export type LaunchParameters = API.LaunchParameters;
  export type ProjectLogsView = API.ProjectLogsView;
}

export { toFile, fileFromPath } from './uploads';
export {
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
} from './error';

export default Runloop;
