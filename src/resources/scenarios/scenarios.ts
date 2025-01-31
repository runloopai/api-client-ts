// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as RunsAPI from './runs';
import { RunListParams, Runs } from './runs';

export class Scenarios extends APIResource {
  runs: RunsAPI.Runs = new RunsAPI.Runs(this._client);

  /**
   * Create a Scenario, a repeatable AI coding evaluation test that defines the
   * starting environment as well as evaluation success criteria.
   */
  create(body: ScenarioCreateParams, options?: Core.RequestOptions): Core.APIPromise<ScenarioView> {
    return this._client.post('/v1/scenarios', { body, ...options });
  }

  /**
   * Get a previously created scenario.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<ScenarioView> {
    return this._client.get(`/v1/scenarios/${id}`, options);
  }

  /**
   * List all Scenarios matching filter.
   */
  list(query?: ScenarioListParams, options?: Core.RequestOptions): Core.APIPromise<ScenarioListView>;
  list(options?: Core.RequestOptions): Core.APIPromise<ScenarioListView>;
  list(
    query: ScenarioListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<ScenarioListView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.get('/v1/scenarios', { query, ...options });
  }

  /**
   * Start a new ScenarioRun based on the provided Scenario.
   */
  startRun(body: ScenarioStartRunParams, options?: Core.RequestOptions): Core.APIPromise<ScenarioRunView> {
    return this._client.post('/v1/scenarios/start_run', { body, ...options });
  }
}

/**
 * InputContextView specifies the problem statement along with all additional
 * context for a Scenario.
 */
export interface InputContext {
  /**
   * The problem statement for the Scenario.
   */
  problem_statement: string;
}

export interface ScenarioCreateParameters {
  /**
   * The input context for the Scenario.
   */
  input_context: InputContext;

  /**
   * Name of the scenario.
   */
  name: string;

  /**
   * The scoring contract for the Scenario.
   */
  scoring_contract: ScoringContract;

  /**
   * The Environment in which the Scenario will run.
   */
  environment_parameters?: ScenarioEnvironment | null;
}

/**
 * ScenarioEnvironmentParameters specify the environment in which a Scenario will
 * be run.
 */
export interface ScenarioEnvironment {
  /**
   * Use the blueprint with matching ID.
   */
  blueprint_id?: string | null;

  /**
   * Use the prebuilt with matching ID.
   */
  prebuilt_id?: string | null;

  /**
   * Use the snapshot with matching ID.
   */
  snapshot_id?: string | null;
}

export interface ScenarioListView {
  has_more: boolean;

  /**
   * List of Scenarios matching filter.
   */
  scenarios: Array<ScenarioView>;

  total_count: number;
}

export interface ScenarioRunListView {
  has_more: boolean;

  /**
   * List of ScenarioRuns matching filter.
   */
  runs: Array<ScenarioRunView>;

  total_count: number;
}

/**
 * A ScenarioRunView represents a single run of a Scenario on a Devbox. When
 * completed, the ScenarioRun will contain the final score and output of the run.
 */
export interface ScenarioRunView {
  /**
   * ID of the ScenarioRun.
   */
  id: string;

  /**
   * ID of the Devbox on which the Scenario is running.
   */
  devbox_id: string;

  /**
   * ID of the Scenario that has been run.
   */
  scenario_id: string;

  /**
   * The state of the ScenarioRun.
   */
  state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed';

  /**
   * ID of the BenchmarkRun that this Scenario is associated with, if any.
   */
  benchmark_run_id?: string | null;

  /**
   * Duration scenario took to run.
   */
  duration_ms?: number | null;

  /**
   * Optional name of ScenarioRun.
   */
  name?: string | null;

  /**
   * The input context for the Scenario.
   */
  scoring_contract_result?: ScoringContractResultView | null;

  /**
   * The time that the scenario started
   */
  start_time_ms?: number | null;
}

/**
 * A ScenarioView represents a repeatable AI coding evaluation test, complete with
 * initial environment and scoring contract.
 */
export interface ScenarioView {
  /**
   * The ID of the Scenario.
   */
  id: string;

  /**
   * The input context for the Scenario.
   */
  input_context: InputContext;

  /**
   * The name of the Scenario.
   */
  name: string;

  /**
   * The scoring contract for the Scenario.
   */
  scoring_contract: ScoringContract;

  /**
   * The Environment in which the Scenario is run.
   */
  environment?: ScenarioEnvironment | null;
}

/**
 * InputContextView specifies the problem statement along with all additional
 * context for a Scenario.
 */
export interface ScoringContract {
  /**
   * A list of scoring functions used to evaluate the Scenario.
   */
  scoring_function_parameters: Array<ScoringFunction>;
}

/**
 * A ScoringContractResultView represents the result of running all scoring
 * functions on a given input context.
 */
export interface ScoringContractResultView {
  /**
   * Total score for all scoring contracts. This will be a value between 0 and 1.
   */
  score: number;

  /**
   * List of all individual scoring function results.
   */
  scoring_function_results: Array<ScoringFunctionResultView>;
}

/**
 * ScoringFunctionParameters specifies a method of scoring a Scenario.
 */
export interface ScoringFunction {
  /**
   * Name of scoring function.
   */
  name: string;

  /**
   * Wight to apply to scoring function score. Weights of all scoring functions
   * should sum to 1.0.
   */
  weight: number;

  /**
   * A single bash script that sets up the environment, scores, and prints the final
   * score to standard out. Score should be an integer between 0 and 100, and look
   * like "score=[0..100].
   */
  bash_script?: string | null;
}

/**
 * A ScoringFunctionResultView represents the result of running a single scoring
 * function on a given input context.
 */
export interface ScoringFunctionResultView {
  /**
   * Log output of the scoring function.
   */
  output: string;

  /**
   * Final score for the given scoring function.
   */
  score: number;

  /**
   * Scoring function name that ran.
   */
  scoring_function_name: string;
}

export interface StartScenarioRunParameters {
  /**
   * ID of the Scenario to run.
   */
  scenario_id: string;

  /**
   * Benchmark to associate the run.
   */
  benchmark_run_id?: string | null;

  /**
   * Display name of the run.
   */
  run_name?: string | null;
}

export interface ScenarioCreateParams {
  /**
   * The input context for the Scenario.
   */
  input_context: InputContext;

  /**
   * Name of the scenario.
   */
  name: string;

  /**
   * The scoring contract for the Scenario.
   */
  scoring_contract: ScoringContract;

  /**
   * The Environment in which the Scenario will run.
   */
  environment_parameters?: ScenarioEnvironment | null;
}

export interface ScenarioListParams {
  /**
   * The limit of items to return. Default is 20.
   */
  limit?: number;

  /**
   * Load the next page of data starting after the item with the given ID.
   */
  starting_after?: string;
}

export interface ScenarioStartRunParams {
  /**
   * ID of the Scenario to run.
   */
  scenario_id: string;

  /**
   * Benchmark to associate the run.
   */
  benchmark_run_id?: string | null;

  /**
   * Display name of the run.
   */
  run_name?: string | null;
}

Scenarios.Runs = Runs;

export declare namespace Scenarios {
  export {
    type InputContext as InputContext,
    type ScenarioCreateParameters as ScenarioCreateParameters,
    type ScenarioEnvironment as ScenarioEnvironment,
    type ScenarioListView as ScenarioListView,
    type ScenarioRunListView as ScenarioRunListView,
    type ScenarioRunView as ScenarioRunView,
    type ScenarioView as ScenarioView,
    type ScoringContract as ScoringContract,
    type ScoringContractResultView as ScoringContractResultView,
    type ScoringFunction as ScoringFunction,
    type ScoringFunctionResultView as ScoringFunctionResultView,
    type StartScenarioRunParameters as StartScenarioRunParameters,
    type ScenarioCreateParams as ScenarioCreateParams,
    type ScenarioListParams as ScenarioListParams,
    type ScenarioStartRunParams as ScenarioStartRunParams,
  };

  export { Runs as Runs, type RunListParams as RunListParams };
}
