import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  ScenarioView,
  ScenarioUpdateParams,
  ScenarioStartRunParams,
} from '../resources/scenarios/scenarios';
import type { DevboxView } from '../resources/devboxes/devboxes';
import { PollingOptions } from '../lib/polling';
import { ScenarioRun } from './scenario-run';

/**
 * Parameters for starting a scenario run, excluding the scenario_id
 * which is provided by the Scenario instance.
 */
export type ScenarioRunParams = Omit<ScenarioStartRunParams, 'scenario_id'>;

/**
 * Object-oriented interface for working with Scenarios.
 *
 * @category Scenario
 *
 * @remarks
 * ## Overview
 *
 * The `Scenario` class provides a high-level API for managing scenarios and
 * starting scenario runs. A scenario defines a repeatable AI coding evaluation
 * test with a starting environment and success criteria.
 *
 * ## Quickstart
 *
 * Scenarios can be obtained from `runloop.scenario.fromId(scn_123)`:
 *
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client';
 *
 * const runloop = new RunloopSDK();
 * const scenario = runloop.scenario.fromId('scn_123');
 *
 * // Get scenario details
 * const info = await scenario.getInfo();
 * console.log(info.name);
 *
 * // Start a run and wait for the devbox to be ready
 * const run = await scenario.run({ run_name: 'my-run' });
 *
 * // Execute your agent on the devbox
 * await run.devbox.cmd.exec('python /home/user/agent/main.py');
 *
 * // Score and complete
 * await run.scoreAndComplete();
 * ```
 */
export class Scenario {
  private client: Runloop;
  private _id: string;

  private constructor(client: Runloop, id: string) {
    this.client = client;
    this._id = id;
  }

  /**
   * Create a Scenario instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * See the {@link ScenarioOps.fromId} method for calling this
   * @private
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} id - The scenario ID
   * @returns {Scenario} A {@link Scenario} instance
   */
  static fromId(client: Runloop, id: string): Scenario {
    return new Scenario(client, id);
  }

  /**
   * Get the scenario ID.
   * @returns {string} The scenario ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Retrieve current scenario details.
   *
   * @example
   * ```typescript
   * const info = await scenario.getInfo();
   * console.log(`Scenario: ${info.name}`);
   * console.log(`Problem: ${info.input_context?.problem_statement}`);
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScenarioView>} Current scenario info
   */
  async getInfo(options?: Core.RequestOptions): Promise<ScenarioView> {
    return this.client.scenarios.retrieve(this._id, options);
  }

  /**
   * Update the scenario.
   *
   * Only provided fields will be updated. Fields that are null will preserve
   * the existing value.
   *
   * @example
   * ```typescript
   * const updated = await scenario.update({
   *   name: 'Updated Scenario Name',
   *   metadata: { version: '2.0' },
   * });
   * ```
   *
   * @param {ScenarioUpdateParams} [params] - Update parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScenarioView>} Updated scenario info
   */
  async update(params?: ScenarioUpdateParams, options?: Core.RequestOptions): Promise<ScenarioView> {
    return this.client.scenarios.update(this._id, params, options);
  }

  /**
   * Start a new scenario run without waiting for the devbox.
   *
   * Creates a new scenario run and returns immediately. The devbox may still
   * be starting; call `awaitEnvReady()` on the returned ScenarioRun to wait
   * for it to be ready.
   *
   * @example
   * ```typescript
   * const run = await scenario.runAsync({ run_name: 'my-run' });
   *
   * // Do other work while devbox starts...
   *
   * // Wait for devbox when ready
   * await run.awaitEnvReady();
   * ```
   *
   * @param {ScenarioRunParams} [params] - Run parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScenarioRun>} ScenarioRun instance for managing the run
   */
  async runAsync(params?: ScenarioRunParams, options?: Core.RequestOptions): Promise<ScenarioRun> {
    const runView = await this.client.scenarios.startRun({ scenario_id: this._id, ...params }, options);
    return new ScenarioRun(this.client, runView.id, runView.devbox_id);
  }

  /**
   * Start a new scenario run and wait for the devbox to be ready.
   *
   * Convenience method that starts a run and waits for the devbox to be ready
   * before returning.
   *
   * @example
   * ```typescript
   * const run = await scenario.run({ run_name: 'my-run' });
   *
   * // Devbox is ready - execute your agent
   * await run.devbox.cmd.exec('python /home/user/agent/main.py');
   *
   * // Score and complete
   * await run.scoreAndComplete();
   * ```
   *
   * @param {ScenarioRunParams} [params] - Run parameters
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options with optional polling config
   * @returns {Promise<ScenarioRun>} ScenarioRun instance with ready devbox
   */
  async run(
    params?: ScenarioRunParams,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<ScenarioRun> {
    const runView = await this.client.scenarios.startRunAndAwaitEnvReady(
      { scenario_id: this._id, ...params },
      options,
    );
    return new ScenarioRun(this.client, runView.id, runView.devbox_id);
  }
}
