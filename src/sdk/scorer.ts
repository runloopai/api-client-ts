import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  ScorerRetrieveResponse,
  ScorerUpdateResponse,
  ScorerUpdateParams,
  ScorerValidateParams,
  ScorerValidateResponse,
} from '../resources/scenarios/scorers';

/**
 * Object-oriented interface for working with custom Scorers.
 *
 * @category Scorer
 *
 * @remarks
 * ## Overview
 *
 * The `Scorer` class provides a high-level API for managing custom scorers.
 * Scorers define bash scripts that produce a score in the range [0.0, 1.0] for scenario runs.
 *
 * ## Usage
 *
 * Obtain instances via `runloop.scorer.create()` or `runloop.scorer.fromId()`:
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 * const scorer = await runloop.scorer.create({
 *   type: 'my_scorer',
 *   bash_script: 'echo "score=1.0"'
 * });
 *
 * // Validate the scorer
 * const result = await scorer.validate({ scoring_context: { output: 'test' } });
 * console.log(`Score: ${result.scoring_result.score}`);
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
   * Create a Scorer instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
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
   *   bash_script: 'echo "score=0.5"'
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

  /**
   * Run the scorer against the provided context and return the result.
   *
   * @example
   * ```typescript
   * const result = await scorer.validate({
   *   scoring_context: { output: 'test output', expected: 'test output' }
   * });
   * console.log(`Validation score: ${result.scoring_result.score}`);
   * console.log(`Output: ${result.scoring_result.output}`);
   * ```
   *
   * @param {ScorerValidateParams} params - Validation parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScorerValidateResponse>} Validation result with score
   */
  async validate(params: ScorerValidateParams, options?: Core.RequestOptions): Promise<ScorerValidateResponse> {
    return this.client.scenarios.scorers.validate(this._id, params, options);
  }
}

