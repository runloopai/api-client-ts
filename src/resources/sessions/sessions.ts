// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { Sessions } from './sessions/sessions';
import * as SessionsAPI from './sessions/sessions';

export class Sessions extends APIResource {
  sessions: SessionsAPI.Sessions = new SessionsAPI.Sessions(this._client);
}

export namespace Sessions {
  export import Sessions = SessionsAPI.Sessions;
  export import Session = SessionsAPI.Session;
  export import SessionList = SessionsAPI.SessionList;
  export import SessionCreateParams = SessionsAPI.SessionCreateParams;
}
