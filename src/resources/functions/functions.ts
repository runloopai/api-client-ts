// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import * as Core from '../../core';
import * as FunctionsAPI from './functions';
import * as Shared from '../shared';
import * as InvocationsAPI from './invocations';

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
  ): Core.APIPromise<Shared.FunctionInvocationExecutionDetailView> {
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
  ): Core.APIPromise<Shared.FunctionInvocationExecutionDetailView> {
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

export type ResourceSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'CUSTOM_SIZE';

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
  export import ResourceSize = FunctionsAPI.ResourceSize;
  export import FunctionInvokeAsyncParams = FunctionsAPI.FunctionInvokeAsyncParams;
  export import FunctionInvokeSyncParams = FunctionsAPI.FunctionInvokeSyncParams;
  export import Invocations = InvocationsAPI.Invocations;
  export import FunctionInvocationListView = InvocationsAPI.FunctionInvocationListView;
  export import KillOperationResponse = InvocationsAPI.KillOperationResponse;
  export import InvocationListParams = InvocationsAPI.InvocationListParams;
  export import InvocationKillParams = InvocationsAPI.InvocationKillParams;
}
