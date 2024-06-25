// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '@runloop/api-client/resource';
import * as Core from '@runloop/api-client/core';
import * as FunctionsAPI from '@runloop/api-client/resources/functions/functions';
import * as OpenAPIAPI from '@runloop/api-client/resources/functions/openapi';
import * as InvocationsAPI from '@runloop/api-client/resources/functions/invocations/invocations';

export class Functions extends APIResource {
  invocations: InvocationsAPI.Invocations = new InvocationsAPI.Invocations(this._client);
  openAPI: OpenAPIAPI.OpenAPI = new OpenAPIAPI.OpenAPI(this._client);

  /**
   * List the functions that are available for invocation.
   */
  list(options?: Core.RequestOptions): Core.APIPromise<FunctionList> {
    return this._client.get('/v1/functions', options);
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
    project_name?: string;
  }
}

export namespace Functions {
  export import FunctionList = FunctionsAPI.FunctionList;
  export import Invocations = InvocationsAPI.Invocations;
  export import FunctionInvocationList = InvocationsAPI.FunctionInvocationList;
  export import KillOperationResponse = InvocationsAPI.KillOperationResponse;
  export import InvocationKillParams = InvocationsAPI.InvocationKillParams;
  export import OpenAPI = OpenAPIAPI.OpenAPI;
  export import OpenAPIRetrieveResponse = OpenAPIAPI.OpenAPIRetrieveResponse;
}
