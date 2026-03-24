// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import * as Core from '../core';

export class Axons extends APIResource {
  /**
   * [Beta] Create a new axon.
   */
  create(
    body?: AxonCreateParams | null | undefined,
    options?: Core.RequestOptions,
  ): Core.APIPromise<AxonView> {
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
  list(options?: Core.RequestOptions): Core.APIPromise<AxonListView> {
    return this._client.get('/v1/axons', options);
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
}

export type AxonCreateParams = unknown;

export interface AxonListView {
  /**
   * List of active axons.
   */
  axons: Array<AxonView>;
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

export interface AxonCreateParams {}

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

export declare namespace Axons {
  export {
    type AxonCreateParams as AxonCreateParams,
    type AxonListView as AxonListView,
    type AxonView as AxonView,
    type PublishParams as PublishParams,
    type PublishResultView as PublishResultView,
    type AxonPublishParams as AxonPublishParams,
  };
}
