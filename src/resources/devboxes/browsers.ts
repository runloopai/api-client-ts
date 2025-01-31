// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import * as Core from '../../core';
import * as DevboxesAPI from './devboxes';

export class Browsers extends APIResource {
  /**
   * Create a Devbox that has a managed Browser and begin the boot process. As part
   * of booting the Devbox, the browser will automatically be started with connection
   * utilities activated.
   */
  create(
    body?: BrowserCreateParams | null | undefined,
    options?: Core.RequestOptions,
  ): Core.APIPromise<BrowserView> {
    return this._client.post('/v1/devboxes/browsers', { body, ...options });
  }
}

/**
 * A Browser represents a managed implementation of a browser like Chromiumon top
 * of Devboxes. It includes the tunnel to the live screen and the underlying
 * DevboxView.
 */
export interface BrowserView {
  /**
   * The url to enable remote connection from browser automation tools like
   * playwright.
   */
  connection_url: string;

  /**
   * The underlying devbox the browser setup is running on.
   */
  devbox: DevboxesAPI.DevboxView;

  /**
   * The url to view the browser window and enable user interactions via their own
   * browser.
   */
  live_view_url: string;
}

export interface BrowserCreateParams {}

export declare namespace Browsers {
  export { type BrowserView as BrowserView, type BrowserCreateParams as BrowserCreateParams };
}
