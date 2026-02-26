// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';
import { GatewayConfigsCursorIDPage, type GatewayConfigsCursorIDPageParams } from '../pagination';

export class GatewayConfigs extends APIResource {
  /**
   * Create a new GatewayConfig to proxy API requests through the agent gateway. The
   * config specifies the target endpoint and how credentials should be applied.
   */
  create(body: GatewayConfigCreateParams, options?: Core.RequestOptions): Core.APIPromise<GatewayConfigView> {
    return this._client.post('/v1/gateway-configs', { body, ...options });
  }

  /**
   * Get a specific GatewayConfig by its unique identifier.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<GatewayConfigView> {
    return this._client.get(`/v1/gateway-configs/${id}`, options);
  }

  /**
   * Update an existing GatewayConfig. All fields are optional.
   */
  update(
    id: string,
    body?: GatewayConfigUpdateParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<GatewayConfigView>;
  update(id: string, options?: Core.RequestOptions): Core.APIPromise<GatewayConfigView>;
  update(
    id: string,
    body: GatewayConfigUpdateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<GatewayConfigView> {
    if (isRequestOptions(body)) {
      return this.update(id, {}, body);
    }
    return this._client.post(`/v1/gateway-configs/${id}`, { body, ...options });
  }

  /**
   * List all GatewayConfigs for the authenticated account, including system-provided
   * configs like 'anthropic' and 'openai'.
   */
  list(
    query?: GatewayConfigListParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<GatewayConfigViewsGatewayConfigsCursorIDPage, GatewayConfigView>;
  list(
    options?: Core.RequestOptions,
  ): Core.PagePromise<GatewayConfigViewsGatewayConfigsCursorIDPage, GatewayConfigView>;
  list(
    query: GatewayConfigListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<GatewayConfigViewsGatewayConfigsCursorIDPage, GatewayConfigView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList('/v1/gateway-configs', GatewayConfigViewsGatewayConfigsCursorIDPage, {
      query,
      ...options,
    });
  }

  /**
   * Delete an existing GatewayConfig. This action is irreversible.
   */
  delete(
    id: string,
    body?: GatewayConfigDeleteParams | null | undefined,
    options?: Core.RequestOptions,
  ): Core.APIPromise<GatewayConfigView> {
    return this._client.post(`/v1/gateway-configs/${id}/delete`, { body, ...options });
  }
}

export class GatewayConfigViewsGatewayConfigsCursorIDPage extends GatewayConfigsCursorIDPage<GatewayConfigView> {}

/**
 * Parameters required to create a new GatewayConfig.
 */
export interface GatewayConfigCreateParameters {
  /**
   * How credentials should be applied to proxied requests. Specify the type
   * ('header', 'bearer') and optional key field.
   */
  auth_mechanism: GatewayConfigCreateParameters.AuthMechanism;

  /**
   * The target endpoint URL (e.g., 'https://api.anthropic.com').
   */
  endpoint: string;

  /**
   * The human-readable name for the GatewayConfig. Must be unique within your
   * account.
   */
  name: string;

  /**
   * Optional description for this gateway configuration.
   */
  description?: string | null;
}

export namespace GatewayConfigCreateParameters {
  /**
   * How credentials should be applied to proxied requests. Specify the type
   * ('header', 'bearer') and optional key field.
   */
  export interface AuthMechanism {
    /**
     * The type of authentication mechanism: 'header', 'bearer'.
     */
    type: string;

    /**
     * For 'header' type: the header name (e.g., 'x-api-key').
     */
    key?: string | null;
  }
}

/**
 * A paginated list of GatewayConfigs.
 */
export interface GatewayConfigListView {
  /**
   * The list of GatewayConfigs.
   */
  gateway_configs: Array<GatewayConfigView>;

  /**
   * Whether there are more results available beyond this page.
   */
  has_more: boolean;

  /**
   * Total count of GatewayConfigs that match the query. Deprecated: will be removed
   * in a future breaking change.
   */
  total_count?: number | null;
}

/**
 * Parameters for updating an existing GatewayConfig. All fields are optional -
 * only specified fields will be updated.
 */
export interface GatewayConfigUpdateParameters {
  /**
   * New authentication mechanism for applying credentials to proxied requests.
   */
  auth_mechanism?: GatewayConfigUpdateParameters.AuthMechanism | null;

  /**
   * New description for this gateway configuration.
   */
  description?: string | null;

  /**
   * New target endpoint URL (e.g., 'https://api.anthropic.com').
   */
  endpoint?: string | null;

  /**
   * New name for the GatewayConfig. Must be unique within your account.
   */
  name?: string | null;
}

export namespace GatewayConfigUpdateParameters {
  /**
   * New authentication mechanism for applying credentials to proxied requests.
   */
  export interface AuthMechanism {
    /**
     * The type of authentication mechanism: 'header', 'bearer'.
     */
    type: string;

    /**
     * For 'header' type: the header name (e.g., 'x-api-key').
     */
    key?: string | null;
  }
}

/**
 * A GatewayConfig defines a configuration for proxying API requests through the
 * agent gateway. It specifies the target endpoint and how credentials should be
 * applied.
 */
export interface GatewayConfigView {
  /**
   * The unique identifier of the GatewayConfig.
   */
  id: string;

  /**
   * How credentials should be applied to proxied requests.
   */
  auth_mechanism: GatewayConfigView.AuthMechanism;

  /**
   * Creation time of the GatewayConfig (Unix timestamp in milliseconds).
   */
  create_time_ms: number;

  /**
   * The target endpoint URL (e.g., 'https://api.anthropic.com').
   */
  endpoint: string;

  /**
   * The human-readable name of the GatewayConfig. Unique per account (or globally
   * for system configs).
   */
  name: string;

  /**
   * The account ID that owns this config.
   */
  account_id?: string | null;

  /**
   * Optional description for this gateway configuration.
   */
  description?: string | null;
}

export namespace GatewayConfigView {
  /**
   * How credentials should be applied to proxied requests.
   */
  export interface AuthMechanism {
    /**
     * The type of authentication mechanism: 'header', 'bearer'.
     */
    type: string;

    /**
     * For 'header' type: the header name (e.g., 'x-api-key').
     */
    key?: string | null;
  }
}

export interface GatewayConfigCreateParams {
  /**
   * How credentials should be applied to proxied requests. Specify the type
   * ('header', 'bearer') and optional key field.
   */
  auth_mechanism: GatewayConfigCreateParams.AuthMechanism;

  /**
   * The target endpoint URL (e.g., 'https://api.anthropic.com').
   */
  endpoint: string;

  /**
   * The human-readable name for the GatewayConfig. Must be unique within your
   * account.
   */
  name: string;

  /**
   * Optional description for this gateway configuration.
   */
  description?: string | null;
}

export namespace GatewayConfigCreateParams {
  /**
   * How credentials should be applied to proxied requests. Specify the type
   * ('header', 'bearer') and optional key field.
   */
  export interface AuthMechanism {
    /**
     * The type of authentication mechanism: 'header', 'bearer'.
     */
    type: string;

    /**
     * For 'header' type: the header name (e.g., 'x-api-key').
     */
    key?: string | null;
  }
}

export interface GatewayConfigUpdateParams {
  /**
   * New authentication mechanism for applying credentials to proxied requests.
   */
  auth_mechanism?: GatewayConfigUpdateParams.AuthMechanism | null;

  /**
   * New description for this gateway configuration.
   */
  description?: string | null;

  /**
   * New target endpoint URL (e.g., 'https://api.anthropic.com').
   */
  endpoint?: string | null;

  /**
   * New name for the GatewayConfig. Must be unique within your account.
   */
  name?: string | null;
}

export namespace GatewayConfigUpdateParams {
  /**
   * New authentication mechanism for applying credentials to proxied requests.
   */
  export interface AuthMechanism {
    /**
     * The type of authentication mechanism: 'header', 'bearer'.
     */
    type: string;

    /**
     * For 'header' type: the header name (e.g., 'x-api-key').
     */
    key?: string | null;
  }
}

export interface GatewayConfigListParams extends GatewayConfigsCursorIDPageParams {
  /**
   * Filter by ID.
   */
  id?: string;

  /**
   * Filter by name (partial match supported).
   */
  name?: string;
}

export interface GatewayConfigDeleteParams {}

GatewayConfigs.GatewayConfigViewsGatewayConfigsCursorIDPage = GatewayConfigViewsGatewayConfigsCursorIDPage;

export declare namespace GatewayConfigs {
  export {
    type GatewayConfigCreateParameters as GatewayConfigCreateParameters,
    type GatewayConfigListView as GatewayConfigListView,
    type GatewayConfigUpdateParameters as GatewayConfigUpdateParameters,
    type GatewayConfigView as GatewayConfigView,
    GatewayConfigViewsGatewayConfigsCursorIDPage as GatewayConfigViewsGatewayConfigsCursorIDPage,
    type GatewayConfigCreateParams as GatewayConfigCreateParams,
    type GatewayConfigUpdateParams as GatewayConfigUpdateParams,
    type GatewayConfigListParams as GatewayConfigListParams,
    type GatewayConfigDeleteParams as GatewayConfigDeleteParams,
  };
}
