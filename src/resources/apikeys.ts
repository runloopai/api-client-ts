// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';

export class Apikeys extends APIResource {
  /**
   * Create a new API key for the authenticated account. Use a standard API key (ak*)
   * or a restricted key (rk*) with RESOURCE_TYPE_ACCOUNT write scope.
   */
  create(body?: ApikeyCreateParams, options?: Core.RequestOptions): Core.APIPromise<APIKeyCreatedView>;
  create(options?: Core.RequestOptions): Core.APIPromise<APIKeyCreatedView>;
  create(
    body: ApikeyCreateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<APIKeyCreatedView> {
    if (isRequestOptions(body)) {
      return this.create({}, body);
    }
    return this._client.post('/v1/apikeys', { body, ...options });
  }
}

export interface APIKeyCreatedView {
  id?: string;

  expires_at_ms?: number | null;

  key_secret?: string;

  name?: string;
}

export interface APIKeyCreateParameters {
  expires_at_ms?: number | null;

  name?: string;
}

export interface ApikeyCreateParams {
  expires_at_ms?: number | null;

  name?: string;
}

export declare namespace Apikeys {
  export {
    type APIKeyCreatedView as APIKeyCreatedView,
    type APIKeyCreateParameters as APIKeyCreateParameters,
    type ApikeyCreateParams as ApikeyCreateParams,
  };
}
