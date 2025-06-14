// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { Runloop } from './index';

export abstract class APIResource {
  protected _client: Runloop;

  constructor(client: Runloop) {
    this._client = client;
  }
}
