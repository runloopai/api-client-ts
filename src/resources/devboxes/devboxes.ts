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
  ExecutionKillParams,
  ExecutionRetrieveParams,
  ExecutionSendStdInParams,
  ExecutionStreamStderrUpdatesParams,
  ExecutionStreamStdoutUpdatesParams,
  ExecutionUpdateChunk,
  Executions,
} from './executions';
import * as LogsAPI from './logs';
import { DevboxLogsListView, LogListParams, Logs } from './logs';
import {
  DevboxesCursorIDPage,
  type DevboxesCursorIDPageParams,
  DiskSnapshotsCursorIDPage,
  type DiskSnapshotsCursorIDPageParams,
} from '../../pagination';
import { type Response } from '../../_shims/index';
import { poll, PollingOptions } from '@runloop/api-client/lib/polling';
import { awaitDevboxState } from '@runloop/api-client/lib/devbox-state';
import { DevboxTools } from './tools';
import { uuidv7 } from 'uuidv7';

type DevboxStatus = DevboxView['status'];
const DEVBOX_BOOTING_STATES: DevboxStatus[] = ['provisioning', 'initializing'];

export class Devboxes extends APIResource {
  diskSnapshots: DiskSnapshotsAPI.DiskSnapshots = new DiskSnapshotsAPI.DiskSnapshots(this._client);
  browsers: BrowsersAPI.Browsers = new BrowsersAPI.Browsers(this._client);
  computers: ComputersAPI.Computers = new ComputersAPI.Computers(this._client);
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
    return awaitDevboxState<DevboxView>({
      client: this._client,
      devboxId: id,
      targetState: 'running',
      statesToCheck: ['running', 'failure', 'shutdown'],
      transitionStates: DEVBOX_BOOTING_STATES,
      pollingOptions: options?.polling as Partial<PollingOptions<DevboxView>> | undefined,
      errorMessage: (devboxId, actualState) => `Devbox ${devboxId} is in non-running state ${actualState}`,
    });
  }

  /**
   * Wait for a devbox to reach the suspended state.
   * Polls the devbox status until it reaches suspended state or fails with an error.
   *
   * @param id - Devbox ID
   * @param options - request options to specify retries, timeout, polling, etc.
   */
  async awaitSuspended(
    id: string,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<DevboxView> {
    return awaitDevboxState<DevboxView>({
      client: this._client,
      devboxId: id,
      targetState: 'suspended',
      statesToCheck: ['suspended', 'failure', 'shutdown'],
      transitionStates: ['suspending'],
      pollingOptions: options?.polling as Partial<PollingOptions<DevboxView>> | undefined,
      errorMessage: (devboxId, actualState) => `Devbox ${devboxId} is in non-suspended state ${actualState}`,
    });
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
   * @deprecated Use {@link enableTunnel} instead for V2 tunnels with better URL format.
   *
   * Creates a legacy tunnel to expose a specific port on the devbox.
   * The legacy tunnel URL format is: `https://{devbox_id}-{port}.tunnel.runloop.ai`
   *
   * V2 tunnels (via enableTunnel) provide encrypted URL-based access with the format:
   * `https://{port}-{tunnel_key}.tunnel.runloop.ai`
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
   * Enable a V2 tunnel for an existing running Devbox. Tunnels provide encrypted
   * URL-based access to the Devbox without exposing internal IDs. The tunnel URL
   * format is: https://&#123;port&#125;-&#123;tunnel_key&#125;.tunnel.runloop.ai
   *
   * Each Devbox can have one tunnel.
   */
  enableTunnel(
    id: string,
    body?: DevboxEnableTunnelParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<TunnelView>;
  enableTunnel(id: string, options?: Core.RequestOptions): Core.APIPromise<TunnelView>;
  enableTunnel(
    id: string,
    body: DevboxEnableTunnelParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<TunnelView> {
    if (isRequestOptions(body)) {
      return this.enableTunnel(id, {}, body);
    }
    return this._client.post(`/v1/devboxes/${id}/enable_tunnel`, { body, ...options });
  }

  /**
   * Execute a command with a known command ID on a devbox, optimistically waiting
   * for it to complete within the specified timeout. If it completes in time, return
   * the result. If not, return a status indicating the command is still running.
   * Note: attach_stdin parameter is not supported; use execute_async for stdin
   * support.
   */
  execute(
    id: string,
    params: DevboxExecuteParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxAsyncExecutionDetailView> {
    const { last_n, ...body } = params;
    return this._client.post(`/v1/devboxes/${id}/execute`, {
      body: {
        ...body,
        command_id: body.command_id || uuidv7(),
      },
      query: { last_n },
      timeout: (this._client as any)._options.timeout ?? 600000,
      ...options,
    });
  }

  /**
   * Execute a command and wait for it to complete with optimal latency for long running commands that can't rely on just polling.
   */
  async executeAndAwaitCompletion(
    devboxId: string,
    params: Omit<DevboxExecuteParams, 'command_id'>,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxAsyncExecutionDetailView>> },
  ): Promise<DevboxAsyncExecutionDetailView> {
    const commandId = uuidv7();
    const execution = await this.execute(
      devboxId,
      { ...params, command_id: commandId },
      // For first poll, if timeout is provided, use the timeout from the request options
      // Otherwise, if polling options are provided, use the timeout from the polling options
      // Otherwise, use the default timeout of 600 seconds
      { ...{ timeout: options?.timeout ?? options?.polling?.timeoutMs ?? 600000 }, ...options },
    );

    if (execution.status === 'completed') {
      // If the execution completes in the initial timeout, return the result
      return execution;
    }

    const waitForCommandBody: DevboxWaitForCommandParams = {
      statuses: ['completed'],
    };

    if (params.last_n) {
      waitForCommandBody.last_n = params.last_n;
    }

    const finalResult = await poll(
      () => this.waitForCommand(devboxId, execution.execution_id, waitForCommandBody),
      () => this.waitForCommand(devboxId, execution.execution_id, waitForCommandBody),
      {
        ...options?.polling,
        shouldStop: (result) => {
          return result.status === 'completed';
        },
        onError: (error) => {
          if (error.status === 408) {
            // Return a placeholder result to continue polling
            return execution;
          }

          // For any other error, rethrow it
          throw error;
        },
      },
    );

    return finalResult;
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
   * return the output. Note: attach_stdin parameter is not supported for synchronous
   * execution.
   *
   * @deprecated Use execute, executeAsync, or executeAndAwaitCompletion instead.
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
  keepAlive(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxKeepAliveResponse> {
    return this._client.post(`/v1/devboxes/${id}/keep_alive`, options);
  }

  /**
   * List all snapshots of a Devbox while optionally filtering by Devbox ID, source
   * Blueprint ID, and metadata.
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
   * @deprecated Only works with legacy tunnels created via {@link createTunnel}.
   * V2 tunnels (from {@link enableTunnel}) remain active until devbox shutdown and cannot be removed.
   *
   * Remove a legacy tunnel from the devbox.
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
   * Get resource usage metrics for a specific Devbox. Returns CPU, memory, and disk
   * consumption calculated from the Devbox's lifecycle, excluding any suspended
   * periods for CPU and memory. Disk usage includes the full elapsed time since
   * storage is consumed even when suspended.
   */
  retrieveResourceUsage(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxResourceUsageView> {
    return this._client.get(`/v1/devboxes/${id}/usage`, options);
  }

  /**
   * Shutdown a running Devbox. This will permanently stop the Devbox. If you want to
   * save the state of the Devbox, you should take a snapshot before shutting down or
   * should suspend the Devbox instead of shutting down. If the Devbox has any
   * in-progress snapshots, the shutdown will be rejected with a 409 Conflict unless
   * force=true is specified.
   */
  shutdown(
    id: string,
    params?: DevboxShutdownParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxView>;
  shutdown(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxView>;
  shutdown(
    id: string,
    params: DevboxShutdownParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxView> {
    if (isRequestOptions(params)) {
      return this.shutdown(id, {}, params);
    }
    const { force } = params;
    return this._client.post(`/v1/devboxes/${id}/shutdown`, { query: { force }, ...options });
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
   * Polls the asynchronous execution's status until it reaches one of the desired
   * statuses or times out. Max is 25 seconds.
   */
  waitForCommand(
    devboxId: string,
    executionId: string,
    params: DevboxWaitForCommandParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxAsyncExecutionDetailView> {
    const { last_n, ...body } = params;
    return this._client.post(`/v1/devboxes/${devboxId}/executions/${executionId}/wait_for_status`, {
      query: { last_n },
      body,
      ...options,
    });
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

/**
 * Details of an asynchronous command execution on a Devbox.
 *
 * @category Devbox Types
 */
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
   * Indicates whether the stderr was truncated due to size limits.
   */
  stderr_truncated?: boolean | null;

  /**
   * Standard out generated by command. This field will remain unset until the
   * execution has completed.
   */
  stdout?: string | null;

  /**
   * Indicates whether the stdout was truncated due to size limits.
   */
  stdout_truncated?: boolean | null;
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

export interface DevboxKillExecutionRequest {
  /**
   * Whether to kill the entire process group (default: false). If true, kills all
   * processes in the same process group as the target process.
   */
  kill_process_group?: boolean | null;
}

export interface DevboxListView {
  /**
   * List of devboxes matching filter.
   */
  devboxes: Array<DevboxView>;

  has_more: boolean;

  remaining_count?: number | null;

  total_count?: number | null;
}

export interface DevboxResourceUsageView {
  /**
   * The devbox ID.
   */
  id: string;

  /**
   * Disk usage in GB-seconds (total_elapsed_seconds multiplied by disk size in GB).
   * Disk is billed for elapsed time since storage is consumed even when suspended.
   */
  disk_gb_seconds: number;

  /**
   * Memory usage in GB-seconds (total_active_seconds multiplied by memory in GB).
   */
  memory_gb_seconds: number;

  /**
   * The devbox creation time in milliseconds since epoch.
   */
  start_time_ms: number;

  /**
   * The current status of the devbox.
   */
  status: string;

  /**
   * Total time in seconds the devbox was actively running (excludes time spent
   * suspended).
   */
  total_active_seconds: number;

  /**
   * Total elapsed time in seconds from devbox creation to now (or end time if
   * terminated). Includes all time regardless of devbox state.
   */
  total_elapsed_seconds: number;

  /**
   * vCPU usage in vCPU-seconds (total_active_seconds multiplied by the number of
   * vCPUs).
   */
  vcpu_seconds: number;

  /**
   * The devbox end time in milliseconds since epoch, or null if still running.
   */
  end_time_ms?: number | null;
}

export interface DevboxSendStdInRequest {
  /**
   * Signal to send to std in of the running execution.
   */
  signal?: 'EOF' | 'INTERRUPT' | null;

  /**
   * Text to send to std in of the running execution.
   */
  text?: string | null;
}

export interface DevboxSendStdInResult {
  /**
   * Devbox id where command is executing.
   */
  devbox_id: string;

  /**
   * Execution id that received the stdin.
   */
  execution_id: string;

  /**
   * Whether the stdin was successfully sent.
   */
  success: boolean;
}

export interface DevboxSnapshotListView {
  has_more: boolean;

  /**
   * List of snapshots matching filter.
   */
  snapshots: Array<DevboxSnapshotView>;

  remaining_count?: number | null;

  total_count?: number | null;
}

/**
 * View of a Devbox disk snapshot.
 *
 * @category Snapshot Types
 */
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
   * (Optional) The commit message of the snapshot (max 1000 characters).
   */
  commit_message?: string | null;

  /**
   * (Optional) The custom name of the snapshot.
   */
  name?: string | null;

  /**
   * (Optional) The size of the snapshot in bytes, relative to the base blueprint.
   */
  size_bytes?: number | null;

  /**
   * (Optional) The source Blueprint ID this snapshot was created from.
   */
  source_blueprint_id?: string | null;
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
 *
 * @category Devbox Types
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
  capabilities: Array<'unknown' | 'computer_usage' | 'browser_usage' | 'docker_in_docker'>;

  /**
   * Creation time of the Devbox (Unix timestamp milliseconds).
   */
  create_time_ms: number;

  /**
   * The time the Devbox finished execution (Unix timestamp milliseconds). Present if
   * the Devbox is in a terminal state.
   */
  end_time_ms: number | null;

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
   * The failure reason if the Devbox failed, if the Devbox has a 'failure' status.
   */
  failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | null;

  /**
   * [Beta] Gateway specifications configured for this devbox. Map key is the
   * environment variable prefix (e.g., 'GWS_ANTHROPIC').
   */
  gateway_specs?: { [key: string]: DevboxView.GatewaySpecs } | null;

  /**
   * The ID of the initiator that created the Devbox.
   */
  initiator_id?: string | null;

  /**
   * The type of initiator that created the Devbox.
   */
  initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation';

  /**
   * The name of the Devbox.
   */
  name?: string | null;

  /**
   * The shutdown reason if the Devbox shutdown, if the Devbox has a 'shutdown'
   * status.
   */
  shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | null;

  /**
   * The Snapshot ID used in creation of the Devbox, if the devbox was created from a
   * Snapshot.
   */
  snapshot_id?: string | null;

  /**
   * V2 tunnel information if a tunnel was created at launch time or via the
   * createTunnel API.
   */
  tunnel?: TunnelView | null;
}

export namespace DevboxView {
  export interface StateTransition {
    /**
     * The status of the Devbox.
     *
     * provisioning: Runloop is allocating and booting the necessary infrastructure
     * resources. initializing: Runloop defined boot scripts are running to enable the
     * environment for interaction. running: The Devbox is ready for interaction.
     * suspending: The Devbox disk is being snapshotted as part of suspension.
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

    /**
     * The time the status change occurred
     */
    transition_time_ms?: unknown;
  }

  export interface GatewaySpecs {
    /**
     * The ID of the gateway config (e.g., gwc_123abc).
     */
    gateway_config_id: string;

    /**
     * The ID of the secret containing the credential.
     */
    secret_id: string;
  }
}

/**
 * A V2 tunnel provides secure HTTP access to services running on a Devbox. Tunnels
 * allow external clients to reach web servers, APIs, or other HTTP services
 * running inside a Devbox without requiring direct network access. Each tunnel is
 * uniquely identified by an encrypted tunnel_key and can be configured for either
 * open (public) or authenticated access. Usage:
 * https://{port}-{tunnel_key}.tunnel.runloop.ai
 */
export interface TunnelView {
  /**
   * The authentication mode for the tunnel.
   */
  auth_mode: 'open' | 'authenticated';

  /**
   * Creation time of the tunnel (Unix timestamp milliseconds).
   */
  create_time_ms: number;

  /**
   * The encrypted tunnel key used to construct the tunnel URL. URL format:
   * https://{port}-{tunnel_key}.tunnel.runloop.{domain}
   */
  tunnel_key: string;

  /**
   * Bearer token for tunnel authentication. Only present when auth_mode is
   * 'authenticated'.
   */
  auth_token?: string | null;
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
   * The Linux user to use for SSH connections to this Devbox.
   */
  ssh_user: string;

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

/**
 * Parameters for creating a new Devbox.
 *
 * @category Devbox Types
 */
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
   * A list of code mounts to be included in the Devbox. Use mounts instead.
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
   * Map of paths and file contents to write before setup. Use mounts instead.
   */
  file_mounts?: { [key: string]: string } | null;

  /**
   * [Beta] (Optional) Gateway specifications for credential proxying. Map key is the
   * environment variable prefix (e.g., 'GWS_ANTHROPIC'). The gateway will proxy
   * requests to external APIs using the specified credential without exposing the
   * real API key. Example: {'GWS_ANTHROPIC': {'gateway': 'anthropic', 'secret':
   * 'my_claude_key'}}
   */
  gateways?: { [key: string]: DevboxCreateParams.Gateways } | null;

  /**
   * Parameters to configure the resources and launch time behavior of the Devbox.
   */
  launch_parameters?: Shared.LaunchParameters | null;

  /**
   * [Beta] (Optional) MCP specifications for MCP server access. Each spec links an
   * MCP config to a secret. The devbox will receive environment variables
   * (RL_MCP_URL, RL_MCP_TOKEN) for accessing MCP servers through the MCP hub.
   * Example: [{'mcp_config': 'github-readonly', 'secret': 'MY_GITHUB_TOKEN'}]
   */
  mcp?: Array<DevboxCreateParams.Mcp> | null;

  /**
   * User defined metadata to attach to the devbox for organization.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * A list of mounts to be included in the Devbox.
   */
  mounts?: Array<Shared.Mount> | null;

  /**
   * (Optional) A user specified name to give the Devbox.
   */
  name?: string | null;

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

  /**
   * (Optional) Configuration for creating a V2 tunnel at Devbox launch time. When
   * specified, a tunnel will be automatically provisioned and the tunnel details
   * will be included in the Devbox response.
   */
  tunnel?: DevboxCreateParams.Tunnel | null;
}

export namespace DevboxCreateParams {
  /**
   * [Beta] GatewaySpec links a gateway configuration to a secret for credential
   * proxying in a devbox. The gateway will proxy requests to external APIs using the
   * specified credential without exposing the real API key.
   */
  export interface Gateways {
    /**
     * The gateway config to use. Can be a gateway config ID (gwc_xxx) or name.
     */
    gateway: string;

    /**
     * The secret containing the credential. Can be a secret ID or name.
     */
    secret: string;
  }

  /**
   * [Beta] McpSpec links an MCP configuration to a secret for MCP server access in a
   * devbox. The MCP hub will proxy requests to upstream MCP servers using the
   * specified credential, with tool-level access control based on the MCP config's
   * allowed_tools.
   */
  export interface Mcp {
    /**
     * The MCP config to use. Can be an MCP config ID (mcp_xxx) or name.
     */
    mcp_config: string;

    /**
     * The secret containing the MCP server credential. Can be a secret ID or name.
     */
    secret: string;
  }

  /**
   * (Optional) Configuration for creating a V2 tunnel at Devbox launch time. When
   * specified, a tunnel will be automatically provisioned and the tunnel details
   * will be included in the Devbox response.
   */
  export interface Tunnel {
    /**
     * Authentication mode for the tunnel. Defaults to 'public' if not specified.
     */
    auth_mode?: 'open' | 'authenticated' | null;
  }
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

export interface DevboxEnableTunnelParams {
  /**
   * Authentication mode for the tunnel. Defaults to 'public' if not specified.
   */
  auth_mode?: 'open' | 'authenticated' | null;
}

/**
 * Parameters for executing a command on a Devbox.
 *
 * @category Devbox Types
 */
export interface DevboxExecuteParams {
  /**
   * Body param: The command to execute via the Devbox shell. By default, commands
   * are run from the user home directory unless shell_name is specified. If
   * shell_name is specified the command is run from the directory based on the
   * recent state of the persistent shell.
   */
  command: string;

  /**
   * Body param: The command ID in UUIDv7 string format for idempotency and tracking
   */
  command_id?: string; // This is optional as the client will generate a command_id if not provided

  /**
   * Query param: Last n lines of standard error / standard out to return
   * (default: 100)
   */
  last_n?: string;

  /**
   * Body param: Timeout in seconds to wait for command completion, up to 25 seconds.
   * Defaults to 25 seconds. Operation is not killed.
   */
  optimistic_timeout?: number | null;

  /**
   * Body param: The name of the persistent shell to create or use if already
   * created. When using a persistent shell, the command will run from the directory
   * at the end of the previous command and environment variables will be preserved.
   */
  shell_name?: string | null;
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
   * Whether to attach stdin streaming for async commands. Not valid for execute_sync
   * endpoint. Defaults to false if not specified.
   */
  attach_stdin?: boolean | null;

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
   * Whether to attach stdin streaming for async commands. Not valid for execute_sync
   * endpoint. Defaults to false if not specified.
   */
  attach_stdin?: boolean | null;

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

  /**
   * Source Blueprint ID to filter snapshots by.
   */
  source_blueprint_id?: string;
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

export interface DevboxShutdownParams {
  /**
   * If true, force shutdown even if snapshots are in progress. Defaults to false.
   */
  force?: string;
}

export interface DevboxSnapshotDiskParams {
  /**
   * (Optional) Commit message associated with the snapshot (max 1000 characters)
   */
  commit_message?: string | null;

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
   * (Optional) Commit message associated with the snapshot (max 1000 characters)
   */
  commit_message?: string | null;

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

export interface DevboxWaitForCommandParams {
  /**
   * Body param: The command execution statuses to wait for. At least one status must
   * be provided. The command will be returned as soon as it reaches any of the
   * provided statuses.
   */
  statuses: Array<'queued' | 'running' | 'completed'>;

  /**
   * Query param: Last n lines of standard error / standard out to return
   * (default: 100)
   */
  last_n?: string;

  /**
   * Body param: (Optional) Timeout in seconds to wait for the status, up to 25
   * seconds. Defaults to 25 seconds.
   */
  timeout_seconds?: number | null;
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
Devboxes.Logs = Logs;
Devboxes.Executions = Executions;

export declare namespace Devboxes {
  export {
    type DevboxAsyncExecutionDetailView as DevboxAsyncExecutionDetailView,
    type DevboxExecutionDetailView as DevboxExecutionDetailView,
    type DevboxKillExecutionRequest as DevboxKillExecutionRequest,
    type DevboxListView as DevboxListView,
    type DevboxResourceUsageView as DevboxResourceUsageView,
    type DevboxSendStdInRequest as DevboxSendStdInRequest,
    type DevboxSendStdInResult as DevboxSendStdInResult,
    type DevboxSnapshotListView as DevboxSnapshotListView,
    type DevboxSnapshotView as DevboxSnapshotView,
    type DevboxTunnelView as DevboxTunnelView,
    type DevboxView as DevboxView,
    type TunnelView as TunnelView,
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
    type DevboxEnableTunnelParams as DevboxEnableTunnelParams,
    type DevboxExecuteParams as DevboxExecuteParams,
    type DevboxExecuteAsyncParams as DevboxExecuteAsyncParams,
    type DevboxExecuteSyncParams as DevboxExecuteSyncParams,
    type DevboxListDiskSnapshotsParams as DevboxListDiskSnapshotsParams,
    type DevboxReadFileContentsParams as DevboxReadFileContentsParams,
    type DevboxRemoveTunnelParams as DevboxRemoveTunnelParams,
    type DevboxShutdownParams as DevboxShutdownParams,
    type DevboxSnapshotDiskParams as DevboxSnapshotDiskParams,
    type DevboxSnapshotDiskAsyncParams as DevboxSnapshotDiskAsyncParams,
    type DevboxUploadFileParams as DevboxUploadFileParams,
    type DevboxWaitForCommandParams as DevboxWaitForCommandParams,
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

  export { Logs as Logs, type DevboxLogsListView as DevboxLogsListView, type LogListParams as LogListParams };

  export {
    Executions as Executions,
    type ExecutionUpdateChunk as ExecutionUpdateChunk,
    type ExecutionRetrieveParams as ExecutionRetrieveParams,
    type ExecutionExecuteAsyncParams as ExecutionExecuteAsyncParams,
    type ExecutionExecuteSyncParams as ExecutionExecuteSyncParams,
    type ExecutionKillParams as ExecutionKillParams,
    type ExecutionSendStdInParams as ExecutionSendStdInParams,
    type ExecutionStreamStderrUpdatesParams as ExecutionStreamStderrUpdatesParams,
    type ExecutionStreamStdoutUpdatesParams as ExecutionStreamStdoutUpdatesParams,
  };
}
