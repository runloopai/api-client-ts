// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';

export class Logs extends APIResource {
  /**
   * Get all logs from a running or completed Devbox.
   */
  list(id: string, query?: LogListParams, options?: Core.RequestOptions): Core.APIPromise<DevboxLogsListView>;
  list(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxLogsListView>;
  list(
    id: string,
    query: LogListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxLogsListView> {
    if (isRequestOptions(query)) {
      return this.list(id, {}, query);
    }
    return this._client.get(`/v1/devboxes/${id}/logs`, { query, ...options });
  }
}

export interface DevboxLogsListView {
  /**
   * List of logs for the given devbox.
   */
  logs: Array<DevboxLogsListView.Log>;
}

export namespace DevboxLogsListView {
  export interface Log {
    /**
     * Log line severity level.
     */
    level: string;

    /**
     * The source of the log.
     */
    source: 'setup_commands' | 'entrypoint' | 'exec' | 'files';

    /**
     * Time of log (Unix timestamp milliseconds).
     */
    timestamp_ms: number;

    /**
     * The Command Executed
     */
    cmd?: string | null;

    /**
     * Identifier of the associated command the log is sourced from.
     */
    cmd_id?: string | null;

    /**
     * The Exit Code of the command
     */
    exit_code?: number | null;

    /**
     * Log line message.
     */
    message?: string | null;

    /**
     * The Shell name the cmd executed in.
     */
    shell_name?: string | null;
  }
}

export interface LogListParams {
  /**
   * ID of execution to filter logs by.
   */
  execution_id?: string;

  /**
   * Shell Name to filter logs by.
   */
  shell_name?: string;
}

export declare namespace Logs {
  export { type DevboxLogsListView as DevboxLogsListView, type LogListParams as LogListParams };
}
