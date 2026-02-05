import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  ScorerCreateParams,
  ScorerListParams,
  ScorerRetrieveResponse,
  ScorerUpdateResponse,
  ScorerUpdateParams,
} from '../resources/scenarios/scorers';

/**
 * Object-oriented interface for working with Scorers.
 *
 * @category Scorer
 *
 * @remarks
 * ## Overview
 *
 * The `Scorer` class provides a high-level, object-oriented API for managing scorers.
 * Scorers define bash scripts that produce a score in the range [0.0, 1.0] for scenario runs.
 *
 * ## Quickstart
 *
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client-ts';
 *
 * const runloop = new RunloopSDK();
 * const scorer = await runloop.scorer.create({
 *   type: 'my_scorer',
 *   bash_script: 'echo "1.0"',
 * });
 *
 * const info = await scorer.getInfo();
 * console.log(`Scorer type: ${info.type}`);
 * ```
 */
export class Scorer {
  private client: Runloop;
  private _id: string;

  private constructor(client: Runloop, scorerId: string) {
    this.client = client;
    this._id = scorerId;
  }

  /**
   * Create a new custom scorer.
   *
   * See the {@link ScorerOps.create} method for calling this.
   * @private
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const scorer = await runloop.scorer.create({
   *   type: 'my_scorer',
   *   bash_script: 'echo "1.0"',
   * });
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {ScorerCreateParams} params - Scorer creation parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Scorer>} A new {@link Scorer} instance
   */
  static async create(
    client: Runloop,
    params: ScorerCreateParams,
    options?: Core.RequestOptions,
  ): Promise<Scorer> {
    const scorerData = await client.scenarios.scorers.create(params, options);
    return new Scorer(client, scorerData.id);
  }

  /**
   * List all scorers with optional filters.
   *
   * See the {@link ScorerOps.list} method for calling this.
   * @private
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const scorers = await runloop.scorer.list({ limit: 10 });
   *
   * for (const scorer of scorers) {
   *   const info = await scorer.getInfo();
   *   console.log(`${info.id}: ${info.type}`);
   * }
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {ScorerListParams} [params] - Optional filter parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Scorer[]>} Array of {@link Scorer} instances
   */
  static async list(
    client: Runloop,
    params?: ScorerListParams,
    options?: Core.RequestOptions,
  ): Promise<Scorer[]> {
    const scorers = await client.scenarios.scorers.list(params, options);
    const result: Scorer[] = [];

    for await (const scorer of scorers) {
      result.push(Scorer.fromId(client, scorer.id));
    }

    return result;
  }

  /**
   * Create a Scorer instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * See the {@link ScorerOps.fromId} method for calling this.
   * @private
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const scorer = runloop.scorer.fromId('scs_123');
   * const info = await scorer.getInfo();
   * console.log(`Scorer type: ${info.type}`);
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} id - The scorer ID
   * @returns {Scorer} A Scorer instance
   */
  static fromId(client: Runloop, id: string): Scorer {
    return new Scorer(client, id);
  }

  /**
   * Get the scorer ID.
   * @returns {string} The scorer ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Fetch current scorer details from the API.
   *
   * @example
   * ```typescript
   * const info = await scorer.getInfo();
   * console.log(`Scorer type: ${info.type}`);
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScorerRetrieveResponse>} Current scorer details
   */
  async getInfo(options?: Core.RequestOptions): Promise<ScorerRetrieveResponse> {
    return this.client.scenarios.scorers.retrieve(this._id, options);
  }

  /**
   * Update the scorer's type or bash script.
   *
   * @example
   * ```typescript
   * const updated = await scorer.update({
   *   type: 'my_scorer_v2',
   *   bash_script: 'echo "0.5"'
   * });
   * ```
   *
   * @param {ScorerUpdateParams} params - Update parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScorerUpdateResponse>} Updated scorer details
   */
  async update(params: ScorerUpdateParams, options?: Core.RequestOptions): Promise<ScorerUpdateResponse> {
    return this.client.scenarios.scorers.update(this._id, params, options);
  }
}
