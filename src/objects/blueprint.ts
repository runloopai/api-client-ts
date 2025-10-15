import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  BlueprintView,
  BlueprintCreateParams,
  BlueprintBuildLogsListView,
  BlueprintPreviewView,
  BlueprintPreviewParams,
} from '../resources/blueprints';
import type { DevboxCreateParams } from '../resources/devboxes/devboxes';
import { Devbox } from './devbox';

/**
 * Object-oriented interface for working with Blueprints.
 *
 * Example usage:
 * ```typescript
 * // Make sure to set RUNLOOP_API_KEY environment variable
 * // export RUNLOOP_API_KEY="your-api-key"
 *
 * const blueprint = await Blueprint.create({
 *   name: 'my-blueprint',
 *   dockerfile: 'FROM ubuntu:22.04\nRUN apt-get update',
 * });
 *
 * // Get blueprint information
 * const info = await blueprint.getInfo();
 * console.log(info.name, info.status);
 *
 * // Create a devbox from this blueprint
 * const devbox = await blueprint.createDevbox({
 *   name: 'my-devbox',
 *   metadata: { created_from: blueprint.id }
 * });
 *
 * const logs = await blueprint.logs();
 * await blueprint.delete();
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
   * @param params - Parameters for creating the blueprint
   * @param options - Request options with optional polling configuration and client override
   * @returns A Blueprint instance with completed build
   */
  static async create(
    params: BlueprintCreateParams,
    options?: Core.RequestOptions & {
      client?: Runloop;
      polling?: Partial<import('../lib/polling').PollingOptions<BlueprintView>>;
    },
  ): Promise<Blueprint> {
    const client = options?.client || Runloop.getDefaultClient();
    const requestOptions = options;

    const blueprintData = await client.blueprints.createAndAwaitBuildCompleted(params, requestOptions);
    return new Blueprint(client, blueprintData.id);
  }

  /**
   * Create a Blueprint instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * @param id - The blueprint ID
   * @param options - Request options with optional client override
   * @returns A Blueprint instance
   */
  static fromId(id: string, options?: Core.RequestOptions & { client?: Runloop }): Blueprint {
    const client = options?.client || Runloop.getDefaultClient();
    return new Blueprint(client, id);
  }

  /**
   * Preview a blueprint configuration without building it.
   * Returns the Dockerfile that would be built.
   *
   * @param params - Blueprint preview parameters
   * @param options - Request options with optional client override
   * @returns Preview with generated Dockerfile
   */
  static async preview(
    params: BlueprintPreviewParams,
    options?: Core.RequestOptions & { client?: Runloop },
  ): Promise<BlueprintPreviewView> {
    const client = options?.client || Runloop.getDefaultClient();
    return client.blueprints.preview(params, options);
  }

  /**
   * Get the blueprint ID.
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the complete blueprint data from the API.
   */
  async getInfo(options?: Core.RequestOptions): Promise<BlueprintView> {
    return this.client.blueprints.retrieve(this._id, options);
  }

  /**
   * Get all build logs for this blueprint.
   *
   * @param options - Request options
   * @returns Build logs
   */
  async logs(options?: Core.RequestOptions): Promise<BlueprintBuildLogsListView> {
    return this.client.blueprints.logs(this._id, options);
  }

  /**
   * Delete this blueprint.
   *
   * @param options - Request options
   */
  async delete(options?: Core.RequestOptions): Promise<unknown> {
    return this.client.blueprints.delete(this._id, options);
  }

  /**
   * Create a new devbox from this blueprint.
   * This is a convenience method that calls Devbox.create() with the blueprint ID
   * and any additional parameters you want to layer on top.
   *
   * @param params - Additional devbox creation parameters (optional)
   * @param options - Request options with optional polling configuration
   * @returns A new Devbox instance created from this blueprint
   */
  async createDevbox(
    params?: Omit<DevboxCreateParams, 'blueprint_id' | 'snapshot_id' | 'blueprint_name'>,
    options?: Core.RequestOptions & {
      polling?: Partial<
        import('../lib/polling').PollingOptions<import('../resources/devboxes/devboxes').DevboxView>
      >;
    },
  ): Promise<Devbox> {
    const createParams: DevboxCreateParams = {
      ...params,
      blueprint_id: this._id,
    };

    return Devbox.create(createParams, { ...options, client: this.client });
  }
}
