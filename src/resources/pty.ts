// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';

export class Pty extends APIResource {
  /**
   * Looks up the PTY session identified by the path session*name and either
   * reconnects to the existing session or creates it if it does not yet exist. The
   * session_name is a client-chosen session identifier, not an opaque server-issued
   * ID. It must be non-empty (1..=256 chars) and use only ASCII letters, digits, '-'
   * and '*'. A newly created PTY session starts an interactive bash shell on the
   * Devbox. Optional cols and rows query parameters apply an initial terminal size
   * before any I/O; they must both be present and in the range 1..=1000 to take
   * effect. The response returns a PtyConnectView containing connect_url (a
   * server-relative path to the WebSocket data plane), idle_ttl_seconds (how long
   * this session is retained after the last client disconnects), and the resulting
   * cols/rows. The interactive terminal byte stream is exchanged over the WebSocket
   * data plane and is not modeled in this OpenAPI contract; clients should connect
   * to connect_url and exchange raw binary frames for terminal I/O. The
   * single-attach contract is enforced when a client opens the WebSocket data plane,
   * not on this bootstrap call: bootstrap always succeeds for a valid session_name,
   * even if another client is currently attached. Rejection of a second concurrent
   * attach happens at WebSocket upgrade time. If the active client disconnects, the
   * session is preserved for the idle TTL so a later connect using the same
   * session_name resumes the same shell. After the TTL expires, after an explicit
   * close control action, or after the underlying Devbox lifecycle replaces the PTY
   * process (such as through suspend/resume), a later request with the same
   * session_name creates a fresh PTY session without the previous shell state.
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
   * Applies a PTY control operation to an existing session. The action field selects
   * the operation; the other fields in PtyControlParameters are interpreted only
   * when they are relevant to the chosen action.
   *
   * resize: cols and rows are required and must each be in 1..=1000. A 0 or
   * out-of-range value returns 400. The new winsize is applied to the PTY master and
   * the kernel delivers SIGWINCH to the foreground process group.
   *
   * signal: signal is the POSIX signal name (for example 'SIGTERM', 'SIGHUP',
   * 'SIGINT', 'SIGUSR1'). Unknown signal names return 400. The signal is delivered
   * to the slave's foreground process group via killpg(2). If the shell has already
   * exited and there is no foreground process group, returns 400.
   *
   * close: terminates the session. Sends SIGHUP to the foreground process group
   * (best-effort; ignored if the shell has already exited) and drops the session
   * from the server's session cache. A subsequent connect with the same session_name
   * will create a fresh PTY session.
   */
  control(
    sessionName: string,
    body?: PtyControlParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<PtyControlResultView>;
  control(sessionName: string, options?: Core.RequestOptions): Core.APIPromise<PtyControlResultView>;
  control(
    sessionName: string,
    body: PtyControlParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<PtyControlResultView> {
    if (isRequestOptions(body)) {
      return this.control(sessionName, {}, body);
    }
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

export interface PtyControlParams {
  action?: 'resize' | 'signal' | 'close';

  cols?: number;

  rows?: number;

  signal?: string;
}

export interface PtyControlResultView {
  session_name?: string;

  status?: string;
}

export interface PtyConnectParams {
  /**
   * Optional initial terminal width in character cells (1..=1000). Defaults to 80
   * when omitted. Applied only if both cols and rows are provided; otherwise
   * ignored.
   */
  cols?: number;

  /**
   * Optional initial terminal height in character cells (1..=1000). Defaults to 24
   * when omitted. Applied only if both cols and rows are provided; otherwise
   * ignored.
   */
  rows?: number;
}

export interface PtyControlParams {
  action?: 'resize' | 'signal' | 'close';

  cols?: number;

  rows?: number;

  signal?: string;
}

export declare namespace Pty {
  export {
    type PtyConnectView as PtyConnectView,
    type PtyControlParams as PtyControlParams,
    type PtyControlResultView as PtyControlResultView,
    type PtyConnectParams as PtyConnectParams,
  };
}
