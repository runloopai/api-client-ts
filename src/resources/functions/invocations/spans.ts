// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '@runloop/api-client/resource';
import * as SpansAPI from '@runloop/api-client/resources/functions/invocations/spans';

export class Spans extends APIResource {}

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
