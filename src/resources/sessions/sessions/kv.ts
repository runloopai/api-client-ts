// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '@runloop/api-client/resource';
import * as KvAPI from '@runloop/api-client/resources/sessions/sessions/kv';

export class Kv extends APIResource {}

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

export namespace Kv {
  export import SessionKv = KvAPI.SessionKv;
}
