// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';

export class Secrets extends APIResource {
  /**
   * Create a new Secret with a globally unique name and value. The Secret will be
   * encrypted at rest and made available as an environment variable in Devboxes.
   */
  create(body: SecretCreateParams, options?: Core.RequestOptions): Core.APIPromise<SecretView> {
    return this._client.post('/v1/secrets', { body, ...options });
  }

  /**
   * Update the value of an existing Secret by name. The new value will be encrypted
   * at rest.
   */
  update(name: string, body: SecretUpdateParams, options?: Core.RequestOptions): Core.APIPromise<SecretView> {
    return this._client.post(`/v1/secrets/${name}`, { body, ...options });
  }

  /**
   * List all Secrets for the authenticated account. Secret values are not included
   * for security reasons.
   */
  list(query?: SecretListParams, options?: Core.RequestOptions): Core.APIPromise<SecretListView>;
  list(options?: Core.RequestOptions): Core.APIPromise<SecretListView>;
  list(
    query: SecretListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<SecretListView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.get('/v1/secrets', { query, ...options });
  }

  /**
   * Delete an existing Secret by name. This action is irreversible and will remove
   * the Secret from all Devboxes.
   */
  delete(
    name: string,
    body?: SecretDeleteParams | null | undefined,
    options?: Core.RequestOptions,
  ): Core.APIPromise<SecretView> {
    return this._client.post(`/v1/secrets/${name}/delete`, { body, ...options });
  }
}

/**
 * Parameters required to create a new Secret.
 */
export interface SecretCreateParameters {
  /**
   * The globally unique name for the Secret. Must be a valid environment variable
   * name (alphanumeric and underscores only). Example: 'DATABASE_PASSWORD'
   */
  name: string;

  /**
   * The value to store for this Secret. This will be encrypted at rest and made
   * available as an environment variable in Devboxes. Example: 'my-secure-password'
   */
  value: string;
}

/**
 * A paginated list of Secrets.
 */
export interface SecretListView {
  /**
   * True if there are more results available beyond this page.
   */
  has_more: boolean;

  /**
   * Number of Secrets remaining after this page. Deprecated: always returns null.
   */
  remaining_count: number | null;

  /**
   * List of Secret objects. Values are omitted for security.
   */
  secrets: Array<SecretView>;

  /**
   * Total number of Secrets across all pages. Deprecated: always returns null.
   */
  total_count: number | null;
}

/**
 * Parameters required to update an existing Secret.
 */
export interface SecretUpdateParameters {
  /**
   * The new value for the Secret. This will replace the existing value and be
   * encrypted at rest. Example: 'my-updated-secure-password'
   */
  value: string;
}

/**
 * A Secret represents a key-value pair that can be securely stored and used in
 * Devboxes as environment variables.
 */
export interface SecretView {
  /**
   * The unique identifier of the Secret.
   */
  id: string;

  /**
   * Creation time of the Secret (Unix timestamp in milliseconds).
   */
  create_time_ms: number;

  /**
   * The globally unique name of the Secret. Used as the environment variable name in
   * Devboxes.
   */
  name: string;

  /**
   * Last update time of the Secret (Unix timestamp in milliseconds).
   */
  update_time_ms: number;
}

export interface SecretCreateParams {
  /**
   * The globally unique name for the Secret. Must be a valid environment variable
   * name (alphanumeric and underscores only). Example: 'DATABASE_PASSWORD'
   */
  name: string;

  /**
   * The value to store for this Secret. This will be encrypted at rest and made
   * available as an environment variable in Devboxes. Example: 'my-secure-password'
   */
  value: string;
}

export interface SecretUpdateParams {
  /**
   * The new value for the Secret. This will replace the existing value and be
   * encrypted at rest. Example: 'my-updated-secure-password'
   */
  value: string;
}

export interface SecretListParams {
  /**
   * The limit of items to return. Default is 20. Max is 5000.
   */
  limit?: number;
}

export interface SecretDeleteParams {}

export declare namespace Secrets {
  export {
    type SecretCreateParameters as SecretCreateParameters,
    type SecretListView as SecretListView,
    type SecretUpdateParameters as SecretUpdateParameters,
    type SecretView as SecretView,
    type SecretCreateParams as SecretCreateParams,
    type SecretUpdateParams as SecretUpdateParams,
    type SecretListParams as SecretListParams,
    type SecretDeleteParams as SecretDeleteParams,
  };
}
