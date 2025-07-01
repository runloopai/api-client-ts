// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as DevboxesAPI from './devboxes';
import { PollingOptions, poll } from '@runloop/api-client/lib/polling';

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
   */
  async awaitCompleted(
    id: string,
    executionId: string,
    options?: Core.RequestOptions & {
      polling?: Partial<PollingOptions<DevboxesAPI.DevboxAsyncExecutionDetailView>>;
    },
  ): Promise<DevboxesAPI.DevboxAsyncExecutionDetailView> {
    const finalResult = await poll(
      () => this.retrieve(id, executionId, options),
      () => this.retrieve(id, executionId, options),
      {
        ...options?.polling,
        shouldStop: (result: DevboxesAPI.DevboxAsyncExecutionDetailView) => {
          return result.status === 'completed';
        },
      },
    );

    return finalResult;
  }

  /**
   * Execute a bash command in the Devbox shell, await the command completion and
   * return the output.
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
   * killing the launched process.
   */
  kill(
    devboxId: string,
    executionId: string,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxAsyncExecutionDetailView> {
    return this._client.post(`/v1/devboxes/${devboxId}/executions/${executionId}/kill`, options);
  }
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

export declare namespace Executions {
  export {
    type ExecutionRetrieveParams as ExecutionRetrieveParams,
    type ExecutionExecuteAsyncParams as ExecutionExecuteAsyncParams,
    type ExecutionExecuteSyncParams as ExecutionExecuteSyncParams,
  };
}
