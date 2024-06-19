// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as Core from '../../core';
import { APIResource } from '../../resource';
import * as FunctionsAPI from './functions';
import * as Shared from '../shared';
import * as OpenAPIAPI from './openapi';
import * as InvocationsAPI from './invocations/invocations';

export class Functions extends APIResource {
  invocations: InvocationsAPI.Invocations = new InvocationsAPI.Invocations(this._client);
  openAPI: OpenAPIAPI.OpenAPI = new OpenAPIAPI.OpenAPI(this._client);

  /**
   * List the functions that are available for invocation.
   */
  list(options?: Core.RequestOptions): Core.APIPromise<FunctionList> {
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
  ): Core.APIPromise<Shared.FunctionInvocationDetail> {
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
  ): Core.APIPromise<Shared.FunctionInvocationDetail> {
    return this._client.post(`/v1/functions/${projectName}/${functionName}/invoke_sync`, {
      body,
      ...options,
    });
  }
}

export interface FunctionList {
  /**
   * List of functions matching given query.
   */
  functions?: Array<FunctionList.Function>;
}

export namespace FunctionList {
  export interface Function {
    /**
     * Unique name of the function.
     */
    name?: string;

    /**
     * Unique name of the project.
     */
    projectName?: string;
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
    sessionId?: string;
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
    sessionId?: string;
  }
}

export namespace Functions {
  export import FunctionList = FunctionsAPI.FunctionList;
  export import FunctionInvokeAsyncParams = FunctionsAPI.FunctionInvokeAsyncParams;
  export import FunctionInvokeSyncParams = FunctionsAPI.FunctionInvokeSyncParams;
  export import Invocations = InvocationsAPI.Invocations;
  export import FunctionInvocationList = InvocationsAPI.FunctionInvocationList;
  export import KillOperationResponse = InvocationsAPI.KillOperationResponse;
  export import InvocationKillParams = InvocationsAPI.InvocationKillParams;
  export import OpenAPI = OpenAPIAPI.OpenAPI;
  export import OpenAPIRetrieveResponse = OpenAPIAPI.OpenAPIRetrieveResponse;
}
