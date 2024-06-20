// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as Core from '@runloop/api-client/core';
import { APIResource } from '@runloop/api-client/resource';
import { isRequestOptions } from '@runloop/api-client/core';
import * as KvAPI from '@runloop/api-client/resources/sessions/sessions/kv';

export class Kv extends APIResource {
  /**
   * List the sessions associated with your application.
   */
  list(sessionId: string, query?: KvListParams, options?: Core.RequestOptions): Core.APIPromise<SessionKv>;
  list(sessionId: string, options?: Core.RequestOptions): Core.APIPromise<SessionKv>;
  list(
    sessionId: string,
    query: KvListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<SessionKv> {
    if (isRequestOptions(query)) {
      return this.list(sessionId, {}, query);
    }
    return this._client.get(`/v1/sessions/sessions/${sessionId}/kv`, { query, ...options });
  }
}

export interface SessionKv {
  /**
   * The ID of the session.
   */
  id?: string;

  /**
   * The session key value storage.
   */
  kv?: Record<string, SessionKv.Kv>;
}

export namespace SessionKv {
  export interface Kv {
    array: boolean;

    bigDecimal: boolean;

    bigInteger: boolean;

    binary: boolean;

    boolean: boolean;

    containerNode: boolean;

    double: boolean;

    empty: boolean;

    float: boolean;

    floatingPointNumber: boolean;

    int: boolean;

    integralNumber: boolean;

    long: boolean;

    missingNode: boolean;

    null: boolean;

    number: boolean;

    object: boolean;

    pojo: boolean;

    short: boolean;

    textual: boolean;

    valueNode: boolean;

    nodeType?: 'ARRAY' | 'BINARY' | 'BOOLEAN' | 'MISSING' | 'NULL' | 'NUMBER' | 'OBJECT' | 'POJO' | 'STRING';
  }
}

export interface KvListParams {
  /**
   * Filter KV to specific keys.
   */
  keys?: string;
}

export namespace Kv {
  export import SessionKv = KvAPI.SessionKv;
  export import KvListParams = KvAPI.KvListParams;
}
