// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import * as Core from '../../core';
import * as ExecutionsAPI from './executions';

export class Logs extends APIResource {
  /**
   * Get all logs from a Devbox by id.
   */
  list(id: string, options?: Core.RequestOptions): Core.APIPromise<ExecutionsAPI.DevboxLogsListView> {
    return this._client.get(`/v1/devboxes/${id}/logs`, options);
  }

  /**
   * Tail the logs for the given devbox. This will return past log entries and
   * continue from there. This is a streaming api and will continue to stream logs
   * until the connection is closed.
   */
  tail(id: string, options?: Core.RequestOptions): Core.APIPromise<void> {
    return this._client.get(`/v1/devboxes/${id}/logs/tail`, {
      ...options,
      headers: { Accept: '*/*', ...options?.headers },
    });
  }
}
