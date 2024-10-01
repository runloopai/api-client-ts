// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as LogsAPI from './logs';

export class Logs extends APIResource {
  /**
   * Get all logs from a Devbox by id.
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
    source: 'setup_commands' | 'entrypoint' | 'exec';

    /**
     * Time of log (Unix timestamp milliseconds).
     */
    timestamp_ms: number;

    /**
     * The Command Executed
     */
    cmd?: string;

    /**
     * Identifier of the associated command the log is sourced from.
     */
    cmd_id?: string;

    /**
     * The Exit Code of the command
     */
    exit_code?: number;

    /**
     * Log line message.
     */
    message?: string;

    /**
     * The Shell name the cmd executed in.
     */
    shell_name?: string;
  }
}

export interface LogListParams {
  /**
   * Id of execution to filter logs by.
   */
  execution_id?: string;

  /**
   * Shell Name to filter logs by.
   */
  shell_name?: string;
}

export namespace Logs {
  export import DevboxLogsListView = LogsAPI.DevboxLogsListView;
  export import LogListParams = LogsAPI.LogListParams;
}
