// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as DevboxesAPI from './devboxes';
import { DevboxSnapshotViewsDiskSnapshotsCursorIDPage } from './devboxes';
import { type DiskSnapshotsCursorIDPageParams } from '../../pagination';

export class DiskSnapshots extends APIResource {
  /**
   * Updates disk snapshot metadata via update vs patch. The entire metadata will be
   * replaced.
   */
  update(
    id: string,
    body?: DiskSnapshotUpdateParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxSnapshotView>;
  update(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxesAPI.DevboxSnapshotView>;
  update(
    id: string,
    body: DiskSnapshotUpdateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxesAPI.DevboxSnapshotView> {
    if (isRequestOptions(body)) {
      return this.update(id, {}, body);
    }
    return this._client.post(`/v1/devboxes/disk_snapshots/${id}`, { body, ...options });
  }

  /**
   * List all snapshots of a Devbox while optionally filtering by Devbox ID and
   * metadata.
   */
  list(
    query?: DiskSnapshotListParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<DevboxSnapshotViewsDiskSnapshotsCursorIDPage, DevboxesAPI.DevboxSnapshotView>;
  list(
    options?: Core.RequestOptions,
  ): Core.PagePromise<DevboxSnapshotViewsDiskSnapshotsCursorIDPage, DevboxesAPI.DevboxSnapshotView>;
  list(
    query: DiskSnapshotListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<DevboxSnapshotViewsDiskSnapshotsCursorIDPage, DevboxesAPI.DevboxSnapshotView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList(
      '/v1/devboxes/disk_snapshots',
      DevboxSnapshotViewsDiskSnapshotsCursorIDPage,
      { query, ...options },
    );
  }

  /**
   * Delete a previously taken disk snapshot of a Devbox.
   */
  delete(id: string, options?: Core.RequestOptions): Core.APIPromise<unknown> {
    return this._client.post(`/v1/devboxes/disk_snapshots/${id}/delete`, options);
  }

  /**
   * Get the current status of an asynchronous disk snapshot operation, including
   * whether it is still in progress and any error messages if it failed.
   */
  queryStatus(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxSnapshotAsyncStatusView> {
    return this._client.get(`/v1/devboxes/disk_snapshots/${id}/status`, options);
  }
}

export interface DevboxSnapshotAsyncStatusView {
  /**
   * The current status of the snapshot operation.
   */
  status: 'in_progress' | 'error' | 'complete';

  /**
   * Error message if the operation failed.
   */
  error_message?: string | null;

  /**
   * The snapshot details if the operation completed successfully.
   */
  snapshot?: DevboxesAPI.DevboxSnapshotView | null;
}

export type DiskSnapshotDeleteResponse = unknown;

export interface DiskSnapshotUpdateParams {
  /**
   * (Optional) Commit message associated with the snapshot (max 1000 characters)
   */
  commit_message?: string | null;

  /**
   * (Optional) Metadata used to describe the snapshot
   */
  metadata?: { [key: string]: string } | null;

  /**
   * (Optional) A user specified name to give the snapshot
   */
  name?: string | null;
}

export interface DiskSnapshotListParams extends DiskSnapshotsCursorIDPageParams {
  /**
   * Devbox ID to filter by.
   */
  devbox_id?: string;

  /**
   * Filter snapshots by metadata key-value pair. Can be used multiple times for
   * different keys.
   */
  'metadata[key]'?: string;

  /**
   * Filter snapshots by metadata key with multiple possible values (OR condition).
   */
  'metadata[key][in]'?: string;
}

export declare namespace DiskSnapshots {
  export {
    type DevboxSnapshotAsyncStatusView as DevboxSnapshotAsyncStatusView,
    type DiskSnapshotDeleteResponse as DiskSnapshotDeleteResponse,
    type DiskSnapshotUpdateParams as DiskSnapshotUpdateParams,
    type DiskSnapshotListParams as DiskSnapshotListParams,
  };
}

export { DevboxSnapshotViewsDiskSnapshotsCursorIDPage };
