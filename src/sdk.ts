import { Runloop, type ClientOptions } from './index';
import { Devbox } from './objects/devbox';
import { Blueprint } from './objects/blueprint';
import { Snapshot } from './objects/snapshot';
import { StorageObject } from './objects/storage-object';
import type * as Core from './core';
import type { DevboxCreateParams, DevboxListDiskSnapshotsParams } from './resources/devboxes/devboxes';
import type {
  BlueprintCreateParams,
  BlueprintPreviewParams,
  BlueprintPreviewView,
} from './resources/blueprints';
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

    async list(params?: DevboxListDiskSnapshotsParams, options?: Core.RequestOptions): Promise<Devbox[]> {
      // TODO: Implement list functionality
      throw new Error('List not yet implemented');
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

    async list(params?: BlueprintCreateParams, options?: Core.RequestOptions): Promise<Blueprint[]> {
      // TODO: Implement list functionality
      throw new Error('List not yet implemented');
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
