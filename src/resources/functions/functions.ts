// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import * as Core from '../../core';
import * as FunctionsAPI from './functions';
import * as InvocationsAPI from './invocations/invocations';

export class Functions extends APIResource {
  invocations: InvocationsAPI.Invocations = new InvocationsAPI.Invocations(this._client);

  /**
   * List the functions that are available for invocation.
   */
  list(options?: Core.RequestOptions): Core.APIPromise<FunctionListView> {
    return this._client.get('/v1/functions', options);
  }

  /**
   * Invoke the remote function asynchronously. This will return a job id that can be
   * used to query the status of the function invocation.
   */
  invokeAsync(
    projectName: string,
    functionName: string,
    body: FunctionInvokeAsyncParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<FunctionInvokeAsyncResponse> {
    return this._client.post(`/v1/functions/${projectName}/${functionName}/invoke_async`, {
      body,
      ...options,
    });
  }

  /**
   * Invoke the remote function synchronously. This will block until the function
   * completes and return the result. If the function call takes too long, the
   * request will timeout.
   */
  invokeSync(
    projectName: string,
    functionName: string,
    body: FunctionInvokeSyncParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<FunctionInvokeSyncResponse> {
    return this._client.post(`/v1/functions/${projectName}/${functionName}/invoke_sync`, {
      body,
      ...options,
    });
  }
}

export interface FunctionListView {
  /**
   * List of functions matching given query.
   */
  functions?: Array<FunctionListView.Function>;
}

export namespace FunctionListView {
  export interface Function {
    /**
     * Unique name of the function.
     */
    name?: string;

    /**
     * Unique name of the project.
     */
    project_name?: string;
  }
}

export interface FunctionInvokeAsyncResponse {
  /**
   * Unique ID of the invocation.
   */
  id?: string;

  error?: string;

  /**
   * Unique name of the function.
   */
  function_name?: string;

  /**
   * The Git sha of the project this invocation used..
   */
  gh_commit_sha?: string;

  /**
   * The Github Owner of the Project.
   */
  gh_owner?: string;

  /**
   * The Devboxes created and used by this invocation.
   */
  linked_devboxes?: Array<string>;

  /**
   * Unique name of the project associated with function.
   */
  project_name?: string;

  request?: unknown;

  result?: unknown;

  status?: 'created' | 'running' | 'success' | 'failure' | 'canceled' | 'suspended';
}

export interface FunctionInvokeSyncResponse {
  /**
   * Unique ID of the invocation.
   */
  id?: string;

  error?: string;

  /**
   * Unique name of the function.
   */
  function_name?: string;

  /**
   * The Git sha of the project this invocation used..
   */
  gh_commit_sha?: string;

  /**
   * The Github Owner of the Project.
   */
  gh_owner?: string;

  /**
   * The Devboxes created and used by this invocation.
   */
  linked_devboxes?: Array<string>;

  /**
   * Unique name of the project associated with function.
   */
  project_name?: string;

  request?: unknown;

  result?: unknown;

  status?: 'created' | 'running' | 'success' | 'failure' | 'canceled' | 'suspended';
}

export interface FunctionInvokeAsyncParams {
  /**
   * Json of the request
   */
  request: unknown;

  runloopMeta?: FunctionInvokeAsyncParams.RunloopMeta;
}

export namespace FunctionInvokeAsyncParams {
  export interface RunloopMeta {
    /**
     * Json of the request
     */
    session_id?: string;
  }
}

export interface FunctionInvokeSyncParams {
  /**
   * Json of the request
   */
  request: unknown;

  runloopMeta?: FunctionInvokeSyncParams.RunloopMeta;
}

export namespace FunctionInvokeSyncParams {
  export interface RunloopMeta {
    /**
     * Json of the request
     */
    session_id?: string;
  }
}

export namespace Functions {
  export import FunctionListView = FunctionsAPI.FunctionListView;
  export import FunctionInvokeAsyncResponse = FunctionsAPI.FunctionInvokeAsyncResponse;
  export import FunctionInvokeSyncResponse = FunctionsAPI.FunctionInvokeSyncResponse;
  export import FunctionInvokeAsyncParams = FunctionsAPI.FunctionInvokeAsyncParams;
  export import FunctionInvokeSyncParams = FunctionsAPI.FunctionInvokeSyncParams;
  export import Invocations = InvocationsAPI.Invocations;
  export import FunctionInvocationListView = InvocationsAPI.FunctionInvocationListView;
  export import KillOperationResponse = InvocationsAPI.KillOperationResponse;
  export import InvocationRetrieveResponse = InvocationsAPI.InvocationRetrieveResponse;
  export import InvocationListParams = InvocationsAPI.InvocationListParams;
  export import InvocationKillParams = InvocationsAPI.InvocationKillParams;
}
