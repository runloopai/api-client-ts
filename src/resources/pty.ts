// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';

export class Pty extends APIResource {
  /**
   * Create or reconnect to a PTY session.
   */
  connect(
    sessionName: string,
    query?: PtyConnectParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<PtyConnectView>;
  connect(sessionName: string, options?: Core.RequestOptions): Core.APIPromise<PtyConnectView>;
  connect(
    sessionName: string,
    query: PtyConnectParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<PtyConnectView> {
    if (isRequestOptions(query)) {
      return this.connect(sessionName, {}, query);
    }
    return this._client.get(`/pty/${sessionName}`, { query, ...options });
  }

  /**
   * Send a control command to a PTY session.
   */
  control(
    sessionName: string,
    body: PtyControlParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<PtyControlResultView> {
    return this._client.post(`/pty/${sessionName}/control`, { body, ...options });
  }
}

export interface PtyConnectView {
  attached: boolean;

  created: boolean;

  cols?: number;

  connect_url?: string;

  idle_ttl_seconds?: number;

  protocol_version?: string;

  rows?: number;

  session_name?: string;

  status?: string;
}

export type PtyControlAction = 'resize' | 'signal' | 'close';

export type PtyControlParams =
  | { action: 'resize'; cols: number; rows: number }
  | { action: 'signal'; signal: string }
  | { action: 'close' };

export interface PtyControlResultView {
  session_name?: string;

  status?: string;
}

export interface PtyConnectParams {
  /**
   * Optional initial terminal width in character cells.
   */
  cols?: number | string;

  /**
   * Optional initial terminal height in character cells.
   */
  rows?: number | string;
}
