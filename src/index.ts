// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { type Agent } from './_shims/index';
import * as Core from './core';
import * as Errors from './error';
import * as Pagination from './pagination';
import {
  type AgentsCursorIDPageParams,
  AgentsCursorIDPageResponse,
  type BenchmarkRunsCursorIDPageParams,
  BenchmarkRunsCursorIDPageResponse,
  type BenchmarksCursorIDPageParams,
  BenchmarksCursorIDPageResponse,
  type BlueprintsCursorIDPageParams,
  BlueprintsCursorIDPageResponse,
  type DevboxesCursorIDPageParams,
  DevboxesCursorIDPageResponse,
  type DiskSnapshotsCursorIDPageParams,
  DiskSnapshotsCursorIDPageResponse,
  type ObjectsCursorIDPageParams,
  ObjectsCursorIDPageResponse,
  type RepositoriesCursorIDPageParams,
  RepositoriesCursorIDPageResponse,
  type ScenarioRunsCursorIDPageParams,
  ScenarioRunsCursorIDPageResponse,
  type ScenarioScorersCursorIDPageParams,
  ScenarioScorersCursorIDPageResponse,
  type ScenariosCursorIDPageParams,
  ScenariosCursorIDPageResponse,
} from './pagination';
import * as Uploads from './uploads';
import * as API from './resources/index';
import {
  AgentCreateParameters,
  AgentCreateParams,
  AgentListParams,
  AgentListView,
  AgentView,
  AgentViewsAgentsCursorIDPage,
  Agents,
} from './resources/agents';
import {
  BlueprintBuildFromInspectionParameters,
  BlueprintBuildLog,
  BlueprintBuildLogsListView,
  BlueprintBuildParameters,
  BlueprintCreateFromInspectionParams,
  BlueprintCreateParams,
  BlueprintDeleteResponse,
  BlueprintListParams,
  BlueprintListPublicParams,
  BlueprintListView,
  BlueprintPreviewParams,
  BlueprintPreviewView,
  BlueprintView,
  BlueprintViewsBlueprintsCursorIDPage,
  Blueprints,
  InspectionSource,
} from './resources/blueprints';
import {
  ObjectCompleteParams,
  ObjectCreateParameters,
  ObjectCreateParams,
  ObjectDeleteParams,
  ObjectDownloadParams,
  ObjectDownloadURLView,
  ObjectListParams,
  ObjectListPublicParams,
  ObjectListView,
  ObjectView,
  ObjectViewsObjectsCursorIDPage,
  Objects,
} from './resources/objects';
import {
  Repositories,
  RepositoryConnectionListView,
  RepositoryConnectionView,
  RepositoryConnectionViewsRepositoriesCursorIDPage,
  RepositoryCreateParams,
  RepositoryDeleteParams,
  RepositoryDeleteResponse,
  RepositoryInspectParams,
  RepositoryInspectionDetails,
  RepositoryInspectionListView,
  RepositoryListParams,
  RepositoryManifestView,
  RepositoryRefreshParams,
  RepositoryRefreshResponse,
} from './resources/repositories';
import {
  SecretCreateParameters,
  SecretCreateParams,
  SecretDeleteParams,
  SecretListParams,
  SecretListView,
  SecretUpdateParameters,
  SecretUpdateParams,
  SecretView,
  Secrets,
} from './resources/secrets';
import {
  BenchmarkCreateParameters,
  BenchmarkCreateParams,
  BenchmarkDefinitionsParams,
  BenchmarkListParams,
  BenchmarkListPublicParams,
  BenchmarkRunListView,
  BenchmarkRunView,
  BenchmarkStartRunParams,
  BenchmarkUpdateParams,
  BenchmarkView,
  BenchmarkViewsBenchmarksCursorIDPage,
  Benchmarks,
  ScenarioDefinitionListView,
  StartBenchmarkRunParameters,
} from './resources/benchmarks/benchmarks';
import {
  DevboxAsyncExecutionDetailView,
  DevboxCreateParams,
  DevboxCreateSSHKeyResponse,
  DevboxCreateTunnelParams,
  DevboxDeleteDiskSnapshotResponse,
  DevboxDownloadFileParams,
  DevboxExecuteAsyncParams,
  DevboxExecuteParams,
  DevboxExecuteSyncParams,
  DevboxExecutionDetailView,
  DevboxKeepAliveResponse,
  DevboxKillExecutionRequest,
  DevboxListDiskSnapshotsParams,
  DevboxListParams,
  DevboxListView,
  DevboxReadFileContentsParams,
  DevboxReadFileContentsResponse,
  DevboxRemoveTunnelParams,
  DevboxRemoveTunnelResponse,
  DevboxSendStdInRequest,
  DevboxSendStdInResult,
  DevboxSnapshotDiskAsyncParams,
  DevboxSnapshotDiskParams,
  DevboxSnapshotListView,
  DevboxSnapshotView,
  DevboxSnapshotViewsDiskSnapshotsCursorIDPage,
  DevboxTunnelView,
  DevboxUpdateParams,
  DevboxUploadFileParams,
  DevboxUploadFileResponse,
  DevboxView,
  DevboxViewsDevboxesCursorIDPage,
  DevboxWaitForCommandParams,
  DevboxWriteFileContentsParams,
  Devboxes,
} from './resources/devboxes/devboxes';
import {
  InputContext,
  InputContextUpdate,
  ScenarioCreateParameters,
  ScenarioCreateParams,
  ScenarioEnvironment,
  ScenarioListParams,
  ScenarioListPublicParams,
  ScenarioRunListView,
  ScenarioRunView,
  ScenarioStartRunParams,
  ScenarioUpdateParameters,
  ScenarioUpdateParams,
  ScenarioView,
  ScenarioViewsScenariosCursorIDPage,
  Scenarios,
  ScoringContract,
  ScoringContractResultView,
  ScoringContractUpdate,
  ScoringFunction,
  ScoringFunctionResultView,
  StartScenarioRunParameters,
} from './resources/scenarios/scenarios';

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
   *
   */
  timeout?: number | undefined;

  /**
   * An HTTP agent used to manage HTTP(S) connections.
   *
   * If not provided, an agent will be constructed by default in the Node.js environment,
   * otherwise no agent is used.
   */
  httpAgent?: Agent | undefined;

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
   * @default 5
   */
  maxRetries?: number | undefined;

  /**
   * Default headers to include with every request to the API.
   *
   * These can be removed in individual requests by explicitly setting the
   * header to `undefined` or `null` in request options.
   */
  defaultHeaders?: Core.Headers | undefined;

  /**
   * Default query parameters to include with every request to the API.
   *
   * These can be removed in individual requests by explicitly setting the
   * param to `undefined` in request options.
   */
  defaultQuery?: Core.DefaultQuery | undefined;
}

/**
 * API Client for interfacing with the Runloop API. This is the runloop api client. Use the new {@link RunloopSDK} instead like this:
 * @example
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client';
 * const runloop = new RunloopSDK();
 * const devbox = await runloop.devbox.create();
 * const result = await devbox.cmd.exec('echo "Hello, World!"');
 * console.log(result.exitCode);
 * ```
 */
export class Runloop extends Core.APIClient {
  bearerToken: string;

  private _options: ClientOptions;

  /**
   * API Client for interfacing with the Runloop API.
   *
   * @param {string | undefined} [opts.bearerToken=process.env['RUNLOOP_API_KEY'] ?? undefined]
   * @param {string} [opts.baseURL=process.env['RUNLOOP_BASE_URL'] ?? https://api.runloop.ai] - Override the default base URL for the API.
   * @param {number} [opts.timeout=30 seconds] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {number} [opts.httpAgent] - An HTTP agent used to manage HTTP(s) connections.
   * @param {Core.Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=5] - The maximum number of times the client will retry a request.
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
      baseURLOverridden: baseURL ? baseURL !== 'https://api.runloop.ai' : false,
      timeout: options.timeout ?? 30000 /* 30 seconds */,
      httpAgent: options.httpAgent,
      maxRetries: options.maxRetries,
      fetch: options.fetch,
    });

    this._options = options;
    this.idempotencyHeader = 'x-request-id';

    this.bearerToken = bearerToken;
  }

  benchmarks: API.Benchmarks = new API.Benchmarks(this);
  agents: API.Agents = new API.Agents(this);
  blueprints: API.Blueprints = new API.Blueprints(this);
  devboxes: API.Devboxes = new API.Devboxes(this);
  scenarios: API.Scenarios = new API.Scenarios(this);
  objects: API.Objects = new API.Objects(this);
  repositories: API.Repositories = new API.Repositories(this);
  secrets: API.Secrets = new API.Secrets(this);

  /**
   * Check whether the base URL is set to its default.
   */
  #baseURLOverridden(): boolean {
    return this.baseURL !== 'https://api.runloop.ai';
  }

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
  static DEFAULT_TIMEOUT = 30000; // 30 seconds

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

Runloop.Benchmarks = Benchmarks;
Runloop.BenchmarkViewsBenchmarksCursorIDPage = BenchmarkViewsBenchmarksCursorIDPage;
Runloop.Agents = Agents;
Runloop.AgentViewsAgentsCursorIDPage = AgentViewsAgentsCursorIDPage;
Runloop.Blueprints = Blueprints;
Runloop.BlueprintViewsBlueprintsCursorIDPage = BlueprintViewsBlueprintsCursorIDPage;
Runloop.Devboxes = Devboxes;
Runloop.DevboxViewsDevboxesCursorIDPage = DevboxViewsDevboxesCursorIDPage;
Runloop.DevboxSnapshotViewsDiskSnapshotsCursorIDPage = DevboxSnapshotViewsDiskSnapshotsCursorIDPage;
Runloop.Scenarios = Scenarios;
Runloop.ScenarioViewsScenariosCursorIDPage = ScenarioViewsScenariosCursorIDPage;
Runloop.Objects = Objects;
Runloop.ObjectViewsObjectsCursorIDPage = ObjectViewsObjectsCursorIDPage;
Runloop.Repositories = Repositories;
Runloop.RepositoryConnectionViewsRepositoriesCursorIDPage = RepositoryConnectionViewsRepositoriesCursorIDPage;
Runloop.Secrets = Secrets;

export declare namespace Runloop {
  export type RequestOptions = Core.RequestOptions;

  export import BlueprintsCursorIDPage = Pagination.BlueprintsCursorIDPage;
  export {
    type BlueprintsCursorIDPageParams as BlueprintsCursorIDPageParams,
    type BlueprintsCursorIDPageResponse as BlueprintsCursorIDPageResponse,
  };

  export import DevboxesCursorIDPage = Pagination.DevboxesCursorIDPage;
  export {
    type DevboxesCursorIDPageParams as DevboxesCursorIDPageParams,
    type DevboxesCursorIDPageResponse as DevboxesCursorIDPageResponse,
  };

  export import RepositoriesCursorIDPage = Pagination.RepositoriesCursorIDPage;
  export {
    type RepositoriesCursorIDPageParams as RepositoriesCursorIDPageParams,
    type RepositoriesCursorIDPageResponse as RepositoriesCursorIDPageResponse,
  };

  export import DiskSnapshotsCursorIDPage = Pagination.DiskSnapshotsCursorIDPage;
  export {
    type DiskSnapshotsCursorIDPageParams as DiskSnapshotsCursorIDPageParams,
    type DiskSnapshotsCursorIDPageResponse as DiskSnapshotsCursorIDPageResponse,
  };

  export import BenchmarksCursorIDPage = Pagination.BenchmarksCursorIDPage;
  export {
    type BenchmarksCursorIDPageParams as BenchmarksCursorIDPageParams,
    type BenchmarksCursorIDPageResponse as BenchmarksCursorIDPageResponse,
  };

  export import AgentsCursorIDPage = Pagination.AgentsCursorIDPage;
  export {
    type AgentsCursorIDPageParams as AgentsCursorIDPageParams,
    type AgentsCursorIDPageResponse as AgentsCursorIDPageResponse,
  };

  export import BenchmarkRunsCursorIDPage = Pagination.BenchmarkRunsCursorIDPage;
  export {
    type BenchmarkRunsCursorIDPageParams as BenchmarkRunsCursorIDPageParams,
    type BenchmarkRunsCursorIDPageResponse as BenchmarkRunsCursorIDPageResponse,
  };

  export import ScenariosCursorIDPage = Pagination.ScenariosCursorIDPage;
  export {
    type ScenariosCursorIDPageParams as ScenariosCursorIDPageParams,
    type ScenariosCursorIDPageResponse as ScenariosCursorIDPageResponse,
  };

  export import ScenarioRunsCursorIDPage = Pagination.ScenarioRunsCursorIDPage;
  export {
    type ScenarioRunsCursorIDPageParams as ScenarioRunsCursorIDPageParams,
    type ScenarioRunsCursorIDPageResponse as ScenarioRunsCursorIDPageResponse,
  };

  export import ScenarioScorersCursorIDPage = Pagination.ScenarioScorersCursorIDPage;
  export {
    type ScenarioScorersCursorIDPageParams as ScenarioScorersCursorIDPageParams,
    type ScenarioScorersCursorIDPageResponse as ScenarioScorersCursorIDPageResponse,
  };

  export import ObjectsCursorIDPage = Pagination.ObjectsCursorIDPage;
  export {
    type ObjectsCursorIDPageParams as ObjectsCursorIDPageParams,
    type ObjectsCursorIDPageResponse as ObjectsCursorIDPageResponse,
  };

  export {
    Benchmarks as Benchmarks,
    type BenchmarkCreateParameters as BenchmarkCreateParameters,
    type BenchmarkRunListView as BenchmarkRunListView,
    type BenchmarkRunView as BenchmarkRunView,
    type BenchmarkView as BenchmarkView,
    type ScenarioDefinitionListView as ScenarioDefinitionListView,
    type StartBenchmarkRunParameters as StartBenchmarkRunParameters,
    BenchmarkViewsBenchmarksCursorIDPage as BenchmarkViewsBenchmarksCursorIDPage,
    type BenchmarkCreateParams as BenchmarkCreateParams,
    type BenchmarkUpdateParams as BenchmarkUpdateParams,
    type BenchmarkListParams as BenchmarkListParams,
    type BenchmarkDefinitionsParams as BenchmarkDefinitionsParams,
    type BenchmarkListPublicParams as BenchmarkListPublicParams,
    type BenchmarkStartRunParams as BenchmarkStartRunParams,
  };

  export {
    Agents as Agents,
    type AgentCreateParameters as AgentCreateParameters,
    type AgentListView as AgentListView,
    type AgentView as AgentView,
    AgentViewsAgentsCursorIDPage as AgentViewsAgentsCursorIDPage,
    type AgentCreateParams as AgentCreateParams,
    type AgentListParams as AgentListParams,
  };

  export {
    Blueprints as Blueprints,
    type BlueprintBuildFromInspectionParameters as BlueprintBuildFromInspectionParameters,
    type BlueprintBuildLog as BlueprintBuildLog,
    type BlueprintBuildLogsListView as BlueprintBuildLogsListView,
    type BlueprintBuildParameters as BlueprintBuildParameters,
    type BlueprintListView as BlueprintListView,
    type BlueprintPreviewView as BlueprintPreviewView,
    type BlueprintView as BlueprintView,
    type InspectionSource as InspectionSource,
    type BlueprintDeleteResponse as BlueprintDeleteResponse,
    BlueprintViewsBlueprintsCursorIDPage as BlueprintViewsBlueprintsCursorIDPage,
    type BlueprintCreateParams as BlueprintCreateParams,
    type BlueprintListParams as BlueprintListParams,
    type BlueprintCreateFromInspectionParams as BlueprintCreateFromInspectionParams,
    type BlueprintListPublicParams as BlueprintListPublicParams,
    type BlueprintPreviewParams as BlueprintPreviewParams,
  };

  export {
    Devboxes as Devboxes,
    type DevboxAsyncExecutionDetailView as DevboxAsyncExecutionDetailView,
    type DevboxExecutionDetailView as DevboxExecutionDetailView,
    type DevboxKillExecutionRequest as DevboxKillExecutionRequest,
    type DevboxListView as DevboxListView,
    type DevboxSendStdInRequest as DevboxSendStdInRequest,
    type DevboxSendStdInResult as DevboxSendStdInResult,
    type DevboxSnapshotListView as DevboxSnapshotListView,
    type DevboxSnapshotView as DevboxSnapshotView,
    type DevboxTunnelView as DevboxTunnelView,
    type DevboxView as DevboxView,
    type DevboxCreateSSHKeyResponse as DevboxCreateSSHKeyResponse,
    type DevboxDeleteDiskSnapshotResponse as DevboxDeleteDiskSnapshotResponse,
    type DevboxKeepAliveResponse as DevboxKeepAliveResponse,
    type DevboxReadFileContentsResponse as DevboxReadFileContentsResponse,
    type DevboxRemoveTunnelResponse as DevboxRemoveTunnelResponse,
    type DevboxUploadFileResponse as DevboxUploadFileResponse,
    DevboxViewsDevboxesCursorIDPage as DevboxViewsDevboxesCursorIDPage,
    DevboxSnapshotViewsDiskSnapshotsCursorIDPage as DevboxSnapshotViewsDiskSnapshotsCursorIDPage,
    type DevboxCreateParams as DevboxCreateParams,
    type DevboxUpdateParams as DevboxUpdateParams,
    type DevboxListParams as DevboxListParams,
    type DevboxCreateTunnelParams as DevboxCreateTunnelParams,
    type DevboxDownloadFileParams as DevboxDownloadFileParams,
    type DevboxExecuteParams as DevboxExecuteParams,
    type DevboxExecuteAsyncParams as DevboxExecuteAsyncParams,
    type DevboxExecuteSyncParams as DevboxExecuteSyncParams,
    type DevboxListDiskSnapshotsParams as DevboxListDiskSnapshotsParams,
    type DevboxReadFileContentsParams as DevboxReadFileContentsParams,
    type DevboxRemoveTunnelParams as DevboxRemoveTunnelParams,
    type DevboxSnapshotDiskParams as DevboxSnapshotDiskParams,
    type DevboxSnapshotDiskAsyncParams as DevboxSnapshotDiskAsyncParams,
    type DevboxUploadFileParams as DevboxUploadFileParams,
    type DevboxWaitForCommandParams as DevboxWaitForCommandParams,
    type DevboxWriteFileContentsParams as DevboxWriteFileContentsParams,
  };

  export {
    Scenarios as Scenarios,
    type InputContext as InputContext,
    type InputContextUpdate as InputContextUpdate,
    type ScenarioCreateParameters as ScenarioCreateParameters,
    type ScenarioEnvironment as ScenarioEnvironment,
    type ScenarioRunListView as ScenarioRunListView,
    type ScenarioRunView as ScenarioRunView,
    type ScenarioUpdateParameters as ScenarioUpdateParameters,
    type ScenarioView as ScenarioView,
    type ScoringContract as ScoringContract,
    type ScoringContractResultView as ScoringContractResultView,
    type ScoringContractUpdate as ScoringContractUpdate,
    type ScoringFunction as ScoringFunction,
    type ScoringFunctionResultView as ScoringFunctionResultView,
    type StartScenarioRunParameters as StartScenarioRunParameters,
    ScenarioViewsScenariosCursorIDPage as ScenarioViewsScenariosCursorIDPage,
    type ScenarioCreateParams as ScenarioCreateParams,
    type ScenarioUpdateParams as ScenarioUpdateParams,
    type ScenarioListParams as ScenarioListParams,
    type ScenarioListPublicParams as ScenarioListPublicParams,
    type ScenarioStartRunParams as ScenarioStartRunParams,
  };

  export {
    Objects as Objects,
    type ObjectCreateParameters as ObjectCreateParameters,
    type ObjectDownloadURLView as ObjectDownloadURLView,
    type ObjectListView as ObjectListView,
    type ObjectView as ObjectView,
    ObjectViewsObjectsCursorIDPage as ObjectViewsObjectsCursorIDPage,
    type ObjectCreateParams as ObjectCreateParams,
    type ObjectListParams as ObjectListParams,
    type ObjectDeleteParams as ObjectDeleteParams,
    type ObjectCompleteParams as ObjectCompleteParams,
    type ObjectDownloadParams as ObjectDownloadParams,
    type ObjectListPublicParams as ObjectListPublicParams,
  };

  export {
    Repositories as Repositories,
    type RepositoryConnectionListView as RepositoryConnectionListView,
    type RepositoryConnectionView as RepositoryConnectionView,
    type RepositoryInspectionDetails as RepositoryInspectionDetails,
    type RepositoryInspectionListView as RepositoryInspectionListView,
    type RepositoryManifestView as RepositoryManifestView,
    type RepositoryDeleteResponse as RepositoryDeleteResponse,
    type RepositoryRefreshResponse as RepositoryRefreshResponse,
    RepositoryConnectionViewsRepositoriesCursorIDPage as RepositoryConnectionViewsRepositoriesCursorIDPage,
    type RepositoryCreateParams as RepositoryCreateParams,
    type RepositoryListParams as RepositoryListParams,
    type RepositoryDeleteParams as RepositoryDeleteParams,
    type RepositoryInspectParams as RepositoryInspectParams,
    type RepositoryRefreshParams as RepositoryRefreshParams,
  };

  export {
    Secrets as Secrets,
    type SecretCreateParameters as SecretCreateParameters,
    type SecretListView as SecretListView,
    type SecretUpdateParameters as SecretUpdateParameters,
    type SecretView as SecretView,
    type SecretCreateParams as SecretCreateParams,
    type SecretUpdateParams as SecretUpdateParams,
    type SecretListParams as SecretListParams,
    type SecretDeleteParams as SecretDeleteParams,
  };

  export type AfterIdle = API.AfterIdle;
  export type AgentMountParameters = API.AgentMountParameters;
  export type AgentSource = API.AgentSource;
  export type CodeMountParameters = API.CodeMountParameters;
  export type LaunchParameters = API.LaunchParameters;
  export type Mount = API.Mount;
  export type ObjectMountParameters = API.ObjectMountParameters;
  export type RunProfile = API.RunProfile;
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

/**
 * @example
 * ```typescript
 * // Instead of: import Runloop from '@runloop/api-client'
 * import { RunloopSDK } from '@runloop/api-client'
 * const sdk = new RunloopSDK();
 * //For existing api client, use the api property
 * const client = new RunloopSDK();
 * const devbox = await client.api.devboxes.create({ name: 'my-devbox' });
 * ```
 */
export default Runloop;
