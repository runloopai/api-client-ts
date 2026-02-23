// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';
import { ObjectsCursorIDPage, type ObjectsCursorIDPageParams } from '../pagination';

export class Objects extends APIResource {
  /**
   * Create a new Object with content and metadata. The Object will be assigned a
   * unique ID.
   */
  create(body: ObjectCreateParams, options?: Core.RequestOptions): Core.APIPromise<ObjectView> {
    return this._client.post('/v1/objects', { body, ...options });
  }

  /**
   * Retrieve a specific Object by its unique identifier.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<ObjectView> {
    return this._client.get(`/v1/objects/${id}`, options);
  }

  /**
   * List all Objects for the authenticated account with pagination support.
   */
  list(
    query?: ObjectListParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<ObjectViewsObjectsCursorIDPage, ObjectView>;
  list(options?: Core.RequestOptions): Core.PagePromise<ObjectViewsObjectsCursorIDPage, ObjectView>;
  list(
    query: ObjectListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<ObjectViewsObjectsCursorIDPage, ObjectView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList('/v1/objects', ObjectViewsObjectsCursorIDPage, { query, ...options });
  }

  /**
   * Delete an existing Object by ID. This action is irreversible and will remove the
   * Object and all its metadata.
   */
  delete(
    id: string,
    body?: ObjectDeleteParams | null | undefined,
    options?: Core.RequestOptions,
  ): Core.APIPromise<ObjectView> {
    return this._client.post(`/v1/objects/${id}/delete`, { body, ...options });
  }

  /**
   * Mark an Object's upload as complete, transitioning it from UPLOADING to
   * READ-only state.
   */
  complete(
    id: string,
    body?: ObjectCompleteParams | null | undefined,
    options?: Core.RequestOptions,
  ): Core.APIPromise<ObjectView> {
    return this._client.post(`/v1/objects/${id}/complete`, { body, ...options });
  }

  /**
   * Generate a presigned download URL for an Object. The URL will be valid for the
   * specified duration.
   */
  download(
    id: string,
    query?: ObjectDownloadParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<ObjectDownloadURLView>;
  download(id: string, options?: Core.RequestOptions): Core.APIPromise<ObjectDownloadURLView>;
  download(
    id: string,
    query: ObjectDownloadParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<ObjectDownloadURLView> {
    if (isRequestOptions(query)) {
      return this.download(id, {}, query);
    }
    return this._client.get(`/v1/objects/${id}/download`, { query, ...options });
  }

  /**
   * List all public Objects with pagination support.
   */
  listPublic(
    query?: ObjectListPublicParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<ObjectViewsObjectsCursorIDPage, ObjectView>;
  listPublic(options?: Core.RequestOptions): Core.PagePromise<ObjectViewsObjectsCursorIDPage, ObjectView>;
  listPublic(
    query: ObjectListPublicParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<ObjectViewsObjectsCursorIDPage, ObjectView> {
    if (isRequestOptions(query)) {
      return this.listPublic({}, query);
    }
    return this._client.getAPIList('/v1/objects/list_public', ObjectViewsObjectsCursorIDPage, {
      query,
      ...options,
    });
  }
}

export class ObjectViewsObjectsCursorIDPage extends ObjectsCursorIDPage<ObjectView> {}

/**
 * Parameters required to create a new Object.
 */
export interface ObjectCreateParameters {
  /**
   * The content type of the Object.
   */
  content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz';

  /**
   * The name of the Object.
   */
  name: string;

  /**
   * User defined metadata to attach to the object for organization.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * Optional lifetime of the object in milliseconds, after which the object is
   * automatically deleted. Time starts ticking after the object is created.
   */
  ttl_ms?: number | null;
}

/**
 * A response containing a presigned download URL for an Object.
 */
export interface ObjectDownloadURLView {
  /**
   * The presigned download URL for the Object.
   */
  download_url: string;
}

/**
 * A paginated list of Objects.
 */
export interface ObjectListView {
  /**
   * True if there are more results available beyond this page.
   */
  has_more: boolean;

  /**
   * List of Object entities.
   */
  objects: Array<ObjectView>;

  /**
   * Number of Objects remaining after this page. Deprecated: will be removed in a
   * future breaking change.
   */
  remaining_count?: number | null;

  /**
   * Total number of Objects across all pages. Deprecated: will be removed in a
   * future breaking change.
   */
  total_count?: number | null;
}

/**
 * An Object represents a stored data entity with metadata.
 *
 * @category Storage Object Types
 */
export interface ObjectView {
  /**
   * The unique identifier of the Object.
   */
  id: string;

  /**
   * The content type of the Object.
   */
  content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz';

  /**
   * The creation time of the Object in milliseconds since epoch.
   */
  create_time_ms: number;

  /**
   * The name of the Object.
   */
  name: string;

  /**
   * The current state of the Object.
   */
  state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR';

  /**
   * The time after which the Object will be deleted in milliseconds since epoch.
   */
  delete_after_time_ms?: number | null;

  /**
   * The size of the Object content in bytes (null until uploaded).
   */
  size_bytes?: number | null;

  /**
   * Presigned URL for uploading content to S3 (only present on create).
   */
  upload_url?: string | null;
}

/**
 * Parameters for creating a new Storage Object.
 *
 * @category Storage Object Types
 */
export interface ObjectCreateParams {
  /**
   * The content type of the Object.
   */
  content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz';

  /**
   * The name of the Object.
   */
  name: string;

  /**
   * User defined metadata to attach to the object for organization.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * Optional lifetime of the object in milliseconds, after which the object is
   * automatically deleted. Time starts ticking after the object is created.
   */
  ttl_ms?: number | null;
}

export interface ObjectListParams extends ObjectsCursorIDPageParams {
  /**
   * Filter storage objects by content type.
   */
  content_type?: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz';

  /**
   * Filter storage objects by name (partial match supported).
   */
  name?: string;

  /**
   * Search by object ID or name.
   */
  search?: string;

  /**
   * Filter storage objects by state.
   */
  state?: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR';
}

export interface ObjectDeleteParams {}

export interface ObjectCompleteParams {}

export interface ObjectDownloadParams {
  /**
   * Duration in seconds for the presigned URL validity (default: 3600).
   */
  duration_seconds?: number;
}

export interface ObjectListPublicParams extends ObjectsCursorIDPageParams {
  /**
   * Filter storage objects by content type.
   */
  content_type?: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz';

  /**
   * Filter storage objects by name (partial match supported).
   */
  name?: string;

  /**
   * Search by object ID or name.
   */
  search?: string;

  /**
   * Filter storage objects by state.
   */
  state?: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR';
}

Objects.ObjectViewsObjectsCursorIDPage = ObjectViewsObjectsCursorIDPage;

export declare namespace Objects {
  export {
    type ObjectCreateParameters as ObjectCreateParameters,
    type ObjectDownloadURLView as ObjectDownloadURLView,
    type ObjectListView as ObjectListView,
    type ObjectView as ObjectView,
    ObjectViewsObjectsCursorIDPage as ObjectViewsObjectsCursorIDPage,
    type ObjectCreateParams as ObjectCreateParams,
    type ObjectListParams as ObjectListParams,
    type ObjectDeleteParams as ObjectDeleteParams,
    type ObjectCompleteParams as ObjectCompleteParams,
    type ObjectDownloadParams as ObjectDownloadParams,
    type ObjectListPublicParams as ObjectListPublicParams,
  };
}
