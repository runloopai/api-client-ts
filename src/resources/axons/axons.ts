// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import { APIPromise } from '../../core';
import * as Core from '../../core';
import * as SqlAPI from './sql';
import {
  Sql,
  SqlBatchParams,
  SqlBatchResultView,
  SqlColumnMetaView,
  SqlQueryParams,
  SqlQueryResultView,
  SqlResultMetaView,
  SqlStatementParams,
  SqlStepErrorView,
  SqlStepResultView,
} from './sql';
import { AxonsCursorIDPage, type AxonsCursorIDPageParams } from '../../pagination';
import { Stream } from '../../streaming';

export class Axons extends APIResource {
  sql: SqlAPI.Sql = new SqlAPI.Sql(this._client);

  /**
   * [Beta] Create a new axon.
   */
  create(body?: AxonCreateParams, options?: Core.RequestOptions): Core.APIPromise<AxonView>;
  create(options?: Core.RequestOptions): Core.APIPromise<AxonView>;
  create(
    body: AxonCreateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<AxonView> {
    if (isRequestOptions(body)) {
      return this.create({}, body);
    }
    return this._client.post('/v1/axons', { body, ...options });
  }

  /**
   * [Beta] Get an axon given ID.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<AxonView> {
    return this._client.get(`/v1/axons/${id}`, options);
  }

  /**
   * [Beta] List all active axons.
   */
  list(
    query?: AxonListParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<AxonViewsAxonsCursorIDPage, AxonView>;
  list(options?: Core.RequestOptions): Core.PagePromise<AxonViewsAxonsCursorIDPage, AxonView>;
  list(
    query: AxonListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<AxonViewsAxonsCursorIDPage, AxonView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList('/v1/axons', AxonViewsAxonsCursorIDPage, { query, ...options });
  }

  /**
   * [Beta] Publish an event to a specified axon.
   */
  publish(
    id: string,
    body: AxonPublishParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<PublishResultView> {
    return this._client.post(`/v1/axons/${id}/publish`, { body, ...options });
  }

  /**
   * [Beta] Subscribe to an axon event stream via server-sent events.
   */
  subscribeSse(id: string, options?: Core.RequestOptions): APIPromise<Stream<AxonEventView>> {
    return this._client.get(`/v1/axons/${id}/subscribe/sse`, { ...options, stream: true }) as APIPromise<
      Stream<AxonEventView>
    >;
  }
}

export class AxonViewsAxonsCursorIDPage extends AxonsCursorIDPage<AxonView> {}

export interface AxonCreateParams {
  /**
   * (Optional) Name for the axon.
   */
  name?: string | null;
}

export interface AxonEventView {
  /**
   * The axon identifier.
   */
  axon_id: string;

  /**
   * Event type (e.g. push, pull_request).
   */
  event_type: string;

  /**
   * Event origin.
   */
  origin: 'EXTERNAL_EVENT' | 'AGENT_EVENT' | 'USER_EVENT' | 'SYSTEM_EVENT';

  /**
   * JSON-encoded event payload.
   */
  payload: string;

  /**
   * Monotonic sequence number.
   */
  sequence: number;

  /**
   * Event source (e.g. github, slack).
   */
  source: string;

  /**
   * Timestamp in milliseconds since epoch.
   */
  timestamp_ms: number;
}

export interface AxonListView {
  /**
   * List of active axons.
   */
  axons: Array<AxonView>;

  has_more: boolean;

  total_count?: number | null;
}

export interface AxonView {
  /**
   * The axon identifier.
   */
  id: string;

  /**
   * Creation time in milliseconds since epoch.
   */
  created_at_ms: number;

  /**
   * The name of the axon.
   */
  name?: string | null;
}

export interface PublishParams {
  /**
   * The event type (e.g. push, pull_request).
   */
  event_type: string;

  /**
   * Event origin.
   */
  origin: 'EXTERNAL_EVENT' | 'AGENT_EVENT' | 'USER_EVENT';

  /**
   * Event payload.
   */
  payload: string;

  /**
   * The source of the event (e.g. github, slack).
   */
  source: string;
}

export interface PublishResultView {
  /**
   * Assigned sequence number.
   */
  sequence: number;

  /**
   * Timestamp in milliseconds since epoch.
   */
  timestamp_ms: number;
}

export interface AxonCreateParams {
  /**
   * (Optional) Name for the axon.
   */
  name?: string | null;
}

export interface AxonListParams extends AxonsCursorIDPageParams {
  /**
   * Filter by axon ID.
   */
  id?: string;

  /**
   * If true (default), includes total_count in the response. Set to false to skip
   * the count query for better performance on large datasets.
   */
  include_total_count?: boolean;

  /**
   * Filter by axon name (prefix match supported).
   */
  name?: string;
}

export interface AxonPublishParams {
  /**
   * The event type (e.g. push, pull_request).
   */
  event_type: string;

  /**
   * Event origin.
   */
  origin: 'EXTERNAL_EVENT' | 'AGENT_EVENT' | 'USER_EVENT';

  /**
   * Event payload.
   */
  payload: string;

  /**
   * The source of the event (e.g. github, slack).
   */
  source: string;
}

Axons.AxonViewsAxonsCursorIDPage = AxonViewsAxonsCursorIDPage;
Axons.Sql = Sql;

export declare namespace Axons {
  export {
    type AxonCreateParams as AxonCreateParams,
    type AxonEventView as AxonEventView,
    type AxonListView as AxonListView,
    type AxonView as AxonView,
    type PublishParams as PublishParams,
    type PublishResultView as PublishResultView,
    AxonViewsAxonsCursorIDPage as AxonViewsAxonsCursorIDPage,
    type AxonListParams as AxonListParams,
    type AxonPublishParams as AxonPublishParams,
  };

  export {
    Sql as Sql,
    type SqlBatchParams as SqlBatchParams,
    type SqlBatchResultView as SqlBatchResultView,
    type SqlColumnMetaView as SqlColumnMetaView,
    type SqlQueryResultView as SqlQueryResultView,
    type SqlResultMetaView as SqlResultMetaView,
    type SqlStatementParams as SqlStatementParams,
    type SqlStepErrorView as SqlStepErrorView,
    type SqlStepResultView as SqlStepResultView,
    type SqlQueryParams as SqlQueryParams,
  };
}
