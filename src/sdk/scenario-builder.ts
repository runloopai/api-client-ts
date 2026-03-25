import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  ScenarioCreateParams,
  ScenarioEnvironment,
  ScoringFunction,
} from '../resources/scenarios/scenarios';
import { Scenario } from './scenario';
import { Blueprint } from './blueprint';
import { Snapshot } from './snapshot';

/**
 * Fluent builder for constructing {@link ScenarioCreateParams}.
 *
 * @category Scenario
 *
 * @remarks
 * ## Overview
 *
 * The `ScenarioBuilder` provides a step-by-step, chainable interface for
 * configuring all aspects of a scenario before pushing it to the platform.
 *
 * ## Quickstart
 *
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client';
 *
 * const runloop = new RunloopSDK();
 * const scenario = await runloop.scenario
 *   .builder('my-scenario')
 *   .fromBlueprint(blueprint)
 *   .withWorkingDirectory('/app')
 *   .withProblemStatement('Fix the bug in main.py')
 *   .addTestCommandScorer('tests', { test_command: 'pytest' })
 *   .push();
 * ```
 */
export class ScenarioBuilder {
  private client: Runloop;
  private _name: string;

  // Environment
  private _blueprint: Blueprint | null = null;
  private _snapshot: Snapshot | null = null;
  private _workingDirectory: string | null = null;

  // Input context
  private _problemStatement: string | null = null;
  private _additionalContext: unknown = null;

  // Scoring
  private _scorers: ScoringFunction[] = [];

  // Metadata
  private _metadata: Record<string, string> = {};
  private _referenceOutput: string | null = null;
  private _requiredEnvVars: string[] | null = null;
  private _requiredSecrets: string[] | null = null;
  private _validationType: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION' | null = null;

  /**
   * Create a new ScenarioBuilder.
   *
   * @param {string} name - Name for the scenario
   * @param {Runloop} client - The Runloop client instance
   */
  constructor(name: string, client: Runloop) {
    this._name = name;
    this.client = client;
  }

  /**
   * Get the scenario name.
   * @returns {string} The scenario name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Set a blueprint to define the baseline environment for the scenario.
   *
   * @param {Blueprint} blueprint - Blueprint to use
   * @returns {this} Builder for chaining
   */
  fromBlueprint(blueprint: Blueprint): this {
    this._blueprint = blueprint;
    this._snapshot = null;
    return this;
  }

  /**
   * Set a snapshot to define the baseline environment for the scenario.
   *
   * @param {Snapshot} snapshot - Snapshot to use
   * @returns {this} Builder for chaining
   */
  fromSnapshot(snapshot: Snapshot): this {
    this._snapshot = snapshot;
    this._blueprint = null;
    return this;
  }

  /**
   * Set the working directory for the scenario.
   *
   * @param {string} directory - Working directory path
   * @returns {this} Builder for chaining
   */
  withWorkingDirectory(directory: string): this {
    this._workingDirectory = directory;
    return this;
  }

  /**
   * Set the problem statement for the scenario. This will be provided as
   * input context to the agent.
   *
   * @param {string} statement - Problem statement text
   * @returns {this} Builder for chaining
   */
  withProblemStatement(statement: string): this {
    this._problemStatement = statement;
    return this;
  }

  /**
   * Set additional structured context for the scenario.
   *
   * @param {unknown} context - Additional context (JSON-serializable)
   * @returns {this} Builder for chaining
   */
  withAdditionalContext(context: unknown): this {
    this._additionalContext = context;
    return this;
  }

  /**
   * Add a test-based scorer that runs a test command.
   *
   * @example
   * ```typescript
   * builder.addTestCommandScorer('tests', {
   *   test_command: 'pytest',
   *   test_files: [{ file_path: 'test_main.py', file_contents: 'def test_foo(): ...' }],
   * });
   * ```
   *
   * @param {string} name - Name of the scoring function
   * @param {object} opts - Scorer options
   * @param {string} opts.test_command - Command to run tests
   * @param {number} [opts.weight] - Weight for this scorer (default: 1.0)
   * @param {ScoringFunction.TestBasedScoringFunction.TestFile[]} [opts.test_files] - Test files to create before running
   * @returns {this} Builder for chaining
   */
  addTestCommandScorer(
    name: string,
    opts: {
      test_command: string;
      weight?: number;
      test_files?: ScoringFunction.TestBasedScoringFunction.TestFile[];
    },
  ): this {
    const scorer: ScoringFunction.TestBasedScoringFunction = {
      type: 'test_based_scorer',
      test_command: opts.test_command,
      ...(opts.test_files !== undefined && { test_files: opts.test_files }),
    };
    return this.addScorer(name, opts.weight ?? 1.0, scorer);
  }

  /**
   * Add a command scorer that runs a shell command.
   * Scoring passes if the command returns exit code 0.
   *
   * @param {string} name - Name of the scoring function
   * @param {object} opts - Scorer options
   * @param {string} opts.command - Shell command to execute
   * @param {number} [opts.weight] - Weight for this scorer (default: 1.0)
   * @returns {this} Builder for chaining
   */
  addShellCommandScorer(name: string, opts: { command: string; weight?: number }): this {
    const scorer: ScoringFunction.CommandScoringFunction = {
      type: 'command_scorer',
      command: opts.command,
    };
    return this.addScorer(name, opts.weight ?? 1.0, scorer);
  }

  /**
   * Add a standalone bash script scorer.
   * The script should output "score=X.X" where X.X is a float between 0.0 and 1.0.
   *
   * @param {string} name - Name of the scoring function
   * @param {object} opts - Scorer options
   * @param {string} opts.bash_script - Bash script content
   * @param {number} [opts.weight] - Weight for this scorer (default: 1.0)
   * @returns {this} Builder for chaining
   */
  addBashScriptScorer(name: string, opts: { bash_script: string; weight?: number }): this {
    const scorer: ScoringFunction.BashScriptScoringFunction = {
      type: 'bash_script_scorer',
      bash_script: opts.bash_script,
    };
    return this.addScorer(name, opts.weight ?? 1.0, scorer);
  }

  /**
   * Add a standalone Python script scorer.
   * The script should print the score in the range [0.0, 1.0] to stdout.
   *
   * @param {string} name - Name of the scoring function
   * @param {object} opts - Scorer options
   * @param {string} opts.python_script - Python script content
   * @param {number} [opts.weight] - Weight for this scorer (default: 1.0)
   * @param {string} [opts.python_version_constraint] - Python version (default "==3.12.10")
   * @param {string} [opts.requirements_contents] - pip requirements.txt content
   * @returns {this} Builder for chaining
   */
  addPythonScriptScorer(
    name: string,
    opts: {
      python_script: string;
      weight?: number;
      python_version_constraint?: string;
      requirements_contents?: string;
    },
  ): this {
    const scorer: ScoringFunction.PythonScriptScoringFunction = {
      type: 'python_script_scorer',
      python_script: opts.python_script,
      ...(opts.python_version_constraint !== undefined && {
        python_version_constraint: opts.python_version_constraint,
      }),
      ...(opts.requirements_contents !== undefined && { requirements_contents: opts.requirements_contents }),
    };
    return this.addScorer(name, opts.weight ?? 1.0, scorer);
  }

  /**
   * Add an AST grep scorer that matches code patterns.
   *
   * @param {string} name - Name of the scoring function
   * @param {object} opts - Scorer options
   * @param {string} opts.pattern - AST pattern to match
   * @param {number} [opts.weight] - Weight for this scorer (default: 1.0)
   * @param {string} [opts.search_directory] - Directory to search (default: ".")
   * @param {string} [opts.lang] - Language of the pattern
   * @returns {this} Builder for chaining
   */
  addAstGrepScorer(
    name: string,
    opts: {
      pattern: string;
      weight?: number;
      search_directory?: string;
      lang?: string;
    },
  ): this {
    const scorer: ScoringFunction.AstGrepScoringFunction = {
      type: 'ast_grep_scorer',
      pattern: opts.pattern,
      search_directory: opts.search_directory ?? '.',
      ...(opts.lang !== undefined && { lang: opts.lang }),
    };
    return this.addScorer(name, opts.weight ?? 1.0, scorer);
  }

  /**
   * Add a custom scorer registered with Runloop.
   *
   * @param {string} name - Name of the scoring function
   * @param {object} opts - Scorer options
   * @param {string} opts.custom_scorer_type - Type identifier registered with Runloop
   * @param {number} [opts.weight] - Weight for this scorer (default: 1.0)
   * @param {unknown} [opts.scorer_params] - Additional JSON parameters for the scorer
   * @returns {this} Builder for chaining
   */
  addCustomScorer(
    name: string,
    opts: {
      custom_scorer_type: string;
      weight?: number;
      scorer_params?: unknown;
    },
  ): this {
    const scorer: ScoringFunction.CustomScoringFunction = {
      type: 'custom_scorer',
      custom_scorer_type: opts.custom_scorer_type,
      ...(opts.scorer_params !== undefined && { scorer_params: opts.scorer_params }),
    };
    return this.addScorer(name, opts.weight ?? 1.0, scorer);
  }

  /**
   * Set metadata for the scenario.
   *
   * @param {Record<string, string>} metadata - Key-value metadata
   * @returns {this} Builder for chaining
   */
  withMetadata(metadata: Record<string, string>): this {
    this._metadata = metadata;
    return this;
  }

  /**
   * Set the reference solution or gold patch for validation.
   *
   * @param {string} output - Reference solution (e.g., git diff)
   * @returns {this} Builder for chaining
   */
  withReferenceOutput(output: string): this {
    this._referenceOutput = output;
    return this;
  }

  /**
   * Set required environment variables.
   *
   * @param {string[]} envVars - List of required environment variable names
   * @returns {this} Builder for chaining
   */
  withRequiredEnvVars(envVars: string[]): this {
    this._requiredEnvVars = envVars;
    return this;
  }

  /**
   * Set required secrets.
   *
   * @param {string[]} secrets - List of required secret names
   * @returns {this} Builder for chaining
   */
  withRequiredSecrets(secrets: string[]): this {
    this._requiredSecrets = secrets;
    return this;
  }

  /**
   * Set the validation strategy.
   *
   * @param {'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'} validationType - Validation type
   * @returns {this} Builder for chaining
   */
  withValidationType(validationType: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'): this {
    this._validationType = validationType;
    return this;
  }

  /**
   * Build the scenario creation parameters.
   *
   * Validates that required fields are set and normalizes scorer weights
   * to sum to 1.0.
   *
   * @example
   * ```typescript
   * const params = builder.build();
   * // Use params with the raw API client
   * const scenarioView = await client.scenarios.create(params);
   * ```
   *
   * @returns {ScenarioCreateParams} Parameters for scenario creation
   * @throws {Error} If problem statement is missing or no scorers are configured
   */
  build(): ScenarioCreateParams {
    if (!this._problemStatement) {
      throw new Error('Problem statement is required. Call withProblemStatement() first.');
    }

    if (this._scorers.length === 0) {
      throw new Error(
        'At least one scorer is required. ' +
          'Call addTestCommandScorer(), addBashScriptScorer(), or another scorer method first.',
      );
    }

    const totalWeight = this._scorers.reduce((sum, s) => sum + s.weight, 0);
    const normalizedScorers: ScoringFunction[] = this._scorers.map((s) => ({
      ...s,
      weight: s.weight / totalWeight,
    }));

    const environmentParameters: ScenarioEnvironment | null =
      this._blueprint || this._snapshot || this._workingDirectory ?
        {
          blueprint_id: this._blueprint?.id ?? null,
          snapshot_id: this._snapshot?.id ?? null,
          working_directory: this._workingDirectory ?? null,
        }
      : null;

    return {
      name: this._name,
      input_context: {
        problem_statement: this._problemStatement,
        ...(this._additionalContext !== null && { additional_context: this._additionalContext }),
      },
      scoring_contract: {
        scoring_function_parameters: normalizedScorers,
      },
      ...(environmentParameters !== null && { environment_parameters: environmentParameters }),
      ...(Object.keys(this._metadata).length > 0 && { metadata: this._metadata }),
      ...(this._referenceOutput !== null && { reference_output: this._referenceOutput }),
      ...(this._requiredEnvVars !== null && { required_environment_variables: this._requiredEnvVars }),
      ...(this._requiredSecrets !== null && { required_secret_names: this._requiredSecrets }),
      ...(this._validationType !== null && { validation_type: this._validationType }),
    };
  }

  /**
   * Create the scenario on the platform.
   *
   * Calls {@link build} to validate and assemble parameters, then creates
   * the scenario via the API.
   *
   * @example
   * ```typescript
   * const scenario = await runloop.scenario
   *   .builder('my-scenario')
   *   .withProblemStatement('Fix the bug')
   *   .addTestCommandScorer('tests', { test_command: 'pytest' })
   *   .push();
   * console.log(`Created scenario: ${scenario.id}`);
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Scenario>} Created {@link Scenario} instance
   * @throws {Error} If required fields are missing
   */
  async push(options?: Core.RequestOptions): Promise<Scenario> {
    const params = this.build();
    const view = await this.client.scenarios.create(params, options);
    return Scenario.fromId(this.client, view.id);
  }

  private addScorer(name: string, weight: number, scorer: ScoringFunction['scorer']): this {
    if (!Number.isFinite(weight) || weight <= 0) {
      throw new Error(`Scorer weight must be a finite positive number, got ${weight}`);
    }
    this._scorers.push({ name, weight, scorer });
    return this;
  }
}
