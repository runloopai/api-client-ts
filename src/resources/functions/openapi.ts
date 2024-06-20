// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as Core from '@runloop/api-client/core';
import { APIResource } from '@runloop/api-client/resource';
import * as OpenAPIAPI from '@runloop/api-client/resources/functions/openapi';

export class OpenAPI extends APIResource {
  /**
   * Get the OpenAPI Spec for this project.
   */
  retrieve(options?: Core.RequestOptions): Core.APIPromise<unknown> {
    return this._client.get('/v1/functions/openapi', options);
  }
}

export type OpenAPIRetrieveResponse = unknown;

export namespace OpenAPI {
  export import OpenAPIRetrieveResponse = OpenAPIAPI.OpenAPIRetrieveResponse;
}
