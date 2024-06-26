// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '@runloop/api-client/resource';
import * as Core from '@runloop/api-client/core';
import * as LogsAPI from '@runloop/api-client/resources/devboxes/logs';

export class Logs extends APIResource {
  /**
   * Get all logs from a Devbox by id.
   */
  list(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxLogsListView> {
    return this._client.get(`/v1/devboxes/${id}/logs`, options);
  }
}

export interface DevboxLogsListView {
  /**
   * List of logs for the given devbox.
   */
  logs?: Array<DevboxLogsListView.Log>;
}

export namespace DevboxLogsListView {
  export interface Log {
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
     * Log line severity level.
     */
    level?: string;

    /**
     * Log line message.
     */
    message?: string;

    /**
     * Time of log (Unix timestamp milliseconds).
     */
    timestamp_ms?: number;
  }
}

export namespace Logs {
  export import DevboxLogsListView = LogsAPI.DevboxLogsListView;
}
