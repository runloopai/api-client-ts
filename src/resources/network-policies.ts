// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';
import { NetworkPoliciesCursorIDPage, type NetworkPoliciesCursorIDPageParams } from '../pagination';

export class NetworkPolicies extends APIResource {
  /**
   * Create a new NetworkPolicy with the specified egress rules. The policy can then
   * be applied to blueprints, devboxes, or snapshot resumes.
   */
  create(body: NetworkPolicyCreateParams, options?: Core.RequestOptions): Core.APIPromise<NetworkPolicyView> {
    return this._client.post('/v1/network-policies', { body, ...options });
  }

  /**
   * Get a specific NetworkPolicy by its unique identifier.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<NetworkPolicyView> {
    return this._client.get(`/v1/network-policies/${id}`, options);
  }

  /**
   * Update an existing NetworkPolicy. All fields are optional.
   */
  update(
    id: string,
    body?: NetworkPolicyUpdateParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<NetworkPolicyView>;
  update(id: string, options?: Core.RequestOptions): Core.APIPromise<NetworkPolicyView>;
  update(
    id: string,
    body: NetworkPolicyUpdateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<NetworkPolicyView> {
    if (isRequestOptions(body)) {
      return this.update(id, {}, body);
    }
    return this._client.post(`/v1/network-policies/${id}`, { body, ...options });
  }

  /**
   * List all NetworkPolicies for the authenticated account.
   */
  list(
    query?: NetworkPolicyListParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<NetworkPolicyViewsNetworkPoliciesCursorIDPage, NetworkPolicyView>;
  list(
    options?: Core.RequestOptions,
  ): Core.PagePromise<NetworkPolicyViewsNetworkPoliciesCursorIDPage, NetworkPolicyView>;
  list(
    query: NetworkPolicyListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<NetworkPolicyViewsNetworkPoliciesCursorIDPage, NetworkPolicyView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList('/v1/network-policies', NetworkPolicyViewsNetworkPoliciesCursorIDPage, {
      query,
      ...options,
    });
  }

  /**
   * Delete an existing NetworkPolicy. This action is irreversible.
   */
  delete(
    id: string,
    body?: NetworkPolicyDeleteParams | null | undefined,
    options?: Core.RequestOptions,
  ): Core.APIPromise<NetworkPolicyView> {
    return this._client.post(`/v1/network-policies/${id}/delete`, { body, ...options });
  }
}

export class NetworkPolicyViewsNetworkPoliciesCursorIDPage extends NetworkPoliciesCursorIDPage<NetworkPolicyView> {}

/**
 * Parameters required to create a new NetworkPolicy.
 */
export interface NetworkPolicyCreateParameters {
  /**
   * The human-readable name for the NetworkPolicy. Must be unique within the
   * account.
   */
  name: string;

  /**
   * (Optional) If true, allows devbox egress to the agent gateway for credential
   * proxying. Defaults to false.
   */
  allow_agent_gateway?: boolean | null;

  /**
   * (Optional) If true, all egress traffic is allowed (ALLOW_ALL policy). Defaults
   * to false.
   */
  allow_all?: boolean | null;

  /**
   * (Optional) If true, allows traffic between the account's own devboxes via
   * tunnels. Defaults to false. If allow_all is true, this is automatically set to
   * true.
   */
  allow_devbox_to_devbox?: boolean | null;

  /**
   * (Optional) If true, allows devbox egress to the MCP hub for MCP server access.
   * Defaults to false.
   */
  allow_mcp_gateway?: boolean | null;

  /**
   * (Optional) DNS-based allow list with wildcard support. Examples: ['github.com',
   * '*.npmjs.org'].
   */
  allowed_hostnames?: Array<string> | null;

  /**
   * Optional description for the NetworkPolicy.
   */
  description?: string | null;
}

/**
 * A list of NetworkPolicies with pagination information.
 */
export interface NetworkPolicyListView {
  /**
   * Whether there are more results available.
   */
  has_more: boolean;

  /**
   * The list of NetworkPolicies.
   */
  network_policies: Array<NetworkPolicyView>;

  /**
   * Total count of items in this response. Deprecated: will be removed in a future
   * breaking change.
   */
  total_count?: number | null;
}

/**
 * Parameters for updating an existing NetworkPolicy. All fields are optional.
 */
export interface NetworkPolicyUpdateParameters {
  /**
   * If true, allows devbox egress to the agent gateway.
   */
  allow_agent_gateway?: boolean | null;

  /**
   * If true, all egress traffic is allowed (ALLOW_ALL policy).
   */
  allow_all?: boolean | null;

  /**
   * If true, allows traffic between the account's own devboxes via tunnels.
   */
  allow_devbox_to_devbox?: boolean | null;

  /**
   * If true, allows devbox egress to the MCP hub.
   */
  allow_mcp_gateway?: boolean | null;

  /**
   * Updated DNS-based allow list with wildcard support. Examples: ['github.com',
   * '*.npmjs.org'].
   */
  allowed_hostnames?: Array<string> | null;

  /**
   * Updated description for the NetworkPolicy.
   */
  description?: string | null;

  /**
   * Updated human-readable name for the NetworkPolicy.
   */
  name?: string | null;
}

/**
 * A NetworkPolicy defines egress network access rules for devboxes. Policies can
 * be applied to blueprints, devboxes, and snapshot resumes.
 */
export interface NetworkPolicyView {
  /**
   * The unique identifier of the NetworkPolicy.
   */
  id: string;

  /**
   * The creation time of the NetworkPolicy (Unix timestamp in milliseconds).
   */
  create_time_ms: number;

  /**
   * The egress rules for this policy.
   */
  egress: NetworkPolicyView.Egress;

  /**
   * The human-readable name of the NetworkPolicy. Unique per account.
   */
  name: string;

  /**
   * Last update time of the NetworkPolicy (Unix timestamp in milliseconds).
   */
  update_time_ms: number;

  /**
   * Optional description of the NetworkPolicy.
   */
  description?: string | null;
}

export namespace NetworkPolicyView {
  /**
   * The egress rules for this policy.
   */
  export interface Egress {
    /**
     * If true, allows devbox egress to the agent gateway for credential proxying.
     */
    allow_agent_gateway: boolean;

    /**
     * If true, all egress traffic is allowed and other fields are ignored. Used for
     * ALLOW_ALL policies.
     */
    allow_all: boolean;

    /**
     * If true, allows traffic between the account's own devboxes via tunnels.
     */
    allow_devbox_to_devbox: boolean;

    /**
     * If true, allows devbox egress to the MCP hub for MCP server access.
     */
    allow_mcp_gateway: boolean;

    /**
     * DNS-based allow list with wildcard support. Examples: ['github.com',
     * '*.npmjs.org', 'api.openai.com']. Empty list with allow_all=false means no
     * network access (DENY_ALL behavior).
     */
    allowed_hostnames: Array<string>;
  }
}

export interface NetworkPolicyCreateParams {
  /**
   * The human-readable name for the NetworkPolicy. Must be unique within the
   * account.
   */
  name: string;

  /**
   * (Optional) If true, allows devbox egress to the agent gateway for credential
   * proxying. Defaults to false.
   */
  allow_agent_gateway?: boolean | null;

  /**
   * (Optional) If true, all egress traffic is allowed (ALLOW_ALL policy). Defaults
   * to false.
   */
  allow_all?: boolean | null;

  /**
   * (Optional) If true, allows traffic between the account's own devboxes via
   * tunnels. Defaults to false. If allow_all is true, this is automatically set to
   * true.
   */
  allow_devbox_to_devbox?: boolean | null;

  /**
   * (Optional) If true, allows devbox egress to the MCP hub for MCP server access.
   * Defaults to false.
   */
  allow_mcp_gateway?: boolean | null;

  /**
   * (Optional) DNS-based allow list with wildcard support. Examples: ['github.com',
   * '*.npmjs.org'].
   */
  allowed_hostnames?: Array<string> | null;

  /**
   * Optional description for the NetworkPolicy.
   */
  description?: string | null;
}

export interface NetworkPolicyUpdateParams {
  /**
   * If true, allows devbox egress to the agent gateway.
   */
  allow_agent_gateway?: boolean | null;

  /**
   * If true, all egress traffic is allowed (ALLOW_ALL policy).
   */
  allow_all?: boolean | null;

  /**
   * If true, allows traffic between the account's own devboxes via tunnels.
   */
  allow_devbox_to_devbox?: boolean | null;

  /**
   * If true, allows devbox egress to the MCP hub.
   */
  allow_mcp_gateway?: boolean | null;

  /**
   * Updated DNS-based allow list with wildcard support. Examples: ['github.com',
   * '*.npmjs.org'].
   */
  allowed_hostnames?: Array<string> | null;

  /**
   * Updated description for the NetworkPolicy.
   */
  description?: string | null;

  /**
   * Updated human-readable name for the NetworkPolicy.
   */
  name?: string | null;
}

export interface NetworkPolicyListParams extends NetworkPoliciesCursorIDPageParams {
  /**
   * Filter by ID.
   */
  id?: string;

  /**
   * Filter by name (partial match supported).
   */
  name?: string;
}

export interface NetworkPolicyDeleteParams {}

NetworkPolicies.NetworkPolicyViewsNetworkPoliciesCursorIDPage = NetworkPolicyViewsNetworkPoliciesCursorIDPage;

export declare namespace NetworkPolicies {
  export {
    type NetworkPolicyCreateParameters as NetworkPolicyCreateParameters,
    type NetworkPolicyListView as NetworkPolicyListView,
    type NetworkPolicyUpdateParameters as NetworkPolicyUpdateParameters,
    type NetworkPolicyView as NetworkPolicyView,
    NetworkPolicyViewsNetworkPoliciesCursorIDPage as NetworkPolicyViewsNetworkPoliciesCursorIDPage,
    type NetworkPolicyCreateParams as NetworkPolicyCreateParams,
    type NetworkPolicyUpdateParams as NetworkPolicyUpdateParams,
    type NetworkPolicyListParams as NetworkPolicyListParams,
    type NetworkPolicyDeleteParams as NetworkPolicyDeleteParams,
  };
}
