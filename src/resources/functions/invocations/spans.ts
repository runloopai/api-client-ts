// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../resource';
import * as Core from '../../../core';
import * as SpansAPI from './spans';

export class Spans extends APIResource {
  /**
   * Get the span points for the given invocation. This will return the span points
   * for the invocation.
   */
  list(invocationId: string, options?: Core.RequestOptions): Core.APIPromise<InvocationSpanListView> {
    return this._client.get(`/v1/functions/invocations/${invocationId}/spans`, options);
  }
}

export interface InvocationSpanListView {
  invocationId?: string;

  /**
   * List of spans matching given query.
   */
  spans?: unknown;
}

export namespace Spans {
  export import InvocationSpanListView = SpansAPI.InvocationSpanListView;
}
