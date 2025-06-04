// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as BenchmarksAPI from './benchmarks';
import { BenchmarkRunViewsBenchmarkRunsCursorIDPage } from './benchmarks';
import * as ScenariosAPI from '../scenarios/scenarios';
import { ScenarioRunViewsBenchmarkRunsCursorIDPage } from '../scenarios/scenarios';
import { type BenchmarkRunsCursorIDPageParams } from '../../pagination';

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
  list(
    query?: RunListParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<BenchmarkRunViewsBenchmarkRunsCursorIDPage, BenchmarksAPI.BenchmarkRunView>;
  list(
    options?: Core.RequestOptions,
  ): Core.PagePromise<BenchmarkRunViewsBenchmarkRunsCursorIDPage, BenchmarksAPI.BenchmarkRunView>;
  list(
    query: RunListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<BenchmarkRunViewsBenchmarkRunsCursorIDPage, BenchmarksAPI.BenchmarkRunView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList('/v1/benchmarks/runs', BenchmarkRunViewsBenchmarkRunsCursorIDPage, {
      query,
      ...options,
    });
  }

  /**
   * Cancel a currently running Benchmark run.
   */
  cancel(id: string, options?: Core.RequestOptions): Core.APIPromise<BenchmarksAPI.BenchmarkRunView> {
    return this._client.post(`/v1/benchmarks/runs/${id}/cancel`, options);
  }

  /**
   * Complete a currently running BenchmarkRun.
   */
  complete(id: string, options?: Core.RequestOptions): Core.APIPromise<BenchmarksAPI.BenchmarkRunView> {
    return this._client.post(`/v1/benchmarks/runs/${id}/complete`, options);
  }

  /**
   * List started scenario runs for a benchmark run.
   */
  listScenarioRuns(
    id: string,
    query?: RunListScenarioRunsParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<ScenarioRunViewsBenchmarkRunsCursorIDPage, ScenariosAPI.ScenarioRunView>;
  listScenarioRuns(
    id: string,
    options?: Core.RequestOptions,
  ): Core.PagePromise<ScenarioRunViewsBenchmarkRunsCursorIDPage, ScenariosAPI.ScenarioRunView>;
  listScenarioRuns(
    id: string,
    query: RunListScenarioRunsParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<ScenarioRunViewsBenchmarkRunsCursorIDPage, ScenariosAPI.ScenarioRunView> {
    if (isRequestOptions(query)) {
      return this.listScenarioRuns(id, {}, query);
    }
    return this._client.getAPIList(
      `/v1/benchmarks/runs/${id}/scenario_runs`,
      ScenarioRunViewsBenchmarkRunsCursorIDPage,
      { query, ...options },
    );
  }
}

export interface RunListParams extends BenchmarkRunsCursorIDPageParams {
  /**
   * The Benchmark ID to filter by.
   */
  benchmark_id?: string;
}

export interface RunListScenarioRunsParams extends BenchmarkRunsCursorIDPageParams {}

export declare namespace Runs {
  export { type RunListParams as RunListParams, type RunListScenarioRunsParams as RunListScenarioRunsParams };
}

export { BenchmarkRunViewsBenchmarkRunsCursorIDPage, ScenarioRunViewsBenchmarkRunsCursorIDPage };
