// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as AxonsAPI from './axons';

export class Events extends APIResource {
  /**
   * [Beta] List events from an axon's event stream, ordered by sequence descending.
   */
  list(
    id: string,
    query?: EventListParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<AxonEventListView>;
  list(id: string, options?: Core.RequestOptions): Core.APIPromise<AxonEventListView>;
  list(
    id: string,
    query: EventListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<AxonEventListView> {
    if (isRequestOptions(query)) {
      return this.list(id, {}, query);
    }
    return this._client.get(`/v1/axons/${id}/events`, { query, ...options });
  }
}

export interface AxonEventListView {
  /**
   * List of axon events.
   */
  events: Array<AxonsAPI.AxonEventView>;

  has_more: boolean;

  total_count?: number | null;
}

export interface EventListParams {
  /**
   * If true (default), includes total_count in the response. Set to false to skip
   * the count query for better performance on large datasets.
   */
  include_total_count?: boolean;

  /**
   * The limit of items to return. Default is 20. Max is 5000.
   */
  limit?: number;

  /**
   * Load the next page of data starting after the item with the given ID.
   */
  starting_after?: string;
}

export declare namespace Events {
  export { type AxonEventListView as AxonEventListView, type EventListParams as EventListParams };
}
