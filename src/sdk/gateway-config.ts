import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  GatewayConfigView,
  GatewayConfigCreateParams,
  GatewayConfigUpdateParams,
} from '../resources/gateway-configs';

/**
 * Object-oriented interface for working with Gateway Configs.
 *
 * @category Gateway Config
 *
 * @remarks
 * ## Overview
 *
 * The `GatewayConfig` class provides a high-level, object-oriented API for managing gateway configurations.
 * Gateway configs define how to proxy API requests through the credential gateway, specifying the target
 * endpoint and how credentials should be applied. They can be used with devboxes to securely proxy
 * requests to external APIs without exposing API keys.
 *
 * ## Quickstart
 *
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client-ts';
 *
 * const runloop = new RunloopSDK();
 * const gatewayConfig = await runloop.gatewayConfig.create({
 *   name: 'my-custom-api',
 *   endpoint: 'https://api.example.com',
 *   auth_mechanism: { type: 'bearer' },
 * });
 *
 * const info = await gatewayConfig.getInfo();
 * console.log(`Gateway Config: ${info.name}`);
 * ```
 */
export class GatewayConfig {
  private client: Runloop;
  private _id: string;

  private constructor(client: Runloop, id: string) {
    this.client = client;
    this._id = id;
  }

  /**
   * Create a new GatewayConfig with the specified configuration.
   * This is the recommended way to create a gateway config.
   *
   * See the {@link GatewayConfigOps.create} method for calling this
   * @private
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const gatewayConfig = await runloop.gatewayConfig.create({
   *   name: 'my-api-gateway',
   *   endpoint: 'https://api.example.com',
   *   auth_mechanism: { type: 'header', key: 'x-api-key' },
   *   description: 'Gateway for My API',
   * });
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {GatewayConfigCreateParams} params - Parameters for creating the gateway config
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<GatewayConfig>} A {@link GatewayConfig} instance
   */
  static async create(
    client: Runloop,
    params: GatewayConfigCreateParams,
    options?: Core.RequestOptions,
  ): Promise<GatewayConfig> {
    const configData = await client.gatewayConfigs.create(params, options);
    return new GatewayConfig(client, configData.id);
  }

  /**
   * Create a GatewayConfig instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * See the {@link GatewayConfigOps.fromId} method for calling this
   * @private
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const gatewayConfig = runloop.gatewayConfig.fromId('gwc_1234567890');
   * const info = await gatewayConfig.getInfo();
   * console.log(`Gateway Config name: ${info.name}`);
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} id - The gateway config ID
   * @returns {GatewayConfig} A {@link GatewayConfig} instance
   */
  static fromId(client: Runloop, id: string): GatewayConfig {
    return new GatewayConfig(client, id);
  }

  /**
   * Get the gateway config ID.
   * @returns {string} The gateway config ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the complete gateway config data from the API.
   *
   * @example
   * ```typescript
   * const info = await gatewayConfig.getInfo();
   * console.log(`Gateway Config: ${info.name}, endpoint: ${info.endpoint}`);
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<GatewayConfigView>} The gateway config data
   */
  async getInfo(options?: Core.RequestOptions): Promise<GatewayConfigView> {
    return this.client.gatewayConfigs.retrieve(this._id, options);
  }

  /**
   * Update an existing GatewayConfig. All fields are optional.
   *
   * @example
   * ```typescript
   * const updated = await gatewayConfig.update({
   *   name: 'updated-gateway-name',
   *   description: 'Updated description',
   * });
   * ```
   *
   * @param {GatewayConfigUpdateParams} params - Parameters for updating the gateway config
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<GatewayConfigView>} The updated gateway config data
   */
  async update(params: GatewayConfigUpdateParams, options?: Core.RequestOptions): Promise<GatewayConfigView> {
    return this.client.gatewayConfigs.update(this._id, params, options);
  }

  /**
   * Delete this gateway config. This action is irreversible.
   *
   * @private
   * See the {@link GatewayConfigOps.delete} method for calling this
   *
   * @example
   * ```typescript
   * await gatewayConfig.delete();
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<GatewayConfigView>} The deleted gateway config data
   */
  async delete(options?: Core.RequestOptions): Promise<GatewayConfigView> {
    return this.client.gatewayConfigs.delete(this._id, {}, options);
  }
}
