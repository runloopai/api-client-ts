// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import { APIPromise } from '../../core';
import * as Core from '../../core';
import * as DevboxesAPI from './devboxes';
import { Stream } from '../../streaming';

export class Executions extends APIResource {
  /**
   * Get the latest status of a previously launched asynchronous execuction including
   * stdout/error and the exit code if complete.
   */
  retrieve(
    devboxId: string,
    executionId: string,
    query?: ExecutionRetrieveParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxAsyncExecutionDetailView>;
  retrieve(
    devboxId: string,
    executionId: string,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxAsyncExecutionDetailView>;
  retrieve(
    devboxId: string,
    executionId: string,
    query: ExecutionRetrieveParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxAsyncExecutionDetailView> {
    if (isRequestOptions(query)) {
      return this.retrieve(devboxId, executionId, {}, query);
    }
    return this._client.get(`/v1/devboxes/${devboxId}/executions/${executionId}`, { query, ...options });
  }

  /**
   * Execute the given command in the Devbox shell asynchronously and returns the
   * execution that can be used to track the command's progress.
   */
  executeAsync(
    id: string,
    body: ExecutionExecuteAsyncParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxAsyncExecutionDetailView> {
    return this._client.post(`/v1/devboxes/${id}/execute_async`, { body, ...options });
  }

  /**
   * Execute a bash command in the Devbox shell, await the command completion and
   * return the output.
   *
   * @deprecated
   */
  executeSync(
    id: string,
    body: ExecutionExecuteSyncParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxExecutionDetailView> {
    return this._client.post(`/v1/devboxes/${id}/execute_sync`, {
      body,
      timeout: (this._client as any)._options.timeout ?? 600000,
      ...options,
    });
  }

  /**
   * Kill a previously launched asynchronous execution if it is still running by
   * killing the launched process. Optionally kill the entire process group.
   */
  kill(
    devboxId: string,
    executionId: string,
    body?: ExecutionKillParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxAsyncExecutionDetailView>;
  kill(
    devboxId: string,
    executionId: string,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxAsyncExecutionDetailView>;
  kill(
    devboxId: string,
    executionId: string,
    body: ExecutionKillParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxAsyncExecutionDetailView> {
    if (isRequestOptions(body)) {
      return this.kill(devboxId, executionId, {}, body);
    }
    return this._client.post(`/v1/devboxes/${devboxId}/executions/${executionId}/kill`, { body, ...options });
  }

  /**
   * Tails the stderr logs for the given execution with SSE streaming
   */
  streamStderrUpdates(
    devboxId: string,
    executionId: string,
    query: ExecutionStreamStderrUpdatesParams | undefined = {},
    options?: Core.RequestOptions,
  ): APIPromise<Stream<ExecutionUpdateChunk>> {
    return this._client.get(`/v1/devboxes/${devboxId}/executions/${executionId}/stream_stderr_updates`, {
      query,
      ...options,
      stream: true,
    }) as APIPromise<Stream<ExecutionUpdateChunk>>;
  }

  /**
   * Tails the stdout logs for the given execution with SSE streaming
   */
  streamStdoutUpdates(
    devboxId: string,
    executionId: string,
    query: ExecutionStreamStdoutUpdatesParams | undefined = {},
    options?: Core.RequestOptions,
  ): APIPromise<Stream<ExecutionUpdateChunk>> {
    return this._client.get(`/v1/devboxes/${devboxId}/executions/${executionId}/stream_stdout_updates`, {
      query,
      ...options,
      stream: true,
    }) as APIPromise<Stream<ExecutionUpdateChunk>>;
  }
}

export interface ExecutionUpdateChunk {
  /**
   * The latest log stream chunk.
   */
  output: string;

  /**
   * The byte offset of this chunk of log stream.
   */
  offset?: number;
}

export interface ExecutionRetrieveParams {
  /**
   * Last n lines of standard error / standard out to return
   */
  last_n?: string;
}

export interface ExecutionExecuteAsyncParams {
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

export interface ExecutionExecuteSyncParams {
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

export interface ExecutionKillParams {
  /**
   * Whether to kill the entire process group (default: false). If true, kills all
   * processes in the same process group as the target process.
   */
  kill_process_group?: boolean | null;
}

export interface ExecutionStreamStderrUpdatesParams {
  /**
   * The byte offset to start the stream from
   */
  offset?: string;
}

export interface ExecutionStreamStdoutUpdatesParams {
  /**
   * The byte offset to start the stream from
   */
  offset?: string;
}

export declare namespace Executions {
  export {
    type ExecutionUpdateChunk as ExecutionUpdateChunk,
    type ExecutionRetrieveParams as ExecutionRetrieveParams,
    type ExecutionExecuteAsyncParams as ExecutionExecuteAsyncParams,
    type ExecutionExecuteSyncParams as ExecutionExecuteSyncParams,
    type ExecutionKillParams as ExecutionKillParams,
    type ExecutionStreamStderrUpdatesParams as ExecutionStreamStderrUpdatesParams,
    type ExecutionStreamStdoutUpdatesParams as ExecutionStreamStdoutUpdatesParams,
  };
}
