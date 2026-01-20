import { Runloop } from '../index';
import type * as Core from '../core';
import type { ScenarioRunView, ScoringContractResultView } from '../resources/scenarios/scenarios';
import type { DevboxView } from '../resources/devboxes/devboxes';
import { PollingOptions } from '../lib/polling';
import { Devbox } from './devbox';
import * as fs from 'fs';
import * as path from 'path';

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
 * the ability to interact with the devbox, score the run, and retrieve results.
 *
 * ## Quickstart
 *
 * ScenarioRuns are typically obtained from a Scenario's `run()` or `runAsync()` methods:
 *
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client';
 *
 * const runloop = new RunloopSDK();
 * const scenario = runloop.scenario.fromId('scenario-123');
 * const run = await scenario.run({ run_name: 'my-run' });
 *
 * // Access the devbox and execute your agent to solve the scenario
 * const devbox = run.devbox;
 * await devbox.cmd.exec('python /home/user/agent/main.py');
 *
 * // Score and complete the run
 * await run.scoreAndComplete();
 * const score = run.getScore();
 * ```
 */
export class ScenarioRun {
  private client: Runloop;
  private _id: string;
  private _devboxId: string;
  private _devbox: Devbox | null = null;

  /**
   * @private
   */
  constructor(client: Runloop, id: string, devboxId: string) {
    this.client = client;
    this._id = id;
    this._devboxId = devboxId;
  }

  /**
   * Create a ScenarioRun instance from an ID.
   *
   * See the {@link ScenarioOps.fromId} method for calling this
   * @private
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} id - The scenario run ID
   * @param {string} devboxId - The associated devbox ID
   * @returns {ScenarioRun} A {@link ScenarioRun} instance
   */
  static fromId(client: Runloop, id: string, devboxId: string): ScenarioRun {
    return new ScenarioRun(client, id, devboxId);
  }

  /**
   * Get the scenario run ID.
   * @returns {string} The scenario run ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the associated devbox ID.
   * @returns {string} The devbox ID
   */
  get devboxId(): string {
    return this._devboxId;
  }

  /**
   * Get the devbox instance for this scenario run.
   *
   * This property provides lazy-loaded access to the devbox associated with
   * this scenario run. Use this to interact with the devbox environment
   * during the scenario execution.
   *
   * @example
   * ```typescript
   * const run = await scenario.run();
   * const devbox = run.devbox;
   * await devbox.cmd.exec('npm test');
   * ```
   *
   * @returns {Devbox} The devbox instance
   */
  get devbox(): Devbox {
    if (!this._devbox) {
      this._devbox = Devbox.fromId(this.client, this._devboxId);
    }
    return this._devbox;
  }

  /**
   * Get the complete scenario run data from the API.
   *
   * @example
   * ```typescript
   * const info = await run.getInfo();
   * console.log(`Run state: ${info.state}`);
   * console.log(`Score: ${info.scoring_contract_result?.score}`);
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScenarioRunView>} The scenario run data
   */
  async getInfo(options?: Core.RequestOptions): Promise<ScenarioRunView> {
    return this.client.scenarios.runs.retrieve(this._id, options);
  }

  /**
   * Wait for the scenario environment (devbox) to be ready.
   *
   * Blocks until the devbox reaches running state. Call this after using
   * `scenario.runAsync()` to ensure the devbox is ready for interaction.
   *
   * @example
   * ```typescript
   * const run = await scenario.runAsync();
   * await run.awaitEnvReady();
   * // Devbox is now ready
   * await run.devbox.cmd.exec('ls -la');
   * ```
   *
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<ScenarioRunView>} The scenario run data after environment is ready
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
   * The scoring runs asynchronously; use `awaitScored()` or `scoreAndAwait()`
   * to wait for scoring to complete.
   *
   * @example
   * ```typescript
   * await run.score();
   * // Scoring is now in progress
   * const result = await run.awaitScored();
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScenarioRunView>} The updated scenario run data
   */
  async score(options?: Core.RequestOptions): Promise<ScenarioRunView> {
    return this.client.scenarios.runs.score(this._id, options);
  }

  /**
   * Wait for the scenario run to be scored.
   *
   * Blocks until scoring is complete. Call this after `score()` to wait
   * for the scoring process to finish.
   *
   * @example
   * ```typescript
   * await run.score();
   * const result = await run.awaitScored();
   * console.log(`Final score: ${result.scoring_contract_result?.score}`);
   * ```
   *
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<ScenarioRunView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<ScenarioRunView>} The scored scenario run data
   */
  async awaitScored(
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<ScenarioRunView>> },
  ): Promise<ScenarioRunView> {
    return this.client.scenarios.runs.awaitScored(this._id, options);
  }

  /**
   * Submit for scoring and wait for completion.
   *
   * This is a convenience method that combines `score()` and `awaitScored()`.
   *
   * @example
   * ```typescript
   * // Agent has finished working...
   * const result = await run.scoreAndAwait();
   * console.log(`Final score: ${result.scoring_contract_result?.score}`);
   * ```
   *
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<ScenarioRunView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<ScenarioRunView>} The scored scenario run data
   */
  async scoreAndAwait(
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<ScenarioRunView>> },
  ): Promise<ScenarioRunView> {
    return this.client.scenarios.runs.scoreAndAwait(this._id, options);
  }

  /**
   * Score the run, wait for scoring, then complete and shutdown.
   *
   * This is a convenience method that scores the scenario run, waits for
   * scoring to finish, then completes the run and shuts down the devbox.
   * This is the recommended way to finish a scenario run.
   *
   * @example
   * ```typescript
   * // Agent has finished working...
   * const result = await run.scoreAndComplete();
   * console.log(`Final score: ${result.scoring_contract_result?.score}`);
   * // Devbox has been shut down
   * ```
   *
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<ScenarioRunView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<ScenarioRunView>} The completed scenario run data with scoring results
   */
  async scoreAndComplete(
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<ScenarioRunView>> },
  ): Promise<ScenarioRunView> {
    return this.client.scenarios.runs.scoreAndComplete(this._id, options);
  }

  /**
   * Complete the scenario run and shutdown the devbox.
   *
   * Call this after scoring to finalize the run. The devbox will be
   * shut down and resources released. Note: The run must be in a
   * scored state before calling complete. Use `cancel()` to end a
   * run without scoring, or `scoreAndComplete()` to score and complete
   * in one operation.
   *
   * @example
   * ```typescript
   * // Score first, then complete
   * await run.scoreAndAwait();
   * await run.complete();
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScenarioRunView>} The final scenario run data
   */
  async complete(options?: Core.RequestOptions): Promise<ScenarioRunView> {
    return this.client.scenarios.runs.complete(this._id, options);
  }

  /**
   * Cancel the scenario run and shutdown the devbox.
   *
   * Use this to abort a running scenario. The devbox will be shut down
   * and the run marked as canceled.
   *
   * @example
   * ```typescript
   * // Abort the scenario
   * await run.cancel();
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScenarioRunView>} The canceled scenario run data
   */
  async cancel(options?: Core.RequestOptions): Promise<ScenarioRunView> {
    return this.client.scenarios.runs.cancel(this._id, options);
  }

  /**
   * Download all logs for this scenario run to a file.
   *
   * Downloads a zip archive containing all logs from the scenario run's
   * associated devbox. This is useful for debugging and analysis.
   *
   * @example
   * ```typescript
   * await run.scoreAndComplete();
   * await run.downloadLogs('./scenario-logs.zip');
   * ```
   *
   * @param {string} filePath - Path where the zip file will be written
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<void>}
   */
  async downloadLogs(filePath: string, options?: Core.RequestOptions): Promise<void> {
    // Validate the parent directory exists and is writable
    const parentDir = path.dirname(filePath);
    try {
      await fs.promises.access(parentDir, fs.constants.W_OK);
    } catch {
      throw new Error(
        `Cannot write to ${filePath}: parent directory '${parentDir}' does not exist or is not writable`,
      );
    }

    const response = await this.client.scenarios.runs.downloadLogs(this._id, options);

    // Get the response as an ArrayBuffer and write to file
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.promises.writeFile(filePath, buffer);
  }

  /**
   * Get the scoring result for this run.
   *
   * Returns null if the run has not been scored yet. Always makes an API
   * call to retrieve the current scoring result.
   *
   * @example
   * ```typescript
   * await run.scoreAndAwait();
   * const score = await run.getScore();
   * if (score) {
   *   console.log(`Total score: ${score.score}`);
   *   for (const fn of score.scoring_function_results) {
   *     console.log(`  ${fn.scoring_function_name}: ${fn.score}`);
   *   }
   * }
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScoringContractResultView | null>} The scoring result or null if not yet scored
   */
  async getScore(options?: Core.RequestOptions): Promise<ScoringContractResultView | null> {
    const info = await this.getInfo(options);
    return info.scoring_contract_result ?? null;
  }
}
