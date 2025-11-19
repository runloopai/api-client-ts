import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  DevboxListDiskSnapshotsParams,
  DevboxCreateParams,
  DevboxView,
} from '../resources/devboxes/devboxes';
import type {
  DevboxSnapshotAsyncStatusView,
  DiskSnapshotUpdateParams,
} from '../resources/devboxes/disk-snapshots';
import type { PollingOptions } from '../lib/polling';
import { Devbox } from './devbox';

/**
 * Object-oriented interface for working with Disk Snapshots.
 *
 * ## Overview
 *
 * The `Snapshot` class provides a high-level API for managing disk snapshots of devboxes.
 * Snapshots capture the complete state of a devbox's disk and can be used to restore
 * devboxes to a previous state or create new devboxes from saved states.
 *
 * ## Quickstart
 *
 * Snapshots are typically created from devboxes:
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client-ts';
 *
 * const runloop = new RunloopSDK();
 * const devbox = runloop.devbox.create({ name: 'my-devbox' });
 * devbox.file.write('my-file.txt', 'Hello, World!');
 * const snapshot = await devbox.snapshotDisk({ name: 'backup' });
 * const devboxFromSnapshot = await snapshot.createDevbox({ name: 'my-devbox-from-snapshot' });
 * ...
 * ```
 *
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
   * @param {Runloop} client - The Runloop client instance
   * @param {string} id - The snapshot ID
   * @returns {Snapshot} A {@link Snapshot} instance
   */
  static fromId(client: Runloop, id: string): Snapshot {
    return new Snapshot(client, id);
  }

  /**
   * List all snapshots, optionally filtered by devbox ID or metadata.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * // List all snapshots
   * const snapshots = await runloop.snapshot.list();
   *
   * // Filter by devbox ID
   * const snapshots = await runloop.snapshot.list({ devbox_id: 'devbox-123' });
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {DevboxListDiskSnapshotsParams} [params] - Optional filter parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Snapshot[]>} Array of {@link Snapshot} instances
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
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<DevboxSnapshotAsyncStatusView>} The snapshot data
   */
  async getInfo(options?: Core.RequestOptions) {
    return await this.client.devboxes.diskSnapshots.queryStatus(this._id, options);
  }

  /**
   * Update the snapshot's name and/or metadata.
   * This performs a complete replacement, not a patch.
   *
   * @param {DiskSnapshotUpdateParams} [params] - New name and/or metadata
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<void>} Promise that resolves when the update is complete
   */
  async update(params?: DiskSnapshotUpdateParams, options?: Core.RequestOptions): Promise<void> {
    await this.client.devboxes.diskSnapshots.update(this._id, params, options);
  }

  /**
   * Delete this snapshot.
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<unknown>} The deletion result
   */
  async delete(options?: Core.RequestOptions): Promise<unknown> {
    return this.client.devboxes.diskSnapshots.delete(this._id, options);
  }

  /**
   * Query the status of an asynchronous snapshot operation.
   * Useful when the snapshot was created with snapshotDiskAsync().
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<DevboxSnapshotAsyncStatusView>} Async status information
   */
  async queryStatus(options?: Core.RequestOptions): Promise<DevboxSnapshotAsyncStatusView> {
    return this.client.devboxes.diskSnapshots.queryStatus(this._id, options);
  }

  /**
   * Wait for the snapshot to be completed.
   *
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxSnapshotAsyncStatusView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<DevboxSnapshotAsyncStatusView>} Snapshot data
   */
  async awaitCompleted(
    options?: Core.RequestOptions & {
      polling?: Partial<PollingOptions<DevboxSnapshotAsyncStatusView>>;
    },
  ): Promise<DevboxSnapshotAsyncStatusView> {
    return this.client.devboxes.diskSnapshots.awaitCompleted(this._id, options);
  }

  /**
   * Create a new devbox from this snapshot.
   * This is a convenience method that calls Devbox.create() with the snapshot ID
   * and any additional parameters you want to layer on top.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const snapshot = runloop.snapshot.fromId('snapshot-123');
   * const devbox = await snapshot.createDevbox({
   *   name: 'restored-devbox',
   *   // Additional devbox parameters...
   * });
   * ```
   *
   * @param {Omit<DevboxCreateParams, 'snapshot_id' | 'blueprint_id' | 'blueprint_name'>} [params] - Additional devbox creation parameters (optional)
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<Devbox>} A new {@link Devbox} instance created from this snapshot
   */
  async createDevbox(
    params?: Omit<DevboxCreateParams, 'snapshot_id' | 'blueprint_id' | 'blueprint_name'>,
    options?: Core.RequestOptions & {
      polling?: Partial<PollingOptions<DevboxView>>;
    },
  ): Promise<Devbox> {
    const createParams: DevboxCreateParams = {
      ...params,
      snapshot_id: this._id,
    };

    return Devbox.create(this.client, createParams, options);
  }
}
