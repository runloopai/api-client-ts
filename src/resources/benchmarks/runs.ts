// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as BenchmarksAPI from './benchmarks';

export class Runs extends APIResource {
  /**
   * Get a BenchmarkRun given ID.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<BenchmarksAPI.BenchmarkRunView> {
    return this._client.get(`/v1/benchmarks/runs/${id}`, options);
  }

  /**
   * List all BenchmarkRuns matching filter.
   */
  list(query?: RunListParams, options?: Core.RequestOptions): Core.APIPromise<RunListResponse>;
  list(options?: Core.RequestOptions): Core.APIPromise<RunListResponse>;
  list(
    query: RunListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<RunListResponse> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.get('/v1/benchmarks/runs', { query, ...options });
  }

  /**
   * Complete a currently running BenchmarkRun.
   */
  complete(id: string, options?: Core.RequestOptions): Core.APIPromise<BenchmarksAPI.BenchmarkRunView> {
    return this._client.post(`/v1/benchmarks/runs/${id}/complete`, options);
  }
}

export interface RunListResponse {
  has_more: boolean;

  /**
   * List of BenchmarkRuns matching filter.
   */
  runs: Array<BenchmarksAPI.BenchmarkRunView>;

  total_count: number;
}

export interface RunListParams {
  /**
   * The limit of items to return. Default is 20.
   */
  limit?: number;

  /**
   * Load the next page of data starting after the item with the given ID.
   */
  starting_after?: string;
}

export declare namespace Runs {
  export { type RunListResponse as RunListResponse, type RunListParams as RunListParams };
}
