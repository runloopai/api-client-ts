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
} from './resources/devboxes/devboxes';
import type { BlueprintCreateParams, BlueprintListParams } from './resources/blueprints';
import type { ObjectCreateParams, ObjectListParams } from './resources/objects';

/**
 * Runloop SDK - The recommended way to interact with Runloop.
 * Provides both low-level API access and high-level object-oriented interfaces.
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

    async create(params?: DevboxCreateParams, options?: Core.RequestOptions): Promise<Devbox> {
      return Devbox.create(this.client, params, options);
    }

    async fromId(id: string, options?: Core.RequestOptions): Promise<Devbox> {
      return Devbox.fromId(this.client, id, options);
    }

    async list(params?: DevboxListParams, options?: Core.RequestOptions): Promise<Devbox[]> {
      const devboxes = await this.client.devboxes.list(params, options);
      const result: Devbox[] = [];

      for await (const devbox of devboxes) {
        result.push(Devbox.fromId(this.client, devbox.id));
      }

      return result;
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

    async fromId(id: string, options?: Core.RequestOptions): Promise<Blueprint> {
      return Blueprint.fromId(this.client, id, options);
    }

    async list(params?: BlueprintListParams, options?: Core.RequestOptions): Promise<Blueprint[]> {
      const blueprints = await this.client.blueprints.list(params, options);
      const result: Blueprint[] = [];

      for await (const blueprint of blueprints) {
        result.push(Blueprint.fromId(this.client, blueprint.id));
      }

      return result;
    }
  }

  /**
   * Snapshot management interface
   */
  export class SnapshotInterface {
    constructor(private client: Runloop) {}

    async fromId(id: string, options?: Core.RequestOptions): Promise<Snapshot> {
      return Snapshot.fromId(this.client, id, options);
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

    async fromId(id: string, options?: Core.RequestOptions): Promise<StorageObject> {
      return StorageObject.fromId(this.client, id, options);
    }

    async list(params?: ObjectListParams, options?: Core.RequestOptions): Promise<StorageObject[]> {
      return StorageObject.list(this.client, params, options);
    }

    /**
     * Upload a file directly from the filesystem (Node.js only).
     * This method handles the complete three-step upload process.
     */
    async uploadFromFile(
      filePath: string,
      name: string,
      options?: Core.RequestOptions & {
        contentType?: string;
        metadata?: Record<string, string>;
      },
    ): Promise<StorageObject> {
      return StorageObject.uploadFromFile(this.client, filePath, name, options);
    }

    /**
     * Upload content from a Buffer (Node.js only).
     * This method handles the complete three-step upload process.
     */
    async uploadFromBuffer(
      buffer: Buffer,
      name: string,
      contentType: string,
      options?: Core.RequestOptions & {
        metadata?: Record<string, string>;
      },
    ): Promise<StorageObject> {
      return StorageObject.uploadFromBuffer(this.client, buffer, name, contentType, options);
    }
  }
}

export default RunloopSDK;
