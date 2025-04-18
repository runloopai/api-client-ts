// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as RunsAPI from './runs';
import { RunListParams, Runs } from './runs';
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
  create(
    body: BenchmarkCreateParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<BenchmarkCreateResponse> {
    return this._client.post('/v1/benchmarks', { body, ...options });
  }

  /**
   * Get a previously created Benchmark.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<BenchmarkRetrieveResponse> {
    return this._client.get(`/v1/benchmarks/${id}`, options);
  }

  /**
   * List all Benchmarks matching filter.
   */
  list(
    query?: BenchmarkListParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<BenchmarkListResponsesBenchmarksCursorIDPage, BenchmarkListResponse>;
  list(
    options?: Core.RequestOptions,
  ): Core.PagePromise<BenchmarkListResponsesBenchmarksCursorIDPage, BenchmarkListResponse>;
  list(
    query: BenchmarkListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<BenchmarkListResponsesBenchmarksCursorIDPage, BenchmarkListResponse> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList('/v1/benchmarks', BenchmarkListResponsesBenchmarksCursorIDPage, {
      query,
      ...options,
    });
  }

  /**
   * List all public benchmarks matching filter.
   */
  listPublic(
    query?: BenchmarkListPublicParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<BenchmarkListPublicResponsesBenchmarksCursorIDPage, BenchmarkListPublicResponse>;
  listPublic(
    options?: Core.RequestOptions,
  ): Core.PagePromise<BenchmarkListPublicResponsesBenchmarksCursorIDPage, BenchmarkListPublicResponse>;
  listPublic(
    query: BenchmarkListPublicParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<BenchmarkListPublicResponsesBenchmarksCursorIDPage, BenchmarkListPublicResponse> {
    if (isRequestOptions(query)) {
      return this.listPublic({}, query);
    }
    return this._client.getAPIList(
      '/v1/benchmarks/list_public',
      BenchmarkListPublicResponsesBenchmarksCursorIDPage,
      { query, ...options },
    );
  }

  /**
   * Start a new BenchmarkRun based on the provided Benchmark.
   */
  startRun(body: BenchmarkStartRunParams, options?: Core.RequestOptions): Core.APIPromise<BenchmarkRunView> {
    return this._client.post('/v1/benchmarks/start_run', { body, ...options });
  }
}

export class BenchmarkListResponsesBenchmarksCursorIDPage extends BenchmarksCursorIDPage<BenchmarkListResponse> {}

export class BenchmarkListPublicResponsesBenchmarksCursorIDPage extends BenchmarksCursorIDPage<BenchmarkListPublicResponse> {}

export class BenchmarkRunViewsBenchmarkRunsCursorIDPage extends BenchmarkRunsCursorIDPage<BenchmarkRunView> {}

/**
 * BenchmarkCreateParameters contain the set of paramters to create a Benchmark.
 */
export interface BenchmarkCreateParameters {
  /**
   * Whether this benchmark is public.
   */
  is_public: boolean;

  /**
   * The name of the Benchmark.
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
   * List of Scenarios that need to be completed before benchmark can be completed.
   */
  pending_scenarios: Array<string>;

  /**
   * List of Scenarios have been completed.
   */
  scenario_runs: Array<BenchmarkRunView.ScenarioRun>;

  /**
   * The time the benchmark run execution started (Unix timestamp milliseconds).
   */
  start_time_ms: number;

  /**
   * The state of the BenchmarkRun.
   */
  state: 'running' | 'completed';

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

export namespace BenchmarkRunView {
  /**
   * A BenchmarkRunScenariosListView represents a run of a complete set of Scenarios
   * run, organized under a Benchmark.
   */
  export interface ScenarioRun {
    /**
     * ID of the Scenario that has been run.
     */
    scenario_id: string;

    /**
     * The scoring result of the ScenarioRun.
     */
    scoringResult: ScenariosAPI.ScoringContractResultView;

    /**
     * ID of the scenario run.
     */
    scenarioRunId?: string;
  }
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

/**
 * A BenchmarkView represents a grouped set of Scenarios that together form a
 * Benchmark.
 */
export interface BenchmarkCreateResponse {
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

/**
 * A BenchmarkView represents a grouped set of Scenarios that together form a
 * Benchmark.
 */
export interface BenchmarkRetrieveResponse {
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

/**
 * A BenchmarkView represents a grouped set of Scenarios that together form a
 * Benchmark.
 */
export interface BenchmarkListResponse {
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

/**
 * A BenchmarkView represents a grouped set of Scenarios that together form a
 * Benchmark.
 */
export interface BenchmarkListPublicResponse {
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

export interface BenchmarkCreateParams {
  /**
   * Whether this benchmark is public.
   */
  is_public: boolean;

  /**
   * The name of the Benchmark.
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

Benchmarks.BenchmarkListResponsesBenchmarksCursorIDPage = BenchmarkListResponsesBenchmarksCursorIDPage;
Benchmarks.BenchmarkListPublicResponsesBenchmarksCursorIDPage =
  BenchmarkListPublicResponsesBenchmarksCursorIDPage;
Benchmarks.Runs = Runs;

export declare namespace Benchmarks {
  export {
    type BenchmarkCreateParameters as BenchmarkCreateParameters,
    type BenchmarkRunListView as BenchmarkRunListView,
    type BenchmarkRunView as BenchmarkRunView,
    type StartBenchmarkRunParameters as StartBenchmarkRunParameters,
    type BenchmarkCreateResponse as BenchmarkCreateResponse,
    type BenchmarkRetrieveResponse as BenchmarkRetrieveResponse,
    type BenchmarkListResponse as BenchmarkListResponse,
    type BenchmarkListPublicResponse as BenchmarkListPublicResponse,
    BenchmarkListResponsesBenchmarksCursorIDPage as BenchmarkListResponsesBenchmarksCursorIDPage,
    BenchmarkListPublicResponsesBenchmarksCursorIDPage as BenchmarkListPublicResponsesBenchmarksCursorIDPage,
    type BenchmarkCreateParams as BenchmarkCreateParams,
    type BenchmarkListParams as BenchmarkListParams,
    type BenchmarkListPublicParams as BenchmarkListPublicParams,
    type BenchmarkStartRunParams as BenchmarkStartRunParams,
  };

  export { Runs as Runs, type RunListParams as RunListParams };
}
