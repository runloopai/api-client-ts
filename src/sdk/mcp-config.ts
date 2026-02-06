import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  McpConfigView,
  McpConfigCreateParams,
  McpConfigUpdateParams,
} from '../resources/mcp-configs';

/**
 * Object-oriented interface for working with MCP Configs.
 *
 * @category MCP Config
 *
 * @remarks
 * ## Overview
 *
 * The `McpConfig` class provides a high-level, object-oriented API for managing MCP configurations.
 * MCP configs define how to connect to upstream MCP (Model Context Protocol) servers, specifying the
 * target endpoint and which tools are allowed. They can be used with devboxes to securely connect
 * to MCP servers.
 *
 * ## Quickstart
 *
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client-ts';
 *
 * const runloop = new RunloopSDK();
 * const mcpConfig = await runloop.mcpConfig.create({
 *   name: 'my-mcp-server',
 *   endpoint: 'https://mcp.example.com',
 *   allowed_tools: ['*'],
 * });
 *
 * const info = await mcpConfig.getInfo();
 * console.log(`MCP Config: ${info.name}`);
 * ```
 */
export class McpConfig {
  private client: Runloop;
  private _id: string;

  private constructor(client: Runloop, id: string) {
    this.client = client;
    this._id = id;
  }

  /**
   * Create a new McpConfig with the specified configuration.
   * This is the recommended way to create an MCP config.
   *
   * See the {@link McpConfigOps.create} method for calling this
   * @private
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const mcpConfig = await runloop.mcpConfig.create({
   *   name: 'my-mcp-server',
   *   endpoint: 'https://mcp.example.com',
   *   allowed_tools: ['*'],
   *   description: 'MCP server for my tools',
   * });
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {McpConfigCreateParams} params - Parameters for creating the MCP config
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<McpConfig>} A {@link McpConfig} instance
   */
  static async create(
    client: Runloop,
    params: McpConfigCreateParams,
    options?: Core.RequestOptions,
  ): Promise<McpConfig> {
    const configData = await client.mcpConfigs.create(params, options);
    return new McpConfig(client, configData.id);
  }

  /**
   * Create a McpConfig instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * See the {@link McpConfigOps.fromId} method for calling this
   * @private
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const mcpConfig = runloop.mcpConfig.fromId('mcp_1234567890');
   * const info = await mcpConfig.getInfo();
   * console.log(`MCP Config name: ${info.name}`);
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} id - The MCP config ID
   * @returns {McpConfig} A {@link McpConfig} instance
   */
  static fromId(client: Runloop, id: string): McpConfig {
    return new McpConfig(client, id);
  }

  /**
   * Get the MCP config ID.
   * @returns {string} The MCP config ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the complete MCP config data from the API.
   *
   * @example
   * ```typescript
   * const info = await mcpConfig.getInfo();
   * console.log(`MCP Config: ${info.name}, endpoint: ${info.endpoint}`);
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<McpConfigView>} The MCP config data
   */
  async getInfo(options?: Core.RequestOptions): Promise<McpConfigView> {
    return this.client.mcpConfigs.retrieve(this._id, options);
  }

  /**
   * Update an existing McpConfig. All fields are optional.
   *
   * @example
   * ```typescript
   * const updated = await mcpConfig.update({
   *   name: 'updated-mcp-name',
   *   description: 'Updated description',
   * });
   * ```
   *
   * @param {McpConfigUpdateParams} params - Parameters for updating the MCP config
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<McpConfigView>} The updated MCP config data
   */
  async update(params: McpConfigUpdateParams, options?: Core.RequestOptions): Promise<McpConfigView> {
    return this.client.mcpConfigs.update(this._id, params, options);
  }

  /**
   * Delete this MCP config. This action is irreversible.
   *
   * @private
   * See the {@link McpConfigOps.delete} method for calling this
   *
   * @example
   * ```typescript
   * await mcpConfig.delete();
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<McpConfigView>} The deleted MCP config data
   */
  async delete(options?: Core.RequestOptions): Promise<McpConfigView> {
    return this.client.mcpConfigs.delete(this._id, {}, options);
  }
}
