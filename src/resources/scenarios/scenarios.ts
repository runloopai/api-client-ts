// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as Shared from '../shared';
import * as RunsAPI from './runs';
import { RunListParams, Runs } from './runs';
import * as ScorersAPI from './scorers';
import {
  ScorerCreateParams,
  ScorerCreateResponse,
  ScorerListParams,
  ScorerListResponse,
  ScorerListResponsesScenarioScorersCursorIDPage,
  ScorerRetrieveResponse,
  ScorerUpdateParams,
  ScorerUpdateResponse,
  Scorers,
} from './scorers';
import {
  BenchmarkRunsCursorIDPage,
  ScenariosCursorIDPage,
  type ScenariosCursorIDPageParams,
} from '../../pagination';
import { PollingOptions } from '@runloop/api-client/lib/polling';
import { DevboxView } from '../devboxes';

export class Scenarios extends APIResource {
  runs: RunsAPI.Runs = new RunsAPI.Runs(this._client);
  scorers: ScorersAPI.Scorers = new ScorersAPI.Scorers(this._client);

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
   * Update a Scenario. Fields that are null will preserve the existing value. Fields
   * that are provided (including empty values) will replace the existing value
   * entirely.
   */
  update(
    id: string,
    body?: ScenarioUpdateParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<ScenarioView>;
  update(id: string, options?: Core.RequestOptions): Core.APIPromise<ScenarioView>;
  update(
    id: string,
    body: ScenarioUpdateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<ScenarioView> {
    if (isRequestOptions(body)) {
      return this.update(id, {}, body);
    }
    return this._client.post(`/v1/scenarios/${id}`, { body, ...options });
  }

  /**
   * List all Scenarios matching filter.
   */
  list(
    query?: ScenarioListParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<ScenarioViewsScenariosCursorIDPage, ScenarioView>;
  list(options?: Core.RequestOptions): Core.PagePromise<ScenarioViewsScenariosCursorIDPage, ScenarioView>;
  list(
    query: ScenarioListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<ScenarioViewsScenariosCursorIDPage, ScenarioView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList('/v1/scenarios', ScenarioViewsScenariosCursorIDPage, {
      query,
      ...options,
    });
  }

  /**
   * Archive a previously created Scenario. The scenario will no longer appear in
   * list endpoints but can still be retrieved by ID.
   */
  archive(id: string, options?: Core.RequestOptions): Core.APIPromise<ScenarioView> {
    return this._client.post(`/v1/scenarios/${id}/archive`, options);
  }

  /**
   * List all public scenarios matching filter.
   */
  listPublic(
    query?: ScenarioListPublicParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<ScenarioViewsScenariosCursorIDPage, ScenarioView>;
  listPublic(
    options?: Core.RequestOptions,
  ): Core.PagePromise<ScenarioViewsScenariosCursorIDPage, ScenarioView>;
  listPublic(
    query: ScenarioListPublicParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<ScenarioViewsScenariosCursorIDPage, ScenarioView> {
    if (isRequestOptions(query)) {
      return this.listPublic({}, query);
    }
    return this._client.getAPIList('/v1/scenarios/list_public', ScenarioViewsScenariosCursorIDPage, {
      query,
      ...options,
    });
  }

  /**
   * Start a new ScenarioRun based on the provided Scenario.
   */
  startRun(body: ScenarioStartRunParams, options?: Core.RequestOptions): Core.APIPromise<ScenarioRunView> {
    return this._client.post('/v1/scenarios/start_run', { body, ...options });
  }

  /**
   * Start a new ScenarioRun and wait for its environment to be ready.
   * This is a convenience method that combines startRun() and awaitReady() on the devbox.
   */
  async startRunAndAwaitEnvReady(
    body: ScenarioStartRunParams,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<ScenarioRunView> {
    const run = await this.startRun(body, options);
    await this._client.devboxes.awaitRunning(run.devbox_id, options);
    return run;
  }
}

export class ScenarioViewsScenariosCursorIDPage extends ScenariosCursorIDPage<ScenarioView> {}

export class ScenarioRunViewsBenchmarkRunsCursorIDPage extends BenchmarkRunsCursorIDPage<ScenarioRunView> {}

/**
 * InputContextView specifies the problem statement along with all additional
 * context for a Scenario.
 */
export interface InputContext {
  /**
   * The problem statement for the Scenario.
   */
  problem_statement: string;

  /**
   * Additional JSON structured input context.
   */
  additional_context?: unknown | null;
}

export interface InputContextUpdate {
  /**
   * Additional JSON structured input context.
   */
  additional_context?: unknown | null;

  /**
   * The problem statement for the Scenario.
   */
  problem_statement?: string | null;
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

  /**
   * User defined metadata to attach to the scenario for organization.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * A string representation of the reference output to solve the scenario. Commonly
   * can be the result of a git diff or a sequence of command actions to apply to the
   * environment.
   */
  reference_output?: string | null;

  /**
   * Environment variables required to run the scenario. If these variables are not
   * provided, the scenario will fail to start.
   */
  required_environment_variables?: Array<string> | null;

  /**
   * Secrets required to run the scenario (user secret name to scenario required
   * secret name). If these secrets are not provided or the mapping is incorrect, the
   * scenario will fail to start.
   */
  required_secret_names?: Array<string> | null;

  /**
   * Timeout for scoring in seconds. Default 30 minutes (1800s).
   */
  scorer_timeout_sec?: number | null;

  /**
   * Validation strategy.
   */
  validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION' | null;
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
   * Optional launch parameters to apply to the devbox environment at launch.
   */
  launch_parameters?: Shared.LaunchParameters | null;

  /**
   * Use the snapshot with matching ID.
   */
  snapshot_id?: string | null;

  /**
   * The working directory where the agent is expected to fulfill the scenario.
   * Scoring functions also run from the working directory.
   */
  working_directory?: string | null;
}

export interface ScenarioRunListView {
  has_more: boolean;

  /**
   * List of ScenarioRuns matching filter.
   */
  runs: Array<ScenarioRunView>;

  remaining_count?: number | null;

  total_count?: number | null;
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
   * User defined metadata to attach to the scenario run for organization.
   */
  metadata: { [key: string]: string };

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
   * Environment variables used to run the scenario.
   */
  environment_variables?: { [key: string]: string } | null;

  /**
   * Optional name of ScenarioRun.
   */
  name?: string | null;

  /**
   * Purpose of the ScenarioRun.
   */
  purpose?: string | null;

  /**
   * The scoring result of the ScenarioRun.
   */
  scoring_contract_result?: ScoringContractResultView | null;

  /**
   * User secrets used to run the scenario.
   */
  secrets_provided?: { [key: string]: string } | null;

  /**
   * The time that the scenario started
   */
  start_time_ms?: number;
}

/**
 * ScenarioUpdateParameters contain the set of parameters to update a Scenario. All
 * fields are optional - null fields preserve existing values, provided fields
 * replace entirely.
 */
export interface ScenarioUpdateParameters {
  /**
   * The Environment in which the Scenario will run.
   */
  environment_parameters?: ScenarioEnvironment | null;

  /**
   * The input context for the Scenario.
   */
  input_context?: InputContextUpdate | null;

  /**
   * User defined metadata to attach to the scenario. Pass in empty map to clear.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * Name of the scenario. Cannot be blank.
   */
  name?: string | null;

  /**
   * A string representation of the reference output to solve the scenario. Commonly
   * can be the result of a git diff or a sequence of command actions to apply to the
   * environment. Pass in empty string to clear.
   */
  reference_output?: string | null;

  /**
   * Environment variables required to run the scenario. Pass in empty list to clear.
   */
  required_environment_variables?: Array<string> | null;

  /**
   * Secrets required to run the scenario. Pass in empty list to clear.
   */
  required_secret_names?: Array<string> | null;

  /**
   * Timeout for scoring in seconds. Default 30 minutes (1800s).
   */
  scorer_timeout_sec?: number | null;

  /**
   * The scoring contract for the Scenario.
   */
  scoring_contract?: ScoringContractUpdate | null;

  /**
   * Validation strategy. Pass in empty string to clear.
   */
  validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION' | null;
}

/**
 * A ScenarioDefinitionView represents a repeatable AI coding evaluation test,
 * complete with initial environment and scoring contract.
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
   * User defined metadata to attach to the scenario for organization.
   */
  metadata: { [key: string]: string };

  /**
   * The name of the Scenario.
   */
  name: string;

  /**
   * The scoring contract for the Scenario.
   */
  scoring_contract: ScoringContract;

  /**
   * Whether the scenario is active or archived. Archived scenarios are excluded from
   * listings and cannot be updated.
   */
  status: 'active' | 'archived';

  /**
   * The Environment in which the Scenario is run.
   */
  environment?: ScenarioEnvironment | null;

  /**
   * Whether this scenario is public.
   */
  is_public?: boolean;

  /**
   * A string representation of the reference output to solve the scenario. Commonly
   * can be the result of a git diff or a sequence of command actions to apply to the
   * environment.
   */
  reference_output?: string | null;

  /**
   * Environment variables required to run the scenario. If any required environment
   * variables are missing, the scenario will fail to start.
   */
  required_environment_variables?: Array<string>;

  /**
   * Environment variables required to run the scenario. If any required secrets are
   * missing, the scenario will fail to start.
   */
  required_secret_names?: Array<string>;

  /**
   * Timeout for scoring in seconds. Default 30 minutes (1800s).
   */
  scorer_timeout_sec?: number | null;

  /**
   * Validation strategy.
   */
  validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION' | null;
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

export interface ScoringContractUpdate {
  /**
   * A list of scoring functions used to evaluate the Scenario.
   */
  scoring_function_parameters?: Array<ScoringFunction> | null;
}

/**
 * ScoringFunction specifies a method of scoring a Scenario.
 */
export interface ScoringFunction {
  /**
   * Name of scoring function. Names must only contain [a-zA-Z0-9_-].
   */
  name: string;

  /**
   * The scoring function to use for evaluating this scenario. The type field
   * determines which built-in function to use.
   */
  scorer:
    | ScoringFunction.AstGrepScoringFunction
    | ScoringFunction.BashScriptScoringFunction
    | ScoringFunction.CommandScoringFunction
    | ScoringFunction.CustomScoringFunction
    | ScoringFunction.PythonScriptScoringFunction
    | ScoringFunction.TestBasedScoringFunction;

  /**
   * Weight to apply to scoring function score. Weights of all scoring functions
   * should sum to 1.0.
   */
  weight: number;
}

export namespace ScoringFunction {
  /**
   * AstGrepScoringFunction utilizes structured coach search for scoring.
   */
  export interface AstGrepScoringFunction {
    /**
     * AST pattern to match. Pattern will be passed to ast-grep using the commandline
     * surround by double quotes ("), so make sure to use proper escaping (for example,
     * \$\$\$).
     */
    pattern: string;

    /**
     * The path to search.
     */
    search_directory: string;

    type: 'ast_grep_scorer';

    /**
     * The language of the pattern.
     */
    lang?: string;
  }

  /**
   * BashScriptScoringFunction is a scoring function specified by a bash script that
   * will be run in the context of your environment.
   */
  export interface BashScriptScoringFunction {
    type: 'bash_script_scorer';

    /**
     * A single bash script that sets up the environment, scores, and prints the final
     * score to standard out. Score should be a float between 0.0 and 1.0, and look
     * like "score=[0.0..1.0].
     */
    bash_script?: string;
  }

  /**
   * CommandScoringFunction executes a single command and checks the result.The
   * output of the command will be printed. Scoring will passed if the command
   * returns status code 0, otherwise it will be failed.
   */
  export interface CommandScoringFunction {
    type: 'command_scorer';

    /**
     * The command to execute.
     */
    command?: string;
  }

  /**
   * CustomScoringFunction is a custom, user defined scoring function.
   */
  export interface CustomScoringFunction {
    /**
     * Type of the scoring function, previously registered with Runloop.
     */
    custom_scorer_type: string;

    type: 'custom_scorer';

    /**
     * Additional JSON structured context to pass to the scoring function.
     */
    scorer_params?: unknown | null;
  }

  /**
   * PythonScriptScoringFunction will run a python script in the context of your
   * environment as a ScoringFunction.
   */
  export interface PythonScriptScoringFunction {
    /**
     * Python script to be run. The script should output the score to standard out as a
     * float between 0.0 and 1.0.
     */
    python_script: string;

    type: 'python_script_scorer';

    /**
     * Python version to run scoring. Default is "==3.12.10"
     */
    python_version_constraint?: string | null;

    /**
     * Package dependencies to be installed. The requirements should be a valid
     * requirements.txt file.
     */
    requirements_contents?: string | null;
  }

  /**
   * TestBasedScoringFunction writes test files to disk and executes a test command
   * to verify the solution.
   */
  export interface TestBasedScoringFunction {
    type: 'test_based_scorer';

    /**
     * The command to execute for running the tests
     */
    test_command?: string;

    /**
     * List of test files to create
     */
    test_files?: Array<TestBasedScoringFunction.TestFile>;
  }

  export namespace TestBasedScoringFunction {
    export interface TestFile {
      /**
       * Content of the test file
       */
      file_contents?: string;

      /**
       * Path to write content of the test file, relative to your environment's working
       * directory
       */
      file_path?: string;
    }
  }
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

  /**
   * The state of the scoring function application.
   */
  state: 'unknown' | 'complete' | 'error';
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
   * User defined metadata to attach to the run for organization.
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

  /**
   * User defined metadata to attach to the scenario for organization.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * A string representation of the reference output to solve the scenario. Commonly
   * can be the result of a git diff or a sequence of command actions to apply to the
   * environment.
   */
  reference_output?: string | null;

  /**
   * Environment variables required to run the scenario. If these variables are not
   * provided, the scenario will fail to start.
   */
  required_environment_variables?: Array<string> | null;

  /**
   * Secrets required to run the scenario (user secret name to scenario required
   * secret name). If these secrets are not provided or the mapping is incorrect, the
   * scenario will fail to start.
   */
  required_secret_names?: Array<string> | null;

  /**
   * Timeout for scoring in seconds. Default 30 minutes (1800s).
   */
  scorer_timeout_sec?: number | null;

  /**
   * Validation strategy.
   */
  validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION' | null;
}

export interface ScenarioUpdateParams {
  /**
   * The Environment in which the Scenario will run.
   */
  environment_parameters?: ScenarioEnvironment | null;

  /**
   * The input context for the Scenario.
   */
  input_context?: InputContextUpdate | null;

  /**
   * User defined metadata to attach to the scenario. Pass in empty map to clear.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * Name of the scenario. Cannot be blank.
   */
  name?: string | null;

  /**
   * A string representation of the reference output to solve the scenario. Commonly
   * can be the result of a git diff or a sequence of command actions to apply to the
   * environment. Pass in empty string to clear.
   */
  reference_output?: string | null;

  /**
   * Environment variables required to run the scenario. Pass in empty list to clear.
   */
  required_environment_variables?: Array<string> | null;

  /**
   * Secrets required to run the scenario. Pass in empty list to clear.
   */
  required_secret_names?: Array<string> | null;

  /**
   * Timeout for scoring in seconds. Default 30 minutes (1800s).
   */
  scorer_timeout_sec?: number | null;

  /**
   * The scoring contract for the Scenario.
   */
  scoring_contract?: ScoringContractUpdate | null;

  /**
   * Validation strategy. Pass in empty string to clear.
   */
  validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION' | null;
}

export interface ScenarioListParams extends ScenariosCursorIDPageParams {
  /**
   * Filter scenarios by benchmark ID.
   */
  benchmark_id?: string;

  /**
   * Query for Scenarios with a given name.
   */
  name?: string;

  /**
   * Filter by validation type
   */
  validation_type?: string;
}

export interface ScenarioListPublicParams extends ScenariosCursorIDPageParams {
  /**
   * Query for Scenarios with a given name.
   */
  name?: string;
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
   * User defined metadata to attach to the run for organization.
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

Scenarios.ScenarioViewsScenariosCursorIDPage = ScenarioViewsScenariosCursorIDPage;
Scenarios.Runs = Runs;
Scenarios.Scorers = Scorers;
Scenarios.ScorerListResponsesScenarioScorersCursorIDPage = ScorerListResponsesScenarioScorersCursorIDPage;

export declare namespace Scenarios {
  export {
    type InputContext as InputContext,
    type InputContextUpdate as InputContextUpdate,
    type ScenarioCreateParameters as ScenarioCreateParameters,
    type ScenarioEnvironment as ScenarioEnvironment,
    type ScenarioRunListView as ScenarioRunListView,
    type ScenarioRunView as ScenarioRunView,
    type ScenarioUpdateParameters as ScenarioUpdateParameters,
    type ScenarioView as ScenarioView,
    type ScoringContract as ScoringContract,
    type ScoringContractResultView as ScoringContractResultView,
    type ScoringContractUpdate as ScoringContractUpdate,
    type ScoringFunction as ScoringFunction,
    type ScoringFunctionResultView as ScoringFunctionResultView,
    type StartScenarioRunParameters as StartScenarioRunParameters,
    ScenarioViewsScenariosCursorIDPage as ScenarioViewsScenariosCursorIDPage,
    type ScenarioCreateParams as ScenarioCreateParams,
    type ScenarioUpdateParams as ScenarioUpdateParams,
    type ScenarioListParams as ScenarioListParams,
    type ScenarioListPublicParams as ScenarioListPublicParams,
    type ScenarioStartRunParams as ScenarioStartRunParams,
  };

  export { Runs as Runs, type RunListParams as RunListParams };

  export {
    Scorers as Scorers,
    type ScorerCreateResponse as ScorerCreateResponse,
    type ScorerRetrieveResponse as ScorerRetrieveResponse,
    type ScorerUpdateResponse as ScorerUpdateResponse,
    type ScorerListResponse as ScorerListResponse,
    ScorerListResponsesScenarioScorersCursorIDPage as ScorerListResponsesScenarioScorersCursorIDPage,
    type ScorerCreateParams as ScorerCreateParams,
    type ScorerUpdateParams as ScorerUpdateParams,
    type ScorerListParams as ScorerListParams,
  };
}
