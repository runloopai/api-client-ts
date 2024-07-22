// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '@runloop/api-client/resource';
import { isRequestOptions } from '@runloop/api-client/core';
import * as Core from '@runloop/api-client/core';
import * as InvocationsAPI from '@runloop/api-client/resources/functions/invocations/invocations';
import * as SpansAPI from '@runloop/api-client/resources/functions/invocations/spans';

export class Invocations extends APIResource {
  spans: SpansAPI.Spans = new SpansAPI.Spans(this._client);

  /**
   * Get the details of a function invocation. This includes the status, response,
   * and error message.
   */
  retrieve(invocationId: string, options?: Core.RequestOptions): Core.APIPromise<InvocationRetrieveResponse> {
    return this._client.get(`/v1/functions/invocations/${invocationId}`, options);
  }

  /**
   * List the functions invocations that are available for invocation.
   */
  list(
    query?: InvocationListParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<FunctionInvocationListView>;
  list(options?: Core.RequestOptions): Core.APIPromise<FunctionInvocationListView>;
  list(
    query: InvocationListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<FunctionInvocationListView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.get('/v1/functions/invocations', { query, ...options });
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

export interface FunctionInvocationListView {
  has_more?: boolean;

  /**
   * List of functions matching given query.
   */
  invocations?: Array<FunctionInvocationListView.Invocation>;

  total_count?: number;
}

export namespace FunctionInvocationListView {
  export interface Invocation {
    /**
     * Unique ID of the invocation.
     */
    id?: string;

    /**
     * End time of the invocation.
     */
    end_time_ms?: number;

    error?: string;

    /**
     * Unique name of the function.
     */
    function_name?: string;

    /**
     * The Git sha of the project this invocation used.
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

    /**
     * Start time of the invocation.
     */
    start_time_ms?: number;

    status?: 'created' | 'running' | 'success' | 'failure' | 'canceled' | 'suspended';
  }
}

export type KillOperationResponse = unknown;

export interface InvocationRetrieveResponse {
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

export interface InvocationListParams {
  /**
   * Page Limit
   */
  limit?: string;

  /**
   * Load the next page starting after the given token.
   */
  starting_after?: string;
}

export interface InvocationKillParams {}

export namespace Invocations {
  export import FunctionInvocationListView = InvocationsAPI.FunctionInvocationListView;
  export import KillOperationResponse = InvocationsAPI.KillOperationResponse;
  export import InvocationRetrieveResponse = InvocationsAPI.InvocationRetrieveResponse;
  export import InvocationListParams = InvocationsAPI.InvocationListParams;
  export import InvocationKillParams = InvocationsAPI.InvocationKillParams;
  export import Spans = SpansAPI.Spans;
}
