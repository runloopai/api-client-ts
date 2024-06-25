// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '@runloop/api-client/resource';
import * as Core from '@runloop/api-client/core';
import * as LogsAPI from '@runloop/api-client/resources/devboxes/logs';

export class Logs extends APIResource {
  /**
   * Get all logs from a Devbox by id.
   */
  list(id: string, options?: Core.RequestOptions): Core.APIPromise<DevboxLogsList> {
    return this._client.get(`/v1/devboxes/${id}/logs`, options);
  }
}

export interface DevboxLogsList {
  /**
   * List of logs for the given devbox.
   */
  logs?: Array<DevboxLogsList.Log>;
}

export namespace DevboxLogsList {
  export interface Log {
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
  export import DevboxLogsList = LogsAPI.DevboxLogsList;
}
