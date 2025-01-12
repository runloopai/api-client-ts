// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import * as Core from '../../core';
import * as DevboxesAPI from './devboxes';

export class Executions extends APIResource {
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
   */
  executeSync(
    id: string,
    body: ExecutionExecuteSyncParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxExecutionDetailView> {
    return this._client.post(`/v1/devboxes/${id}/execute_sync`, { body, ...options });
  }
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
    type ExecutionExecuteAsyncParams as ExecutionExecuteAsyncParams,
    type ExecutionExecuteSyncParams as ExecutionExecuteSyncParams,
  };
}
