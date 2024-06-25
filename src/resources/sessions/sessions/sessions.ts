// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '@runloop/api-client/resource';
import * as Core from '@runloop/api-client/core';
import * as SessionsAPI from '@runloop/api-client/resources/sessions/sessions/sessions';
import * as KvAPI from '@runloop/api-client/resources/sessions/sessions/kv';

export class Sessions extends APIResource {
  kv: KvAPI.Kv = new KvAPI.Kv(this._client);

  /**
   * Create a new session for the application. Sessions are used to store metadata
   * and state for your application.
   */
  create(
    body?: SessionCreateParams | null | undefined,
    options?: Core.RequestOptions,
  ): Core.APIPromise<Session> {
    return this._client.post('/v1/sessions/sessions', { body, ...options });
  }

  /**
   * List the sessions associated with your application.
   */
  list(options?: Core.RequestOptions): Core.APIPromise<SessionList> {
    return this._client.get('/v1/sessions/sessions', options);
  }
}

export interface Session {
  /**
   * The ID of the session.
   */
  id?: string;
}

export interface SessionList {
  /**
   * List of sessions matching given query.
   */
  sessions?: Array<Session>;
}

export interface SessionCreateParams {}

export namespace Sessions {
  export import Session = SessionsAPI.Session;
  export import SessionList = SessionsAPI.SessionList;
  export import SessionCreateParams = SessionsAPI.SessionCreateParams;
  export import Kv = KvAPI.Kv;
  export import SessionKv = KvAPI.SessionKv;
}
