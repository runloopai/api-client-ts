import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  DevboxSnapshotView,
  DevboxListDiskSnapshotsParams,
  DevboxCreateParams,
} from '../resources/devboxes/devboxes';
import type {
  DevboxSnapshotAsyncStatusView,
  DiskSnapshotUpdateParams,
} from '../resources/devboxes/disk-snapshots';
import { Devbox } from './devbox';
import { ObjectOptions } from './types';

/**
 * Object-oriented interface for working with Disk Snapshots.
 *
 * Example usage:
 * ```typescript
 * // Typically created from a Devbox:
 * const snapshotView = await devbox.snapshotDisk('my-snapshot');
 * const snapshot = new Snapshot(client, snapshotView.id);
 *
 * // Or load from existing snapshot
 * const snapshot = await Snapshot.get(client, 'snapshot-id');
 *
 * // Get snapshot information
 * const info = await snapshot.getInfo();
 * console.log(info.name, info.create_time_ms);
 *
 * // Create a new devbox from this snapshot
 * const newDevbox = await snapshot.createDevbox({
 *   name: 'restored-devbox',
 *   metadata: { restored_from: snapshot.id }
 * });
 *
 * // Update metadata
 * await snapshot.update({ metadata: { updated: 'true' } });
 * await snapshot.delete();
 * ```
 */
export class Snapshot {
  private client: Runloop;
  private _id: string;

  constructor(client: Runloop, id: string) {
    this.client = client;
    this._id = id;
  }

  /**
   * Load an existing Snapshot by ID.
   * Note: This searches through all snapshots to find the matching ID.
   *
   * @param id - The snapshot ID
   * @param options - Request options with optional client override
   * @returns A Snapshot instance
   * @throws Error if snapshot not found
   */
  static async get(id: string, options?: ObjectOptions): Promise<Snapshot> {
    const client = options?.client || Runloop.getDefaultClient();
    const requestOptions = options;

    // List all snapshots and find the one with matching ID
    // Note: The API doesn't provide a direct retrieve by ID endpoint
    const snapshots = await client.devboxes.listDiskSnapshots({}, requestOptions);

    for await (const snapshot of snapshots) {
      if (snapshot.id === id) {
        return new Snapshot(client, id);
      }
    }

    throw new Error(`Snapshot with ID ${id} not found`);
  }

  /**
   * List all snapshots, optionally filtered by devbox ID or metadata.
   *
   * @param params - Optional filter parameters
   * @param options - Request options with optional client override
   * @returns Array of Snapshot instances
   */
  static async list(params?: DevboxListDiskSnapshotsParams, options?: ObjectOptions): Promise<Snapshot[]> {
    const client = options?.client || Runloop.getDefaultClient();
    const requestOptions = options;

    const snapshots = await client.devboxes.listDiskSnapshots(params, requestOptions);
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
   * Note: This searches through all snapshots to find the matching ID.
   */
  async getInfo(options?: Core.RequestOptions): Promise<DevboxSnapshotView> {
    const snapshots = await this.client.devboxes.listDiskSnapshots({}, options);

    for await (const snapshot of snapshots) {
      if (snapshot.id === this._id) {
        return snapshot;
      }
    }

    throw new Error(`Snapshot with ID ${this._id} not found`);
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
   * Create a new devbox from this snapshot.
   * This is a convenience method that calls Devbox.create() with the snapshot ID
   * and any additional parameters you want to layer on top.
   *
   * @param params - Additional devbox creation parameters (optional)
   * @param options - Request options with optional polling configuration
   * @returns A new Devbox instance created from this snapshot
   */
  async createDevbox(
    params?: Omit<DevboxCreateParams, 'snapshot_id'>,
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

    return Devbox.create(createParams, { ...options, client: this.client });
  }
}
