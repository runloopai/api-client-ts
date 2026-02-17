// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';
import * as ScenariosAPI from './scenarios/scenarios';
import { ScenarioRunViewsBenchmarkRunsCursorIDPage } from './scenarios/scenarios';
import { BenchmarkRunsCursorIDPage, type BenchmarkRunsCursorIDPageParams } from '../pagination';

export class BenchmarkRuns extends APIResource {
  /**
   * Get a BenchmarkRun given ID.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<BenchmarkRunView> {
    return this._client.get(`/v1/benchmark_runs/${id}`, options);
  }

  /**
   * List all BenchmarkRuns matching filter.
   */
  list(
    query?: BenchmarkRunListParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<BenchmarkRunViewsBenchmarkRunsCursorIDPage, BenchmarkRunView>;
  list(
    options?: Core.RequestOptions,
  ): Core.PagePromise<BenchmarkRunViewsBenchmarkRunsCursorIDPage, BenchmarkRunView>;
  list(
    query: BenchmarkRunListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<BenchmarkRunViewsBenchmarkRunsCursorIDPage, BenchmarkRunView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList('/v1/benchmark_runs', BenchmarkRunViewsBenchmarkRunsCursorIDPage, {
      query,
      ...options,
    });
  }

  /**
   * Cancel a currently running Benchmark run.
   */
  cancel(id: string, options?: Core.RequestOptions): Core.APIPromise<BenchmarkRunView> {
    return this._client.post(`/v1/benchmark_runs/${id}/cancel`, options);
  }

  /**
   * Complete a currently running BenchmarkRun.
   */
  complete(id: string, options?: Core.RequestOptions): Core.APIPromise<BenchmarkRunView> {
    return this._client.post(`/v1/benchmark_runs/${id}/complete`, options);
  }

  /**
   * List started scenario runs for a benchmark run.
   */
  listScenarioRuns(
    id: string,
    query?: BenchmarkRunListScenarioRunsParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<ScenarioRunViewsBenchmarkRunsCursorIDPage, ScenariosAPI.ScenarioRunView>;
  listScenarioRuns(
    id: string,
    options?: Core.RequestOptions,
  ): Core.PagePromise<ScenarioRunViewsBenchmarkRunsCursorIDPage, ScenariosAPI.ScenarioRunView>;
  listScenarioRuns(
    id: string,
    query: BenchmarkRunListScenarioRunsParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<ScenarioRunViewsBenchmarkRunsCursorIDPage, ScenariosAPI.ScenarioRunView> {
    if (isRequestOptions(query)) {
      return this.listScenarioRuns(id, {}, query);
    }
    return this._client.getAPIList(
      `/v1/benchmark_runs/${id}/scenario_runs`,
      ScenarioRunViewsBenchmarkRunsCursorIDPage,
      { query, ...options },
    );
  }
}

export class BenchmarkRunViewsBenchmarkRunsCursorIDPage extends BenchmarkRunsCursorIDPage<BenchmarkRunView> {}

export interface BenchmarkRunListView {
  has_more: boolean;

  remaining_count: number | null;

  /**
   * List of BenchmarkRuns matching filter.
   */
  runs: Array<BenchmarkRunView>;

  total_count: number | null;
}

/**
 * A BenchmarkRunView represents a run of a complete set of Scenarios, organized
 * under a Benchmark or created by a BenchmarkJob.
 */
export interface BenchmarkRunView {
  /**
   * The ID of the BenchmarkRun.
   */
  id: string;

  /**
   * User defined metadata to attach to the benchmark run for organization.
   */
  metadata: { [key: string]: string };

  /**
   * The time the benchmark run execution started (Unix timestamp milliseconds).
   */
  start_time_ms: number;

  /**
   * The state of the BenchmarkRun.
   */
  state: 'running' | 'canceled' | 'completed';

  /**
   * The ID of the Benchmark definition. Present if run was created from a benchmark
   * definition.
   */
  benchmark_id?: string | null;

  /**
   * The duration for the BenchmarkRun to complete.
   */
  duration_ms?: number | null;

  /**
   * Environment variables used to run the benchmark.
   */
  environment_variables?: { [key: string]: string } | null;

  /**
   * The name of the BenchmarkRun.
   */
  name?: string | null;

  /**
   * Purpose of the run.
   */
  purpose?: string | null;

  /**
   * The final score across the BenchmarkRun, present once completed. Calculated as
   * sum of scenario scores / number of scenario runs.
   */
  score?: number | null;

  /**
   * User secrets used to run the benchmark. Example: {"DB_PASS":
   * "DATABASE_PASSWORD"} would set the environment variable 'DB_PASS' on all
   * scenario devboxes to the value of the secret 'DATABASE_PASSWORD'.
   */
  secrets_provided?: { [key: string]: string } | null;
}

export interface BenchmarkRunListParams extends BenchmarkRunsCursorIDPageParams {
  /**
   * The Benchmark ID to filter by.
   */
  benchmark_id?: string;

  /**
   * Filter by name
   */
  name?: string;
}

export interface BenchmarkRunListScenarioRunsParams extends BenchmarkRunsCursorIDPageParams {
  /**
   * Filter by Scenario Run state
   */
  state?: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed';
}

BenchmarkRuns.BenchmarkRunViewsBenchmarkRunsCursorIDPage = BenchmarkRunViewsBenchmarkRunsCursorIDPage;

export declare namespace BenchmarkRuns {
  export {
    type BenchmarkRunListView as BenchmarkRunListView,
    type BenchmarkRunView as BenchmarkRunView,
    BenchmarkRunViewsBenchmarkRunsCursorIDPage as BenchmarkRunViewsBenchmarkRunsCursorIDPage,
    type BenchmarkRunListParams as BenchmarkRunListParams,
    type BenchmarkRunListScenarioRunsParams as BenchmarkRunListScenarioRunsParams,
  };
}

export { ScenarioRunViewsBenchmarkRunsCursorIDPage };
