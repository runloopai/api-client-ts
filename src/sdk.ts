import { Runloop, type ClientOptions } from './index';
import { Devbox } from './objects/devbox';
import { Blueprint } from './objects/blueprint';
import { Snapshot } from './objects/snapshot';
import { StorageObject } from './objects/storage-object';

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

    async create(params?, options?): Promise<Devbox> {
      return Devbox.create(this.client, params, options);
    }

    async fromId(id: string, options?): Promise<Devbox> {
      return Devbox.fromId(this.client, id, options);
    }

    async list(params?, options?): Promise<Devbox[]> {
      // TODO: Implement list functionality
      throw new Error('List not yet implemented');
    }
  }

  /**
   * Blueprint management interface
   */
  export class BlueprintInterface {
    constructor(private client: Runloop) {}

    async create(params, options?): Promise<Blueprint> {
      return Blueprint.create(this.client, params, options);
    }

    async fromId(id: string, options?): Promise<Blueprint> {
      return Blueprint.fromId(this.client, id, options);
    }

    async list(params?, options?): Promise<Blueprint[]> {
      // TODO: Implement list functionality
      throw new Error('List not yet implemented');
    }
  }

  /**
   * Snapshot management interface
   */
  export class SnapshotInterface {
    constructor(private client: Runloop) {}

    async fromId(id: string, options?): Promise<Snapshot> {
      return Snapshot.fromId(this.client, id, options);
    }

    async list(params?, options?): Promise<Snapshot[]> {
      return Snapshot.list(this.client, params, options);
    }
  }

  /**
   * Storage object management interface
   */
  export class StorageObjectInterface {
    constructor(private client: Runloop) {}

    async create(params, options?): Promise<StorageObject> {
      return StorageObject.create(this.client, params, options);
    }

    async fromId(id: string, options?): Promise<StorageObject> {
      return StorageObject.fromId(this.client, id, options);
    }

    async list(params?, options?): Promise<StorageObject[]> {
      return StorageObject.list(this.client, params, options);
    }
  }
}

export default RunloopSDK;

