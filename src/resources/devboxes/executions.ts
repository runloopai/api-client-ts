// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as DevboxesAPI from './devboxes';
import { PollingOptions, poll } from '@runloop/api-client/lib/polling';

export class Executions extends APIResource {
  /**
   * Get status of an execution on a devbox.
   */
  retrieve(
    id: string,
    executionId: string,
    query?: ExecutionRetrieveParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxAsyncExecutionDetailView>;
  retrieve(
    id: string,
    executionId: string,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxAsyncExecutionDetailView>;
  retrieve(
    id: string,
    executionId: string,
    query: ExecutionRetrieveParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxAsyncExecutionDetailView> {
    if (isRequestOptions(query)) {
      return this.retrieve(id, executionId, {}, query);
    }
    return this._client.get(`/v1/devboxes/${id}/executions/${executionId}`, { query, ...options });
  }

  /**
   * Asynchronously execute a command on a devbox
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
   * Synchronously execute a command on a devbox
   */
  executeSync(
    id: string,
    body: ExecutionExecuteSyncParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxExecutionDetailView> {
    return this._client.post(`/v1/devboxes/${id}/execute_sync`, { body, ...options });
  }

  /**
   * Kill an asynchronous execution currently running on a devbox
   */
  kill(
    id: string,
    executionId: string,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxAsyncExecutionDetailView> {
    return this._client.post(`/v1/devboxes/${id}/executions/${executionId}/kill`, options);
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
   * The command to execute on the Devbox.
   */
  command: string;

  /**
   * Which named shell to run the command in.
   */
  shell_name?: string;
}

export interface ExecutionExecuteSyncParams {
  /**
   * The command to execute on the Devbox.
   */
  command: string;

  /**
   * Which named shell to run the command in.
   */
  shell_name?: string;
}

export declare namespace Executions {
  export {
    type ExecutionRetrieveParams as ExecutionRetrieveParams,
    type ExecutionExecuteAsyncParams as ExecutionExecuteAsyncParams,
    type ExecutionExecuteSyncParams as ExecutionExecuteSyncParams,
  };
}
