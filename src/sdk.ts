export * from './sdk/index';
import type * as Core from './core';
import { Runloop, type ClientOptions } from './index';
import { Devbox } from './sdk/devbox';
import { Blueprint } from './sdk/blueprint';
import { Snapshot } from './sdk/snapshot';
import { StorageObject } from './sdk/storage-object';

// Import types used in this file
import type {
  DevboxCreateParams,
  DevboxListParams,
  DevboxView,
  DevboxListDiskSnapshotsParams,
} from './resources/devboxes/devboxes';
import type { BlueprintCreateParams, BlueprintListParams } from './resources/blueprints';
import type { ObjectCreateParams, ObjectListParams } from './resources/objects';
import { PollingOptions } from './lib/polling';

export * from './index';

/**
 * Primary Runloop API namespace used by the SDK.
 *
 * Prefer this over the legacy `Runloop` export so that generated docs highlight
 * the new name, while still preserving backwards compatibility for existing
 * customers that import `Runloop` directly.
 */
export import RunloopAPI = Runloop;

// Extract the content type from the API types
type ContentType = ObjectCreateParams['content_type'];

/**
 * Runloop SDK - The recommended way to interact with Runloop.
 * Provides both low-level API access and high-level object-oriented interfaces.
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK(); // export RUNLOOP_API_KEY will automatically be used.
 * const devbox = await runloop.devbox.create({ name: 'my-devbox' });
 * const result = await devbox.cmd.exec('echo "Hello, World!"');
 * console.log(result.exitCode);
 * ```
 *
 * ## Operations
 * - `devbox` - {@link DevboxOps}
 * - `blueprint` - {@link BlueprintOps}
 * - `snapshot` - {@link SnapshotOps}
 * - `storageObject` - {@link StorageObjectOps}
 *
 * See the documentation for each Operations class for more details.
 *
 * ## Use the HTTP API directly
 * This is useful when you need to access features not yet exposed through the high-level interfaces.
 *
 * See the {@link RunloopAPI} for the Runloop class for more details.
 *
 * ```typescript
 * const runloop = new RunloopSDK();
 * const createResult = await runloop.api.secrets.create({ name: 'my-secret', value: 'my-secret-value' });
 * console.log(createResult.name);
 * ```
 *
 */
export class RunloopSDK {
  /**
   * Low-level API client providing direct access to all Runloop API endpoints.
   * Use this when you need fine-grained control or access to features not yet exposed
   * through the high-level interfaces. Most users should prefer the specialized interfaces
   * (devbox, blueprint, etc.) for a more convenient API.
   */
  public readonly api: RunloopAPI;

  /**
   * **Devbox Operations** - {@link DevboxOps} for creating and accessing {@link Devbox} class instances.
   *
   * Devboxes are isolated development environments running in Runloop's cloud - the core resource
   * that provides you with a fully configured development environment. Use these operations to create
   * new devboxes or get existing ones by ID.
   */
  public readonly devbox: DevboxOps;

  /**
   * **Blueprint Operations** - {@link BlueprintOps} for creating and accessing {@link Blueprint} class instances.
   *
   * Blueprints are reusable templates that define the base configuration for devboxes, built from
   * Dockerfiles. They can be used to create multiple devboxes with consistent environments. Use these
   * operations to create new blueprints or get existing ones by ID.
   */
  public readonly blueprint: BlueprintOps;

  /**
   * **Snapshot Operations** - {@link SnapshotOps} for creating and accessing {@link Snapshot} class instances.
   *
   * Snapshots are point-in-time copies of a devbox's disk state, allowing you to save the complete
   * state of a devbox and restore it later or create new devboxes from saved states. Use these
   * operations to list snapshots or get existing ones by ID.
   */
  public readonly snapshot: SnapshotOps;

  /**
   * **Storage Object Operations** - {@link StorageObjectOps} for creating and accessing {@link StorageObject} class instances.
   *
   * Storage objects are files stored in Runloop's object storage system. They can be uploaded,
   * downloaded, and managed with metadata, useful for storing configuration files, data files, or
   * any other content you need to persist or share between devboxes. Use these operations to create
   * new storage objects or get existing ones by ID.
   */
  public readonly storageObject: StorageObjectOps;

  /**
   * Creates a new RunloopSDK instance.
   * @param {ClientOptions} [options] - Optional client configuration options.
   */
  constructor(options?: ClientOptions) {
    this.api = new RunloopAPI(options);
    this.devbox = new DevboxOps(this.api);
    this.blueprint = new BlueprintOps(this.api);
    this.snapshot = new SnapshotOps(this.api);
    this.storageObject = new StorageObjectOps(this.api);
  }
}

/**
 * Devbox SDK interface for managing devboxes.
 *
 * ## Overview
 *
 * The `DevboxOps` class provides a high-level abstraction for managing devboxes,
 * which are isolated development environments running in Runloop's cloud infrastructure.
 * Devboxes can be created from blueprints or snapshots, and support command execution,
 * file operations, and lifecycle management.
 *
 * ## Usage
 *
 * This interface is accessed via {@link RunloopSDK.devbox}. You should construct
 * a {@link RunloopSDK} instance and use it from there:
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 * const devbox = await runloop.devbox.create({ name: 'my-devbox' });
 * const result = await devbox.cmd.exec('echo "Hello, World!"');
 * ```
 */
export class DevboxOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * Create a new Devbox and wait for it to reach the running state.
   * This is the recommended way to create a devbox as it ensures it's ready to use.
   *
   * See the {@link DevboxOps.create} method for calling this
   * @private
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const devbox = await runloop.devbox.create({ name: 'my-devbox' });
   *
 * devbox.cmd.exec('echo "Hello, World!"');
 * ...
 * ```
   *
   * @param {DevboxCreateParams} [params] - Parameters for creating the devbox.
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options including polling configuration.
   * @returns {Promise<Devbox>} A {@link Devbox} instance.
   */
  async create(
    params?: DevboxCreateParams,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<Devbox> {
    return Devbox.create(this.client, params, options);
  }

  /**
   * Create a new devbox from a blueprint ID.
   * @param {string} blueprintId - The ID of the blueprint to use.
   * @param {Omit<DevboxCreateParams, 'blueprint_id' | 'snapshot_id' | 'blueprint_name'>} [params] - Additional parameters for creating the devbox (excluding blueprint_id, snapshot_id, and blueprint_name).
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options including polling configuration.
   * @returns {Promise<Devbox>} A {@link Devbox} instance.
   */
  async createFromBlueprintId(
    blueprintId: string,
    params?: Omit<DevboxCreateParams, 'blueprint_id' | 'snapshot_id' | 'blueprint_name'>,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<Devbox> {
    return Devbox.createFromBlueprintId(this.client, blueprintId, params, options);
  }

  /**
   * Create a new devbox from a blueprint name.
   * @param {string} blueprintName - The name of the blueprint to use.
   * @param {Omit<DevboxCreateParams, 'blueprint_id' | 'snapshot_id' | 'blueprint_name'>} [params] - Additional parameters for creating the devbox (excluding blueprint_id, snapshot_id, and blueprint_name).
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options including polling configuration.
   * @returns {Promise<Devbox>} A {@link Devbox} instance.
   */
  async createFromBlueprintName(
    blueprintName: string,
    params?: Omit<DevboxCreateParams, 'blueprint_id' | 'snapshot_id' | 'blueprint_name'>,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<Devbox> {
    return Devbox.createFromBlueprintName(this.client, blueprintName, params, options);
  }

  /**
   * Create a new devbox from a snapshot.
   *
   * @example
   * ```typescript
   * const devbox = await Devbox.createFromSnapshot(
   *   runloop,
   *   snapshot.id,
   *   { name: 'restored-devbox' }
   * );
   * ```
   *
   * @param {string} snapshotId - The ID of the snapshot to use.
   * @param {Omit<DevboxCreateParams, 'snapshot_id' | 'blueprint_id' | 'blueprint_name'>} [params] - Additional parameters for creating the devbox (excluding snapshot_id, blueprint_id, and blueprint_name).
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options including polling configuration.
   * @returns {Promise<Devbox>} A {@link Devbox} instance.
   */
  async createFromSnapshot(
    snapshotId: string,
    params?: Omit<DevboxCreateParams, 'snapshot_id' | 'blueprint_id' | 'blueprint_name'>,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<Devbox> {
    return Devbox.createFromSnapshot(this.client, snapshotId, params, options);
  }

  /**
   * Get a devbox object by its ID.
   * @param {string} id - The ID of the devbox.
   * @returns {Devbox} A {@link Devbox} instance.
   */
  fromId(id: string): Devbox {
    return Devbox.fromId(this.client, id);
  }

  /**
   * List all devboxes with optional filters.
   * @param {DevboxListParams} [params] - Optional filter parameters.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Devbox[]>} An array of {@link Devbox} instances.
   */
  async list(params?: DevboxListParams, options?: Core.RequestOptions): Promise<Devbox[]> {
    const result = await this.client.devboxes.list(params, options);
    const devboxes: Devbox[] = [];

    for (const devbox of result.devboxes) {
      devboxes.push(Devbox.fromId(this.client, devbox.id));
    }

    return devboxes;
  }
}

/**
 * Blueprint SDK interface for managing blueprints.
 *
 * ## Overview
 *
 * The `BlueprintOps` class provides a high-level abstraction for managing blueprints,
 * which define the base configuration for devboxes. Blueprints are built from Dockerfiles
 * and can be used to create multiple devboxes with consistent environments.
 *
 * ## Usage
 *
 * This interface is accessed via {@link RunloopSDK.blueprint}. You should construct
 * a {@link RunloopSDK} instance and use it from there:
 *
 * @example
 * ```typescript
 * const sdk = new RunloopSDK();
 * const blueprint = await sdk.blueprint.create({
 *   name: 'my-blueprint',
 *   dockerfile: `FROM ubuntu:22.04
 *                RUN apt-get update`,
 * });
 * const devbox = await sdk.devbox.createFromBlueprintId(blueprint.id, { name: 'my-devbox' });
 * ```
 */
export class BlueprintOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * Create a new blueprint.
   * @param {BlueprintCreateParams} params - Parameters for creating the blueprint.
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<RunloopAPI.Blueprints.BlueprintView>> }} [options] - Request options including polling configuration.
   * @returns {Promise<Blueprint>} A {@link Blueprint} instance.
   */
  async create(
    params: BlueprintCreateParams,
    options?: Core.RequestOptions & {
      polling?: Partial<PollingOptions<RunloopAPI.Blueprints.BlueprintView>>;
    },
  ): Promise<Blueprint> {
    return Blueprint.create(this.client, params, options);
  }

  /**
   * Get a blueprint object by its ID.
   * @param {string} id - The ID of the blueprint.
   * @returns {Blueprint} A {@link Blueprint} instance.
   */
  fromId(id: string): Blueprint {
    return Blueprint.fromId(this.client, id);
  }

  /**
   * List all blueprints with optional filters.
   * @param {BlueprintListParams} [params] - Optional filter parameters.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Blueprint[]>} An array of {@link Blueprint} instances.
   */
  async list(params?: BlueprintListParams, options?: Core.RequestOptions): Promise<Blueprint[]> {
    const result = await this.client.blueprints.list(params, options);
    const blueprints: Blueprint[] = [];

    for (const blueprint of result.blueprints) {
      blueprints.push(Blueprint.fromId(this.client, blueprint.id));
    }

    return blueprints;
  }
}

/**
 * Snapshot SDK interface for managing disk snapshots.
 *
 * ## Overview
 *
 * The `SnapshotOps` class provides a high-level abstraction for managing disk snapshots,
 * which capture the complete state of a devbox's disk. Snapshots can be used to restore
 * devboxes to a previous state or create new devboxes from saved states.
 *
 * ## Usage
 *
 * This interface is accessed via {@link RunloopSDK.snapshot}. You should construct
 * a {@link RunloopSDK} instance and use it from there:
 *
 * @example
 * ```typescript
 * const sdk = new RunloopSDK();
 * const snapshot = await devbox.snapshotDisk({ name: 'backup' });
 * ...
 * const devbox = await snapshot.createDevbox();
 * ```
 */
export class SnapshotOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * Get a snapshot object by its ID.
   * @param {string} id - The ID of the snapshot.
   * @returns {Snapshot} A {@link Snapshot} instance.
   */
  fromId(id: string): Snapshot {
    return Snapshot.fromId(this.client, id);
  }

  /**
   * List all snapshots.
   * @param {DevboxListDiskSnapshotsParams} [params] - Optional filter parameters.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Snapshot[]>} An array of {@link Snapshot} instances.
   */
  async list(params?: DevboxListDiskSnapshotsParams, options?: Core.RequestOptions): Promise<Snapshot[]> {
    return Snapshot.list(this.client, params, options);
  }
}

/**
 * Storage object management interface
 *
 * ## Overview
 *
 * The `StorageObjectOps` class provides a high-level abstraction for managing storage objects,
 * which are files stored in Runloop's object storage. Storage objects can be uploaded,
 * downloaded, and managed with metadata.
 *
 * ## Usage
 *
 * This interface is accessed via {@link RunloopSDK.storageObject}. You should construct
 * a {@link RunloopSDK} instance and use it from there:
 *
 * @example
 * ```typescript
 * const sdk = new RunloopSDK();
 * const storageObject = await sdk.storageObject.uploadFromFile("./my-file.txt", "my-file.txt");
 * const objects = await sdk.storageObject.list();
 * ```
 */
export class StorageObjectOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * Create a new storage object. This is for advanced users and for basic operations you should use the {@link StorageObjectOps.uploadFromFile uploadFromFile()}, {@link StorageObjectOps.uploadFromText uploadFromText()}, or {@link StorageObjectOps.uploadFromBuffer uploadFromBuffer()} methods instead.
   *
   * @example
   * ```typescript
   * const storageObject = await runloop.storageObject.create({
   *   name: 'my-file.txt',
   *   content_type: 'text',
   *   metadata: { project: 'demo' },
   * });
   * storageObject.uploadContent('Hello, World!');
   * // this will mark the object as complete and make it read-only
   * storageObject.complete();
   * ```
   * @param params - Parameters for creating the object.
   * @param options - Request options.
   * @returns A {@link StorageObject} instance.
   */
  async create(
    params: ObjectCreateParams,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<RunloopAPI.Objects.ObjectView>> },
  ): Promise<StorageObject> {
    return StorageObject.create(this.client, params, options);
  }

  /**
   * Get a storage object by its ID.
   *
   * @param {string} id - The ID of the storage object.
   * @returns {StorageObject} A {@link StorageObject} instance.
   */
  fromId(id: string): StorageObject {
    return StorageObject.fromId(this.client, id);
  }

  /**
   * List all storage objects with optional filters.
   * @param {ObjectListParams} [params] - Optional filter parameters.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<StorageObject[]>} An array of {@link StorageObject} instances.
   */
  async list(params?: ObjectListParams, options?: Core.RequestOptions): Promise<StorageObject[]> {
    const result = await this.client.objects.list(params, options);
    const storageObjects: StorageObject[] = [];
    for (const storageObject of result.objects) {
      storageObjects.push(StorageObject.fromId(this.client, storageObject.id));
    }
    return storageObjects;
  }

  /**
   * Upload a file directly from the filesystem (Node.js only).
   * This method handles the complete three-step upload process:
   * 1. Create object and get upload URL
   * 2. Upload file content to the provided URL
   * 3. Mark upload as complete
   *
   * See the {@link StorageObjectOps.uploadFromFile} method for calling this
   * @private
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const object = await runloop.storageObject.uploadFromFile(
   *   './package.json',
   *   'package.json',
   *   {
   *     contentType: 'text',
   *     metadata: { project: 'my-app' },
   *   }
   * );
   * console.log(`Uploaded: ${object.id}`);
   * ```
   * @param {string} filePath - The path to the file to upload.
   * @param {string} name - The name to use for the storage object.
   * @param {Core.RequestOptions & { contentType?: ContentType; metadata?: Record<string, string> }} [options] - Request options including content type and metadata.
   * @returns {Promise<StorageObject>} A {@link StorageObject} instance.
   */
  async uploadFromFile(
    filePath: string,
    name: string,
    options?: Core.RequestOptions & {
      contentType?: ContentType;
      metadata?: Record<string, string>;
    },
  ): Promise<StorageObject> {
    return StorageObject.uploadFromFile(this.client, filePath, name, options);
  }

  /**
   * Upload text content directly.
   * This method handles the complete three-step upload process:
   * 1. Create object and get upload URL
   * 2. Upload text content to the provided URL
   * 3. Mark upload as complete
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const object = await runloop.storageObject.uploadFromText(
   *   'Hello, World!',
   *   'greeting.txt',
   *   { metadata: { type: 'greeting' } }
   * );
   * ```
   * @param {string} text - The text content to upload.
   * @param {string} name - The name to use for the storage object.
   * @param {Core.RequestOptions & { metadata?: Record<string, string> }} [options] - Request options including metadata.
   * @returns {Promise<StorageObject>} A {@link StorageObject} instance.
   */
  async uploadFromText(
    text: string,
    name: string,
    options?: Core.RequestOptions & {
      metadata?: Record<string, string>;
    },
  ): Promise<StorageObject> {
    return StorageObject.uploadFromText(this.client, text, name, options);
  }

  /**
   * Upload content from a Buffer (Node.js only).
   * This method handles the complete three-step upload process:
   * 1. Create object and get upload URL
   * 2. Upload buffer content to the provided URL
   * 3. Mark upload as complete
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const buffer = Buffer.from('Binary data');
   * const object = await runloop.storageObject.uploadFromBuffer(
   *   buffer,
   *   'data.bin',
   *   'unspecified',
   *   { metadata: { format: 'binary' } }
   * );
   * ```
   * @param {Buffer} buffer - The buffer containing the content to upload.
   * @param {string} name - The name to use for the storage object.
   * @param {ContentType} contentType - The content type of the buffer.
   * @param {Core.RequestOptions & { metadata?: Record<string, string> }} [options] - Request options including metadata.
   * @returns {Promise<StorageObject>} A {@link StorageObject} instance.
   */
  async uploadFromBuffer(
    buffer: Buffer,
    name: string,
    contentType: ContentType,
    options?: Core.RequestOptions & {
      metadata?: Record<string, string>;
    },
  ): Promise<StorageObject> {
    return StorageObject.uploadFromBuffer(this.client, buffer, name, contentType, options);
  }

  /**
   * Upload a local directory as a gzipped tarball (Node.js only).
   * This method creates a tar archive of the directory contents, gzips it, and uploads it.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   *
   * const object = await runloop.storageObject.uploadFromDir(
   *   './my-project',
   *   {
   *     name: 'my-project.tar.gz',
   *     ttl_ms: 3600000, // 1 hour
   *     metadata: { project: 'demo' }
   *   }
   * );
   * console.log(`Uploaded directory as ${object.id}`);
   * ```
   *
   * @param {string} dirPath - The path to the directory to upload.
   * @param {Omit<ObjectCreateParams, 'content_type'} params - Parameters for creating the object.
   * @param {Core.RequestOptions} options - Request options.
   * @returns {Promise<StorageObject>} A {@link StorageObject} instance.
   */
  async uploadFromDir(
    dirPath: string,
    params: Omit<ObjectCreateParams, 'content_type'>,
    options?: Core.RequestOptions,
  ): Promise<StorageObject> {
    return StorageObject.uploadFromDir(this.client, dirPath, params, options);
  }
}

// @deprecated Use {@link RunloopSDK} instead.
/**
 * @deprecated Use {@link RunloopSDK} instead.
 * @example
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client';
 * const sdk = new RunloopSDK();
 * const devbox = await sdk.devbox.create({ name: 'my-devbox' });
 * ```
 */
export default Runloop;

export declare namespace RunloopSDK {
  export {
    RunloopSDK as Client,
    DevboxOps as DevboxOps,
    BlueprintOps as BlueprintOps,
    SnapshotOps as SnapshotOps,
    StorageObjectOps as StorageObjectOps,
    Devbox as Devbox,
    Blueprint as Blueprint,
    Snapshot as Snapshot,
    StorageObject as StorageObject,
  };
}
// Export SDK classes from sdk/sdk.ts - these are separate from RunloopSDK to avoid circular dependencies
export {
  Devbox,
  DevboxCmdOps,
  DevboxFileOps,
  DevboxNetOps,
  type ExecuteStreamingCallbacks,
  Blueprint,
  Snapshot,
  StorageObject,
  Execution,
  ExecutionResult,
} from './sdk/index';
