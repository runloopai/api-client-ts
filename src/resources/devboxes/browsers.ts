// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as DevboxesAPI from './devboxes';

export class Browsers extends APIResource {
  /**
   * Create a Devbox that has a managed Browser and begin the boot process. As part
   * of booting the Devbox, the browser will automatically be started with connection
   * utilities activated.
   */
  create(body?: BrowserCreateParams, options?: Core.RequestOptions): Core.APIPromise<BrowserView>;
  create(options?: Core.RequestOptions): Core.APIPromise<BrowserView>;
  create(
    body: BrowserCreateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<BrowserView> {
    if (isRequestOptions(body)) {
      return this.create({}, body);
    }
    return this._client.post('/v1/devboxes/browsers', { body, ...options });
  }

  /**
   * Get Browser Details.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<BrowserView> {
    return this._client.get(`/v1/devboxes/browsers/${id}`, options);
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
   * browser. You can control the interactivity of the browser by adding or removing
   * 'view_only' query parameter. view_only=1 will allow interaction and view_only=0
   * will disable interaction.
   */
  live_view_url: string;
}

export interface BrowserCreateParams {
  /**
   * The name to use for the created Devbox with a Browser.
   */
  name?: string | null;
}

export declare namespace Browsers {
  export { type BrowserView as BrowserView, type BrowserCreateParams as BrowserCreateParams };
}
