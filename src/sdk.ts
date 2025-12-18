export * from './sdk/index';
import type * as Core from './core';
import { Runloop, type ClientOptions } from './index';
import { Devbox } from './sdk/devbox';
import { Blueprint, type CreateParams as BlueprintCreateParams } from './sdk/blueprint';
import { Snapshot } from './sdk/snapshot';
import { StorageObject } from './sdk/storage-object';
import { Agent } from './sdk/agent';
import { Scorer } from './sdk/scorer';

// Import types used in this file
import type {
  DevboxCreateParams,
  DevboxListParams,
  DevboxView,
  DevboxListDiskSnapshotsParams,
} from './resources/devboxes/devboxes';
import type { BlueprintListParams } from './resources/blueprints';
import type { ObjectCreateParams, ObjectListParams } from './resources/objects';
import type { AgentCreateParams, AgentListParams } from './resources/agents';
import type { ScorerCreateParams, ScorerListParams } from './resources/scenarios/scorers';
import { PollingOptions } from './lib/polling';
import * as Shared from './resources/shared';

// ============================================================================
// SDK-specific mount types for convenient StorageObject mounting
// ============================================================================

/**
 * A convenient mount format that maps a path to a StorageObject.
 * The key is the path on the devbox where the object will be mounted,
 * and the value is the StorageObject instance.
 *
 * @category SDK Types
 *
 * @example
 * ```typescript
 * { '/home/user/config.txt': storageObject }
 * ```
 */
export type InlineObjectMount = { [path: string]: StorageObject };

/**
 * Union type representing all valid mount inputs for the SDK.
 * Accepts both the standard API mount format and the convenient InlineObjectMount format.
 *
 * @category SDK Types
 */
export type MountInstance = Shared.Mount | InlineObjectMount;

/**
 * Extended DevboxCreateParams that accepts the convenient SDK mount syntax.
 * Use this type when creating devboxes through the SDK's DevboxOps.create() method.
 *
 * @category SDK Types
 */
export interface SDKDevboxCreateParams extends Omit<DevboxCreateParams, 'mounts'> {
  /**
   * A list of mounts to be included in the Devbox.
   * Accepts both standard API mount format and the convenient `{ path: StorageObject }` syntax.
   *
   * @example
   * ```typescript
   * mounts: [
   *   { '/home/user/file.txt': storageObject },
   *   { type: 'code_mount', repo_name: 'my-repo', repo_owner: 'owner' }
   * ]
   * ```
   */
  mounts?: Array<MountInstance> | null;
}

/**
 * Type guard to check if a mount input is an InlineObjectMount (path-to-StorageObject mapping).
 * Standard Shared.Mount types have a 'type' discriminator property, while InlineObjectMount does not.
 *
 * @param mount - The mount input to check
 * @returns true if the mount is an InlineObjectMount
 */
function isInlineObjectMount(mount: MountInstance): mount is InlineObjectMount {
  if (typeof mount !== 'object' || mount === null || 'type' in mount) {
    return false;
  }
  // Exclude arrays
  if (Array.isArray(mount)) {
    return false;
  }
  // Validate that all values have an 'id' property (StorageObject shape)
  const values = Object.values(mount);
  return (
    values.length > 0 &&
    values.every((v) => v && typeof v === 'object' && 'id' in v && typeof v.id === 'string')
  );
}

/**
 * Transforms SDK mount inputs to the API-compatible Shared.Mount format.
 * Converts convenient `{ path: StorageObject }` syntax to `ObjectMountParameters`.
 *
 * @param mounts - Array of SDK mount inputs
 * @returns Array of API-compatible mounts
 */
function transformMounts(mounts: Array<MountInstance>): Array<Shared.Mount> {
  return mounts.flatMap((mount) => {
    if (isInlineObjectMount(mount)) {
      // Convert { "path": StorageObject } to ObjectMountParameters
      return Object.entries(mount).map(([path, obj]) => {
        if (!obj || typeof obj !== 'object' || typeof obj.id !== 'string') {
          throw new Error(
            `Invalid mount value for path "${path}": expected a StorageObject with an 'id' property, ` +
              `got ${obj === null ? 'null' : typeof obj}`,
          );
        }
        return {
          type: 'object_mount' as const,
          object_id: obj.id,
          object_path: path,
        };
      });
    }
    // Already a standard mount
    return mount;
  });
}

/**
 * Transforms SDKDevboxCreateParams to DevboxCreateParams by converting SDK mount syntax.
 *
 * @param params - SDK devbox creation parameters
 * @returns API-compatible devbox creation parameters
 */
function transformSDKDevboxCreateParams(params?: SDKDevboxCreateParams): DevboxCreateParams | undefined {
  if (!params) {
    return undefined;
  }

  // Extract mounts and rest of params
  const { mounts, ...rest } = params;

  // If mounts is undefined, don't include it in the result (preserves the optional property)
  if (mounts === undefined) {
    return rest as DevboxCreateParams;
  }

  // If mounts is null or empty array, pass through as-is with correct type
  if (mounts === null || mounts.length === 0) {
    return {
      ...rest,
      mounts: mounts as Array<Shared.Mount> | null,
    };
  }

  // Transform non-empty mounts array
  return {
    ...rest,
    mounts: transformMounts(mounts),
  };
}

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
 * @category SDK Client
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK(); // export RUNLOOP_API_KEY will automatically be used.
 * const devbox = await runloop.devbox.create({ name: 'my-devbox' });
 * const result = await devbox.cmd.exec('echo "Hello, World!"');
 * console.log(result.exitCode);
 * ```
 *
 * @remarks
 * ## Operations
 * - `devbox` - {@link DevboxOps}
 * - `blueprint` - {@link BlueprintOps}
 * - `snapshot` - {@link SnapshotOps}
 * - `storageObject` - {@link StorageObjectOps}
 * - `agent` - {@link AgentOps}
 * - `scorer` - {@link ScorerOps}
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
   * **Agent Operations** - {@link AgentOps} for creating and accessing {@link Agent} class instances.
   *
   * Agents are registered AI agent entities that can be mounted into devboxes. Agents can be sourced
   * from npm, pip, git repositories, or object storage, and provide reusable agent code that can be
   * shared across multiple devboxes. Use these operations to create new agents or get existing ones by ID.
   */
  public readonly agent: AgentOps;

  /**
   * **Scorer Operations** - {@link ScorerOps} for creating and accessing {@link Scorer} class instances.
   *
   * Scorers are custom scoring functions that evaluate scenario outputs. They define scripts
   * that produce a score in the range [0.0, 1.0] for scenario runs.
   */
  public readonly scorer: ScorerOps;

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
    this.agent = new AgentOps(this.api);
    this.scorer = new ScorerOps(this.api);
  }
}

/**
 * Devbox SDK interface for managing devboxes.
 *
 * @category Devbox
 *
 * @remarks
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
   * Supports the convenient SDK mount syntax for StorageObjects:
   * ```typescript
   * mounts: [{ '/path/on/devbox': storageObject }]
   * ```
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const devbox = await runloop.devbox.create({ name: 'my-devbox' });
   *
   * devbox.cmd.exec('echo "Hello, World!"');
   * ```
   *
   * @example
   * ```typescript
   * // Create devbox with mounted storage object
   * const storageObject = await runloop.storageObject.uploadFromFile('./config.txt', 'config.txt');
   * const devbox = await runloop.devbox.create({
   *   name: 'devbox-with-file',
   *   mounts: [{ '/home/user/config.txt': storageObject }]
   * });
   * ```
   *
   * @param {SDKDevboxCreateParams} [params] - Parameters for creating the devbox, with SDK mount syntax support.
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options including polling configuration.
   * @returns {Promise<Devbox>} A {@link Devbox} instance.
   */
  async create(
    params?: SDKDevboxCreateParams,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<Devbox> {
    const transformedParams = transformSDKDevboxCreateParams(params);
    return Devbox.create(this.client, transformedParams, options);
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
 * @category Blueprint
 *
 * @remarks
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
 * const runloop = new RunloopSDK();
 * const blueprint = await runloop.blueprint.create({
 *   name: 'my-blueprint',
 *   dockerfile: `FROM ubuntu:22.04
 *                RUN apt-get update`,
 * });
 * const devbox = await runloop.devbox.createFromBlueprintId(blueprint.id, { name: 'my-devbox' });
 * ```
 *
 * To use a local directory as a build context, use an object.
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 * const obj = await runloop.storageObject.uploadFromDir(
 *   './',
 *   {
 *     name: 'build-context',
 *     ttl_ms: 3600000, // 1 hour
 *   }
 * );
 * const blueprint = await runloop.blueprint.create({
 *   name: 'my-blueprint-with-context',
 *   dockerfile: `FROM ubuntu:22.04
 *                COPY . .`,
 *   build_context: obj,
 * });
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
 * @category Snapshot
 *
 * @remarks
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
 * const runloop = new RunloopSDK();
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
 * @category Storage Object
 *
 * @remarks
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
 * const runloop = new RunloopSDK();
 * const storageObject = await runloop.storageObject.uploadFromFile("./my-file.txt", "my-file.txt");
 * const objects = await runloop.storageObject.list();
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

/**
 * Agent SDK interface for managing agents.
 *
 * @category Agent
 *
 * @remarks
 * ## Overview
 *
 * The `AgentOps` class provides a high-level abstraction for managing AI agent entities.
 * Agents can be sourced from npm, pip, git repositories, or object storage, and mounted
 * into devboxes for execution.
 *
 * ## Usage
 *
 * This interface is accessed via {@link RunloopSDK.agent}. You should construct
 * a {@link RunloopSDK} instance and use it from there:
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 * const agent = await runloop.agent.create({
 *   name: 'my-npm-agent',
 *   source: {
 *     type: 'npm',
 *     npm: { package_name: '@my-org/agent' }
 *   }
 * });
 * const devbox = await agent.createDevbox({
 *   name: 'devbox-with-agent',
 *   agent_path: '/home/user/agent'
 * });
 * ```
 */
export class AgentOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * Create a new agent.
   *
   * @example
   * Create an agent from an NPM package:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.create({
   *   name: 'my-agent',
   *   source: {
   *     type: 'npm',
   *     npm: {
   *       package_name: '@my-org/agent',
   *       npm_version: '1.0.0'
   *     }
   *   }
   * });
   * console.log(`Created agent: ${agent.id}`);
   * ```
   *
   * @example
   * Create an agent from a Git repository:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.create({
   *   name: 'my-git-agent',
   *   source: {
   *     type: 'git',
   *     git: {
   *       repository: 'https://github.com/my-org/agent-repo',
   *       ref: 'main'
   *     }
   *   }
   * });
   * ```
   *
   * @example
   * Create an agent from a storage object:
   * ```typescript
   * const runloop = new RunloopSDK();
   * // First, upload your agent code as a storage object
   * const storageObject = await runloop.storageObject.uploadFromDir(
   *   './my-agent',
   *   { name: 'agent-package' }
   * );
   *
   * // Then create an agent from it
   * const agent = await runloop.agent.create({
   *   name: 'my-object-agent',
   *   source: {
   *     type: 'object',
   *     object: {
   *       object_id: storageObject.id
   *     }
   *   }
   * });
   * ```
   *
   * @param {AgentCreateParams} params - Parameters for creating the agent.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Agent>} An {@link Agent} instance.
   */
  async create(params: AgentCreateParams, options?: Core.RequestOptions): Promise<Agent> {
    return Agent.create(this.client, params, options);
  }

  /**
   * Create an agent from an NPM package.
   *
   * @example
   * Basic usage:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromNpm({
   *   name: 'my-npm-agent',
   *   package_name: '@my-org/agent'
   * });
   * ```
   *
   * @example
   * With version and setup commands:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromNpm({
   *   name: 'my-npm-agent',
   *   package_name: '@my-org/agent',
   *   npm_version: '^1.2.0',
   *   agent_setup: ['npm run build', 'chmod +x ./run.sh']
   * });
   * ```
   *
   * @example
   * Using a private registry:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromNpm({
   *   name: 'private-agent',
   *   package_name: '@my-org/private-agent',
   *   registry_url: 'https://npm.mycompany.com'
   * });
   * ```
   *
   * @param {object} params - Parameters for creating the agent.
   * @param {string} params.package_name - NPM package name.
   * @param {string} [params.npm_version] - NPM version constraint.
   * @param {string} [params.registry_url] - NPM registry URL.
   * @param {string[]} [params.agent_setup] - Setup commands to run after installation.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Agent>} An {@link Agent} instance.
   */
  async createFromNpm(
    params: Omit<AgentCreateParams, 'source'> & {
      package_name: string;
      npm_version?: string;
      registry_url?: string;
      agent_setup?: string[];
    },
    options?: Core.RequestOptions,
  ): Promise<Agent> {
    const { package_name, npm_version, registry_url, agent_setup, ...restParams } = params;

    const npmConfig: any = { package_name };
    if (npm_version !== undefined) npmConfig.npm_version = npm_version;
    if (registry_url !== undefined) npmConfig.registry_url = registry_url;
    if (agent_setup !== undefined) npmConfig.agent_setup = agent_setup;

    return this.create(
      {
        ...restParams,
        source: { type: 'npm', npm: npmConfig },
      },
      options,
    );
  }

  /**
   * Create an agent from a Pip package.
   *
   * @example
   * Basic usage:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromPip({
   *   name: 'my-python-agent',
   *   package_name: 'my-agent-package'
   * });
   * ```
   *
   * @example
   * With version constraint:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromPip({
   *   name: 'my-python-agent',
   *   package_name: 'my-agent-package',
   *   pip_version: '>=1.0.0,<2.0.0'
   * });
   * ```
   *
   * @example
   * Using a private PyPI registry:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromPip({
   *   name: 'private-python-agent',
   *   package_name: 'my-private-agent',
   *   registry_url: 'https://pypi.mycompany.com/simple',
   *   agent_setup: ['python setup.py install']
   * });
   * ```
   *
   * @param {object} params - Parameters for creating the agent.
   * @param {string} params.package_name - Pip package name.
   * @param {string} [params.pip_version] - Pip version constraint.
   * @param {string} [params.registry_url] - Pip registry URL.
   * @param {string[]} [params.agent_setup] - Setup commands to run after installation.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Agent>} An {@link Agent} instance.
   */
  async createFromPip(
    params: Omit<AgentCreateParams, 'source'> & {
      package_name: string;
      pip_version?: string;
      registry_url?: string;
      agent_setup?: string[];
    },
    options?: Core.RequestOptions,
  ): Promise<Agent> {
    const { package_name, pip_version, registry_url, agent_setup, ...restParams } = params;

    const pipConfig: any = { package_name };
    if (pip_version !== undefined) pipConfig.pip_version = pip_version;
    if (registry_url !== undefined) pipConfig.registry_url = registry_url;
    if (agent_setup !== undefined) pipConfig.agent_setup = agent_setup;

    return this.create(
      {
        ...restParams,
        source: { type: 'pip', pip: pipConfig },
      },
      options,
    );
  }

  /**
   * Create an agent from a Git repository.
   *
   * @example
   * Basic usage with public repository:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromGit({
   *   name: 'my-git-agent',
   *   repository: 'https://github.com/my-org/agent-repo'
   * });
   * ```
   *
   * @example
   * With specific branch and setup commands:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromGit({
   *   name: 'my-git-agent',
   *   repository: 'https://github.com/my-org/agent-repo',
   *   ref: 'develop',
   *   agent_setup: [
   *     'npm install',
   *     'npm run build'
   *   ]
   * });
   * ```
   *
   * @example
   * Using a specific commit:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromGit({
   *   name: 'my-git-agent',
   *   repository: 'https://github.com/my-org/agent-repo',
   *   ref: 'a1b2c3d4e5f6'
   * });
   * ```
   *
   * @param {object} params - Parameters for creating the agent.
   * @param {string} params.repository - Git repository URL.
   * @param {string} [params.ref] - Optional Git ref (branch/tag/commit), defaults to main/HEAD.
   * @param {string[]} [params.agent_setup] - Setup commands to run after cloning.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Agent>} An {@link Agent} instance.
   */
  async createFromGit(
    params: Omit<AgentCreateParams, 'source'> & {
      repository: string;
      ref?: string;
      agent_setup?: string[];
    },
    options?: Core.RequestOptions,
  ): Promise<Agent> {
    const { repository, ref, agent_setup, ...restParams } = params;

    const gitConfig: any = { repository };
    if (ref !== undefined) gitConfig.ref = ref;
    if (agent_setup !== undefined) gitConfig.agent_setup = agent_setup;

    return this.create(
      {
        ...restParams,
        source: { type: 'git', git: gitConfig },
      },
      options,
    );
  }

  /**
   * Create an agent from a storage object.
   *
   * @example
   * Upload agent code and create agent:
   * ```typescript
   * const runloop = new RunloopSDK();
   *
   * // Upload agent directory as a storage object
   * const storageObject = await runloop.storageObject.uploadFromDir(
   *   './my-agent-code',
   *   { name: 'agent-package' }
   * );
   *
   * // Create agent from the storage object
   * const agent = await runloop.agent.createFromObject({
   *   name: 'my-object-agent',
   *   object_id: storageObject.id
   * });
   * ```
   *
   * @example
   * With setup commands:
   * ```typescript
   * const runloop = new RunloopSDK();
   *
   * const storageObject = await runloop.storageObject.uploadFromDir(
   *   './my-agent-code',
   *   { name: 'agent-package' }
   * );
   *
   * const agent = await runloop.agent.createFromObject({
   *   name: 'my-object-agent',
   *   object_id: storageObject.id,
   *   agent_setup: [
   *     'chmod +x setup.sh',
   *     './setup.sh',
   *     'pip install -r requirements.txt'
   *   ]
   * });
   * ```
   *
   * @example
   * Complete workflow: storage object → agent → devbox:
   * ```typescript
   * const runloop = new RunloopSDK();
   *
   * // 1. Upload agent code
   * const storageObject = await runloop.storageObject.uploadFromDir(
   *   './my-agent',
   *   { name: 'agent-v1' }
   * );
   *
   * // 2. Create agent from storage object
   * const agent = await runloop.agent.createFromObject({
   *   name: 'my-agent',
   *   object_id: storageObject.id
   * });
   *
   * // 3. Create devbox with agent mounted
   * const devbox = await runloop.devbox.create({
   *   name: 'devbox-with-agent',
   *   mounts: [{
   *     type: 'agent_mount',
   *     agent_id: agent.id,
   *     agent_name: null,
   *     agent_path: '/home/user/agent'
   *   }]
   * });
   * ```
   *
   * @param {object} params - Parameters for creating the agent.
   * @param {string} params.object_id - Storage object ID.
   * @param {string[]} [params.agent_setup] - Setup commands to run after unpacking.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Agent>} An {@link Agent} instance.
   */
  async createFromObject(
    params: Omit<AgentCreateParams, 'source'> & {
      object_id: string;
      agent_setup?: string[];
    },
    options?: Core.RequestOptions,
  ): Promise<Agent> {
    const { object_id, agent_setup, ...restParams } = params;

    const objectConfig: any = { object_id };
    if (agent_setup !== undefined) objectConfig.agent_setup = agent_setup;

    return this.create(
      {
        ...restParams,
        source: { type: 'object', object: objectConfig },
      },
      options,
    );
  }

  /**
   * Get an agent object by its ID.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = runloop.agent.fromId('agt_1234567890');
   *
   * // Get agent information
   * const info = await agent.getInfo();
   * console.log(`Agent name: ${info.name}`);
   * ```
   *
   * @param {string} id - The ID of the agent.
   * @returns {Agent} An {@link Agent} instance.
   */
  fromId(id: string): Agent {
    return Agent.fromId(this.client, id);
  }

  /**
   * List all agents with optional filters.
   *
   * @example
   * List all agents:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agents = await runloop.agent.list();
   *
   * for (const agent of agents) {
   *   const info = await agent.getInfo();
   *   console.log(`${info.name}: ${info.source?.type}`);
   * }
   * ```
   *
   * @example
   * List with filters:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agents = await runloop.agent.list({
   *   name: 'my-agent',
   *   limit: 10
   * });
   * ```
   *
   * @param {AgentListParams} [params] - Optional filter parameters.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Agent[]>} An array of {@link Agent} instances.
   */
  async list(params?: AgentListParams, options?: Core.RequestOptions): Promise<Agent[]> {
    return Agent.list(this.client, params, options);
  }
}

/**
 * Scorer SDK interface for managing custom scorers.
 *
 * @category Scorer
 */
export class ScorerOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * Create a new custom scorer.
   *
   * @param {ScorerCreateParams} params - Parameters for creating the scorer
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Scorer>} A {@link Scorer} instance
   */
  async create(params: ScorerCreateParams, options?: Core.RequestOptions): Promise<Scorer> {
    const response = await this.client.scenarios.scorers.create(params, options);
    return Scorer.fromId(this.client, response.id);
  }

  /**
   * Get a scorer object by its ID.
   *
   * @param {string} id - The ID of the scorer
   * @returns {Scorer} A {@link Scorer} instance
   */
  fromId(id: string): Scorer {
    return Scorer.fromId(this.client, id);
  }

  /**
   * List all scorers with optional filters.
   *
   * @param {ScorerListParams} [params] - Optional filter parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Scorer[]>} An array of {@link Scorer} instances
   */
  async list(params?: ScorerListParams, options?: Core.RequestOptions): Promise<Scorer[]> {
    const page = await this.client.scenarios.scorers.list(params, options);
    const scorers: Scorer[] = [];

    for await (const scorer of page) {
      scorers.push(Scorer.fromId(this.client, scorer.id));
    }

    return scorers;
  }
}

// @deprecated Use {@link RunloopSDK} instead.
/**
 * @deprecated Use {@link RunloopSDK} instead.
 * @example
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client';
 * const runloop = new RunloopSDK();
 * const devbox = await runloop.devbox.create({ name: 'my-devbox' });
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
    AgentOps as AgentOps,
    ScorerOps as ScorerOps,
    Devbox as Devbox,
    Blueprint as Blueprint,
    Snapshot as Snapshot,
    StorageObject as StorageObject,
    Agent as Agent,
    Scorer as Scorer,
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
  Agent,
  Scorer,
  Execution,
  ExecutionResult,
} from './sdk/index';
