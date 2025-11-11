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
 *
 * ## Overview
 *
 * The `Blueprint` class provides a high-level API for managing blueprints, which define
 * the base configuration for devboxes. Blueprints are built from Dockerfiles and can be
 * used to create multiple devboxes with consistent environments.
 *
 * ## Creating Blueprints
 *
 * ### Basic Creation
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client-ts';
 *
 * const runloop = new RunloopSDK();
 * const blueprint = await runloop.blueprint.create({
 *   name: 'my-blueprint',
 *   dockerfile: 'FROM ubuntu:22.04\nRUN apt-get update',
 * });
 * console.log(`Blueprint ${blueprint.id} built successfully`);
 * ```
 *
 * ### Create from Existing Blueprint
 * ```typescript
 * const runloop = new RunloopSDK();
 * const blueprint = runloop.blueprint.fromId('blueprint-123');
 * const info = await blueprint.getInfo();
 * console.log(`Blueprint name: ${info.name}`);
 * ```
 *
 * ## Creating Devboxes from Blueprints
 *
 * ### Using the Blueprint Instance
 * ```typescript
 * const runloop = new RunloopSDK();
 * const blueprint = runloop.blueprint.fromId('blueprint-123');
 * const devbox = await blueprint.createDevbox({ name: 'my-devbox' });
 * ```
 *
 * ### Using the SDK Interface
 * ```typescript
 * const runloop = new RunloopSDK();
 * // Using blueprint ID
 * const devbox = await runloop.devbox.createFromBlueprintId('blueprint-123', {
 *   name: 'my-devbox',
 * });
 *
 * // Using blueprint name
 * const devbox = await runloop.devbox.createFromBlueprintName('my-blueprint', {
 *   name: 'my-devbox',
 * });
 * ```
 *
 * ## Managing Blueprints
 *
 * ### List Blueprints
 * ```typescript
 * const runloop = new RunloopSDK();
 * const blueprints = await runloop.blueprint.list();
 * for (const blueprint of blueprints) {
 *   console.log(`${blueprint.id}: ${(await blueprint.getInfo()).name}`);
 * }
 * ```
 *
 * ### Get Build Logs
 * ```typescript
 * const runloop = new RunloopSDK();
 * const blueprint = runloop.blueprint.fromId('blueprint-123');
 * const logs = await blueprint.logs();
 * console.log('Build logs:', logs);
 * ```
 *
 * ### Delete Blueprint
 * ```typescript
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
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const blueprint = await runloop.blueprint.create({
   *   name: 'nodejs-blueprint',
   *   dockerfile: 'FROM node:18\nWORKDIR /app',
   * });
   * console.log(`Blueprint ${blueprint.id} is ready!`);
   * ```
   *
   * @param client - The Runloop client instance
   * @param params - Parameters for creating the blueprint
   * @param options - Request options with optional polling configuration
   * @returns A Blueprint instance with completed build
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
   * @param client - The Runloop client instance
   * @param id - The blueprint ID
   * @returns A Blueprint instance
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
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const blueprint = runloop.blueprint.fromId('blueprint-123');
   * const devbox = await blueprint.createDevbox({
   *   name: 'my-devbox',
   *   // Additional devbox parameters...
   * });
   * ```
   *
   * @param params - Additional devbox creation parameters (optional)
   * @param options - Request options with optional polling configuration
   * @returns A new Devbox instance created from this blueprint
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
