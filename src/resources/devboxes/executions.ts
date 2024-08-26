// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as ExecutionsAPI from './executions';
import * as DevboxesAPI from './devboxes';
import * as LogsAPI from './logs';

export class Executions extends APIResource {
  /**
   * Asynchronously execute a command on a devbox
   */
  executeAsync(
    id: string,
    body?: ExecutionExecuteAsyncParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxAsyncExecutionDetailView>;
  executeAsync(
    id: string,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxAsyncExecutionDetailView>;
  executeAsync(
    id: string,
    body: ExecutionExecuteAsyncParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxAsyncExecutionDetailView> {
    if (isRequestOptions(body)) {
      return this.executeAsync(id, {}, body);
    }
    return this._client.post(`/v1/devboxes/${id}/executions/execute_async`, { body, ...options });
  }

  /**
   * Synchronously execute a command on a devbox
   */
  executeSync(
    id: string,
    body?: ExecutionExecuteSyncParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxExecutionDetailView>;
  executeSync(
    id: string,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxExecutionDetailView>;
  executeSync(
    id: string,
    body: ExecutionExecuteSyncParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxExecutionDetailView> {
    if (isRequestOptions(body)) {
      return this.executeSync(id, {}, body);
    }
    return this._client.post(`/v1/devboxes/${id}/execute_sync`, { body, ...options });
  }

  /**
   * Get all logs from a Devbox execution by id.
   */
  logs(
    id: string,
    executionId: string,
    options?: Core.RequestOptions,
  ): Core.APIPromise<LogsAPI.DevboxLogsListView> {
    return this._client.get(`/v1/devboxes/${id}/executions/${executionId}/logs`, options);
  }
}

export interface ExecutionExecuteAsyncParams {
  /**
   * The command to execute on the Devbox.
   */
  command?: string;
}

export interface ExecutionExecuteSyncParams {
  /**
   * The command to execute on the Devbox.
   */
  command?: string;
}

export namespace Executions {
  export import ExecutionExecuteAsyncParams = ExecutionsAPI.ExecutionExecuteAsyncParams;
  export import ExecutionExecuteSyncParams = ExecutionsAPI.ExecutionExecuteSyncParams;
}
