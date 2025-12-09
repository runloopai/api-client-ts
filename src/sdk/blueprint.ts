import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  BlueprintView,
  BlueprintCreateParams,
  BlueprintBuildLogsListView,
} from '../resources/blueprints';
import type { DevboxCreateParams, DevboxView } from '../resources/devboxes/devboxes';
import type { PollingOptions } from '../lib/polling';
import type { IgnoreMatcher } from '../lib/ignore-matcher';
import { Devbox } from './devbox';
import { StorageObject } from './storage-object';

export interface BuildContextDirOptions {
  /**
   * Path to the directory to use as build context (Node.js only).
   */
  path: string;

  /**
   * Optional ignore specification:
   *  - an IgnoreMatcher instance, or
   *  - an array of docker-style glob patterns (as in .dockerignore).
   */
  ignore?: IgnoreMatcher | string[];

  /**
   * Optional path to a specific .dockerignore-style file to use instead of the
   * default `<path>/.dockerignore`.
   */
  dockerignorePath?: string;

  /**
   * TTL (ms) for the backing StorageObject. Defaults to 1 hour if omitted.
   */
  ttlMs?: number;
}

export type CreateParams = Omit<BlueprintCreateParams, 'build_context'> & {
  /**
   * A build context to attach to the Blueprint build.
   * Enables the use of `COPY` Dockerfile directives.
   */
  build_context?: StorageObject | BlueprintCreateParams.BuildContext | null;

  /**
   * Configure a local directory build context.
   *
   * If provided, the SDK will:
   *  1. Create and upload a gzipped tarball of `path` as a StorageObject
   *     (honoring .dockerignore or provided ignore patterns),
   *  2. Set `build_context` on the Blueprint to reference that object.
   *
   * If both build_context and build_context_dir are provided, build_context_dir
   * takes precedence.
   */
  build_context_dir?: string | BuildContextDirOptions | null;
};

/**
 * Object-oriented interface for working with Blueprints.
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
   * @param {CreateParams} params - Parameters for creating the blueprint
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<BlueprintView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<Blueprint>} A {@link Blueprint} instance with completed build
   */
  static async create(
    client: Runloop,
    params: CreateParams,
    options?: Core.RequestOptions & {
      polling?: Partial<PollingOptions<BlueprintView>>;
    },
  ): Promise<Blueprint> {
    const { build_context, build_context_dir, ...other } = params as any;
    let rawParams: BlueprintCreateParams;

    if (build_context_dir) {
      const dirConfig: BuildContextDirOptions =
        typeof build_context_dir === 'string' ? { path: build_context_dir } : build_context_dir;

      const ttlMs = dirConfig.ttlMs ?? 3600000;

      const storageObject = await StorageObject.uploadFromDir(
        client,
        dirConfig.path,
        {
          name: `build-context-${params.name}`,
          ttl_ms: ttlMs,
        },
        {
          ...(options ?? {}),
          ignore: dirConfig.ignore,
          dockerignorePath: dirConfig.dockerignorePath,
        } as any,
      );

      rawParams = {
        ...other,
        build_context: { type: 'object', object_id: storageObject.id },
      } as BlueprintCreateParams;
    } else if (build_context instanceof StorageObject) {
      rawParams = {
        ...other,
        build_context: { type: 'object', object_id: build_context.id },
      } as BlueprintCreateParams;
    } else {
      rawParams = {
        ...other,
        build_context,
      } as BlueprintCreateParams;
    }

    const blueprintData = await client.blueprints.createAndAwaitBuildCompleted(rawParams, options);
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
