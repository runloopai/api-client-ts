// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '@runloop/api-client/resource';
import { isRequestOptions } from '@runloop/api-client/core';
import * as Core from '@runloop/api-client/core';
import * as DevboxesAPI from '@runloop/api-client/resources/devboxes/devboxes';
import * as LogsAPI from '@runloop/api-client/resources/devboxes/logs';

export class Devboxes extends APIResource {
  logs: LogsAPI.Logs = new LogsAPI.Logs(this._client);

  /**
   * Create a Devbox with the specified configuration. The Devbox will be created in
   * the 'pending' state and will transition to 'running' once it is ready.
   */
  create(body?: DevboxCreateParams, options?: Core.RequestOptions): Core.APIPromise<Devbox>;
  create(options?: Core.RequestOptions): Core.APIPromise<Devbox>;
  create(
    body: DevboxCreateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<Devbox> {
    if (isRequestOptions(body)) {
      return this.create({}, body);
    }
    return this._client.post('/v1/devboxes', { body, ...options });
  }

  /**
   * Get a devbox by id. If the devbox does not exist, a 404 is returned.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<Devbox> {
    return this._client.get(`/v1/devboxes/${id}`, options);
  }

  /**
   * List all devboxes or filter by status. If no status is provided, all devboxes
   * are returned.
   */
  list(query?: DevboxListParams, options?: Core.RequestOptions): Core.APIPromise<DevboxList>;
  list(options?: Core.RequestOptions): Core.APIPromise<DevboxList>;
  list(
    query: DevboxListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DevboxList> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.get('/v1/devboxes', { query, ...options });
  }

  /**
   * Shutdown a running devbox by id. This will take the devbox out of service.
   */
  shutdown(id: string, options?: Core.RequestOptions): Core.APIPromise<Devbox> {
    return this._client.post(`/v1/devboxes/${id}/shutdown`, options);
  }
}

export interface Devbox {
  /**
   * The id of the Devbox.
   */
  id?: string;

  /**
   * Creation time of the Devbox (Unix timestamp milliseconds).
   */
  create_time_ms?: number;

  /**
   * The current status of the Devbox (provisioning, initializing, running, failure,
   * shutdown).
   */
  status?: string;
}

export interface DevboxList {
  /**
   * List of devboxes matching filter.
   */
  devboxes?: Array<Devbox>;
}

export interface DevboxCreateParams {
  /**
   * (Optional) Id of a code handle to mount to devbox.
   */
  code_handle?: string;

  /**
   * (Optional) When specified, the Devbox will run this script as its main
   * executable. The devbox lifecycle will be bound to entrypoint, shutting down when
   * the process is complete.
   */
  entrypoint?: string;

  /**
   * (Optional) Environment variables used to configure your Devbox.
   */
  environment_variables?: Record<string, string>;

  /**
   * (Optional) List of commands needed to set up your Devbox. Examples might include
   * fetching a tool or building your dependencies. Runloop will look optimize these
   * steps for you.
   */
  setup_commands?: Array<string>;
}

export interface DevboxListParams {
  /**
   * Filter by status
   */
  status?: string;
}

export namespace Devboxes {
  export import Devbox = DevboxesAPI.Devbox;
  export import DevboxList = DevboxesAPI.DevboxList;
  export import DevboxCreateParams = DevboxesAPI.DevboxCreateParams;
  export import DevboxListParams = DevboxesAPI.DevboxListParams;
  export import Logs = LogsAPI.Logs;
  export import DevboxLogsList = LogsAPI.DevboxLogsList;
}
