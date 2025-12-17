import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  ScenarioCreateParams,
  ScenarioEnvironment,
  ScoringContract,
  ScoringFunction,
  InputContext,
  ScenarioView,
} from '../resources/scenarios/scenarios';
import { RunloopError } from '../error';
import { Scenario } from './scenario';
import type { Blueprint } from './blueprint';
import type { Snapshot } from './snapshot';

/**
 * Configuration for a test file in a test-based scorer.
 *
 * These types are not unit tests of this SDK; they are files that Runloop will
 * write into the scenario environment before executing the `test_command` for scoring.
 */
export type TestFile = ScoringFunction.TestBasedScoringFunction.TestFile;

/**
 * Alias for {@link TestFile} with a more explicit name.
 *
 * These files are written into the scenario environment as part of scoring for a
 * `test_based_scorer`. They are not unit tests of the SDK itself.
 */
export type ScenarioTestFile = TestFile;

/**
 * Internal scorer configuration used during building.
 */
interface ScorerConfig {
  name: string;
  weight: number | undefined;
  weightWasProvided: boolean;
  scorer: ScoringFunction['scorer'];
}

/**
 * Preview of a scenario configuration before pushing to the platform.
 * Composes from existing API types with relaxed constraints for preview state.
 *
 * Note: Some fields allow `null` to represent "not yet set" state during building,
 * which differs from the API response types that use `undefined` for optional fields.
 */
export interface ScenarioPreview {
  name: string;
  /** Input context with nullable problem_statement for preview state */
  input_context: {
    problem_statement: string | null;
    additional_context?: InputContext['additional_context'];
  };
  scoring_contract: Pick<ScoringContract, 'scoring_function_parameters'>;
  environment?: ScenarioEnvironment | null;
  metadata?: ScenarioView['metadata'];
  reference_output?: string | null;
  required_environment_variables?: Array<string> | null;
  required_secret_names?: Array<string> | null;
  validation_type?: ScenarioView['validation_type'];
}

/**
 * Builder for constructing scenarios with a fluent API.
 *
 * @category Scenario
 *
 * @remarks
 * ## Overview
 *
 * The `ScenarioBuilder` provides a step-by-step interface for configuring all aspects
 * of a scenario before pushing it to the platform. Use method chaining to build up
 * the scenario configuration, then call `push()` to create it.
 *
 * ## Usage
 *
 * @example
 * ```typescript
 * const builder = runloop.scenario.builder('my-scenario')
 *   .fromBlueprint(blueprint)
 *   .withWorkingDirectory('/app')
 *   .withProblemStatement('Fix the bug in main.py')
 *   .addTestCommandScorer('tests', { testCommand: 'pytest' });
 *
 * // Preview before pushing
 * const preview = builder.preview();
 *
 * // Or build params for manual creation
 * const params = builder.build();
 *
 * // Or push directly
 * const scenario = await builder.push();
 * ```
 */
export class ScenarioBuilder {
  private client: Runloop;
  private _name: string;

  // Environment configuration
  private _blueprint: Blueprint | null = null;
  private _snapshot: Snapshot | null = null;
  private _workingDirectory: string | null = null;

  // Input context
  private _problemStatement: string | null = null;
  private _additionalContext: unknown | null = null;

  // Scoring
  private _scorers: ScorerConfig[] = [];

  // Metadata and other options
  private _metadata: { [key: string]: string } = {};
  private _referenceOutput: string | null = null;
  private _requiredEnvVars: string[] | null = null;
  private _requiredSecrets: string[] | null = null;
  private _validationType: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION' | null = null;

  /**
   * Create a new ScenarioBuilder.
   *
   * @param {string} name - Name for the scenario
   * @param {Runloop} client - Runloop client instance
   */
  constructor(name: string, client: Runloop) {
    this.client = client;
    this._name = name;
  }

  /**
   * Get the scenario name.
   * @returns {string} Scenario name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Set a blueprint to define the baseline environment for the scenario.
   *
   * @param {Blueprint} blueprint - Blueprint to use
   * @returns {this} Self for method chaining
   */
  fromBlueprint(blueprint: Blueprint): this {
    this._blueprint = blueprint;
    this._snapshot = null; // Clear snapshot if blueprint is set
    return this;
  }

  /**
   * Set a snapshot to define the baseline environment for the scenario.
   *
   * @param {Snapshot} snapshot - Snapshot to use
   * @returns {this} Self for method chaining
   */
  fromSnapshot(snapshot: Snapshot): this {
    this._snapshot = snapshot;
    this._blueprint = null; // Clear blueprint if snapshot is set
    return this;
  }

  /**
   * Set the working directory for the scenario.
   *
   * @param {string} directory - Working directory path
   * @returns {this} Self for method chaining
   */
  withWorkingDirectory(directory: string): this {
    this._workingDirectory = directory;
    return this;
  }

  /**
   * Set the problem statement for the scenario.
   * This will be provided as input context to the agent.
   *
   * @param {string} statement - Problem statement text
   * @returns {this} Self for method chaining
   */
  withProblemStatement(statement: string): this {
    this._problemStatement = statement;
    return this;
  }

  /**
   * Set additional structured context for the scenario.
   * This can be used to provide additional information to the agent,
   * such as hints, examples, or other relevant information.
   *
   * @param {unknown} context - Additional context (JSON-serializable)
   * @returns {this} Self for method chaining
   */
  withAdditionalContext(context: unknown): this {
    this._additionalContext = context;
    return this;
  }

  /**
   * Internal helper to add a scorer to the list.
   * @private
   */
  private addScorer(
    name: string,
    weight: number | undefined,
    weightWasProvided: boolean,
    scorer: ScoringFunction['scorer'],
  ): this {
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      throw new RunloopError(`Scorer name must only contain [a-zA-Z0-9_-], got ${JSON.stringify(name)}`);
    }

    if (weightWasProvided) {
      if (typeof weight !== 'number' || !Number.isFinite(weight)) {
        throw new RunloopError(`Scorer weight must be a finite number, got ${String(weight)}`);
      }
      if (weight <= 0) {
        throw new RunloopError(`Scorer weight must be positive, got ${weight}`);
      }
    }

    this._scorers.push({ name, weight, weightWasProvided, scorer });
    return this;
  }

  /**
   * Add a test-based scorer that runs a test command.
   *
   * @example
   * ```typescript
   * builder.addTestCommandScorer('unit-tests', {
   *   testCommand: 'pytest tests/',
   *   testFiles: [
   *     { file_path: 'tests/test_new.py', file_contents: 'def test_example(): assert True' }
   *   ]
   * });
   * ```
   *
   * @param {string} name - Name of the scoring function
   * @param {object} params - Scorer parameters
   * @param {string} params.testCommand - Command to run tests (e.g., "pytest")
   * @param {number} [params.weight] - Weight for this scorer. If any scorer specifies a weight, all scorers must and their weights must sum to 1.0.
   * @param {TestFile[]} [params.testFiles] - Optional test files to create before running
   * @returns {this} Self for method chaining
   */
  addTestCommandScorer(
    name: string,
    params: {
      testCommand: string;
      weight?: number;
      testFiles?: TestFile[];
    },
  ): this {
    const scorer: ScoringFunction.TestBasedScoringFunction = {
      type: 'test_based_scorer',
      test_command: params.testCommand,
    };
    if (params.testFiles) {
      scorer.test_files = params.testFiles;
    }
    const weightWasProvided = params.weight !== undefined;
    return this.addScorer(name, params.weight, weightWasProvided, scorer);
  }

  /**
   * Add a command scorer that runs a shell command.
   *
   * @example
   * ```typescript
   * builder.addShellCommandScorer('lint-check', {
   *   command: 'npm run lint'
   * });
   * ```
   *
   * @param {string} name - Name of the scoring function
   * @param {object} params - Scorer parameters
   * @param {string} params.command - Shell command to execute
   * @param {number} [params.weight] - Weight for this scorer. If any scorer specifies a weight, all scorers must and their weights must sum to 1.0.
   * @returns {this} Self for method chaining
   */
  addShellCommandScorer(
    name: string,
    params: {
      command: string;
      weight?: number;
    },
  ): this {
    const scorer: ScoringFunction.CommandScoringFunction = {
      type: 'command_scorer',
      command: params.command,
    };
    const weightWasProvided = params.weight !== undefined;
    return this.addScorer(name, params.weight, weightWasProvided, scorer);
  }

  /**
   * Add a standalone bash script scorer.
   *
   * The script should output "score=X.X" where X.X is a float between 0.0 and 1.0, inclusive.
   *
   * @example
   * ```typescript
   * builder.addBashScriptScorer('custom-check', {
   *   bashScript: `
   *     if grep -q "TODO" src/*.ts; then
   *       echo "score=0.0"
   *     else
   *       echo "score=1.0"
   *     fi
   *   `
   * });
   * ```
   *
   * @param {string} name - Name of the scoring function
   * @param {object} params - Scorer parameters
   * @param {string} params.bashScript - Bash script content
   * @param {number} [params.weight] - Weight for this scorer. If any scorer specifies a weight, all scorers must and their weights must sum to 1.0.
   * @returns {this} Self for method chaining
   */
  addBashScriptScorer(
    name: string,
    params: {
      bashScript: string;
      weight?: number;
    },
  ): this {
    const scorer: ScoringFunction.BashScriptScoringFunction = {
      type: 'bash_script_scorer',
      bash_script: params.bashScript,
    };
    const weightWasProvided = params.weight !== undefined;
    return this.addScorer(name, params.weight, weightWasProvided, scorer);
  }

  /**
   * Add a standalone Python script scorer.
   *
   * The script is run in an isolated uv environment, and the dependencies are declared
   * in the uv script header. The script should print the score in the range [0.0, 1.0] to stdout.
   *
   * @example
   * ```typescript
   * builder.addPythonScriptScorer('python-check', {
   *   pythonScript: `
   *     import json
   *     with open('results.json') as f:
   *       results = json.load(f)
   *     score = results['passed'] / results['total']
   *     print(score)
   *   `
   * });
   * ```
   *
   * @param {string} name - Name of the scoring function
   * @param {object} params - Scorer parameters
   * @param {string} params.pythonScript - Python script content
   * @param {number} [params.weight] - Weight for this scorer. If any scorer specifies a weight, all scorers must and their weights must sum to 1.0.
   * @param {string} [params.pythonVersionConstraint] - Python version (default "==3.12.10")
   * @param {string} [params.requirementsContents] - pip requirements.txt content
   * @returns {this} Self for method chaining
   */
  addPythonScriptScorer(
    name: string,
    params: {
      pythonScript: string;
      weight?: number;
      pythonVersionConstraint?: string;
      requirementsContents?: string;
    },
  ): this {
    const scorer: ScoringFunction.PythonScriptScoringFunction = {
      type: 'python_script_scorer',
      python_script: params.pythonScript,
    };
    if (params.pythonVersionConstraint) {
      scorer.python_version_constraint = params.pythonVersionConstraint;
    }
    if (params.requirementsContents) {
      scorer.requirements_contents = params.requirementsContents;
    }
    const weightWasProvided = params.weight !== undefined;
    return this.addScorer(name, params.weight, weightWasProvided, scorer);
  }

  /**
   * Add an AST grep scorer that matches code patterns.
   *
   * @example
   * ```typescript
   * builder.addAstGrepScorer('pattern-check', {
   *   pattern: 'console.log($$$)',
   *   searchDirectory: 'src/',
   *   lang: 'typescript'
   * });
   * ```
   *
   * @param {string} name - Name of the scoring function
   * @param {object} params - Scorer parameters
   * @param {string} params.pattern - AST pattern to match
   * @param {number} [params.weight] - Weight for this scorer. If any scorer specifies a weight, all scorers must and their weights must sum to 1.0.
   * @param {string} [params.searchDirectory="."] - Directory to search (default ".")
   * @param {string} [params.lang] - Language of the pattern (optional)
   * @returns {this} Self for method chaining
   */
  addAstGrepScorer(
    name: string,
    params: {
      pattern: string;
      weight?: number;
      searchDirectory?: string;
      lang?: string;
    },
  ): this {
    const scorer: ScoringFunction.AstGrepScoringFunction = {
      type: 'ast_grep_scorer',
      pattern: params.pattern,
      search_directory: params.searchDirectory ?? '.',
    };
    if (params.lang) {
      scorer.lang = params.lang;
    }
    const weightWasProvided = params.weight !== undefined;
    return this.addScorer(name, params.weight, weightWasProvided, scorer);
  }

  /**
   * Add a custom scorer registered with Runloop.
   *
   * @example
   * ```typescript
   * builder.addCustomScorer('my-scorer', {
   *   customScorerType: 'my_custom_scorer',
   *   scorerParams: { threshold: 0.8 }
   * });
   * ```
   *
   * @param {string} name - Name of the scoring function
   * @param {object} params - Scorer parameters
   * @param {string} params.customScorerType - Type identifier registered with Runloop
   * @param {number} [params.weight] - Weight for this scorer. If any scorer specifies a weight, all scorers must and their weights must sum to 1.0.
   * @param {unknown} [params.scorerParams] - Additional JSON parameters for the scorer
   * @returns {this} Self for method chaining
   */
  addCustomScorer(
    name: string,
    params: {
      customScorerType: string;
      weight?: number;
      scorerParams?: unknown;
    },
  ): this {
    const scorer: ScoringFunction.CustomScoringFunction = {
      type: 'custom_scorer',
      custom_scorer_type: params.customScorerType,
    };
    if (params.scorerParams !== undefined) {
      scorer.scorer_params = params.scorerParams;
    }
    const weightWasProvided = params.weight !== undefined;
    return this.addScorer(name, params.weight, weightWasProvided, scorer);
  }

  /**
   * Set metadata for the scenario.
   *
   * @param {Record<string, string>} metadata - Key-value metadata
   * @returns {this} Self for method chaining
   */
  withMetadata(metadata: { [key: string]: string }): this {
    this._metadata = metadata;
    return this;
  }

  /**
   * Set the reference solution or gold patch for validation.
   * After application, the scorer is expected to return a score of 1.0.
   *
   * @param {string} output - Reference solution or gold patch (e.g., git diff)
   * @returns {this} Self for method chaining
   */
  withReferenceOutput(output: string): this {
    this._referenceOutput = output;
    return this;
  }

  /**
   * Set required environment variables.
   *
   * @param {string[]} envVars - List of required environment variable names
   * @returns {this} Self for method chaining
   */
  withRequiredEnvVars(envVars: string[]): this {
    this._requiredEnvVars = envVars;
    return this;
  }

  /**
   * Set required secrets.
   *
   * @param {string[]} secrets - List of required secret names
   * @returns {this} Self for method chaining
   */
  withRequiredSecrets(secrets: string[]): this {
    this._requiredSecrets = secrets;
    return this;
  }

  /**
   * Set the validation strategy to specify how the reference solution or gold patch
   * is applied to the scenario.
   *
   * @param {'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'} validationType - Validation type
   * @returns {this} Self for method chaining
   */
  withValidationType(validationType: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'): this {
    this._validationType = validationType;
    return this;
  }

  /**
   * Build scorers list with weights summing to 1.0.
   *
   * Weight policy:
   * - If no weights are provided, weights default to 1.0 (n=1) or equal weights (n>1).\n
   * - If weights are provided, all scorers must provide weights and their sum must be 1.0.\n
   * - Mixed explicit/implicit weights is an error.\n
   * @private
   */
  private buildNormalizedScorers(): ScoringFunction[] {
    const n = this._scorers.length;
    const providedCount = this._scorers.filter((s) => s.weightWasProvided).length;

    if (providedCount !== 0 && providedCount !== n) {
      throw new RunloopError(
        `Either provide weights for all scorers or for none. Got ${providedCount} of ${n} scorers with an explicit weight.`,
      );
    }

    // No weights provided: default weights.
    if (providedCount === 0) {
      if (n === 1) {
        const only = this._scorers[0]!;
        return [{ name: only.name, weight: 1.0, scorer: only.scorer }];
      }

      // Equal weights, with the last entry set to the remainder so the sum is exactly 1.0.
      const base = 1.0 / n;
      const weights = new Array<number>(n).fill(base);
      const sumFirst = base * (n - 1);
      weights[n - 1] = 1.0 - sumFirst;

      return this._scorers.map((s, i) => ({
        name: s.name,
        weight: weights[i]!,
        scorer: s.scorer,
      }));
    }

    // All weights provided: validate and enforce sum==1.0.
    const weights = this._scorers.map((s) => s.weight as number);
    const sum = weights.reduce((acc, w) => acc + w, 0);
    const tolerance = 1e-9;

    // this is just some handling for typescript number representation weirdness
    // and general lack of floating point precision.
    if (!Number.isFinite(sum) || Math.abs(sum - 1.0) > tolerance) {
      throw new RunloopError(`Scorer weights must sum to 1.0, got ${sum}`);
    }

    if (n === 1) {
      const only = this._scorers[0]!;
      return [{ name: only.name, weight: 1.0, scorer: only.scorer }];
    }

    // Adjust last weight by remainder to guarantee exact sum.
    const sumOthers = weights.slice(0, n - 1).reduce((acc, w) => acc + w, 0);
    const last = 1.0 - sumOthers;
    if (!Number.isFinite(last) || last <= 0) {
      throw new RunloopError(`Invalid scorer weights: last weight would be ${last}`);
    }
    weights[n - 1] = last;

    return this._scorers.map((s, i) => ({
      name: s.name,
      weight: weights[i]!,
      scorer: s.scorer,
    }));
  }

  /**
   * Build a best-effort normalized scorers list for preview purposes.
   *
   * This is intentionally more permissive than `buildNormalizedScorers()` so that
   * `preview()` does not throw for partial/in-progress builder states.
   * @private
   */
  private buildPreviewScorers(): ScoringFunction[] {
    const n = this._scorers.length;
    if (n === 0) return [];

    // Treat missing weights as 1.0 for preview, and drop invalid weights to 0.
    const rawWeights = this._scorers.map((s) => (s.weightWasProvided ? (s.weight as number) : 1.0));
    const safeWeights = rawWeights.map((w) => (typeof w === 'number' && Number.isFinite(w) && w > 0 ? w : 0));
    const total = safeWeights.reduce((acc, w) => acc + w, 0);
    if (!Number.isFinite(total) || total <= 0) return [];

    return this._scorers.map((s, i) => ({
      name: s.name,
      weight: safeWeights[i]! / total,
      scorer: s.scorer,
    }));
  }

  /**
   * Build environment parameters.
   * @private
   */
  private buildEnvironmentParams(): ScenarioEnvironment | null {
    if (!this._blueprint && !this._snapshot && !this._workingDirectory) {
      return null;
    }
    return {
      ...(this._blueprint ? { blueprint_id: this._blueprint.id } : {}),
      ...(this._snapshot ? { snapshot_id: this._snapshot.id } : {}),
      ...(this._workingDirectory ? { working_directory: this._workingDirectory } : {}),
    };
  }

  /**
   * Build the scenario creation parameters.
   *
   * Weights are automatically normalized to sum to 1.0.
   *
   * @throws {RunloopError} If required fields are missing
   * @returns {ScenarioCreateParams} Parameters for scenario creation
   */
  build(): ScenarioCreateParams {
    if (!this._problemStatement) {
      throw new RunloopError('Problem statement is required. Call withProblemStatement() first.');
    }

    if (this._scorers.length === 0) {
      throw new RunloopError(
        'At least one scorer is required. ' +
          'Call addTestCommandScorer(), addBashScriptScorer(), or another scorer method first.',
      );
    }

    const scoringContract: ScoringContract = {
      scoring_function_parameters: this.buildNormalizedScorers(),
    };

    const inputContext: ScenarioCreateParams['input_context'] = {
      problem_statement: this._problemStatement,
      ...(this._additionalContext !== null ? { additional_context: this._additionalContext } : {}),
    };

    const params: ScenarioCreateParams = {
      name: this._name,
      input_context: inputContext,
      scoring_contract: scoringContract,
    };

    const envParams = this.buildEnvironmentParams();
    if (envParams) {
      params.environment_parameters = envParams;
    }

    if (Object.keys(this._metadata).length > 0) {
      params.metadata = this._metadata;
    }

    if (this._referenceOutput !== null) {
      params.reference_output = this._referenceOutput;
    }

    if (this._requiredEnvVars !== null) {
      params.required_environment_variables = this._requiredEnvVars;
    }

    if (this._requiredSecrets !== null) {
      params.required_secret_names = this._requiredSecrets;
    }

    if (this._validationType !== null) {
      params.validation_type = this._validationType;
    }

    return params;
  }

  /**
   * Preview the scenario configuration without pushing to the platform.
   *
   * Returns the current configuration state as a ScenarioPreview object.
   * Does not validate or raise errors for missing required fields.
   *
   * @returns {ScenarioPreview} Preview of the scenario configuration
   */
  preview(): ScenarioPreview {
    return {
      name: this._name,
      input_context: {
        problem_statement: this._problemStatement,
        additional_context: this._additionalContext,
      },
      scoring_contract: {
        scoring_function_parameters: this.buildPreviewScorers(),
      },
      environment: this.buildEnvironmentParams(),
      metadata: this._metadata,
      reference_output: this._referenceOutput,
      required_environment_variables: this._requiredEnvVars,
      required_secret_names: this._requiredSecrets,
      validation_type: this._validationType,
    };
  }

  /**
   * Create the scenario on the platform.
   *
   * @example
   * ```typescript
   * const scenario = await runloop.scenario.builder('my-scenario')
   *   .withProblemStatement('Fix the bug')
   *   .addTestCommandScorer('tests', { testCommand: 'npm test' })
   *   .push();
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @throws {RunloopError} If required fields are missing
   * @returns {Promise<Scenario>} Created scenario wrapper
   */
  async push(options?: Core.RequestOptions): Promise<Scenario> {
    const params = this.build();
    const scenarioView = await this.client.scenarios.create(params, options);
    return Scenario.fromId(this.client, scenarioView.id);
  }
}
