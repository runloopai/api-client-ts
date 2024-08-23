// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as InvocationsAPI from './invocations';
import * as Shared from '../shared';

export class Invocations extends APIResource {
  /**
   * Get the details of a function invocation. This includes the status, response,
   * and error message.
   */
  retrieve(
    invocationId: string,
    options?: Core.RequestOptions,
  ): Core.APIPromise<Shared.FunctionInvocationExecutionDetailView> {
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

  /**
   * Get the logs for the given invocation.
   */
  logs(invocationId: string, options?: Core.RequestOptions): Core.APIPromise<InvocationLogsResponse> {
    return this._client.get(`/v1/functions/invocations/${invocationId}/logs`, options);
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

export interface InvocationLogsResponse {
  /**
   * ID of the invocation.
   */
  invocation_id?: string;

  /**
   * List of logs for the given invocation.
   */
  logs?: Array<InvocationLogsResponse.Log>;
}

export namespace InvocationLogsResponse {
  export interface Log {
    /**
     * Log line severity level.
     */
    level?: string;

    /**
     * Log line message.
     */
    message?: string;

    /**
     * Time of log (Unix timestamp milliseconds).
     */
    timestamp_ms?: number;
  }
}

export interface InvocationListParams {
  /**
   * Page Limit
   */
  limit?: number;

  /**
   * Load the next page starting after the given token.
   */
  starting_after?: string;
}

export interface InvocationKillParams {}

export namespace Invocations {
  export import FunctionInvocationListView = InvocationsAPI.FunctionInvocationListView;
  export import KillOperationResponse = InvocationsAPI.KillOperationResponse;
  export import InvocationLogsResponse = InvocationsAPI.InvocationLogsResponse;
  export import InvocationListParams = InvocationsAPI.InvocationListParams;
  export import InvocationKillParams = InvocationsAPI.InvocationKillParams;
}
