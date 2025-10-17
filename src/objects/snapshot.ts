import { Runloop } from '../index';
import type * as Core from '../core';
import type { DevboxListDiskSnapshotsParams, DevboxCreateParams } from '../resources/devboxes/devboxes';
import type {
  DevboxSnapshotAsyncStatusView,
  DiskSnapshotUpdateParams,
} from '../resources/devboxes/disk-snapshots';
import { Devbox } from './devbox';

/**
 * Object-oriented interface for working with Disk Snapshots.
 */
export class Snapshot {
  private client: Runloop;
  private _id: string;

  constructor(client: Runloop, id: string) {
    this.client = client;
    this._id = id;
  }

  /**
   * Create a Snapshot instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * @param client - The Runloop client instance
   * @param id - The snapshot ID
   * @param options - Request options
   * @returns A Snapshot instance
   */
  static fromId(client: Runloop, id: string, options?: Core.RequestOptions): Snapshot {
    return new Snapshot(client, id);
  }

  /**
   * List all snapshots, optionally filtered by devbox ID or metadata.
   *
   * @param client - The Runloop client instance
   * @param params - Optional filter parameters
   * @param options - Request options
   * @returns Array of Snapshot instances
   */
  static async list(
    client: Runloop,
    params?: DevboxListDiskSnapshotsParams,
    options?: Core.RequestOptions,
  ): Promise<Snapshot[]> {
    const snapshots = await client.devboxes.listDiskSnapshots(params, options);
    const result: Snapshot[] = [];

    for await (const snapshot of snapshots) {
      result.push(new Snapshot(client, snapshot.id));
    }

    return result;
  }

  /**
   * Get the snapshot ID.
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the complete snapshot data from the API.
   */
  async getInfo(options?: Core.RequestOptions) {
    return await this.client.devboxes.diskSnapshots.queryStatus(this._id, options);
  }

  /**
   * Update the snapshot's name and/or metadata.
   * This performs a complete replacement, not a patch.
   *
   * @param params - New name and/or metadata
   * @param options - Request options
   */
  async update(params?: DiskSnapshotUpdateParams, options?: Core.RequestOptions): Promise<void> {
    await this.client.devboxes.diskSnapshots.update(this._id, params, options);
  }

  /**
   * Delete this snapshot.
   *
   * @param options - Request options
   */
  async delete(options?: Core.RequestOptions): Promise<unknown> {
    return this.client.devboxes.diskSnapshots.delete(this._id, options);
  }

  /**
   * Query the status of an asynchronous snapshot operation.
   * Useful when the snapshot was created with snapshotDiskAsync().
   *
   * @param options - Request options
   * @returns Async status information
   */
  async queryStatus(options?: Core.RequestOptions): Promise<DevboxSnapshotAsyncStatusView> {
    return this.client.devboxes.diskSnapshots.queryStatus(this._id, options);
  }

  /**
   * Wait for the snapshot to be completed.
   *
   * @param options - Request options with optional polling configuration
   * @returns Snapshot data
   */
  async awaitCompleted(
    options?: Core.RequestOptions & {
      polling?: Partial<
        import('../lib/polling').PollingOptions<
          import('../resources/devboxes/disk-snapshots').DevboxSnapshotAsyncStatusView
        >
      >;
    },
  ): Promise<DevboxSnapshotAsyncStatusView> {
    return this.client.devboxes.diskSnapshots.awaitCompleted(this._id, options);
  }

  /**
   * Create a new devbox from this snapshot.
   * This is a convenience method that calls Devbox.create() with the snapshot ID
   * and any additional parameters you want to layer on top.
   *
   * @param params - Additional devbox creation parameters (optional)
   * @param options - Request options with optional polling configuration
   * @returns A new Devbox instance created from this snapshot
   */
  async createDevbox(
    params?: Omit<DevboxCreateParams, 'snapshot_id' | 'blueprint_id' | 'blueprint_name'>,
    options?: Core.RequestOptions & {
      polling?: Partial<
        import('../lib/polling').PollingOptions<import('../resources/devboxes/devboxes').DevboxView>
      >;
    },
  ): Promise<Devbox> {
    const createParams: DevboxCreateParams = {
      ...params,
      snapshot_id: this._id,
    };

    return Devbox.create(this.client, createParams, options);
  }
}
