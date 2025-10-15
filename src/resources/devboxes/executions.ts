// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import { APIPromise } from '../../core';
import * as Core from '../../core';
import * as DevboxesAPI from './devboxes';
import { PollingOptions, poll } from '@runloop/api-client/lib/polling';
import { Stream } from '../../streaming';
import { withStreamAutoReconnect } from '@runloop/api-client/lib/streaming-reconnection';

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
   * Wait for an async execution to complete.
   * Polls the execution status until it reaches completed state.
   *
   * @param id - Devbox ID
   * @param executionId - Execution ID
   * @param options - request options to specify retries, timeout, polling, etc.
   */
  async awaitCompleted(
    id: string,
    executionId: string,
    options?: Core.RequestOptions & {
      polling?: Partial<PollingOptions<DevboxesAPI.DevboxAsyncExecutionDetailView>>;
    },
  ): Promise<DevboxesAPI.DevboxAsyncExecutionDetailView> {
    const longPoll = (): Promise<DevboxesAPI.DevboxAsyncExecutionDetailView> => {
      // This either returns a DevboxAsyncExecutionDetailView when execution status is completed;
      // Otherwise it throws an 408 error when times out.
      return this._client.post(`/v1/devboxes/${id}/executions/${executionId}/wait_for_status`, {
        body: { statuses: ['completed'] },
      });
    };

    const finalResult = await poll(
      () => longPoll(),
      () => longPoll(),
      {
        ...options?.polling,
        shouldStop: (result: DevboxesAPI.DevboxAsyncExecutionDetailView) => {
          return result.status === 'completed';
        },
        onError: (error) => {
          if (error.status === 408) {
            // Return a placeholder result to continue polling
            return { status: 'running' } as DevboxesAPI.DevboxAsyncExecutionDetailView;
          }

          // For any other error, rethrow it
          throw error;
        },
      },
    );

    return finalResult;
  }

  /**
   * Execute a bash command in the Devbox shell, await the command completion and
   * return the output. Note: attach_stdin parameter is not supported for synchronous
   * execution.
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
   * Send content to the Std In of a running execution.
   */
  sendStdIn(
    devboxId: string,
    executionId: string,
    body?: ExecutionSendStdInParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxSendStdInResult>;
  sendStdIn(
    devboxId: string,
    executionId: string,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxSendStdInResult>;
  sendStdIn(
    devboxId: string,
    executionId: string,
    body: ExecutionSendStdInParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxSendStdInResult> {
    if (isRequestOptions(body)) {
      return this.sendStdIn(devboxId, executionId, {}, body);
    }
    return this._client.post(`/v1/devboxes/${devboxId}/executions/${executionId}/send_std_in`, {
      body,
      ...options,
    });
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
    const defaultHeaders = {
      Accept: 'text/event-stream',
    };
    const mergedOptions: Core.RequestOptions = {
      headers: defaultHeaders,
      ...options,
    };
    const getStream: (offset: number | undefined) => APIPromise<Stream<ExecutionUpdateChunk>> = (offset) =>
      this._client.get(`/v1/devboxes/${devboxId}/executions/${executionId}/stream_stderr_updates`, {
        query: { ...query, offset: offset?.toString() || '0' },
        ...mergedOptions,
        stream: true,
      });
    return withStreamAutoReconnect(getStream, (item) => item.offset) as APIPromise<
      Stream<ExecutionUpdateChunk>
    >;
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
    const defaultHeaders = {
      Accept: 'text/event-stream',
    };
    const mergedOptions: Core.RequestOptions = {
      headers: defaultHeaders,
      ...options,
    };
    const getStream: (offset: number | undefined) => APIPromise<Stream<ExecutionUpdateChunk>> = (offset) =>
      this._client.get(`/v1/devboxes/${devboxId}/executions/${executionId}/stream_stdout_updates`, {
        query: { ...query, offset: offset?.toString() || '0' },
        ...mergedOptions,
        stream: true,
      });
    return withStreamAutoReconnect(getStream, (item) => item.offset) as APIPromise<
      Stream<ExecutionUpdateChunk>
    >;
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
   * Last n lines of standard error / standard out to return (default: 100)
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

export interface ExecutionExecuteSyncParams {
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

export interface ExecutionKillParams {
  /**
   * Whether to kill the entire process group (default: false). If true, kills all
   * processes in the same process group as the target process.
   */
  kill_process_group?: boolean | null;
}

export interface ExecutionSendStdInParams {
  /**
   * Signal to send to std in of the running execution.
   */
  signal?: 'EOF' | 'INTERRUPT' | null;

  /**
   * Text to send to std in of the running execution.
   */
  text?: string | null;
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
    type ExecutionSendStdInParams as ExecutionSendStdInParams,
    type ExecutionStreamStderrUpdatesParams as ExecutionStreamStderrUpdatesParams,
    type ExecutionStreamStdoutUpdatesParams as ExecutionStreamStdoutUpdatesParams,
  };
}
