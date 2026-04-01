// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import { APIPromise } from '../core';
import * as Core from '../core';
import { Stream } from '../streaming';
import { withStreamAutoReconnect } from '@runloop/api-client/lib/streaming-reconnection';

export class Axons extends APIResource {
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

  /**
   * [Beta] Subscribe to an axon event stream via server-sent events.
   * On idle timeout (408), reconnects with `after_sequence` derived from the last
   * received event (internal to {@link withStreamAutoReconnect}).
   */
  subscribeSse(id: string, options?: Core.RequestOptions): APIPromise<Stream<AxonEventView>> {
    const mergedOptions: Core.RequestOptions = {
      ...options,
      headers: {
        Accept: 'text/event-stream',
        ...options?.headers,
      },
    };
    const getStream: (afterSequence: number | undefined) => APIPromise<Stream<AxonEventView>> = (
      afterSequence,
    ) =>
      this._client.get(`/v1/axons/${id}/subscribe/sse`, {
        query: afterSequence !== undefined ? { after_sequence: afterSequence.toString() } : undefined,
        ...mergedOptions,
        stream: true,
      }) as APIPromise<Stream<AxonEventView>>;
    return withStreamAutoReconnect(getStream, (item) => item.sequence);
  }
}

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
    type AxonEventView as AxonEventView,
    type AxonListView as AxonListView,
    type AxonView as AxonView,
    type PublishParams as PublishParams,
    type PublishResultView as PublishResultView,
    type AxonPublishParams as AxonPublishParams,
  };
}
