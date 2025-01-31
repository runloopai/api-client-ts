// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as DevboxesAPI from './devboxes';

export class Computers extends APIResource {
  /**
   * Create a Computer and begin the boot process. The Computer will initially launch
   * in the 'provisioning' state while Runloop allocates the necessary
   * infrastructure. It will transition to the 'initializing' state while the booted
   * Computer runs any Runloop or user defined set up scripts. Finally, the Computer
   * will transition to the 'running' state when it is ready for use.
   */
  create(body?: ComputerCreateParams, options?: Core.RequestOptions): Core.APIPromise<ComputerView>;
  create(options?: Core.RequestOptions): Core.APIPromise<ComputerView>;
  create(
    body: ComputerCreateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<ComputerView> {
    if (isRequestOptions(body)) {
      return this.create({}, body);
    }
    return this._client.post('/v1/devboxes/computers', { body, ...options });
  }

  /**
   * Perform the specified keyboard interaction on the Computer identified by the
   * given ID.
   */
  keyboardInteraction(
    id: string,
    body: ComputerKeyboardInteractionParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<ComputerKeyboardInteractionResponse> {
    return this._client.post(`/v1/devboxes/computers/${id}/keyboard_interaction`, { body, ...options });
  }

  /**
   * Perform the specified mouse interaction on the Computer identified by the given
   * ID.
   */
  mouseInteraction(
    id: string,
    body: ComputerMouseInteractionParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<ComputerMouseInteractionResponse> {
    return this._client.post(`/v1/devboxes/computers/${id}/mouse_interaction`, { body, ...options });
  }

  /**
   * Perform the specified screen interaction on the Computer identified by the given
   * ID.
   */
  screenInteraction(
    id: string,
    body: ComputerScreenInteractionParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<ComputerScreenInteractionResponse> {
    return this._client.post(`/v1/devboxes/computers/${id}/screen_interaction`, { body, ...options });
  }
}

/**
 * A Computer represents an implementation of Anthropic Computer usage on top of
 * Devboxes. It includes the tunnel to the live screen and the underlying
 * DevboxView.
 */
export interface ComputerView {
  /**
   * The underlying devbox the computer setup is running on.
   */
  devbox: DevboxesAPI.DevboxView;

  /**
   * The http tunnel to connect and view the live screen of the computer.
   */
  live_screen_url: string;
}

export interface ComputerKeyboardInteractionResponse {
  error?: string;

  latest_screenshot_base64_img?: string;

  output?: string;
}

export interface ComputerMouseInteractionResponse {
  error?: string;

  latest_screenshot_base64_img?: string;

  output?: string;
}

export interface ComputerScreenInteractionResponse {
  error?: string;

  latest_screenshot_base64_img?: string;

  output?: string;
}

export interface ComputerCreateParams {
  /**
   * Customize the dimensions of the computer display.
   */
  display_dimensions?: ComputerCreateParams.DisplayDimensions | null;
}

export namespace ComputerCreateParams {
  /**
   * Customize the dimensions of the computer display.
   */
  export interface DisplayDimensions {
    /**
     * The height of the display being controlled by the model in pixels.
     */
    display_height_px: number;

    /**
     * The width of the display being controlled by the model in pixels.
     */
    display_width_px: number;
  }
}

export interface ComputerKeyboardInteractionParams {
  /**
   * The keyboard action to perform.
   */
  action: 'key' | 'type';

  /**
   * The text to type or the key (with optional modifier) to press.
   */
  text?: string | null;
}

export interface ComputerMouseInteractionParams {
  /**
   * The mouse action to perform.
   */
  action: 'mouse_move' | 'left_click' | 'left_click_drag' | 'right_click' | 'middle_click' | 'double_click';

  /**
   * The x (pixels from the left) and y (pixels from the top) coordinates for the
   * mouse to move or click-drag. Required only by `action=mouse_move` or
   * `action=left_click_drag`
   */
  coordinate?: ComputerMouseInteractionParams.Coordinate | null;
}

export namespace ComputerMouseInteractionParams {
  /**
   * The x (pixels from the left) and y (pixels from the top) coordinates for the
   * mouse to move or click-drag. Required only by `action=mouse_move` or
   * `action=left_click_drag`
   */
  export interface Coordinate {
    /**
     * The x coordinate (pixels from the left) for the mouse to move or click-drag.
     */
    x: number;

    /**
     * The y coordinate (pixels from the top) for the mouse to move or click-drag.
     */
    y: number;
  }
}

export interface ComputerScreenInteractionParams {
  /**
   * The screen action to perform.
   */
  action: 'screenshot' | 'cursor_position';
}

export declare namespace Computers {
  export {
    type ComputerView as ComputerView,
    type ComputerKeyboardInteractionResponse as ComputerKeyboardInteractionResponse,
    type ComputerMouseInteractionResponse as ComputerMouseInteractionResponse,
    type ComputerScreenInteractionResponse as ComputerScreenInteractionResponse,
    type ComputerCreateParams as ComputerCreateParams,
    type ComputerKeyboardInteractionParams as ComputerKeyboardInteractionParams,
    type ComputerMouseInteractionParams as ComputerMouseInteractionParams,
    type ComputerScreenInteractionParams as ComputerScreenInteractionParams,
  };
}
