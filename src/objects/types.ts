// Shared types for object-oriented API classes

import type { Runloop } from '../index';
import type * as Core from '../core';

/**
 * Base options interface that extends Core.RequestOptions with an optional client parameter.
 * This allows object-oriented classes to use a default client or accept a custom one.
 */
export interface ObjectOptions extends Core.RequestOptions {
  /**
   * Optional Runloop client instance. If not provided, the default client will be used.
   */
  client?: Runloop;
}

/**
 * Options interface for object creation methods that support polling.
 */
export interface ObjectCreateOptions<T = any> extends ObjectOptions {
  /**
   * Optional polling configuration for operations that support it.
   */
  polling?: Partial<import('../lib/polling').PollingOptions<T>>;
}
