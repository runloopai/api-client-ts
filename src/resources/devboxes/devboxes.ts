// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as Shared from '../shared';
import * as BrowsersAPI from './browsers';
import { BrowserCreateParams, BrowserView, Browsers } from './browsers';
import * as ComputersAPI from './computers';
import {
  ComputerCreateParams,
  ComputerKeyboardInteractionParams,
  ComputerKeyboardInteractionResponse,
  ComputerMouseInteractionParams,
  ComputerMouseInteractionResponse,
  ComputerScreenInteractionParams,
  ComputerScreenInteractionResponse,
  ComputerView,
  Computers,
} from './computers';
import * as DiskSnapshotsAPI from './disk-snapshots';
import {
  DevboxSnapshotAsyncStatusView,
  DiskSnapshotDeleteResponse,
  DiskSnapshotListParams,
  DiskSnapshotUpdateParams,
  DiskSnapshots,
} from './disk-snapshots';
import * as ExecutionsAPI from './executions';
import {
  ExecutionExecuteAsyncParams,
  ExecutionExecuteSyncParams,
  ExecutionRetrieveParams,
  Executions,
} from './executions';
import * as LogsAPI from './logs';
import { DevboxLogsListView, LogListParams, Logs } from './logs';
import * as LspAPI from './lsp';
import {
  BaseCodeAction,
  BaseCommand,
  BaseDiagnostic,
  BaseLocation,
  BaseMarkupContent,
  BaseParameterInformation,
  BaseRange,
  BaseSignature,
  BaseWorkspaceEdit,
  CodeActionApplicationResult,
  CodeActionContext,
  CodeActionKind,
  CodeActionTriggerKind,
  CodeActionsForDiagnosticRequestBody,
  CodeActionsRequestBody,
  CodeActionsResponse,
  CodeDescription,
  CodeSegmentInfoRequestBody,
  CodeSegmentInfoResponse,
  Diagnostic,
  DiagnosticRelatedInformation,
  DiagnosticSeverity,
  DiagnosticTag,
  DiagnosticsResponse,
  DocumentSymbol,
  DocumentSymbolResponse,
  DocumentUri,
  FileContentsResponse,
  FileDefinitionRequestBody,
  FileDefinitionResponse,
  FilePath,
  FileRequestBody,
  FileUri,
  FormattingResponse,
  HealthStatusResponse,
  Integer,
  LSpAny,
  Location,
  Lsp,
  LspApplyCodeActionParams,
  LspCodeActionsParams,
  LspDiagnosticsParams,
  LspDocumentSymbolsParams,
  LspFileDefinitionParams,
  LspFileParams,
  LspFilesResponse,
  LspFormattingParams,
  LspGetCodeActionsForDiagnosticParams,
  LspGetCodeActionsForDiagnosticResponse,
  LspGetCodeSegmentInfoParams,
  LspGetSignatureHelpParams,
  LspReferencesParams,
  LspSetWatchDirectoryParams,
  LspSetWatchDirectoryResponse,
  Position,
  Range,
  RecordStringTextEditArray,
  ReferencesRequestBody,
  ReferencesResponse,
  SetWatchDirectoryRequestBody,
  SignatureHelpRequestBody,
  SignatureHelpResponse,
  SymbolKind,
  SymbolTag,
  SymbolType,
  TextEdit,
  URi,
  Uinteger,
  WatchedFileResponse,
} from './lsp';
import {
  DevboxesCursorIDPage,
  type DevboxesCursorIDPageParams,
  DiskSnapshotsCursorIDPage,
  type DiskSnapshotsCursorIDPageParams,
} from '../../pagination';
import { type Response } from '../../_shims/index';
import { poll, PollingOptions } from '@runloop/api-client/lib/polling';
import { DevboxTools } from './tools';
import { RunloopError } from '../..';

type DevboxStatus = DevboxView['status'];
const DEVBOX_BOOTING_STATES: DevboxStatus[] = ['provisioning', 'initializing'];

export class Devboxes extends APIResource {
  diskSnapshots: DiskSnapshotsAPI.DiskSnapshots = new DiskSnapshotsAPI.DiskSnapshots(this._client);
  browsers: BrowsersAPI.Browsers = new BrowsersAPI.Browsers(this._client);
  computers: ComputersAPI.Computers = new ComputersAPI.Computers(this._client);
  lsp: LspAPI.Lsp = new LspAPI.Lsp(this._client);
  logs: LogsAPI.Logs = new LogsAPI.Logs(this._client);
  executions: ExecutionsAPI.Executions = new ExecutionsAPI.Executions(this._client);

  /**
   * Create a Devbox and begin the boot process. The Devbox will initially launch in
   * the 'provisioning' state while Runloop allocates the necessary infrastructure.
   * It will transition to the 'initializing' state while the booted Devbox runs any
   * Runloop or user defined set up scripts. Finally, the Devbox will transition to
   * the 'running' state when it is ready for use.
   */
  create(body?: DevboxCreateParams, options?: Core.RequestOptions): Core.APIPromise<DevboxView>;
  create(options?: Core.RequestOptions): Core.APIPromise<DevboxView>;
  create(
    body: DevboxCreateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxView> {
    if (isRequestOptions(body)) {
      return this.create({}, body);
    }
    return this._client.post('/v1/devboxes', { body, ...options });
  }

  /**
   * Get the latest details and status of a Devbox.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxView> {
    return this._client.get(`/v1/devboxes/${id}`, options);
  }

  /**
   * Wait for a devbox to reach the running state.
   * Polls the devbox status until it reaches running state or fails with an error.
   *
   * @param id - Devbox ID
   * @param options - request options to specify retries, timeout, polling, etc.
   */
  async awaitRunning(
    id: string,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<DevboxView> {
    const longPoll = (): Promise<DevboxView> => {
      // This either returns a DevboxView when status is running or failure;
      // Otherwise it throws an 408 error when times out.
      return this._client.post(`/v1/devboxes/${id}/wait_for_status`, {
        body: { statuses: ['running', 'failure', 'shutdown'] },
      });
    };

    const finalResult = await poll(
      () => longPoll(),
      () => longPoll(),
      {
        ...options?.polling,
        shouldStop: (result) => {
          return !DEVBOX_BOOTING_STATES.includes(result.status);
        },
        onError: (error) => {
          if (error.status === 408) {
            // Return a placeholder result to continue polling
            return { status: 'provisioning' } as DevboxView;
          }

          // For any other error, rethrow it
          throw error;
        },
      },
    );

    // Now we check if the devbox is 'running' otherwise we throw an error
    if (finalResult.status !== 'running') {
      throw new RunloopError(`Devbox ${id} is in non-running state ${finalResult.status}`);
    }

    return finalResult;
  }
  /**
   * Create a devbox and wait for it to reach the running state.
   * This is a convenience method that combines create() and awaitDevboxRunning().
   *
   * @param body - DevboxCreateParams
   * @param options - request options to specify retries, timeout, polling, etc.
   */
  async createAndAwaitRunning(
    body?: DevboxCreateParams,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<DevboxView> {
    const devbox = await this.create(body, options);
    return this.awaitRunning(devbox.id, options);
  }
  /**
   * Updates a devbox by doing a complete update the existing name,metadata fields.
   * It does not patch partial values.
   */
  update(id: string, body?: DevboxUpdateParams, options?: Core.RequestOptions): Core.APIPromise<DevboxView>;
  update(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxView>;
  update(
    id: string,
    body: DevboxUpdateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxView> {
    if (isRequestOptions(body)) {
      return this.update(id, {}, body);
    }
    return this._client.post(`/v1/devboxes/${id}`, { body, ...options });
  }

  /**
   * List all Devboxes while optionally filtering by status.
   */
  list(
    query?: DevboxListParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<DevboxViewsDevboxesCursorIDPage, DevboxView>;
  list(options?: Core.RequestOptions): Core.PagePromise<DevboxViewsDevboxesCursorIDPage, DevboxView>;
  list(
    query: DevboxListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<DevboxViewsDevboxesCursorIDPage, DevboxView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList('/v1/devboxes', DevboxViewsDevboxesCursorIDPage, { query, ...options });
  }

  /**
   * Create an SSH key for a Devbox to enable remote access.
   */
  createSSHKey(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxCreateSSHKeyResponse> {
    return this._client.post(`/v1/devboxes/${id}/create_ssh_key`, options);
  }

  /**
   * Create a live tunnel to an available port on the Devbox.
   */
  createTunnel(
    id: string,
    body: DevboxCreateTunnelParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxTunnelView> {
    return this._client.post(`/v1/devboxes/${id}/create_tunnel`, { body, ...options });
  }

  /**
   * Delete a previously taken disk snapshot of a Devbox.
   */
  deleteDiskSnapshot(id: string, options?: Core.RequestOptions): Core.APIPromise<unknown> {
    return this._client.post(`/v1/devboxes/disk_snapshots/${id}/delete`, options);
  }

  /**
   * Download file contents of any type (binary, text, etc) from a specified path on
   * the Devbox.
   */
  downloadFile(
    id: string,
    body: DevboxDownloadFileParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<Response> {
    return this._client.post(`/v1/devboxes/${id}/download_file`, {
      body,
      timeout: (this._client as any)._options.timeout ?? 600000,
      ...options,
      headers: { Accept: 'application/octet-stream', ...options?.headers },
      __binaryResponse: true,
    });
  }

  /**
   * Execute the given command in the Devbox shell asynchronously and returns the
   * execution that can be used to track the command's progress.
   */
  executeAsync(
    id: string,
    body: DevboxExecuteAsyncParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxAsyncExecutionDetailView> {
    return this._client.post(`/v1/devboxes/${id}/execute_async`, { body, ...options });
  }

  /**
   * Execute a bash command in the Devbox shell, await the command completion and
   * return the output.
   */
  executeSync(
    id: string,
    body: DevboxExecuteSyncParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxExecutionDetailView> {
    return this._client.post(`/v1/devboxes/${id}/execute_sync`, {
      body,
      timeout: (this._client as any)._options.timeout ?? 600000,
      ...options,
    });
  }

  /**
   * Send a 'Keep Alive' signal to a running Devbox that is configured to shutdown on
   * idle so the idle time resets.
   */
  keepAlive(id: string, options?: Core.RequestOptions): Core.APIPromise<unknown> {
    return this._client.post(`/v1/devboxes/${id}/keep_alive`, options);
  }

  /**
   * List all snapshots of a Devbox while optionally filtering by Devbox ID and
   * metadata.
   */
  listDiskSnapshots(
    query?: DevboxListDiskSnapshotsParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<DevboxSnapshotViewsDiskSnapshotsCursorIDPage, DevboxSnapshotView>;
  listDiskSnapshots(
    options?: Core.RequestOptions,
  ): Core.PagePromise<DevboxSnapshotViewsDiskSnapshotsCursorIDPage, DevboxSnapshotView>;
  listDiskSnapshots(
    query: DevboxListDiskSnapshotsParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<DevboxSnapshotViewsDiskSnapshotsCursorIDPage, DevboxSnapshotView> {
    if (isRequestOptions(query)) {
      return this.listDiskSnapshots({}, query);
    }
    return this._client.getAPIList(
      '/v1/devboxes/disk_snapshots',
      DevboxSnapshotViewsDiskSnapshotsCursorIDPage,
      { query, ...options },
    );
  }

  /**
   * Read file contents from a file on a Devbox as a UTF-8. Note 'downloadFile'
   * should be used for large files (greater than 100MB). Returns the file contents
   * as a UTF-8 string.
   */
  readFileContents(
    id: string,
    body: DevboxReadFileContentsParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<string> {
    return this._client.post(`/v1/devboxes/${id}/read_file_contents`, {
      body,
      timeout: (this._client as any)._options.timeout ?? 600000,
      ...options,
      headers: { Accept: 'text/plain', ...options?.headers },
    });
  }

  /**
   * Remove a previously opened tunnel on the Devbox.
   */
  removeTunnel(
    id: string,
    body: DevboxRemoveTunnelParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<unknown> {
    return this._client.post(`/v1/devboxes/${id}/remove_tunnel`, { body, ...options });
  }

  /**
   * Resume a suspended Devbox with the disk state captured as suspend time. Note
   * that any previously running processes or daemons will need to be restarted using
   * the Devbox shell tools.
   */
  resume(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxView> {
    return this._client.post(`/v1/devboxes/${id}/resume`, options);
  }

  /**
   * Shutdown a running Devbox. This will permanently stop the Devbox. If you want to
   * save the state of the Devbox, you should take a snapshot before shutting down or
   * should suspend the Devbox instead of shutting down.
   */
  shutdown(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxView> {
    return this._client.post(`/v1/devboxes/${id}/shutdown`, options);
  }

  /**
   * Create a disk snapshot of a devbox with the specified name and metadata to
   * enable launching future Devboxes with the same disk state.
   */
  snapshotDisk(
    id: string,
    body?: DevboxSnapshotDiskParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxSnapshotView>;
  snapshotDisk(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxSnapshotView>;
  snapshotDisk(
    id: string,
    body: DevboxSnapshotDiskParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxSnapshotView> {
    if (isRequestOptions(body)) {
      return this.snapshotDisk(id, {}, body);
    }
    return this._client.post(`/v1/devboxes/${id}/snapshot_disk`, {
      body,
      timeout: (this._client as any)._options.timeout ?? 600000,
      ...options,
    });
  }

  /**
   * Start an asynchronous disk snapshot of a devbox with the specified name and
   * metadata. The snapshot operation will continue in the background and can be
   * monitored using the query endpoint.
   */
  snapshotDiskAsync(
    id: string,
    body?: DevboxSnapshotDiskAsyncParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxSnapshotView>;
  snapshotDiskAsync(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxSnapshotView>;
  snapshotDiskAsync(
    id: string,
    body: DevboxSnapshotDiskAsyncParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxSnapshotView> {
    if (isRequestOptions(body)) {
      return this.snapshotDiskAsync(id, {}, body);
    }
    return this._client.post(`/v1/devboxes/${id}/snapshot_disk_async`, { body, ...options });
  }

  /**
   * Suspend a running Devbox and create a disk snapshot to enable resuming the
   * Devbox later with the same disk. Note this will not snapshot memory state such
   * as running processes.
   */
  suspend(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxView> {
    return this._client.post(`/v1/devboxes/${id}/suspend`, options);
  }

  /**
   * Upload file contents of any type (binary, text, etc) to a Devbox. Note this API
   * is suitable for large files (larger than 100MB) and efficiently uploads files
   * via multipart form data.
   */
  uploadFile(
    id: string,
    body: DevboxUploadFileParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<unknown> {
    return this._client.post(
      `/v1/devboxes/${id}/upload_file`,
      Core.multipartFormRequestOptions({
        body,
        timeout: (this._client as any)._options.timeout ?? 600000,
        ...options,
      }),
    );
  }

  /**
   * Write UTF-8 string contents to a file at path on the Devbox. Note for large
   * files (larger than 100MB), the upload_file endpoint must be used.
   */
  writeFileContents(
    id: string,
    body: DevboxWriteFileContentsParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxExecutionDetailView> {
    return this._client.post(`/v1/devboxes/${id}/write_file_contents`, {
      body,
      timeout: (this._client as any)._options.timeout ?? 600000,
      ...options,
    });
  }

  // Make an accessor for tools
  get tools(): DevboxTools {
    return new DevboxTools(this);
  }
}

export class DevboxViewsDevboxesCursorIDPage extends DevboxesCursorIDPage<DevboxView> {}

export class DevboxSnapshotViewsDiskSnapshotsCursorIDPage extends DiskSnapshotsCursorIDPage<DevboxSnapshotView> {}

export interface DevboxAsyncExecutionDetailView {
  /**
   * Devbox id where command was executed.
   */
  devbox_id: string;

  /**
   * Ephemeral id of the execution in progress.
   */
  execution_id: string;

  /**
   * Current status of the execution.
   */
  status: 'queued' | 'running' | 'completed';

  /**
   * Exit code of command execution. This field will remain unset until the execution
   * has completed.
   */
  exit_status?: number | null;

  /**
   * Shell name.
   */
  shell_name?: string | null;

  /**
   * Standard error generated by command. This field will remain unset until the
   * execution has completed.
   */
  stderr?: string | null;

  /**
   * Standard out generated by command. This field will remain unset until the
   * execution has completed.
   */
  stdout?: string | null;
}

export interface DevboxExecutionDetailView {
  /**
   * Devbox id where command was executed.
   */
  devbox_id: string;

  /**
   * Exit status of command execution.
   */
  exit_status: number;

  /**
   * Standard error generated by command.
   */
  stderr: string;

  /**
   * Standard out generated by command.
   */
  stdout: string;

  /**
   * Shell name.
   */
  shell_name?: string | null;
}

export interface DevboxListView {
  /**
   * List of devboxes matching filter.
   */
  devboxes: Array<DevboxView>;

  has_more: boolean;

  remaining_count: number;

  total_count: number;
}

export interface DevboxSnapshotListView {
  has_more: boolean;

  remaining_count: number;

  /**
   * List of snapshots matching filter.
   */
  snapshots: Array<DevboxSnapshotView>;

  total_count: number;
}

export interface DevboxSnapshotView {
  /**
   * The unique identifier of the snapshot.
   */
  id: string;

  /**
   * Creation time of the Snapshot (Unix timestamp milliseconds).
   */
  create_time_ms: number;

  /**
   * User defined metadata associated with the snapshot.
   */
  metadata: { [key: string]: string };

  /**
   * The source Devbox ID this snapshot was created from.
   */
  source_devbox_id: string;

  /**
   * (Optional) The custom name of the snapshot.
   */
  name?: string | null;
}

export interface DevboxTunnelView {
  /**
   * ID of the Devbox the tunnel routes to.
   */
  devbox_id: string;

  /**
   * Port of the Devbox the tunnel routes to.
   */
  port: number;

  /**
   * Public url used to access Devbox.
   */
  url: string;
}

/**
 * A Devbox represents a virtual development environment. It is an isolated sandbox
 * that can be given to agents and used to run arbitrary code such as AI generated
 * code.
 */
export interface DevboxView {
  /**
   * The ID of the Devbox.
   */
  id: string;

  /**
   * A list of capability groups this devbox has access to. This allows devboxes to
   * be compatible with certain tools sets like computer usage APIs.
   */
  capabilities: Array<'unknown' | 'computer_usage' | 'browser_usage' | 'language_server'>;

  /**
   * Creation time of the Devbox (Unix timestamp milliseconds).
   */
  create_time_ms: number;

  /**
   * The launch parameters used to create the Devbox.
   */
  launch_parameters: Shared.LaunchParameters;

  /**
   * The user defined Devbox metadata.
   */
  metadata: { [key: string]: string };

  /**
   * A list of state transitions in order with durations
   */
  state_transitions: Array<DevboxView.StateTransition>;

  /**
   * The current status of the Devbox.
   */
  status:
    | 'provisioning'
    | 'initializing'
    | 'running'
    | 'suspending'
    | 'suspended'
    | 'resuming'
    | 'failure'
    | 'shutdown';

  /**
   * The Blueprint ID used in creation of the Devbox, if the devbox was created from
   * a Blueprint.
   */
  blueprint_id?: string | null;

  /**
   * The time the Devbox finished execution (Unix timestamp milliseconds). Present if
   * the Devbox is in a terminal state.
   */
  end_time_ms?: number | null;

  /**
   * The failure reason if the Devbox failed, if the Devbox has a 'failure' status.
   */
  failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | null;

  /**
   * The name of the Devbox.
   */
  name?: string | null;

  /**
   * The shutdown reason if the Devbox shutdown, if the Devbox has a 'shutdown'
   * status.
   */
  shutdown_reason?:
    | 'api_shutdown'
    | 'keep_alive_timeout'
    | 'entrypoint_exit'
    | 'idle'
    | 'lambda_lifecycle'
    | null;

  /**
   * The Snapshot ID used in creation of the Devbox, if the devbox was created from a
   * Snapshot.
   */
  snapshot_id?: string | null;
}

export namespace DevboxView {
  export interface StateTransition {
    /**
     * The status of the Devbox.
     *
     * provisioning: Runloop is allocating and booting the necessary infrastructure
     * resources. initializing: Runloop defined boot scripts are running to enable the
     * environment for interaction. running: The Devbox is ready for interaction.
     * suspending: The Devbox disk is being snaphsotted and as part of suspension.
     * suspended: The Devbox disk is saved and no more active compute is being used for
     * the Devbox. resuming: The Devbox disk is being loaded as part of booting a
     * suspended Devbox. failure: The Devbox failed as part of booting or running user
     * requested actions. shutdown: The Devbox was successfully shutdown and no more
     * active compute is being used.
     */
    status?:
      | 'provisioning'
      | 'initializing'
      | 'running'
      | 'suspending'
      | 'suspended'
      | 'resuming'
      | 'failure'
      | 'shutdown';

    transition_time_ms?: unknown;
  }
}

export interface DevboxCreateSSHKeyResponse {
  /**
   * The ID of the Devbox.
   */
  id: string;

  /**
   * The ssh private key, in PEM format.
   */
  ssh_private_key: string;

  /**
   * The host url of the Devbox that can be used for SSH.
   */
  url: string;
}

export type DevboxDeleteDiskSnapshotResponse = unknown;

export type DevboxKeepAliveResponse = unknown;

export type DevboxReadFileContentsResponse = string;

export type DevboxRemoveTunnelResponse = unknown;

export type DevboxUploadFileResponse = unknown;

export interface DevboxCreateParams {
  /**
   * Blueprint ID to use for the Devbox. If none set, the Devbox will be created with
   * the default Runloop Devbox image. Only one of (Snapshot ID, Blueprint ID,
   * Blueprint name) should be specified.
   */
  blueprint_id?: string | null;

  /**
   * Name of Blueprint to use for the Devbox. When set, this will load the latest
   * successfully built Blueprint with the given name. Only one of (Snapshot ID,
   * Blueprint ID, Blueprint name) should be specified.
   */
  blueprint_name?: string | null;

  /**
   * A list of code mounts to be included in the Devbox.
   */
  code_mounts?: Array<Shared.CodeMountParameters> | null;

  /**
   * (Optional) When specified, the Devbox will run this script as its main
   * executable. The devbox lifecycle will be bound to entrypoint, shutting down when
   * the process is complete.
   */
  entrypoint?: string | null;

  /**
   * (Optional) Environment variables used to configure your Devbox.
   */
  environment_variables?: { [key: string]: string } | null;

  /**
   * (Optional) Map of paths and file contents to write before setup..
   */
  file_mounts?: { [key: string]: string } | null;

  /**
   * Parameters to configure the resources and launch time behavior of the Devbox.
   */
  launch_parameters?: Shared.LaunchParameters | null;

  /**
   * User defined metadata to attach to the devbox for organization.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * (Optional) A user specified name to give the Devbox.
   */
  name?: string | null;

  /**
   * Reference to prebuilt Blueprint to create the Devbox from. Should not be used
   * together with (Snapshot ID, Blueprint ID, or Blueprint name).
   */
  prebuilt?: string | null;

  /**
   * Repository connection id the devbox should source its base image from.
   */
  repo_connection_id?: string | null;

  /**
   * (Optional) Map of environment variable names to secret names. The secret values
   * will be securely injected as environment variables in the Devbox. Example:
   * {"DB_PASS": "DATABASE_PASSWORD"} sets environment variable 'DB_PASS' to the
   * value of secret 'DATABASE_PASSWORD'.
   */
  secrets?: { [key: string]: string } | null;

  /**
   * Snapshot ID to use for the Devbox. Only one of (Snapshot ID, Blueprint ID,
   * Blueprint name) should be specified.
   */
  snapshot_id?: string | null;
}

export interface DevboxUpdateParams {
  /**
   * User defined metadata to attach to the devbox for organization.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * (Optional) A user specified name to give the Devbox.
   */
  name?: string | null;
}

export interface DevboxListParams extends DevboxesCursorIDPageParams {
  /**
   * Filter by status
   */
  status?:
    | 'provisioning'
    | 'initializing'
    | 'running'
    | 'suspending'
    | 'suspended'
    | 'resuming'
    | 'failure'
    | 'shutdown';
}

export interface DevboxCreateTunnelParams {
  /**
   * Devbox port that tunnel will expose.
   */
  port: number;
}

export interface DevboxDownloadFileParams {
  /**
   * The path on the Devbox filesystem to read the file from. Path is relative to
   * user home directory.
   */
  path: string;
}

export interface DevboxExecuteAsyncParams {
  /**
   * The command to execute via the Devbox shell. By default, commands are run from
   * the user home directory unless shell_name is specified. If shell_name is
   * specified the command is run from the directory based on the recent state of the
   * persistent shell.
   */
  command: string;

  /**
   * The name of the persistent shell to create or use if already created. When using
   * a persistent shell, the command will run from the directory at the end of the
   * previous command and environment variables will be preserved.
   */
  shell_name?: string | null;
}

export interface DevboxExecuteSyncParams {
  /**
   * The command to execute via the Devbox shell. By default, commands are run from
   * the user home directory unless shell_name is specified. If shell_name is
   * specified the command is run from the directory based on the recent state of the
   * persistent shell.
   */
  command: string;

  /**
   * The name of the persistent shell to create or use if already created. When using
   * a persistent shell, the command will run from the directory at the end of the
   * previous command and environment variables will be preserved.
   */
  shell_name?: string | null;
}

export interface DevboxListDiskSnapshotsParams extends DiskSnapshotsCursorIDPageParams {
  /**
   * Devbox ID to filter by.
   */
  devbox_id?: string;

  /**
   * Filter snapshots by metadata key-value pair. Can be used multiple times for
   * different keys.
   */
  'metadata[key]'?: string;

  /**
   * Filter snapshots by metadata key with multiple possible values (OR condition).
   */
  'metadata[key][in]'?: string;
}

export interface DevboxReadFileContentsParams {
  /**
   * The path on the Devbox filesystem to read the file from. Path is relative to
   * user home directory.
   */
  file_path: string;
}

export interface DevboxRemoveTunnelParams {
  /**
   * Devbox port that tunnel will expose.
   */
  port: number;
}

export interface DevboxSnapshotDiskParams {
  /**
   * (Optional) Metadata used to describe the snapshot
   */
  metadata?: { [key: string]: string } | null;

  /**
   * (Optional) A user specified name to give the snapshot
   */
  name?: string | null;
}

export interface DevboxSnapshotDiskAsyncParams {
  /**
   * (Optional) Metadata used to describe the snapshot
   */
  metadata?: { [key: string]: string } | null;

  /**
   * (Optional) A user specified name to give the snapshot
   */
  name?: string | null;
}

export interface DevboxUploadFileParams {
  /**
   * The path to write the file to on the Devbox. Path is relative to user home
   * directory.
   */
  path: string;

  file?: Core.Uploadable;
}

export interface DevboxWriteFileContentsParams {
  /**
   * The UTF-8 string contents to write to the file.
   */
  contents: string;

  /**
   * The path to write the file to on the Devbox. Path is relative to user home
   * directory.
   */
  file_path: string;
}

Devboxes.DevboxViewsDevboxesCursorIDPage = DevboxViewsDevboxesCursorIDPage;
Devboxes.DevboxSnapshotViewsDiskSnapshotsCursorIDPage = DevboxSnapshotViewsDiskSnapshotsCursorIDPage;
Devboxes.DiskSnapshots = DiskSnapshots;
Devboxes.Browsers = Browsers;
Devboxes.Computers = Computers;
Devboxes.Lsp = Lsp;
Devboxes.Logs = Logs;
Devboxes.Executions = Executions;

export declare namespace Devboxes {
  export {
    type DevboxAsyncExecutionDetailView as DevboxAsyncExecutionDetailView,
    type DevboxExecutionDetailView as DevboxExecutionDetailView,
    type DevboxListView as DevboxListView,
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
    type DevboxExecuteAsyncParams as DevboxExecuteAsyncParams,
    type DevboxExecuteSyncParams as DevboxExecuteSyncParams,
    type DevboxListDiskSnapshotsParams as DevboxListDiskSnapshotsParams,
    type DevboxReadFileContentsParams as DevboxReadFileContentsParams,
    type DevboxRemoveTunnelParams as DevboxRemoveTunnelParams,
    type DevboxSnapshotDiskParams as DevboxSnapshotDiskParams,
    type DevboxSnapshotDiskAsyncParams as DevboxSnapshotDiskAsyncParams,
    type DevboxUploadFileParams as DevboxUploadFileParams,
    type DevboxWriteFileContentsParams as DevboxWriteFileContentsParams,
  };

  export {
    DiskSnapshots as DiskSnapshots,
    type DevboxSnapshotAsyncStatusView as DevboxSnapshotAsyncStatusView,
    type DiskSnapshotDeleteResponse as DiskSnapshotDeleteResponse,
    type DiskSnapshotUpdateParams as DiskSnapshotUpdateParams,
    type DiskSnapshotListParams as DiskSnapshotListParams,
  };

  export {
    Browsers as Browsers,
    type BrowserView as BrowserView,
    type BrowserCreateParams as BrowserCreateParams,
  };

  export {
    Computers as Computers,
    type ComputerView as ComputerView,
    type ComputerKeyboardInteractionResponse as ComputerKeyboardInteractionResponse,
    type ComputerMouseInteractionResponse as ComputerMouseInteractionResponse,
    type ComputerScreenInteractionResponse as ComputerScreenInteractionResponse,
    type ComputerCreateParams as ComputerCreateParams,
    type ComputerKeyboardInteractionParams as ComputerKeyboardInteractionParams,
    type ComputerMouseInteractionParams as ComputerMouseInteractionParams,
    type ComputerScreenInteractionParams as ComputerScreenInteractionParams,
  };

  export {
    Lsp as Lsp,
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

  export { Logs as Logs, type DevboxLogsListView as DevboxLogsListView, type LogListParams as LogListParams };

  export {
    Executions as Executions,
    type ExecutionRetrieveParams as ExecutionRetrieveParams,
    type ExecutionExecuteAsyncParams as ExecutionExecuteAsyncParams,
    type ExecutionExecuteSyncParams as ExecutionExecuteSyncParams,
  };
}
