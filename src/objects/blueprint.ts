import type { Runloop } from '../index';
import type * as Core from '../core';
import type {
  BlueprintView,
  BlueprintCreateParams,
  BlueprintBuildLogsListView,
  BlueprintPreviewView,
  BlueprintPreviewParams,
} from '../resources/blueprints';
import { PollingOptions } from '../lib/polling';

/**
 * Object-oriented interface for working with Blueprints.
 *
 * Example usage:
 * ```typescript
 * const blueprint = await Blueprint.create(client, {
 *   name: 'my-blueprint',
 *   dockerfile: 'FROM ubuntu:22.04\nRUN apt-get update',
 * });
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
   * @param client - The Runloop API client
   * @param params - Parameters for creating the blueprint
   * @param options - Request options with optional polling configuration
   * @returns A Blueprint instance with completed build
   */
  static async create(
    client: Runloop,
    params: BlueprintCreateParams,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<BlueprintView>> },
  ): Promise<Blueprint> {
    const blueprintData = await client.blueprints.createAndAwaitBuildCompleted(params, options);
    return new Blueprint(client, blueprintData);
  }

  /**
   * Load an existing Blueprint by ID.
   *
   * @param client - The Runloop API client
   * @param id - The blueprint ID
   * @param options - Request options
   * @returns A Blueprint instance
   */
  static async get(client: Runloop, id: string, options?: Core.RequestOptions): Promise<Blueprint> {
    const blueprintData = await client.blueprints.retrieve(id, options);
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
   * Access to the underlying blueprints API resource for advanced operations.
   */
  get api() {
    return this.client.blueprints;
  }
}
