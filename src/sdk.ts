import { Runloop, type ClientOptions } from './index';
import { Devbox } from './objects/devbox';
import { Blueprint } from './objects/blueprint';
import { Snapshot } from './objects/snapshot';
import { StorageObject } from './objects/storage-object';
import type * as Core from './core';
import type {
  DevboxCreateParams,
  DevboxListDiskSnapshotsParams,
  DevboxListParams,
  DevboxView,
} from './resources/devboxes/devboxes';
import type { BlueprintCreateParams, BlueprintListParams } from './resources/blueprints';
import type { ObjectCreateParams, ObjectListParams } from './resources/objects';
import { PollingOptions } from './lib/polling';

// Extract the content type from the API types
type ContentType = ObjectCreateParams['content_type'];

/**
 * Runloop SDK - The recommended way to interact with Runloop.
 * Provides both low-level API access and high-level object-oriented interfaces.
 *
 * @example
 * ```typescript
 * const sdk = new RunloopSDK(); // export RUNLOOP_API_KEY will automatically be used.
 * const devbox = await sdk.devbox.create({ name: 'my-devbox' });
 * const result = await devbox.cmd.exec({ command: 'echo "Hello, World!"' });
 * console.log(result.exitCode);
 * ```
 */
export class RunloopSDK {
  public readonly api: Runloop;
  public readonly devbox: RunloopSDK.DevboxInterface;
  public readonly blueprint: RunloopSDK.BlueprintInterface;
  public readonly snapshot: RunloopSDK.SnapshotInterface;
  public readonly storageObject: RunloopSDK.StorageObjectInterface;

  constructor(options?: ClientOptions) {
    this.api = new Runloop(options);
    this.devbox = new RunloopSDK.DevboxInterface(this.api);
    this.blueprint = new RunloopSDK.BlueprintInterface(this.api);
    this.snapshot = new RunloopSDK.SnapshotInterface(this.api);
    this.storageObject = new RunloopSDK.StorageObjectInterface(this.api);
  }
}

export namespace RunloopSDK {
  /**
   * Devbox management interface
   */
  export class DevboxInterface {
    constructor(private client: Runloop) {}

    async create(
      params?: DevboxCreateParams,
      options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
    ): Promise<Devbox> {
      return Devbox.create(this.client, params, options);
    }

    fromId(id: string): Devbox {
      return Devbox.fromId(this.client, id);
    }

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
   * Blueprint management interface
   */
  export class BlueprintInterface {
    constructor(private client: Runloop) {}

    async create(params: BlueprintCreateParams, options?: Core.RequestOptions): Promise<Blueprint> {
      return Blueprint.create(this.client, params, options);
    }

    fromId(id: string): Blueprint {
      return Blueprint.fromId(this.client, id);
    }

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
   * Snapshot management interface
   */
  export class SnapshotInterface {
    constructor(private client: Runloop) {}

    fromId(id: string): Snapshot {
      return Snapshot.fromId(this.client, id);
    }

    async list(params?: DevboxListDiskSnapshotsParams, options?: Core.RequestOptions): Promise<Snapshot[]> {
      return Snapshot.list(this.client, params, options);
    }
  }

  /**
   * Storage object management interface
   */
  export class StorageObjectInterface {
    constructor(private client: Runloop) {}

    async create(params: ObjectCreateParams, options?: Core.RequestOptions): Promise<StorageObject> {
      return StorageObject.create(this.client, params, options);
    }

    fromId(id: string): StorageObject {
      return StorageObject.fromId(this.client, id);
    }

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
     * This method handles the complete three-step upload process.
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
     * This method handles the complete three-step upload process.
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
     * This method handles the complete three-step upload process.
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
  }
}

export default RunloopSDK;
