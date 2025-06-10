// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as RunsAPI from './runs';
import { RunListParams, RunListScenarioRunsParams, Runs } from './runs';
import * as ScenariosAPI from '../scenarios/scenarios';
import {
  BenchmarkRunsCursorIDPage,
  BenchmarksCursorIDPage,
  type BenchmarksCursorIDPageParams,
} from '../../pagination';

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
   * Update a Benchmark with a set of Scenarios.
   */
  update(
    id: string,
    body: BenchmarkUpdateParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<BenchmarkView> {
    return this._client.post(`/v1/benchmarks/${id}`, { body, ...options });
  }

  /**
   * List all Benchmarks matching filter.
   */
  list(
    query?: BenchmarkListParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<BenchmarkViewsBenchmarksCursorIDPage, BenchmarkView>;
  list(options?: Core.RequestOptions): Core.PagePromise<BenchmarkViewsBenchmarksCursorIDPage, BenchmarkView>;
  list(
    query: BenchmarkListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<BenchmarkViewsBenchmarksCursorIDPage, BenchmarkView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList('/v1/benchmarks', BenchmarkViewsBenchmarksCursorIDPage, {
      query,
      ...options,
    });
  }

  /**
   * Get scenario definitions for a previously created Benchmark.
   */
  definitions(
    id: string,
    query?: BenchmarkDefinitionsParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<ScenarioDefinitionListView>;
  definitions(id: string, options?: Core.RequestOptions): Core.APIPromise<ScenarioDefinitionListView>;
  definitions(
    id: string,
    query: BenchmarkDefinitionsParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<ScenarioDefinitionListView> {
    if (isRequestOptions(query)) {
      return this.definitions(id, {}, query);
    }
    return this._client.get(`/v1/benchmarks/${id}/definitions`, { query, ...options });
  }

  /**
   * List all public benchmarks matching filter.
   */
  listPublic(
    query?: BenchmarkListPublicParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<BenchmarkViewsBenchmarksCursorIDPage, BenchmarkView>;
  listPublic(
    options?: Core.RequestOptions,
  ): Core.PagePromise<BenchmarkViewsBenchmarksCursorIDPage, BenchmarkView>;
  listPublic(
    query: BenchmarkListPublicParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<BenchmarkViewsBenchmarksCursorIDPage, BenchmarkView> {
    if (isRequestOptions(query)) {
      return this.listPublic({}, query);
    }
    return this._client.getAPIList('/v1/benchmarks/list_public', BenchmarkViewsBenchmarksCursorIDPage, {
      query,
      ...options,
    });
  }

  /**
   * Start a new BenchmarkRun based on the provided Benchmark.
   */
  startRun(body: BenchmarkStartRunParams, options?: Core.RequestOptions): Core.APIPromise<BenchmarkRunView> {
    return this._client.post('/v1/benchmarks/start_run', { body, ...options });
  }
}

export class BenchmarkViewsBenchmarksCursorIDPage extends BenchmarksCursorIDPage<BenchmarkView> {}

export class BenchmarkRunViewsBenchmarkRunsCursorIDPage extends BenchmarkRunsCursorIDPage<BenchmarkRunView> {}

/**
 * BenchmarkCreateParameters contain the set of parameters to create a Benchmark.
 */
export interface BenchmarkCreateParameters {
  /**
   * The name of the Benchmark. This must be unique.
   */
  name: string;

  /**
   * User defined metadata to attach to the benchmark for organization.
   */
  metadata?: Record<string, string> | null;

  /**
   * The Scenario IDs that make up the Benchmark.
   */
  scenario_ids?: Array<string> | null;
}

export interface BenchmarkRunListView {
  has_more: boolean;

  remaining_count: number;

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
   * User defined metadata to attach to the benchmark run for organization.
   */
  metadata: Record<string, string>;

  /**
   * The time the benchmark run execution started (Unix timestamp milliseconds).
   */
  start_time_ms: number;

  /**
   * The state of the BenchmarkRun.
   */
  state: 'running' | 'canceled' | 'completed';

  /**
   * The duration for the BenchmarkRun to complete.
   */
  duration_ms?: number | null;

  /**
   * The name of the BenchmarkRun.
   */
  name?: string | null;

  /**
   * The final score across the BenchmarkRun, present once completed. Calculated as
   * sum of scenario scores / number of scenario runs.
   */
  score?: number | null;
}

/**
 * A BenchmarkDefinitionView represents a grouped set of Scenarios that together
 * form a Benchmark.
 */
export interface BenchmarkView {
  /**
   * The ID of the Benchmark.
   */
  id: string;

  /**
   * User defined metadata to attach to the benchmark for organization.
   */
  metadata: Record<string, string>;

  /**
   * The name of the Benchmark.
   */
  name: string;

  /**
   * List of Scenario IDs that make up the benchmark.
   */
  scenarioIds: Array<string>;

  /**
   * Whether this benchmark is public.
   */
  is_public?: boolean;
}

export interface ScenarioDefinitionListView {
  has_more: boolean;

  remaining_count: number;

  /**
   * List of Scenarios matching filter.
   */
  scenarios: Array<ScenariosAPI.ScenarioView>;

  total_count: number;
}

export interface StartBenchmarkRunParameters {
  /**
   * ID of the Benchmark to run.
   */
  benchmark_id: string;

  /**
   * User defined metadata to attach to the benchmark run for organization.
   */
  metadata?: Record<string, string> | null;

  /**
   * Display name of the run.
   */
  run_name?: string | null;
}

export interface BenchmarkCreateParams {
  /**
   * The name of the Benchmark. This must be unique.
   */
  name: string;

  /**
   * User defined metadata to attach to the benchmark for organization.
   */
  metadata?: Record<string, string> | null;

  /**
   * The Scenario IDs that make up the Benchmark.
   */
  scenario_ids?: Array<string> | null;
}

export interface BenchmarkUpdateParams {
  /**
   * The name of the Benchmark. This must be unique.
   */
  name: string;

  /**
   * User defined metadata to attach to the benchmark for organization.
   */
  metadata?: Record<string, string> | null;

  /**
   * The Scenario IDs that make up the Benchmark.
   */
  scenario_ids?: Array<string> | null;
}

export interface BenchmarkListParams extends BenchmarksCursorIDPageParams {}

export interface BenchmarkDefinitionsParams {
  /**
   * The limit of items to return. Default is 20.
   */
  limit?: number;

  /**
   * Load the next page of data starting after the item with the given ID.
   */
  starting_after?: string;
}

export interface BenchmarkListPublicParams extends BenchmarksCursorIDPageParams {}

export interface BenchmarkStartRunParams {
  /**
   * ID of the Benchmark to run.
   */
  benchmark_id: string;

  /**
   * User defined metadata to attach to the benchmark run for organization.
   */
  metadata?: Record<string, string> | null;

  /**
   * Display name of the run.
   */
  run_name?: string | null;
}

Benchmarks.BenchmarkViewsBenchmarksCursorIDPage = BenchmarkViewsBenchmarksCursorIDPage;
Benchmarks.Runs = Runs;

export declare namespace Benchmarks {
  export {
    type BenchmarkCreateParameters as BenchmarkCreateParameters,
    type BenchmarkRunListView as BenchmarkRunListView,
    type BenchmarkRunView as BenchmarkRunView,
    type BenchmarkView as BenchmarkView,
    type ScenarioDefinitionListView as ScenarioDefinitionListView,
    type StartBenchmarkRunParameters as StartBenchmarkRunParameters,
    BenchmarkViewsBenchmarksCursorIDPage as BenchmarkViewsBenchmarksCursorIDPage,
    type BenchmarkCreateParams as BenchmarkCreateParams,
    type BenchmarkUpdateParams as BenchmarkUpdateParams,
    type BenchmarkListParams as BenchmarkListParams,
    type BenchmarkDefinitionsParams as BenchmarkDefinitionsParams,
    type BenchmarkListPublicParams as BenchmarkListPublicParams,
    type BenchmarkStartRunParams as BenchmarkStartRunParams,
  };

  export {
    Runs as Runs,
    type RunListParams as RunListParams,
    type RunListScenarioRunsParams as RunListScenarioRunsParams,
  };
}
