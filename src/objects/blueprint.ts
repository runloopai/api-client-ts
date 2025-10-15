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
import { PollingOptions } from '../lib/polling';
import { Devbox } from './devbox';
import { ObjectCreateOptions, ObjectOptions } from './types';

/**
 * Object-oriented interface for working with Blueprints.
 *
 * Example usage:
 * ```typescript
 * // Set default client (optional, can be done once at app startup)
 * Runloop.setDefaultClient(new Runloop({ bearerToken: 'your-token' }));
 *
 * // Use with default client
 * const blueprint = await Blueprint.create({
 *   name: 'my-blueprint',
 *   dockerfile: 'FROM ubuntu:22.04\nRUN apt-get update',
 * });
 *
 * // Or provide custom client
 * const blueprint = await Blueprint.create(
 *   { name: 'my-blueprint', dockerfile: 'FROM ubuntu:22.04' },
 *   { client: customClient }
 * );
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
  private blueprintData: BlueprintView;

  private constructor(client: Runloop, blueprintData: BlueprintView) {
    this.client = client;
    this.blueprintData = blueprintData;
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
    options?: ObjectCreateOptions<BlueprintView>,
  ): Promise<Blueprint>;
  /**
   * Create a new Blueprint and wait for it to complete building.
   * This is the recommended way to create a blueprint as it ensures it's ready to use.
   *
   * @param client - The Runloop API client
   * @param params - Parameters for creating the blueprint
   * @param options - Request options with optional polling configuration
   * @returns A Blueprint instance with completed build
   */
  static async create(
    client: Runloop,
    params: BlueprintCreateParams,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<BlueprintView>> },
  ): Promise<Blueprint>;
  static async create(
    clientOrParams: Runloop | BlueprintCreateParams,
    paramsOrOptions?: BlueprintCreateParams | ObjectCreateOptions<BlueprintView>,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<BlueprintView>> },
  ): Promise<Blueprint> {
    let client: Runloop;
    let params: BlueprintCreateParams;
    let requestOptions:
      | (Core.RequestOptions & { polling?: Partial<PollingOptions<BlueprintView>> })
      | undefined;

    // Handle overloaded signatures
    if (clientOrParams && typeof clientOrParams === 'object' && 'bearerToken' in clientOrParams) {
      // Old signature: create(client, params, options)
      client = clientOrParams;
      params = paramsOrOptions as BlueprintCreateParams;
      requestOptions = options;
    } else {
      // New signature: create(params, options)
      const opts = paramsOrOptions as ObjectCreateOptions<BlueprintView> | undefined;
      client = opts?.client || Runloop.getDefaultClient();
      params = clientOrParams as BlueprintCreateParams;
      requestOptions = opts;
    }

    const blueprintData = await client.blueprints.createAndAwaitBuildCompleted(params, requestOptions);
    return new Blueprint(client, blueprintData);
  }

  /**
   * Load an existing Blueprint by ID.
   *
   * @param id - The blueprint ID
   * @param options - Request options with optional client override
   * @returns A Blueprint instance
   */
  static async get(id: string, options?: ObjectOptions): Promise<Blueprint>;
  /**
   * Load an existing Blueprint by ID.
   *
   * @param client - The Runloop API client
   * @param id - The blueprint ID
   * @param options - Request options
   * @returns A Blueprint instance
   */
  static async get(client: Runloop, id: string, options?: Core.RequestOptions): Promise<Blueprint>;
  static async get(
    clientOrId: Runloop | string,
    idOrOptions?: string | ObjectOptions,
    options?: Core.RequestOptions,
  ): Promise<Blueprint> {
    let client: Runloop;
    let id: string;
    let requestOptions: Core.RequestOptions | undefined;

    // Handle overloaded signatures
    if (typeof clientOrId === 'string') {
      // New signature: get(id, options)
      const opts = idOrOptions as ObjectOptions | undefined;
      client = opts?.client || Runloop.getDefaultClient();
      id = clientOrId;
      requestOptions = opts;
    } else {
      // Old signature: get(client, id, options)
      client = clientOrId;
      id = idOrOptions as string;
      requestOptions = options;
    }

    const blueprintData = await client.blueprints.retrieve(id, requestOptions);
    return new Blueprint(client, blueprintData);
  }

  /**
   * Preview a blueprint configuration without building it.
   * Returns the Dockerfile that would be built.
   *
   * @param client - The Runloop API client
   * @param params - Blueprint preview parameters
   * @param options - Request options
   * @returns Preview with generated Dockerfile
   */
  static async preview(
    client: Runloop,
    params: BlueprintPreviewParams,
    options?: Core.RequestOptions,
  ): Promise<BlueprintPreviewView> {
    return client.blueprints.preview(params, options);
  }

  /**
   * Get the blueprint ID.
   */
  get id(): string {
    return this.blueprintData.id;
  }

  /**
   * Get the blueprint name.
   */
  get name(): string {
    return this.blueprintData.name;
  }

  /**
   * Get the current blueprint build status.
   */
  get status(): BlueprintView['status'] {
    return this.blueprintData.status;
  }

  /**
   * Get the blueprint state.
   */
  get state(): BlueprintView['state'] {
    return this.blueprintData.state;
  }

  /**
   * Get the complete blueprint data.
   */
  get data(): BlueprintView {
    return this.blueprintData;
  }

  /**
   * Refresh the blueprint data from the API.
   */
  async refresh(options?: Core.RequestOptions): Promise<void> {
    this.blueprintData = await this.client.blueprints.retrieve(this.blueprintData.id, options);
  }

  /**
   * Get all build logs for this blueprint.
   *
   * @param options - Request options
   * @returns Build logs
   */
  async logs(options?: Core.RequestOptions): Promise<BlueprintBuildLogsListView> {
    return this.client.blueprints.logs(this.blueprintData.id, options);
  }

  /**
   * Delete this blueprint.
   *
   * @param options - Request options
   */
  async delete(options?: Core.RequestOptions): Promise<unknown> {
    const result = await this.client.blueprints.delete(this.blueprintData.id, options);
    // Update local state
    this.blueprintData = { ...this.blueprintData, state: 'deleted' };
    return result;
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
    params?: Omit<DevboxCreateParams, 'blueprint_id'>,
    options?: Core.RequestOptions & {
      polling?: Partial<
        import('../lib/polling').PollingOptions<import('../resources/devboxes/devboxes').DevboxView>
      >;
    },
  ): Promise<Devbox> {
    const createParams: DevboxCreateParams = {
      ...params,
      blueprint_id: this.blueprintData.id,
    };

    return Devbox.create(this.client, createParams, options);
  }
}
