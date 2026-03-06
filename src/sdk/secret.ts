import { Runloop } from '../index';
import type * as Core from '../core';
import type { SecretView, SecretUpdateParams } from '../resources/secrets';

/**
 * Object-oriented interface for working with Secrets.
 *
 * @category Secret
 *
 * @remarks
 * ## Overview
 *
 * The `Secret` class provides a high-level, object-oriented API for managing secrets.
 * Secrets are encrypted key-value pairs that can be securely stored and used in Devboxes
 * as environment variables. Secrets are identified by their globally unique name.
 *
 * ## Quickstart
 *
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client-ts';
 *
 * const runloop = new RunloopSDK();
 *
 * // Create a secret
 * const secret = await runloop.secret.create({
 *   name: 'MY_API_KEY',
 *   value: 'secret-value',
 * });
 *
 * // Use the secret in a devbox
 * const devbox = await runloop.devbox.create({
 *   name: 'my-devbox',
 *   secrets: { 'API_KEY': secret },  // Can use Secret object directly
 * });
 *
 * // Get secret info
 * const info = await secret.getInfo();
 * console.log(`Secret: ${info.name}, ID: ${info.id}`);
 * ```
 */
export class Secret {
  private client: Runloop;
  private _name: string;

  private constructor(client: Runloop, name: string) {
    this.client = client;
    this._name = name;
  }

  /**
   * Create a Secret instance from a SecretView (API response).
   * Used internally after create/update operations.
   *
   * @private
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {SecretView} view - The secret view from API response
   * @returns {Secret} A {@link Secret} instance
   */
  static fromView(client: Runloop, view: SecretView): Secret {
    return new Secret(client, view.name);
  }

  /**
   * Create a Secret instance by name without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * See the {@link SecretOps.fromName} method for calling this
   * @private
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const secret = runloop.secret.fromName('MY_API_KEY');
   * const info = await secret.getInfo();
   * console.log(`Secret ID: ${info.id}`);
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} name - The secret name (globally unique)
   * @returns {Secret} A {@link Secret} instance
   */
  static fromName(client: Runloop, name: string): Secret {
    return new Secret(client, name);
  }

  /**
   * Get the secret name.
   * @returns {string} The secret name (globally unique identifier)
   */
  get name(): string {
    return this._name;
  }

  /**
   * Get the complete secret data from the API.
   * This retrieves the full SecretView including id, name, create_time_ms, and update_time_ms.
   *
   * Note: The secret value is never returned for security reasons.
   *
   * @example
   * ```typescript
   * const info = await secret.getInfo();
   * console.log(`Secret: ${info.name}, ID: ${info.id}, Created: ${info.create_time_ms}`);
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<SecretView>} The secret data (value is not included)
   */
  async getInfo(options?: Core.RequestOptions): Promise<SecretView> {
    return this.client.secrets.retrieve(this._name, options);
  }

  /**
   * Update this secret's value.
   *
   * @example
   * ```typescript
   * const updated = await secret.update({
   *   value: 'new-secret-value',
   * });
   * console.log(`Updated at: ${(await updated.getInfo()).update_time_ms}`);
   * ```
   *
   * @param {SecretUpdateParams} params - Parameters for updating the secret
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Secret>} The updated Secret instance
   */
  async update(params: SecretUpdateParams, options?: Core.RequestOptions): Promise<Secret> {
    await this.client.secrets.update(this._name, params, options);
    return this;
  }

  /**
   * Delete this secret. This action is irreversible.
   *
   * @private
   * See the {@link SecretOps.delete} method for calling this
   *
   * @example
   * ```typescript
   * await secret.delete();
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<SecretView>} The deleted secret data
   */
  async delete(options?: Core.RequestOptions): Promise<SecretView> {
    return this.client.secrets.delete(this._name, {}, options);
  }
}
