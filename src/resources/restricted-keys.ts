// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';

export class RestrictedKeys extends APIResource {
  /**
   * Create a restricted API key with specific resource scopes. Use a standard API
   * key (ak*) or a restricted key (rk*) with RESOURCE_TYPE_ACCOUNT write scope.
   */
  create(
    body?: RestrictedKeyCreateParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<RestrictedKeyCreatedView>;
  create(options?: Core.RequestOptions): Core.APIPromise<RestrictedKeyCreatedView>;
  create(
    body: RestrictedKeyCreateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<RestrictedKeyCreatedView> {
    if (isRequestOptions(body)) {
      return this.create({}, body);
    }
    return this._client.post('/v1/restricted_keys', { body, ...options });
  }
}

export interface RestrictedKeyCreatedView {
  id?: string;

  expires_at_ms?: number | null;

  key_secret?: string;

  name?: string;

  scopes?: Array<ScopeEntryView>;
}

export interface RestrictedKeyCreateParameters {
  expires_at_ms?: number | null;

  name?: string;

  scopes?: Array<ScopeEntryView>;
}

export interface ScopeEntryView {
  access_level?: 'ACCESS_LEVEL_NONE' | 'ACCESS_LEVEL_READ' | 'ACCESS_LEVEL_WRITE';

  resource_type?:
    | 'RESOURCE_TYPE_DEVBOXES'
    | 'RESOURCE_TYPE_BLUEPRINTS'
    | 'RESOURCE_TYPE_SNAPSHOTS'
    | 'RESOURCE_TYPE_BENCHMARKS'
    | 'RESOURCE_TYPE_SCENARIOS'
    | 'RESOURCE_TYPE_REPO_CONNECTIONS'
    | 'RESOURCE_TYPE_AGENTS'
    | 'RESOURCE_TYPE_OBJECTS'
    | 'RESOURCE_TYPE_ACCOUNT';
}

export interface RestrictedKeyCreateParams {
  expires_at_ms?: number | null;

  name?: string;

  scopes?: Array<ScopeEntryView>;
}

export declare namespace RestrictedKeys {
  export {
    type RestrictedKeyCreatedView as RestrictedKeyCreatedView,
    type RestrictedKeyCreateParameters as RestrictedKeyCreateParameters,
    type ScopeEntryView as ScopeEntryView,
    type RestrictedKeyCreateParams as RestrictedKeyCreateParams,
  };
}
