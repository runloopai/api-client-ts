// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as Core from '../core';
import { APIResource } from '../resource';
import * as LatchesAPI from './latches';

export class Latches extends APIResource {
  /**
   * Fulfill the latch by passing the waited for event. This will unblock any waiting
   * functions.
   */
  fulfill(
    latchId: string,
    body: LatchFulfillParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<unknown> {
    return this._client.post(`/v1/latches/${latchId}`, { body, ...options });
  }
}

export type EmptyRecord = unknown;

export interface LatchFulfillParams {
  /**
   * Json of the event to complete the latch with
   */
  result: unknown;
}

export namespace Latches {
  export import EmptyRecord = LatchesAPI.EmptyRecord;
  export import LatchFulfillParams = LatchesAPI.LatchFulfillParams;
}
