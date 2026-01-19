// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as Shared from '../shared';
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
   * Update a Benchmark. Fields that are null will preserve the existing value.
   * Fields that are provided (including empty values) will replace the existing
   * value entirely.
   */
  update(
    id: string,
    body?: BenchmarkUpdateParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<BenchmarkView>;
  update(id: string, options?: Core.RequestOptions): Core.APIPromise<BenchmarkView>;
  update(
    id: string,
    body: BenchmarkUpdateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<BenchmarkView> {
    if (isRequestOptions(body)) {
      return this.update(id, {}, body);
    }
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

  /**
   * Add and/or remove Scenario IDs from an existing Benchmark.
   */
  updateScenarios(
    id: string,
    body?: BenchmarkUpdateScenariosParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<BenchmarkView>;
  updateScenarios(id: string, options?: Core.RequestOptions): Core.APIPromise<BenchmarkView>;
  updateScenarios(
    id: string,
    body: BenchmarkUpdateScenariosParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<BenchmarkView> {
    if (isRequestOptions(body)) {
      return this.updateScenarios(id, {}, body);
    }
    return this._client.post(`/v1/benchmarks/${id}/scenarios`, { body, ...options });
  }
}

export class BenchmarkViewsBenchmarksCursorIDPage extends BenchmarksCursorIDPage<BenchmarkView> {}

export class BenchmarkRunViewsBenchmarkRunsCursorIDPage extends BenchmarkRunsCursorIDPage<BenchmarkRunView> {}

/**
 * BenchmarkCreateParameters contain the set of parameters to create a Benchmark.
 */
export interface BenchmarkCreateParameters {
  /**
   * The unique name of the Benchmark.
   */
  name: string;

  /**
   * Attribution information for the benchmark.
   */
  attribution?: string | null;

  /**
   * Detailed description of the benchmark.
   */
  description?: string | null;

  /**
   * User defined metadata to attach to the benchmark.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * Environment variables required to run the benchmark. If any required variables
   * are not supplied, the benchmark will fail to start.
   */
  required_environment_variables?: Array<string> | null;

  /**
   * Secrets required to run the benchmark with (environment variable name will be
   * mapped to the your user secret by name). If any of these secrets are not
   * provided or the mapping is incorrect, the benchmark will fail to start.
   */
  required_secret_names?: Array<string>;

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

export interface BenchmarkScenarioUpdateParameters {
  /**
   * Scenario IDs to add to the Benchmark.
   */
  scenarios_to_add?: Array<string> | null;

  /**
   * Scenario IDs to remove from the Benchmark.
   */
  scenarios_to_remove?: Array<string> | null;
}

/**
 * BenchmarkUpdateParameters contain the set of parameters to update a Benchmark.
 * All fields are optional - null fields preserve existing values, provided fields
 * replace entirely.
 */
export interface BenchmarkUpdateParameters {
  /**
   * Attribution information for the benchmark. Pass in empty string to clear.
   */
  attribution?: string | null;

  /**
   * Detailed description of the benchmark. Pass in empty string to clear.
   */
  description?: string | null;

  /**
   * User defined metadata to attach to the benchmark. Pass in empty map to clear.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * The unique name of the Benchmark. Cannot be blank.
   */
  name?: string | null;

  /**
   * Environment variables required to run the benchmark. If any required variables
   * are not supplied, the benchmark will fail to start. Pass in empty list to clear.
   */
  required_environment_variables?: Array<string> | null;

  /**
   * Secrets required to run the benchmark with (environment variable name will be
   * mapped to the your user secret by name). If any of these secrets are not
   * provided or the mapping is incorrect, the benchmark will fail to start. Pass in
   * empty list to clear.
   */
  required_secret_names?: Array<string> | null;

  /**
   * The Scenario IDs that make up the Benchmark. Pass in empty list to clear.
   */
  scenario_ids?: Array<string> | null;
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
  metadata: { [key: string]: string };

  /**
   * The name of the Benchmark.
   */
  name: string;

  /**
   * List of Scenario IDs that make up the benchmark.
   */
  scenarioIds: Array<string>;

  /**
   * Attribution information for the benchmark.
   */
  attribution?: string;

  /**
   * Detailed description of the benchmark.
   */
  description?: string;

  /**
   * Whether this benchmark is public.
   */
  is_public?: boolean;

  /**
   * Required environment variables used to run the benchmark. If any required
   * environment variables are missing, the benchmark will fail to start.
   */
  required_environment_variables?: Array<string>;

  /**
   * Required secrets used to run the benchmark. If any required secrets are missing,
   * the benchmark will fail to start.
   */
  required_secret_names?: Array<string>;
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
  metadata?: { [key: string]: string } | null;

  /**
   * Display name of the run.
   */
  run_name?: string | null;

  /**
   * Runtime configuration to use for this benchmark run
   */
  runProfile?: Shared.RunProfile | null;
}

export interface BenchmarkCreateParams {
  /**
   * The unique name of the Benchmark.
   */
  name: string;

  /**
   * Attribution information for the benchmark.
   */
  attribution?: string | null;

  /**
   * Detailed description of the benchmark.
   */
  description?: string | null;

  /**
   * User defined metadata to attach to the benchmark.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * Environment variables required to run the benchmark. If any required variables
   * are not supplied, the benchmark will fail to start.
   */
  required_environment_variables?: Array<string> | null;

  /**
   * Secrets required to run the benchmark with (environment variable name will be
   * mapped to the your user secret by name). If any of these secrets are not
   * provided or the mapping is incorrect, the benchmark will fail to start.
   */
  required_secret_names?: Array<string>;

  /**
   * The Scenario IDs that make up the Benchmark.
   */
  scenario_ids?: Array<string> | null;
}

export interface BenchmarkUpdateParams {
  /**
   * Attribution information for the benchmark. Pass in empty string to clear.
   */
  attribution?: string | null;

  /**
   * Detailed description of the benchmark. Pass in empty string to clear.
   */
  description?: string | null;

  /**
   * User defined metadata to attach to the benchmark. Pass in empty map to clear.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * The unique name of the Benchmark. Cannot be blank.
   */
  name?: string | null;

  /**
   * Environment variables required to run the benchmark. If any required variables
   * are not supplied, the benchmark will fail to start. Pass in empty list to clear.
   */
  required_environment_variables?: Array<string> | null;

  /**
   * Secrets required to run the benchmark with (environment variable name will be
   * mapped to the your user secret by name). If any of these secrets are not
   * provided or the mapping is incorrect, the benchmark will fail to start. Pass in
   * empty list to clear.
   */
  required_secret_names?: Array<string> | null;

  /**
   * The Scenario IDs that make up the Benchmark. Pass in empty list to clear.
   */
  scenario_ids?: Array<string> | null;
}

export interface BenchmarkListParams extends BenchmarksCursorIDPageParams {
  /**
   * Filter by name
   */
  name?: string;
}

export interface BenchmarkDefinitionsParams {
  /**
   * The limit of items to return. Default is 20. Max is 5000.
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
  metadata?: { [key: string]: string } | null;

  /**
   * Display name of the run.
   */
  run_name?: string | null;

  /**
   * Runtime configuration to use for this benchmark run
   */
  runProfile?: Shared.RunProfile | null;
}

export interface BenchmarkUpdateScenariosParams {
  /**
   * Scenario IDs to add to the Benchmark.
   */
  scenarios_to_add?: Array<string> | null;

  /**
   * Scenario IDs to remove from the Benchmark.
   */
  scenarios_to_remove?: Array<string> | null;
}

Benchmarks.BenchmarkViewsBenchmarksCursorIDPage = BenchmarkViewsBenchmarksCursorIDPage;
Benchmarks.Runs = Runs;

export declare namespace Benchmarks {
  export {
    type BenchmarkCreateParameters as BenchmarkCreateParameters,
    type BenchmarkRunListView as BenchmarkRunListView,
    type BenchmarkRunView as BenchmarkRunView,
    type BenchmarkScenarioUpdateParameters as BenchmarkScenarioUpdateParameters,
    type BenchmarkUpdateParameters as BenchmarkUpdateParameters,
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
    type BenchmarkUpdateScenariosParams as BenchmarkUpdateScenariosParams,
  };

  export {
    Runs as Runs,
    type RunListParams as RunListParams,
    type RunListScenarioRunsParams as RunListScenarioRunsParams,
  };
}
