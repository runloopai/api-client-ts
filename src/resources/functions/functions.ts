// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import * as Core from '../../core';
import * as Shared from '../shared';
import * as InvocationsAPI from './invocations';
import {
  FunctionInvocationListView,
  InvocationKillParams,
  InvocationListParams,
  Invocations,
  KillOperationResponse,
} from './invocations';

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

Functions.Invocations = Invocations;

export declare namespace Functions {
  export {
    type FunctionListView as FunctionListView,
    type FunctionInvokeAsyncParams as FunctionInvokeAsyncParams,
    type FunctionInvokeSyncParams as FunctionInvokeSyncParams,
  };

  export {
    Invocations as Invocations,
    type FunctionInvocationListView as FunctionInvocationListView,
    type KillOperationResponse as KillOperationResponse,
    type InvocationListParams as InvocationListParams,
    type InvocationKillParams as InvocationKillParams,
  };
}
