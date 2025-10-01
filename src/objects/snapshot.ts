import type { Runloop } from '../index';
import type * as Core from '../core';
import type { DevboxSnapshotView } from '../resources/devboxes/devboxes';
import type { DevboxSnapshotAsyncStatusView } from '../resources/devboxes/disk-snapshots';

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
   * @param client - The Runloop API client
   * @param id - The snapshot ID
   * @param options - Request options
   * @returns A Snapshot instance
   * @throws Error if snapshot not found
   */
  static async get(client: Runloop, id: string, options?: Core.RequestOptions): Promise<Snapshot> {
    // List all snapshots and find the one with matching ID
    // Note: The API doesn't provide a direct retrieve by ID endpoint
    const snapshots = await client.devboxes.listDiskSnapshots({}, options);

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
   * @param client - The Runloop API client
   * @param params - Optional filter parameters
   * @param options - Request options
   * @returns Array of Snapshot instances
   */
  static async list(
    client: Runloop,
    params?: { devboxId?: string; metadata?: Record<string, string> },
    options?: Core.RequestOptions,
  ): Promise<Snapshot[]> {
    const queryParams: any = {};

    if (params?.devboxId) {
      queryParams.devbox_id = params.devboxId;
    }

    // Note: metadata filtering would need to be handled per the API spec
    // which uses metadata[key] syntax

    const snapshots = await client.devboxes.listDiskSnapshots(queryParams, options);
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
  async update(
    params?: { name?: string | null; metadata?: { [key: string]: string } | null },
    options?: Core.RequestOptions,
  ): Promise<void> {
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
   * Access to the underlying disk snapshots API resource for advanced operations.
   */
  get api() {
    return this.client.devboxes.diskSnapshots;
  }
}
