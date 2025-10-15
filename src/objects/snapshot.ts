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
 * const snapshot = new Snapshot(client, snapshotView);
 *
 * // Or load from existing snapshot
 * const snapshot = await Snapshot.get(client, 'snapshot-id');
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
  private snapshotData: DevboxSnapshotView;

  constructor(client: Runloop, snapshotData: DevboxSnapshotView) {
    this.client = client;
    this.snapshotData = snapshotData;
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
  static async get(id: string, options?: ObjectOptions): Promise<Snapshot>;
  /**
   * Load an existing Snapshot by ID.
   * Note: This searches through all snapshots to find the matching ID.
   *
   * @param client - The Runloop API client
   * @param id - The snapshot ID
   * @param options - Request options
   * @returns A Snapshot instance
   * @throws Error if snapshot not found
   */
  static async get(client: Runloop, id: string, options?: Core.RequestOptions): Promise<Snapshot>;
  static async get(
    clientOrId: Runloop | string,
    idOrOptions?: string | ObjectOptions,
    options?: Core.RequestOptions,
  ): Promise<Snapshot> {
    let client: Runloop;
    let id: string;
    let requestOptions: Core.RequestOptions | undefined;

    // Handle overloaded signatures
    if (typeof clientOrId === 'string') {
      // New signature: get(id, options)
      const opts = idOrOptions as ObjectOptions | undefined;
      client = opts?.client || Runloop.getDefaultClient();
      id = clientOrId;
      requestOptions = opts;
    } else {
      // Old signature: get(client, id, options)
      client = clientOrId;
      id = idOrOptions as string;
      requestOptions = options;
    }

    // List all snapshots and find the one with matching ID
    // Note: The API doesn't provide a direct retrieve by ID endpoint
    const snapshots = await client.devboxes.listDiskSnapshots({}, requestOptions);

    for await (const snapshot of snapshots) {
      if (snapshot.id === id) {
        return new Snapshot(client, snapshot);
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
  static async list(params?: DevboxListDiskSnapshotsParams, options?: ObjectOptions): Promise<Snapshot[]>;
  /**
   * List all snapshots, optionally filtered by devbox ID or metadata.
   *
   * @param client - The Runloop API client
   * @param params - Optional filter parameters
   * @param options - Request options
   * @returns Array of Snapshot instances
   */
  static async list(
    client: Runloop,
    params?: DevboxListDiskSnapshotsParams,
    options?: Core.RequestOptions,
  ): Promise<Snapshot[]>;
  static async list(
    clientOrParams?: Runloop | DevboxListDiskSnapshotsParams,
    paramsOrOptions?: DevboxListDiskSnapshotsParams | ObjectOptions,
    options?: Core.RequestOptions,
  ): Promise<Snapshot[]> {
    let client: Runloop;
    let params: DevboxListDiskSnapshotsParams | undefined;
    let requestOptions: Core.RequestOptions | undefined;

    // Handle overloaded signatures
    if (clientOrParams && typeof clientOrParams === 'object' && 'bearerToken' in clientOrParams) {
      // Old signature: list(client, params, options)
      client = clientOrParams;
      params = paramsOrOptions as DevboxListDiskSnapshotsParams | undefined;
      requestOptions = options;
    } else {
      // New signature: list(params, options)
      const opts = paramsOrOptions as ObjectOptions | undefined;
      client = opts?.client || Runloop.getDefaultClient();
      params = clientOrParams as DevboxListDiskSnapshotsParams | undefined;
      requestOptions = opts;
    }

    const snapshots = await client.devboxes.listDiskSnapshots(params, requestOptions);
    const result: Snapshot[] = [];

    for await (const snapshot of snapshots) {
      result.push(new Snapshot(client, snapshot));
    }

    return result;
  }

  /**
   * Get the snapshot ID.
   */
  get id(): string {
    return this.snapshotData.id;
  }

  /**
   * Get the snapshot name.
   */
  get name(): string | null {
    return this.snapshotData.name ?? null;
  }

  /**
   * Get the source devbox ID.
   */
  get sourceDevboxId(): string {
    return this.snapshotData.source_devbox_id;
  }

  /**
   * Get the snapshot metadata.
   */
  get metadata(): { [key: string]: string } {
    return this.snapshotData.metadata;
  }

  /**
   * Get the creation timestamp (milliseconds).
   */
  get createTimeMs(): number {
    return this.snapshotData.create_time_ms;
  }

  /**
   * Get the complete snapshot data.
   */
  get data(): DevboxSnapshotView {
    return this.snapshotData;
  }

  /**
   * Update the snapshot's name and/or metadata.
   * This performs a complete replacement, not a patch.
   *
   * @param params - New name and/or metadata
   * @param options - Request options
   */
  async update(params?: DiskSnapshotUpdateParams, options?: Core.RequestOptions): Promise<void> {
    this.snapshotData = await this.client.devboxes.diskSnapshots.update(
      this.snapshotData.id,
      params,
      options,
    );
  }

  /**
   * Delete this snapshot.
   *
   * @param options - Request options
   */
  async delete(options?: Core.RequestOptions): Promise<unknown> {
    return this.client.devboxes.diskSnapshots.delete(this.snapshotData.id, options);
  }

  /**
   * Query the status of an asynchronous snapshot operation.
   * Useful when the snapshot was created with snapshotDiskAsync().
   *
   * @param options - Request options
   * @returns Async status information
   */
  async queryStatus(options?: Core.RequestOptions): Promise<DevboxSnapshotAsyncStatusView> {
    return this.client.devboxes.diskSnapshots.queryStatus(this.snapshotData.id, options);
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
      snapshot_id: this.snapshotData.id,
    };

    return Devbox.create(this.client, createParams, options);
  }
}
