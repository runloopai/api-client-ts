// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as RunsAPI from './runs';
import { RunListParams, Runs } from './runs';

export class Benchmarks extends APIResource {
  runs: RunsAPI.Runs = new RunsAPI.Runs(this._client);

  /**
   * Create a Benchmark with a set of Scenarios.
   */
  create(body: BenchmarkCreateParams, options?: Core.RequestOptions): Core.APIPromise<BenchmarkView> {
    return this._client.post('/v1/benchmarks', { body, ...options });
  }

  /**
   * Get a previously created Benchmark.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<BenchmarkView> {
    return this._client.get(`/v1/benchmarks/${id}`, options);
  }

  /**
   * List all Benchmarks matching filter.
   */
  list(query?: BenchmarkListParams, options?: Core.RequestOptions): Core.APIPromise<BenchmarkListView>;
  list(options?: Core.RequestOptions): Core.APIPromise<BenchmarkListView>;
  list(
    query: BenchmarkListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<BenchmarkListView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.get('/v1/benchmarks', { query, ...options });
  }

  /**
   * Start a new BenchmarkRun based on the provided Benchmark.
   */
  startRun(body: BenchmarkStartRunParams, options?: Core.RequestOptions): Core.APIPromise<BenchmarkRunView> {
    return this._client.post('/v1/benchmarks/start_run', { body, ...options });
  }
}

/**
 * BenchmarkCreateParameters contain the set of paramters to create a Benchmark.
 */
export interface BenchmarkCreateParameters {
  /**
   * The name of the Benchmark.
   */
  name: string;

  /**
   * The Scenario IDs that make up the Benchmark.
   */
  scenario_ids?: Array<string> | null;
}

export interface BenchmarkListView {
  /**
   * List of Benchmarks matching filter.
   */
  benchmarks: Array<BenchmarkView>;

  has_more: boolean;

  total_count: number;
}

export interface BenchmarkRunListView {
  has_more: boolean;

  /**
   * List of BenchmarkRuns matching filter.
   */
  runs: Array<BenchmarkRunView>;

  total_count: number;
}

/**
 * A BenchmarkRunView represents a run of a complete set of Scenarios, organized
 * under a Benchmark.
 */
export interface BenchmarkRunView {
  /**
   * The ID of the BenchmarkRun.
   */
  id: string;

  /**
   * The ID of the Benchmark.
   */
  benchmark_id: string;

  /**
   * The state of the BenchmarkRun.
   */
  state: 'running' | 'completed';

  /**
   * The name of the BenchmarkRun.
   */
  name?: string | null;
}

/**
 * A BenchmarkView represents a grouped set of Scenarios that together form a
 * Benchmark.
 */
export interface BenchmarkView {
  /**
   * The ID of the Benchmark.
   */
  id: string;

  /**
   * The name of the Benchmark.
   */
  name: string;

  /**
   * List of Scenario IDs that make up the benchmark.
   */
  scenarioIds: Array<string>;
}

export interface StartBenchmarkRunParameters {
  /**
   * ID of the Benchmark to run.
   */
  benchmark_id: string;

  /**
   * Display name of the run.
   */
  run_name?: string | null;
}

export interface BenchmarkCreateParams {
  /**
   * The name of the Benchmark.
   */
  name: string;

  /**
   * The Scenario IDs that make up the Benchmark.
   */
  scenario_ids?: Array<string> | null;
}

export interface BenchmarkListParams {
  /**
   * The limit of items to return. Default is 20.
   */
  limit?: number;

  /**
   * Load the next page of data starting after the item with the given ID.
   */
  starting_after?: string;
}

export interface BenchmarkStartRunParams {
  /**
   * ID of the Benchmark to run.
   */
  benchmark_id: string;

  /**
   * Display name of the run.
   */
  run_name?: string | null;
}

Benchmarks.Runs = Runs;

export declare namespace Benchmarks {
  export {
    type BenchmarkCreateParameters as BenchmarkCreateParameters,
    type BenchmarkListView as BenchmarkListView,
    type BenchmarkRunListView as BenchmarkRunListView,
    type BenchmarkRunView as BenchmarkRunView,
    type BenchmarkView as BenchmarkView,
    type StartBenchmarkRunParameters as StartBenchmarkRunParameters,
    type BenchmarkCreateParams as BenchmarkCreateParams,
    type BenchmarkListParams as BenchmarkListParams,
    type BenchmarkStartRunParams as BenchmarkStartRunParams,
  };

  export { Runs as Runs, type RunListParams as RunListParams };
}
