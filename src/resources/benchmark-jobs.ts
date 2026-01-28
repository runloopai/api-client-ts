// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';

export class BenchmarkJobs extends APIResource {
  /**
   * [Beta] Create a BenchmarkJob that runs a set of scenarios entirely on runloop.
   */
  create(body?: BenchmarkJobCreateParams, options?: Core.RequestOptions): Core.APIPromise<BenchmarkJobView>;
  create(options?: Core.RequestOptions): Core.APIPromise<BenchmarkJobView>;
  create(
    body: BenchmarkJobCreateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<BenchmarkJobView> {
    if (isRequestOptions(body)) {
      return this.create({}, body);
    }
    return this._client.post('/v1/benchmark_jobs', { body, ...options });
  }

  /**
   * [Beta] Get a BenchmarkJob given ID.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<BenchmarkJobView> {
    return this._client.get(`/v1/benchmark_jobs/${id}`, options);
  }

  /**
   * [Beta] List all BenchmarkJobs matching filter.
   */
  list(query?: BenchmarkJobListParams, options?: Core.RequestOptions): Core.APIPromise<BenchmarkJobListView>;
  list(options?: Core.RequestOptions): Core.APIPromise<BenchmarkJobListView>;
  list(
    query: BenchmarkJobListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<BenchmarkJobListView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.get('/v1/benchmark_jobs', { query, ...options });
  }
}

/**
 * BenchmarkJobCreateParameters contain the set of parameters to create a
 * BenchmarkJob.
 */
export interface BenchmarkJobCreateParameters {
  /**
   * The name of the BenchmarkJob. If not provided, name will be generated based on
   * target dataset.
   */
  name?: string | null;

  /**
   * The job specification. Exactly one spec type must be set.
   */
  spec?:
    | BenchmarkJobCreateParameters.HarborJobSpec
    | BenchmarkJobCreateParameters.BenchmarkDefinitionJobSpec
    | BenchmarkJobCreateParameters.ScenarioDefinitionJobSpec
    | null;
}

export namespace BenchmarkJobCreateParameters {
  /**
   * Harbor-based job specification with inline YAML configuration.
   */
  export interface HarborJobSpec {
    /**
     * The Harbor job configuration as inline YAML content.
     */
    inline_yaml: string;

    type: 'harbor';
  }

  /**
   * Specifies a benchmark definition with runtime configuration. The benchmark
   * definition's scenarios will be executed using the provided agent and
   * orchestrator configurations.
   */
  export interface BenchmarkDefinitionJobSpec {
    /**
     * Agent configurations to use for this run. Must specify at least one agent.
     */
    agent_configs: Array<BenchmarkDefinitionJobSpec.AgentConfig>;

    /**
     * ID of the benchmark definition to run. The scenarios from this benchmark will be
     * executed.
     */
    benchmark_id: string;

    type: 'benchmark';

    /**
     * Orchestrator configuration (optional overrides). If not provided, default values
     * will be used.
     */
    orchestrator_config?: BenchmarkDefinitionJobSpec.OrchestratorConfig | null;
  }

  export namespace BenchmarkDefinitionJobSpec {
    /**
     * Configuration for an agent in a benchmark job
     */
    export interface AgentConfig {
      /**
       * Name of the agent
       */
      name: string;

      type: 'job_agent';

      /**
       * Environment configuration to use for this agent
       */
      agent_environment?: AgentConfig.AgentEnvironment | null;

      /**
       * ID of the agent to use (optional if agent exists by name)
       */
      agent_id?: string | null;

      /**
       * Additional kwargs for agent configuration
       */
      kwargs?: { [key: string]: string } | null;

      /**
       * Model name override for this agent
       */
      model_name?: string | null;

      /**
       * Timeout in seconds for this agent
       */
      timeout_seconds?: number | null;
    }

    export namespace AgentConfig {
      /**
       * Environment configuration to use for this agent
       */
      export interface AgentEnvironment {
        /**
         * Environment variables to set when launching the agent.
         */
        environment_variables?: { [key: string]: string } | null;

        /**
         * Secrets to inject as environment variables when launching the agent. Map of
         * environment variable names to secret IDs.
         */
        secrets?: { [key: string]: string } | null;
      }
    }

    /**
     * Orchestrator configuration (optional overrides). If not provided, default values
     * will be used.
     */
    export interface OrchestratorConfig {
      /**
       * Number of retry attempts on failure (default: 0). This is the retry policy for
       * failed scenarios. Default is 0.
       */
      n_attempts?: number | null;

      /**
       * Number of concurrent trials to run (default: 1). Controls parallelism for
       * scenario execution. Default is 1.
       */
      n_concurrent_trials?: number | null;

      /**
       * Suppress verbose output (default: false)
       */
      quiet?: boolean | null;

      /**
       * Timeout multiplier for retries (default: 1.0). Each retry will multiply the
       * timeout by this factor.
       */
      timeout_multiplier?: number | null;
    }
  }

  /**
   * Specifies a set of scenarios with runtime configuration. The scenarios will be
   * executed using the provided agent and orchestrator configurations.
   */
  export interface ScenarioDefinitionJobSpec {
    /**
     * Agent configurations to use for this run. Must specify at least one agent.
     */
    agent_configs: Array<ScenarioDefinitionJobSpec.AgentConfig>;

    /**
     * List of scenario IDs to execute
     */
    scenario_ids: Array<string>;

    type: 'scenarios';

    /**
     * Orchestrator configuration (optional overrides). If not provided, default values
     * will be used.
     */
    orchestrator_config?: ScenarioDefinitionJobSpec.OrchestratorConfig | null;
  }

  export namespace ScenarioDefinitionJobSpec {
    /**
     * Configuration for an agent in a benchmark job
     */
    export interface AgentConfig {
      /**
       * Name of the agent
       */
      name: string;

      type: 'job_agent';

      /**
       * Environment configuration to use for this agent
       */
      agent_environment?: AgentConfig.AgentEnvironment | null;

      /**
       * ID of the agent to use (optional if agent exists by name)
       */
      agent_id?: string | null;

      /**
       * Additional kwargs for agent configuration
       */
      kwargs?: { [key: string]: string } | null;

      /**
       * Model name override for this agent
       */
      model_name?: string | null;

      /**
       * Timeout in seconds for this agent
       */
      timeout_seconds?: number | null;
    }

    export namespace AgentConfig {
      /**
       * Environment configuration to use for this agent
       */
      export interface AgentEnvironment {
        /**
         * Environment variables to set when launching the agent.
         */
        environment_variables?: { [key: string]: string } | null;

        /**
         * Secrets to inject as environment variables when launching the agent. Map of
         * environment variable names to secret IDs.
         */
        secrets?: { [key: string]: string } | null;
      }
    }

    /**
     * Orchestrator configuration (optional overrides). If not provided, default values
     * will be used.
     */
    export interface OrchestratorConfig {
      /**
       * Number of retry attempts on failure (default: 0). This is the retry policy for
       * failed scenarios. Default is 0.
       */
      n_attempts?: number | null;

      /**
       * Number of concurrent trials to run (default: 1). Controls parallelism for
       * scenario execution. Default is 1.
       */
      n_concurrent_trials?: number | null;

      /**
       * Suppress verbose output (default: false)
       */
      quiet?: boolean | null;

      /**
       * Timeout multiplier for retries (default: 1.0). Each retry will multiply the
       * timeout by this factor.
       */
      timeout_multiplier?: number | null;
    }
  }
}

export interface BenchmarkJobListView {
  has_more: boolean;

  /**
   * List of BenchmarkJobs matching filter.
   */
  jobs: Array<BenchmarkJobView>;

  remaining_count: number;

  total_count: number;
}

/**
 * A BenchmarkJobView represents a benchmark job that runs a set of scenarios
 * entirely on runloop.
 */
export interface BenchmarkJobView {
  /**
   * The ID of the BenchmarkJob.
   */
  id: string;

  /**
   * Timestamp when job was created (Unix milliseconds).
   */
  create_time_ms: number;

  /**
   * The unique name of the BenchmarkJob.
   */
  name: string;

  /**
   * The current state of the benchmark job.
   */
  state: 'initializing' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';

  /**
   * Detailed outcome data for each benchmark run created by this job. Includes
   * per-agent results and scenario-level details.
   */
  benchmark_outcomes?: Array<BenchmarkJobView.BenchmarkOutcome> | null;

  /**
   * Failure reason if job failed.
   */
  failure_reason?: string | null;

  /**
   * Benchmark runs currently in progress for this job. Shows runs that have not yet
   * completed.
   */
  in_progress_runs?: Array<BenchmarkJobView.InProgressRun> | null;

  /**
   * The source configuration that was used to create this job. Either Harbor YAML or
   * benchmark definition reference.
   */
  job_source?:
    | BenchmarkJobView.HarborJobSource
    | BenchmarkJobView.BenchmarkDefJobSource
    | BenchmarkJobView.ScenariosJobSource
    | null;

  /**
   * The resolved job specification. Contains scenarios, agents, and orchestrator
   * config.
   */
  job_spec?: BenchmarkJobView.JobSpec | null;
}

export namespace BenchmarkJobView {
  /**
   * Outcome data for a single benchmark run within a benchmark job, representing
   * results for one agent configuration.
   */
  export interface BenchmarkOutcome {
    /**
     * The name of the agent configuration used.
     */
    agent_name: string;

    /**
     * The ID of the benchmark run.
     */
    benchmark_run_id: string;

    /**
     * Number of scenarios that completed successfully.
     */
    n_completed: number;

    /**
     * Number of scenarios that failed.
     */
    n_failed: number;

    /**
     * Number of scenarios that timed out.
     */
    n_timeout: number;

    /**
     * Detailed outcomes for each scenario in this benchmark run.
     */
    scenario_outcomes: Array<BenchmarkOutcome.ScenarioOutcome>;

    /**
     * Average score across all completed scenarios (0.0 to 1.0).
     */
    average_score?: number | null;

    /**
     * Total duration of the benchmark run in milliseconds.
     */
    duration_ms?: number | null;

    /**
     * The model name used by the agent.
     */
    model_name?: string | null;
  }

  export namespace BenchmarkOutcome {
    /**
     * Outcome data for a single scenario execution, including its final state and
     * scoring results.
     */
    export interface ScenarioOutcome {
      /**
       * The ID of the scenario definition that was executed.
       */
      scenario_definition_id: string;

      /**
       * The name of the scenario.
       */
      scenario_name: string;

      /**
       * The ID of the scenario run.
       */
      scenario_run_id: string;

      /**
       * The final state of the scenario execution.
       */
      state: 'COMPLETED' | 'FAILED' | 'TIMEOUT' | 'CANCELED';

      /**
       * Duration of the scenario execution in milliseconds.
       */
      duration_ms?: number | null;

      /**
       * Failure information if the scenario failed or timed out. Contains exception type
       * and message.
       */
      failure_reason?: ScenarioOutcome.FailureReason | null;

      /**
       * The score achieved for this scenario (0.0 to 1.0). Only present if state is
       * COMPLETED.
       */
      score?: number | null;
    }

    export namespace ScenarioOutcome {
      /**
       * Failure information if the scenario failed or timed out. Contains exception type
       * and message.
       */
      export interface FailureReason {
        /**
         * The exception message providing context
         */
        exception_message: string;

        /**
         * The exception class name (e.g., 'TimeoutException', 'AgentTimeoutError')
         */
        exception_type: string;
      }
    }
  }

  /**
   * A lightweight view of a benchmark run currently in progress, showing basic
   * execution details without full outcome data.
   */
  export interface InProgressRun {
    /**
     * The ID of the benchmark run.
     */
    benchmark_run_id: string;

    /**
     * Start time (Unix milliseconds).
     */
    start_time_ms: number;

    /**
     * The current state of the run.
     */
    state: 'running' | 'canceled' | 'completed';

    /**
     * Agent configuration used for this run. Specifies whether the run was driven by
     * an external API agent or a job-defined agent.
     */
    agent_config?: InProgressRun.ExternalAPIAgentConfig | InProgressRun.JobAgentConfig | null;

    /**
     * Duration so far in milliseconds.
     */
    duration_ms?: number | null;
  }

  export namespace InProgressRun {
    /**
     * Configuration for externally-driven benchmark runs via API
     */
    export interface ExternalAPIAgentConfig {
      type: 'external_api';

      /**
       * Placeholder for future external agent metadata
       */
      info?: string | null;
    }

    /**
     * Configuration for an agent in a benchmark job
     */
    export interface JobAgentConfig {
      /**
       * Name of the agent
       */
      name: string;

      type: 'job_agent';

      /**
       * Environment configuration to use for this agent
       */
      agent_environment?: JobAgentConfig.AgentEnvironment | null;

      /**
       * ID of the agent to use (optional if agent exists by name)
       */
      agent_id?: string | null;

      /**
       * Additional kwargs for agent configuration
       */
      kwargs?: { [key: string]: string } | null;

      /**
       * Model name override for this agent
       */
      model_name?: string | null;

      /**
       * Timeout in seconds for this agent
       */
      timeout_seconds?: number | null;
    }

    export namespace JobAgentConfig {
      /**
       * Environment configuration to use for this agent
       */
      export interface AgentEnvironment {
        /**
         * Environment variables to set when launching the agent.
         */
        environment_variables?: { [key: string]: string } | null;

        /**
         * Secrets to inject as environment variables when launching the agent. Map of
         * environment variable names to secret IDs.
         */
        secrets?: { [key: string]: string } | null;
      }
    }
  }

  /**
   * Harbor job source with inline YAML configuration
   */
  export interface HarborJobSource {
    /**
     * The Harbor job configuration as inline YAML content
     */
    inline_yaml: string;

    type: 'harbor';
  }

  /**
   * Benchmark definition job source
   */
  export interface BenchmarkDefJobSource {
    /**
     * The ID of the benchmark definition
     */
    benchmark_id: string;

    type: 'benchmark';

    /**
     * Optional user-provided name for the benchmark definition
     */
    benchmark_name?: string | null;
  }

  /**
   * Scenarios job source with a list of scenario definition IDs
   */
  export interface ScenariosJobSource {
    /**
     * List of scenario definition IDs to execute
     */
    scenario_ids: Array<string>;

    type: 'scenarios';
  }

  /**
   * The resolved job specification. Contains scenarios, agents, and orchestrator
   * config.
   */
  export interface JobSpec {
    /**
     * Agent configurations for this job
     */
    agent_configs: Array<JobSpec.AgentConfig>;

    /**
     * List of scenario IDs to execute
     */
    scenario_ids: Array<string>;

    /**
     * Orchestrator configuration
     */
    orchestrator_config?: JobSpec.OrchestratorConfig | null;
  }

  export namespace JobSpec {
    /**
     * Configuration for an agent in a benchmark job
     */
    export interface AgentConfig {
      /**
       * Name of the agent
       */
      name: string;

      type: 'job_agent';

      /**
       * Environment configuration to use for this agent
       */
      agent_environment?: AgentConfig.AgentEnvironment | null;

      /**
       * ID of the agent to use (optional if agent exists by name)
       */
      agent_id?: string | null;

      /**
       * Additional kwargs for agent configuration
       */
      kwargs?: { [key: string]: string } | null;

      /**
       * Model name override for this agent
       */
      model_name?: string | null;

      /**
       * Timeout in seconds for this agent
       */
      timeout_seconds?: number | null;
    }

    export namespace AgentConfig {
      /**
       * Environment configuration to use for this agent
       */
      export interface AgentEnvironment {
        /**
         * Environment variables to set when launching the agent.
         */
        environment_variables?: { [key: string]: string } | null;

        /**
         * Secrets to inject as environment variables when launching the agent. Map of
         * environment variable names to secret IDs.
         */
        secrets?: { [key: string]: string } | null;
      }
    }

    /**
     * Orchestrator configuration
     */
    export interface OrchestratorConfig {
      /**
       * Number of retry attempts on failure (default: 0). This is the retry policy for
       * failed scenarios. Default is 0.
       */
      n_attempts?: number | null;

      /**
       * Number of concurrent trials to run (default: 1). Controls parallelism for
       * scenario execution. Default is 1.
       */
      n_concurrent_trials?: number | null;

      /**
       * Suppress verbose output (default: false)
       */
      quiet?: boolean | null;

      /**
       * Timeout multiplier for retries (default: 1.0). Each retry will multiply the
       * timeout by this factor.
       */
      timeout_multiplier?: number | null;
    }
  }
}

export interface BenchmarkJobCreateParams {
  /**
   * The name of the BenchmarkJob. If not provided, name will be generated based on
   * target dataset.
   */
  name?: string | null;

  /**
   * The job specification. Exactly one spec type must be set.
   */
  spec?:
    | BenchmarkJobCreateParams.HarborJobSpec
    | BenchmarkJobCreateParams.BenchmarkDefinitionJobSpec
    | BenchmarkJobCreateParams.ScenarioDefinitionJobSpec
    | null;
}

export namespace BenchmarkJobCreateParams {
  /**
   * Harbor-based job specification with inline YAML configuration.
   */
  export interface HarborJobSpec {
    /**
     * The Harbor job configuration as inline YAML content.
     */
    inline_yaml: string;

    type: 'harbor';
  }

  /**
   * Specifies a benchmark definition with runtime configuration. The benchmark
   * definition's scenarios will be executed using the provided agent and
   * orchestrator configurations.
   */
  export interface BenchmarkDefinitionJobSpec {
    /**
     * Agent configurations to use for this run. Must specify at least one agent.
     */
    agent_configs: Array<BenchmarkDefinitionJobSpec.AgentConfig>;

    /**
     * ID of the benchmark definition to run. The scenarios from this benchmark will be
     * executed.
     */
    benchmark_id: string;

    type: 'benchmark';

    /**
     * Orchestrator configuration (optional overrides). If not provided, default values
     * will be used.
     */
    orchestrator_config?: BenchmarkDefinitionJobSpec.OrchestratorConfig | null;
  }

  export namespace BenchmarkDefinitionJobSpec {
    /**
     * Configuration for an agent in a benchmark job
     */
    export interface AgentConfig {
      /**
       * Name of the agent
       */
      name: string;

      type: 'job_agent';

      /**
       * Environment configuration to use for this agent
       */
      agent_environment?: AgentConfig.AgentEnvironment | null;

      /**
       * ID of the agent to use (optional if agent exists by name)
       */
      agent_id?: string | null;

      /**
       * Additional kwargs for agent configuration
       */
      kwargs?: { [key: string]: string } | null;

      /**
       * Model name override for this agent
       */
      model_name?: string | null;

      /**
       * Timeout in seconds for this agent
       */
      timeout_seconds?: number | null;
    }

    export namespace AgentConfig {
      /**
       * Environment configuration to use for this agent
       */
      export interface AgentEnvironment {
        /**
         * Environment variables to set when launching the agent.
         */
        environment_variables?: { [key: string]: string } | null;

        /**
         * Secrets to inject as environment variables when launching the agent. Map of
         * environment variable names to secret IDs.
         */
        secrets?: { [key: string]: string } | null;
      }
    }

    /**
     * Orchestrator configuration (optional overrides). If not provided, default values
     * will be used.
     */
    export interface OrchestratorConfig {
      /**
       * Number of retry attempts on failure (default: 0). This is the retry policy for
       * failed scenarios. Default is 0.
       */
      n_attempts?: number | null;

      /**
       * Number of concurrent trials to run (default: 1). Controls parallelism for
       * scenario execution. Default is 1.
       */
      n_concurrent_trials?: number | null;

      /**
       * Suppress verbose output (default: false)
       */
      quiet?: boolean | null;

      /**
       * Timeout multiplier for retries (default: 1.0). Each retry will multiply the
       * timeout by this factor.
       */
      timeout_multiplier?: number | null;
    }
  }

  /**
   * Specifies a set of scenarios with runtime configuration. The scenarios will be
   * executed using the provided agent and orchestrator configurations.
   */
  export interface ScenarioDefinitionJobSpec {
    /**
     * Agent configurations to use for this run. Must specify at least one agent.
     */
    agent_configs: Array<ScenarioDefinitionJobSpec.AgentConfig>;

    /**
     * List of scenario IDs to execute
     */
    scenario_ids: Array<string>;

    type: 'scenarios';

    /**
     * Orchestrator configuration (optional overrides). If not provided, default values
     * will be used.
     */
    orchestrator_config?: ScenarioDefinitionJobSpec.OrchestratorConfig | null;
  }

  export namespace ScenarioDefinitionJobSpec {
    /**
     * Configuration for an agent in a benchmark job
     */
    export interface AgentConfig {
      /**
       * Name of the agent
       */
      name: string;

      type: 'job_agent';

      /**
       * Environment configuration to use for this agent
       */
      agent_environment?: AgentConfig.AgentEnvironment | null;

      /**
       * ID of the agent to use (optional if agent exists by name)
       */
      agent_id?: string | null;

      /**
       * Additional kwargs for agent configuration
       */
      kwargs?: { [key: string]: string } | null;

      /**
       * Model name override for this agent
       */
      model_name?: string | null;

      /**
       * Timeout in seconds for this agent
       */
      timeout_seconds?: number | null;
    }

    export namespace AgentConfig {
      /**
       * Environment configuration to use for this agent
       */
      export interface AgentEnvironment {
        /**
         * Environment variables to set when launching the agent.
         */
        environment_variables?: { [key: string]: string } | null;

        /**
         * Secrets to inject as environment variables when launching the agent. Map of
         * environment variable names to secret IDs.
         */
        secrets?: { [key: string]: string } | null;
      }
    }

    /**
     * Orchestrator configuration (optional overrides). If not provided, default values
     * will be used.
     */
    export interface OrchestratorConfig {
      /**
       * Number of retry attempts on failure (default: 0). This is the retry policy for
       * failed scenarios. Default is 0.
       */
      n_attempts?: number | null;

      /**
       * Number of concurrent trials to run (default: 1). Controls parallelism for
       * scenario execution. Default is 1.
       */
      n_concurrent_trials?: number | null;

      /**
       * Suppress verbose output (default: false)
       */
      quiet?: boolean | null;

      /**
       * Timeout multiplier for retries (default: 1.0). Each retry will multiply the
       * timeout by this factor.
       */
      timeout_multiplier?: number | null;
    }
  }
}

export interface BenchmarkJobListParams {
  /**
   * The limit of items to return. Default is 20. Max is 5000.
   */
  limit?: number;

  /**
   * Filter by name
   */
  name?: string;

  /**
   * Load the next page of data starting after the item with the given ID.
   */
  starting_after?: string;
}

export declare namespace BenchmarkJobs {
  export {
    type BenchmarkJobCreateParameters as BenchmarkJobCreateParameters,
    type BenchmarkJobListView as BenchmarkJobListView,
    type BenchmarkJobView as BenchmarkJobView,
    type BenchmarkJobCreateParams as BenchmarkJobCreateParams,
    type BenchmarkJobListParams as BenchmarkJobListParams,
  };
}
