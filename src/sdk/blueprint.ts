import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  BlueprintView,
  BlueprintCreateParams,
  BlueprintBuildLogsListView,
} from '../resources/blueprints';
import type { DevboxCreateParams, DevboxView } from '../resources/devboxes/devboxes';
import type { PollingOptions } from '../lib/polling';
import { Devbox } from './devbox';

/**
 * Object-oriented interface for working with Blueprints.
 * ```
 */
export class Blueprint {
  private client: Runloop;
  private _id: string;

  private constructor(client: Runloop, id: string) {
    this.client = client;
    this._id = id;
  }

  /**
   * Create a new Blueprint and wait for it to complete building.
   * This is the recommended way to create a blueprint as it ensures it's ready to use.
   *
   * See the {@link BlueprintOps.create} method for calling this
   * @private
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {BlueprintCreateParams} params - Parameters for creating the blueprint
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<BlueprintView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<Blueprint>} A {@link Blueprint} instance with completed build
   */
  static async create(
    client: Runloop,
    params: BlueprintCreateParams,
    options?: Core.RequestOptions & {
      polling?: Partial<PollingOptions<BlueprintView>>;
    },
  ): Promise<Blueprint> {
    const blueprintData = await client.blueprints.createAndAwaitBuildCompleted(params, options);
    return new Blueprint(client, blueprintData.id);
  }

  /**
   * Create a Blueprint instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * See the {@link BlueprintOps.fromId} method for calling this
   * @private
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} id - The blueprint ID
   * @returns {Blueprint} A {@link Blueprint} instance
   */
  static fromId(client: Runloop, id: string): Blueprint {
    return new Blueprint(client, id);
  }

  // BETA the preview is not available in the API.
  // /**
  //  * Preview a blueprint configuration without building it.
  //  * Returns the Dockerfile that would be built.
  //  *
  //  * @param client - The Runloop client instance
  //  * @param params - Blueprint preview parameters
  //  * @param options - Request options
  //  * @returns Preview with generated Dockerfile
  //  */
  // static async preview(
  //   client: Runloop,
  //   params: BlueprintPreviewParams,
  //   options?: Core.RequestOptions,
  // ): Promise<BlueprintPreviewView> {
  //   return client.blueprints.preview(params, options);
  // }

  /**
   * Get the blueprint ID.
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the complete blueprint data from the API.
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<BlueprintView>} The blueprint data
   */
  async getInfo(options?: Core.RequestOptions): Promise<BlueprintView> {
    return this.client.blueprints.retrieve(this._id, options);
  }

  /**
   * Get all build logs for this blueprint.
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<BlueprintBuildLogsListView>} Build logs
   */
  async logs(options?: Core.RequestOptions): Promise<BlueprintBuildLogsListView> {
    return this.client.blueprints.logs(this._id, options);
  }

  /**
   * Delete this blueprint.
   *
   * @private
   * See the {@link BlueprintOps.delete} method for calling this
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<unknown>} The deletion result
   */
  async delete(options?: Core.RequestOptions): Promise<unknown> {
    return this.client.blueprints.delete(this._id, options);
  }

  /**
   * Create a new devbox from this blueprint.
   * This is a convenience method that calls Devbox.create() with the blueprint ID
   * and any additional parameters you want to layer on top.
   *
   * See the {@link BlueprintOps.createDevbox} method for calling this
   * @private
   *
   * @param {Omit<DevboxCreateParams, 'blueprint_id' | 'snapshot_id' | 'blueprint_name'>} [params] - Additional devbox creation parameters (optional)
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<Devbox>} A new {@link Devbox} instance created from this blueprint
   */
  async createDevbox(
    params?: Omit<DevboxCreateParams, 'blueprint_id' | 'snapshot_id' | 'blueprint_name'>,
    options?: Core.RequestOptions & {
      polling?: Partial<PollingOptions<DevboxView>>;
    },
  ): Promise<Devbox> {
    const createParams: DevboxCreateParams = {
      ...params,
      blueprint_id: this._id,
    };

    return Devbox.create(this.client, createParams, options);
  }
}
