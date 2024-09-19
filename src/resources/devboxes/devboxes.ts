// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as DevboxesAPI from './devboxes';
import * as AccountAPI from '../account';
import * as CodeAPI from '../code';
import * as ExecutionsAPI from './executions';
import * as LogsAPI from './logs';

export class Devboxes extends APIResource {
  logs: LogsAPI.Logs = new LogsAPI.Logs(this._client);
  executions: ExecutionsAPI.Executions = new ExecutionsAPI.Executions(this._client);

  /**
   * Create a Devbox with the specified configuration. The Devbox will be created in
   * the 'pending' state and will transition to 'running' once it is ready.
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
   * Get a devbox by id. If the devbox does not exist, a 404 is returned.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxView> {
    return this._client.get(`/v1/devboxes/${id}`, options);
  }

  /**
   * List all devboxes or filter by status. If no status is provided, all devboxes
   * are returned.
   */
  list(query?: DevboxListParams, options?: Core.RequestOptions): Core.APIPromise<DevboxListView>;
  list(options?: Core.RequestOptions): Core.APIPromise<DevboxListView>;
  list(
    query: DevboxListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxListView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.get('/v1/devboxes', { query, ...options });
  }

  /**
   * Create an SSH key for a devbox by id.
   */
  createSSHKey(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxCreateSSHKeyResponse> {
    return this._client.post(`/v1/devboxes/${id}/create_ssh_key`, options);
  }

  /**
   * Asynchronously execute a command on a devbox
   */
  executeAsync(
    id: string,
    body?: DevboxExecuteAsyncParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxAsyncExecutionDetailView>;
  executeAsync(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxAsyncExecutionDetailView>;
  executeAsync(
    id: string,
    body: DevboxExecuteAsyncParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxAsyncExecutionDetailView> {
    if (isRequestOptions(body)) {
      return this.executeAsync(id, {}, body);
    }
    return this._client.post(`/v1/devboxes/${id}/execute_async`, { body, ...options });
  }

  /**
   * Synchronously execute a command on a devbox
   */
  executeSync(
    id: string,
    body?: DevboxExecuteSyncParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxExecutionDetailView>;
  executeSync(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxExecutionDetailView>;
  executeSync(
    id: string,
    body: DevboxExecuteSyncParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxExecutionDetailView> {
    if (isRequestOptions(body)) {
      return this.executeSync(id, {}, body);
    }
    return this._client.post(`/v1/devboxes/${id}/execute_sync`, { body, ...options });
  }

  /**
   * Read file contents from a file on given Devbox.
   */
  readFileContents(
    id: string,
    body?: DevboxReadFileContentsParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<string>;
  readFileContents(id: string, options?: Core.RequestOptions): Core.APIPromise<string>;
  readFileContents(
    id: string,
    body: DevboxReadFileContentsParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<string> {
    if (isRequestOptions(body)) {
      return this.readFileContents(id, {}, body);
    }
    return this._client.post(`/v1/devboxes/${id}/read_file_contents`, {
      body,
      ...options,
      headers: { Accept: 'text/plain', ...options?.headers },
    });
  }

  /**
   * Shutdown a running devbox by id. This will take the devbox out of service.
   */
  shutdown(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxView> {
    return this._client.post(`/v1/devboxes/${id}/shutdown`, options);
  }

  /**
   * Upload file contents to a file at path on the Devbox.
   */
  uploadFile(
    id: string,
    body?: DevboxUploadFileParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<unknown>;
  uploadFile(id: string, options?: Core.RequestOptions): Core.APIPromise<unknown>;
  uploadFile(
    id: string,
    body: DevboxUploadFileParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<unknown> {
    if (isRequestOptions(body)) {
      return this.uploadFile(id, {}, body);
    }
    return this._client.post(
      `/v1/devboxes/${id}/upload_file`,
      Core.multipartFormRequestOptions({ body, ...options }),
    );
  }

  /**
   * Write contents to a file at path on the Devbox.
   */
  writeFile(
    id: string,
    body?: DevboxWriteFileParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxExecutionDetailView>;
  writeFile(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxExecutionDetailView>;
  writeFile(
    id: string,
    body: DevboxWriteFileParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxExecutionDetailView> {
    if (isRequestOptions(body)) {
      return this.writeFile(id, {}, body);
    }
    return this._client.post(`/v1/devboxes/${id}/write_file`, { body, ...options });
  }
}

export interface DevboxAsyncExecutionDetailView {
  /**
   * Devbox id where command was executed.
   */
  devbox_id?: string;

  /**
   * Ephemeral id of the execution in progress.
   */
  execution_id?: string;

  /**
   * Exit code of command execution. This field will remain unset until the execution
   * has completed.
   */
  exit_status?: number;

  /**
   * Shell name.
   */
  shell_name?: string;

  /**
   * Current status of the execution.
   */
  status?: 'queued' | 'running' | 'completed';

  /**
   * Standard error generated by command. This field will remain unset until the
   * execution has completed.
   */
  stderr?: string;

  /**
   * Standard out generated by command. This field will remain unset until the
   * execution has completed.
   */
  stdout?: string;
}

export interface DevboxExecutionDetailView {
  /**
   * Devbox id where command was executed.
   */
  devbox_id?: string;

  /**
   * Exit status of command execution.
   */
  exit_status?: number;

  /**
   * Shell name.
   */
  shell_name?: string;

  /**
   * Standard error generated by command.
   */
  stderr?: string;

  /**
   * Standard out generated by command.
   */
  stdout?: string;
}

export interface DevboxListView {
  /**
   * List of devboxes matching filter.
   */
  devboxes?: Array<DevboxView>;

  has_more?: boolean;

  total_count?: number;
}

export interface DevboxView {
  /**
   * The id of the Devbox.
   */
  id?: string;

  /**
   * The Blueprint ID used in creation of the Devbox, if any.
   */
  blueprint_id?: string;

  /**
   * Creation time of the Devbox (Unix timestamp milliseconds).
   */
  create_time_ms?: number;

  /**
   * The time the Devbox finished execution (Unix timestamp milliseconds).
   */
  end_time_ms?: number;

  /**
   * The failure reason if the Devbox failed, if any.
   */
  failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed';

  /**
   * The initiator ID of the devbox.
   */
  initiator_id?: string;

  /**
   * The initiator of the devbox.
   */
  initiator_type?: 'unknown' | 'api' | 'invocation';

  /**
   * The launch parameters used to create the Devbox.
   */
  launch_parameters?: DevboxView.LaunchParameters;

  /**
   * The user defined Devbox metadata.
   */
  metadata?: Record<string, string>;

  /**
   * The name of the Devbox.
   */
  name?: string;

  /**
   * The shutdown reason if the Devbox shutdown, if any.
   */
  shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit';

  /**
   * The current status of the Devbox.
   */
  status?: 'provisioning' | 'initializing' | 'running' | 'failure' | 'shutdown';
}

export namespace DevboxView {
  /**
   * The launch parameters used to create the Devbox.
   */
  export interface LaunchParameters {
    /**
     * Time in seconds after which Devbox will automatically shutdown. Default is 1
     * hour.
     */
    keep_alive_time_seconds?: number;

    /**
     * Set of commands to be run at launch time, before the entrypoint process is run.
     */
    launch_commands?: Array<string>;

    /**
     * Manual resource configuration for Devbox. If not set, defaults will be used.
     */
    resource_size_request?: AccountAPI.ResourceSize;
  }
}

export interface DevboxCreateSSHKeyResponse {
  /**
   * The id of the Devbox.
   */
  id?: string;

  /**
   * The ssh private key, in PEM format.
   */
  ssh_private_key?: string;

  /**
   * The url of the Devbox.
   */
  url?: string;
}

export type DevboxReadFileContentsResponse = string;

export type DevboxUploadFileResponse = unknown;

export interface DevboxCreateParams {
  /**
   * (Optional) Blueprint to use for the Devbox. If none set, the Devbox will be
   * created with the default Runloop Devbox image.
   */
  blueprint_id?: string;

  /**
   * (Optional) Name of Blueprint to use for the Devbox. When set, this will load the
   * latest successfully built Blueprint with the given name.
   */
  blueprint_name?: string;

  /**
   * A list of code mounts to be included in the Devbox.
   */
  code_mounts?: Array<CodeAPI.CodeMountParameters>;

  /**
   * (Optional) When specified, the Devbox will run this script as its main
   * executable. The devbox lifecycle will be bound to entrypoint, shutting down when
   * the process is complete.
   */
  entrypoint?: string;

  /**
   * (Optional) Environment variables used to configure your Devbox.
   */
  environment_variables?: Record<string, string>;

  /**
   * (Optional) Map of paths and file contents to write before setup..
   */
  file_mounts?: Record<string, string>;

  /**
   * Parameters to configure the resources and launch time behavior of the Devbox.
   */
  launch_parameters?: DevboxCreateParams.LaunchParameters;

  /**
   * User defined metadata to attach to the devbox for organization.
   */
  metadata?: Record<string, string>;

  /**
   * (Optional) A user specified name to give the Devbox.
   */
  name?: string;

  /**
   * Handle to prebuilt.
   */
  prebuilt?: string;

  /**
   * (Optional) List of commands needed to set up your Devbox. Examples might include
   * fetching a tool or building your dependencies. Runloop will look optimize these
   * steps for you.
   */
  setup_commands?: Array<string>;
}

export namespace DevboxCreateParams {
  /**
   * Parameters to configure the resources and launch time behavior of the Devbox.
   */
  export interface LaunchParameters {
    /**
     * Time in seconds after which Devbox will automatically shutdown. Default is 1
     * hour.
     */
    keep_alive_time_seconds?: number;

    /**
     * Set of commands to be run at launch time, before the entrypoint process is run.
     */
    launch_commands?: Array<string>;

    /**
     * Manual resource configuration for Devbox. If not set, defaults will be used.
     */
    resource_size_request?: AccountAPI.ResourceSize;
  }
}

export interface DevboxListParams {
  /**
   * Page Limit
   */
  limit?: number;

  /**
   * Load the next page starting after the given token.
   */
  starting_after?: string;

  /**
   * Filter by status
   */
  status?: string;
}

export interface DevboxExecuteAsyncParams {
  /**
   * The command to execute on the Devbox.
   */
  command?: string;

  /**
   * Which named shell to run the command in.
   */
  shell_name?: string;
}

export interface DevboxExecuteSyncParams {
  /**
   * The command to execute on the Devbox.
   */
  command?: string;

  /**
   * Which named shell to run the command in.
   */
  shell_name?: string;
}

export interface DevboxReadFileContentsParams {
  /**
   * The path of the file to read.
   */
  file_path?: string;
}

export interface DevboxUploadFileParams {
  file?: Core.Uploadable;

  path?: string;
}

export interface DevboxWriteFileParams {
  /**
   * The contents to write to file.
   */
  contents?: string;

  /**
   * The path of the file to read.
   */
  file_path?: string;
}

export namespace Devboxes {
  export import DevboxAsyncExecutionDetailView = DevboxesAPI.DevboxAsyncExecutionDetailView;
  export import DevboxExecutionDetailView = DevboxesAPI.DevboxExecutionDetailView;
  export import DevboxListView = DevboxesAPI.DevboxListView;
  export import DevboxView = DevboxesAPI.DevboxView;
  export import DevboxCreateSSHKeyResponse = DevboxesAPI.DevboxCreateSSHKeyResponse;
  export import DevboxReadFileContentsResponse = DevboxesAPI.DevboxReadFileContentsResponse;
  export import DevboxUploadFileResponse = DevboxesAPI.DevboxUploadFileResponse;
  export import DevboxCreateParams = DevboxesAPI.DevboxCreateParams;
  export import DevboxListParams = DevboxesAPI.DevboxListParams;
  export import DevboxExecuteAsyncParams = DevboxesAPI.DevboxExecuteAsyncParams;
  export import DevboxExecuteSyncParams = DevboxesAPI.DevboxExecuteSyncParams;
  export import DevboxReadFileContentsParams = DevboxesAPI.DevboxReadFileContentsParams;
  export import DevboxUploadFileParams = DevboxesAPI.DevboxUploadFileParams;
  export import DevboxWriteFileParams = DevboxesAPI.DevboxWriteFileParams;
  export import Logs = LogsAPI.Logs;
  export import DevboxLogsListView = LogsAPI.DevboxLogsListView;
  export import LogListParams = LogsAPI.LogListParams;
  export import Executions = ExecutionsAPI.Executions;
  export import ExecutionRetrieveParams = ExecutionsAPI.ExecutionRetrieveParams;
  export import ExecutionExecuteAsyncParams = ExecutionsAPI.ExecutionExecuteAsyncParams;
  export import ExecutionExecuteSyncParams = ExecutionsAPI.ExecutionExecuteSyncParams;
}
