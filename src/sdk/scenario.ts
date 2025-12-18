import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  ScenarioView,
  ScenarioUpdateParams,
  ScenarioStartRunParams,
} from '../resources/scenarios/scenarios';
import type { DevboxView } from '../resources/devboxes/devboxes';
import type { PollingOptions } from '../lib/polling';
import { ScenarioRun } from './scenario-run';

/**
 * Object-oriented interface for working with Scenarios.
 *
 * @category Scenario
 *
 * @remarks
 * ## Overview
 *
 * The `Scenario` class provides a high-level API for managing scenarios.
 * Scenarios are repeatable AI coding evaluation tests that define a starting
 * environment and use a scorer evaluate success criteria.
 *
 * ## Usage
 *
 * Obtain instances via `runloop.scenario.fromId()` or `runloop.scenario.list()`:
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 * const scenario = runloop.scenario.fromId('scn-xxx');
 * const info = await scenario.getInfo();
 * const run = await scenario.run({ run_name: 'test-run' });
 * ```
 */
export class Scenario {
  private client: Runloop;
  private _id: string;

  private constructor(client: Runloop, scenarioId: string) {
    this.client = client;
    this._id = scenarioId;
  }

  /**
   * Create a Scenario instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} id - The scenario ID
   * @returns {Scenario} A Scenario instance
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
   * Retrieve current scenario details from the API.
   *
   * @example
   * ```typescript
   * const info = await scenario.getInfo();
   * console.log(`Scenario: ${info.name}`);
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScenarioView>} Current scenario info
   */
  async getInfo(options?: Core.RequestOptions): Promise<ScenarioView> {
    return this.client.scenarios.retrieve(this._id, options);
  }

  /**
   * Update the scenari: only provided fields will be updated.
   *
   * @example
   * ```typescript
   * const updated = await scenario.update({
   *   name: 'updated-scenario-name',
   *   metadata: { version: '2' }
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
   * Start a new scenario run without waiting for the devbox to be ready.
   *
   * Creates a new scenario run and returns immediately. The devbox may still
   * be starting; call `awaitEnvReady()` on the returned ScenarioRun to wait
   * for it to be ready.
   *
   * @example
   * ```typescript
   * const run = await scenario.runAsync({ run_name: 'quick-start' });
   * await run.awaitEnvReady();
   * // Now the devbox is ready
   * ```
   *
   * @param {Omit<ScenarioStartRunParams, 'scenario_id'>} [params] - Run parameters (scenario_id is automatically set)
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScenarioRun>} ScenarioRun instance for managing the run
   */
  async runAsync(
    params?: Omit<ScenarioStartRunParams, 'scenario_id'>,
    options?: Core.RequestOptions,
  ): Promise<ScenarioRun> {
    const runView = await this.client.scenarios.startRun(
      {
        ...params,
        scenario_id: this._id,
      },
      options,
    );
    return ScenarioRun.fromRunView(this.client, runView);
  }

  /**
   * Start a new scenario run and wait for the devbox to be ready.
   *
   * Convenience method that starts a run and waits for the devbox to be ready.
   *
   * @example
   * ```typescript
   * const run = await scenario.run({ run_name: 'test-run' });
   * // Devbox is ready, start working
   * const result = await run.devbox.cmd.exec('echo "Hello"');
   * ```
   *
   * @param {Omit<ScenarioStartRunParams, 'scenario_id'>} [params] - Run parameters (scenario_id is automatically set)
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<ScenarioRun>} ScenarioRun instance with ready devbox
   */
  async run(
    params?: Omit<ScenarioStartRunParams, 'scenario_id'>,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<ScenarioRun> {
    const runView = await this.client.scenarios.startRunAndAwaitEnvReady(
      {
        ...params,
        scenario_id: this._id,
      },
      options,
    );
    return ScenarioRun.fromRunView(this.client, runView);
  }
}
