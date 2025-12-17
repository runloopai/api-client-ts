import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  ScenarioRunView,
  ScoringContractResultView,
} from '../resources/scenarios/scenarios';
import type { DevboxView } from '../resources/devboxes/devboxes';
import type { PollingOptions } from '../lib/polling';
import type { Response } from '../_shims/index';
import { Devbox } from './devbox';

/**
 * Object-oriented interface for working with Scenario Runs.
 *
 * @category Scenario
 *
 * @remarks
 * ## Overview
 *
 * The `ScenarioRun` class provides a high-level API for managing scenario runs.
 * A scenario run represents a single execution of a scenario on a devbox, including
 * access to the devbox for agent interactions and methods for scoring and completion.
 *
 * ## Usage
 *
 * Obtain instances via `scenario.run()` or `scenario.runAsync()`:
 *
 * @example
 * ```typescript
 * const scenario = runloop.scenario.fromId('scn-xxx');
 * const run = await scenario.run();
 *
 * // Access the devbox
 * const result = await run.devbox.cmd.exec('echo "Hello"');
 *
 * // Score and complete
 * await run.scoreAndComplete();
 * const score = await run.getScore();
 * ```
 */
export class ScenarioRun {
  private client: Runloop;
  private _id: string;
  private _devboxId: string;
  private _devbox: Devbox | undefined;

  private constructor(client: Runloop, runId: string, devboxId: string) {
    this.client = client;
    this._id = runId;
    this._devboxId = devboxId;
  }

  /**
   * Create a ScenarioRun instance from a ScenarioRunView.
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {ScenarioRunView} runView - The scenario run view from the API
   * @returns {ScenarioRun} A ScenarioRun instance
   */
  static fromRunView(client: Runloop, runView: ScenarioRunView): ScenarioRun {
    return new ScenarioRun(client, runView.id, runView.devbox_id);
  }

  /**
   * Create a ScenarioRun instance by ID and devbox ID.
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} runId - The scenario run ID
   * @param {string} devboxId - The devbox ID associated with this run
   * @returns {ScenarioRun} A ScenarioRun instance
   */
  static fromId(client: Runloop, runId: string, devboxId: string): ScenarioRun {
    return new ScenarioRun(client, runId, devboxId);
  }

  /**
   * Get the scenario run ID.
   * @returns {string} The scenario run ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the devbox ID associated with this run.
   * @returns {string} The devbox ID
   */
  get devboxId(): string {
    return this._devboxId;
  }

  /**
   * The devbox instance for this scenario run.
   *
   * Use this to interact with the devbox environment during the scenario run.
   * The devbox is lazily loaded on first access.
   *
   * @example
   * ```typescript
   * const run = await scenario.run();
   * // Execute commands on the devbox
   * const result = await run.devbox.cmd.exec('npm test');
   * // Read/write files
   * const content = await run.devbox.file.read({ file_path: '/app/output.txt' });
   * ```
   *
   * @returns {Devbox} Devbox instance
   */
  get devbox(): Devbox {
    if (!this._devbox) {
      this._devbox = Devbox.fromId(this.client, this._devboxId);
    }
    return this._devbox;
  }

  /**
   * Retrieve current scenario run status and metadata.
   *
   * @example
   * ```typescript
   * const info = await run.getInfo();
   * console.log(`Run state: ${info.state}`);
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScenarioRunView>} Current scenario run state info
   */
  async getInfo(options?: Core.RequestOptions): Promise<ScenarioRunView> {
    return this.client.scenarios.runs.retrieve(this._id, options);
  }

  /**
   * Wait for the scenario environment (devbox) to be ready.
   *
   * Blocks until the devbox reaches running state.
   *
   * @example
   * ```typescript
   * const run = await scenario.runAsync();
   * await run.awaitEnvReady();
   * // Now the devbox is ready for commands
   * ```
   *
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<ScenarioRunView>} Scenario run state after environment is ready
   */
  async awaitEnvReady(
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<ScenarioRunView> {
    await this.client.devboxes.awaitRunning(this._devboxId, options);
    return this.getInfo(options);
  }

  /**
   * Submit the scenario run for scoring.
   *
   * This triggers the scoring process using the scenario's scoring contract.
   *
   * @example
   * ```typescript
   * await run.score();
   * // Then wait for scoring to complete
   * await run.awaitScored();
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScenarioRunView>} Updated scenario run state
   */
  async score(options?: Core.RequestOptions): Promise<ScenarioRunView> {
    return this.client.scenarios.runs.score(this._id, options);
  }

  /**
   * Wait for the scenario run to be scored.
   *
   * Blocks until scoring is complete.
   *
   * @example
   * ```typescript
   * await run.score();
   * const scored = await run.awaitScored();
   * console.log(`Score: ${scored.scoring_contract_result?.score}`);
   * ```
   *
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<ScenarioRunView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<ScenarioRunView>} Scored scenario run state
   */
  async awaitScored(
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<ScenarioRunView>> },
  ): Promise<ScenarioRunView> {
    return this.client.scenarios.runs.awaitScored(this._id, options);
  }

  /**
   * Submit for scoring and wait for completion.
   *
   * Convenience method that calls score() then awaitScored().
   *
   * @example
   * ```typescript
   * const scored = await run.scoreAndAwait();
   * console.log(`Final score: ${scored.scoring_contract_result?.score}`);
   * ```
   *
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<ScenarioRunView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<ScenarioRunView>} Scored scenario run state
   */
  async scoreAndAwait(
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<ScenarioRunView>> },
  ): Promise<ScenarioRunView> {
    return this.client.scenarios.runs.scoreAndAwait(this._id, options);
  }

  /**
   * Score the run, wait for scoring, then complete and shutdown.
   *
   * Convenience method that scores the scenario run, waits for scoring to
   * finish, then completes the run and shuts down the devbox.
   *
   * @example
   * ```typescript
   * // Complete workflow
   * const run = await scenario.run();
   * await run.devbox.cmd.exec('npm test');
   * const completed = await run.scoreAndComplete();
   * console.log(`Final score: ${completed.scoring_contract_result?.score}`);
   * ```
   *
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<ScenarioRunView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<ScenarioRunView>} Completed scenario run state with scoring results
   */
  async scoreAndComplete(
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<ScenarioRunView>> },
  ): Promise<ScenarioRunView> {
    return this.client.scenarios.runs.scoreAndComplete(this._id, options);
  }

  /**
   * Complete the scenario run and shutdown the devbox.
   *
   * @example
   * ```typescript
   * await run.complete();
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScenarioRunView>} Final scenario run state
   */
  async complete(options?: Core.RequestOptions): Promise<ScenarioRunView> {
    return this.client.scenarios.runs.complete(this._id, options);
  }

  /**
   * Cancel the scenario run and shutdown the devbox.
   *
   * @example
   * ```typescript
   * await run.cancel();
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScenarioRunView>} Cancelled scenario run state
   */
  async cancel(options?: Core.RequestOptions): Promise<ScenarioRunView> {
    return this.client.scenarios.runs.cancel(this._id, options);
  }

  /**
   * Download all logs for this scenario run as a zip file.
   *
   * Downloads a zip archive containing all logs from the scenario run's
   * associated devbox.
   *
   * @example
   * ```typescript
   * const response = await run.downloadLogs();
   * // Write to file using appropriate method for your environment
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Response>} Response containing the zip file
   */
  async downloadLogs(options?: Core.RequestOptions): Promise<Response> {
    return this.client.scenarios.runs.downloadLogs(this._id, options);
  }

  /**
   * Get the scoring result for this run.
   *
   * Returns null if the run has not been scored yet. Always makes an API
   * call to retrieve the current scoring result.
   *
   * @example
   * ```typescript
   * const score = await run.getScore();
   * if (score) {
   *   console.log(`Score: ${score.score}`);
   *   for (const result of score.scoring_function_results) {
   *     console.log(`  ${result.scoring_function_name}: ${result.score}`);
   *   }
   * }
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScoringContractResultView | null>} Scoring result or null if not yet scored
   */
  async getScore(options?: Core.RequestOptions): Promise<ScoringContractResultView | null> {
    const info = await this.getInfo(options);
    return info.scoring_contract_result ?? null;
  }
}

