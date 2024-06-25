// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '@runloop/api-client/resource';
import * as Core from '@runloop/api-client/core';
import * as InvocationsAPI from '@runloop/api-client/resources/functions/invocations/invocations';
import * as Shared from '@runloop/api-client/resources/shared';
import * as SpansAPI from '@runloop/api-client/resources/functions/invocations/spans';

export class Invocations extends APIResource {
  spans: SpansAPI.Spans = new SpansAPI.Spans(this._client);

  /**
   * Get the details of a function invocation. This includes the status, response,
   * and error message.
   */
  retrieve(
    invocationId: string,
    options?: Core.RequestOptions,
  ): Core.APIPromise<Shared.FunctionInvocationDetail> {
    return this._client.get(`/v1/functions/invocations/${invocationId}`, options);
  }

  /**
   * List the functions invocations that are available for invocation.
   */
  list(options?: Core.RequestOptions): Core.APIPromise<FunctionInvocationList> {
    return this._client.get('/v1/functions/invocations', options);
  }

  /**
   * Kill the invocation with the given ID. This will stop the function execution.
   */
  kill(
    invocationId: string,
    body?: InvocationKillParams | null | undefined,
    options?: Core.RequestOptions,
  ): Core.APIPromise<unknown> {
    return this._client.post(`/v1/functions/invocations/${invocationId}/kill`, { body, ...options });
  }
}

export interface FunctionInvocationList {
  /**
   * List of functions matching given query.
   */
  invocations?: Array<FunctionInvocationList.Invocation>;
}

export namespace FunctionInvocationList {
  export interface Invocation {
    /**
     * Unique ID of the invocations.
     */
    id?: string;

    /**
     * Name of the invoked function.
     */
    name?: string;

    /**
     * Project name associated with invoked function.
     */
    projectName?: string;

    status?: 'created' | 'running' | 'success' | 'failure' | 'canceled' | 'suspended';
  }
}

export type KillOperationResponse = unknown;

export interface InvocationKillParams {}

export namespace Invocations {
  export import FunctionInvocationList = InvocationsAPI.FunctionInvocationList;
  export import KillOperationResponse = InvocationsAPI.KillOperationResponse;
  export import InvocationKillParams = InvocationsAPI.InvocationKillParams;
  export import Spans = SpansAPI.Spans;
  export import InvocationSpanList = SpansAPI.InvocationSpanList;
}
