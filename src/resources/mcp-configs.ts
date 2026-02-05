// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';
import { McpConfigsCursorIDPage, type McpConfigsCursorIDPageParams } from '../pagination';

export class McpConfigs extends APIResource {
  /**
   * [Beta] Create a new McpConfig to connect to an upstream MCP (Model Context
   * Protocol) server. The config specifies the target endpoint and which tools are
   * allowed.
   */
  create(body: McpConfigCreateParams, options?: Core.RequestOptions): Core.APIPromise<McpConfigView> {
    return this._client.post('/v1/mcp-configs', { body, ...options });
  }

  /**
   * [Beta] Get a specific McpConfig by its unique identifier.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<McpConfigView> {
    return this._client.get(`/v1/mcp-configs/${id}`, options);
  }

  /**
   * [Beta] Update an existing McpConfig. All fields are optional.
   */
  update(
    id: string,
    body?: McpConfigUpdateParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<McpConfigView>;
  update(id: string, options?: Core.RequestOptions): Core.APIPromise<McpConfigView>;
  update(
    id: string,
    body: McpConfigUpdateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<McpConfigView> {
    if (isRequestOptions(body)) {
      return this.update(id, {}, body);
    }
    return this._client.post(`/v1/mcp-configs/${id}`, { body, ...options });
  }

  /**
   * [Beta] List all McpConfigs for the authenticated account.
   */
  list(
    query?: McpConfigListParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<McpConfigViewsMcpConfigsCursorIDPage, McpConfigView>;
  list(options?: Core.RequestOptions): Core.PagePromise<McpConfigViewsMcpConfigsCursorIDPage, McpConfigView>;
  list(
    query: McpConfigListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<McpConfigViewsMcpConfigsCursorIDPage, McpConfigView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList('/v1/mcp-configs', McpConfigViewsMcpConfigsCursorIDPage, {
      query,
      ...options,
    });
  }

  /**
   * [Beta] Delete an existing McpConfig. This action is irreversible.
   */
  delete(
    id: string,
    body?: McpConfigDeleteParams | null | undefined,
    options?: Core.RequestOptions,
  ): Core.APIPromise<McpConfigView> {
    return this._client.post(`/v1/mcp-configs/${id}/delete`, { body, ...options });
  }
}

export class McpConfigViewsMcpConfigsCursorIDPage extends McpConfigsCursorIDPage<McpConfigView> {}

/**
 * Parameters required to create a new McpConfig.
 */
export interface McpConfigCreateParameters {
  /**
   * Glob patterns specifying which tools are allowed from this MCP server. Examples:
   * ['*'] for all tools, ['github.search_*', 'github.get_*'] for specific patterns.
   */
  allowed_tools: Array<string>;

  /**
   * The target MCP server endpoint URL (e.g., 'https://mcp.example.com').
   */
  endpoint: string;

  /**
   * The human-readable name for the McpConfig. Must be unique within your account.
   * The first segment before '-' is used as the service name for tool routing (e.g.,
   * 'github-readonly' uses 'github' as the service name).
   */
  name: string;

  /**
   * Optional description for this MCP configuration.
   */
  description?: string | null;
}

/**
 * A paginated list of McpConfigs.
 */
export interface McpConfigListView {
  /**
   * Whether there are more results available beyond this page.
   */
  has_more: boolean;

  /**
   * The list of McpConfigs.
   */
  mcp_configs: Array<McpConfigView>;

  /**
   * Total count of McpConfigs that match the query.
   */
  total_count: number;
}

/**
 * Parameters for updating an existing McpConfig. All fields are optional - only
 * specified fields will be updated.
 */
export interface McpConfigUpdateParameters {
  /**
   * New glob patterns specifying which tools are allowed. Examples: ['*'] for all
   * tools, ['github.search_*'] for specific patterns.
   */
  allowed_tools?: Array<string> | null;

  /**
   * New description for this MCP configuration.
   */
  description?: string | null;

  /**
   * New target MCP server endpoint URL.
   */
  endpoint?: string | null;

  /**
   * New name for the McpConfig. Must be unique within your account.
   */
  name?: string | null;
}

/**
 * An McpConfig defines a configuration for connecting to an upstream MCP (Model
 * Context Protocol) server. It specifies the target endpoint and which tools are
 * allowed.
 */
export interface McpConfigView {
  /**
   * The unique identifier of the McpConfig.
   */
  id: string;

  /**
   * Glob patterns specifying which tools are allowed from this MCP server (e.g.,
   * ['github.search_*', 'github.get_*'] or ['*'] for all tools).
   */
  allowed_tools: Array<string>;

  /**
   * Creation time of the McpConfig (Unix timestamp in milliseconds).
   */
  create_time_ms: number;

  /**
   * The target MCP server endpoint URL (e.g., 'https://mcp.example.com').
   */
  endpoint: string;

  /**
   * The human-readable name of the McpConfig. Unique per account.
   */
  name: string;

  /**
   * The account ID that owns this config.
   */
  account_id?: string | null;

  /**
   * Optional description for this MCP configuration.
   */
  description?: string | null;
}

export interface McpConfigCreateParams {
  /**
   * Glob patterns specifying which tools are allowed from this MCP server. Examples:
   * ['*'] for all tools, ['github.search_*', 'github.get_*'] for specific patterns.
   */
  allowed_tools: Array<string>;

  /**
   * The target MCP server endpoint URL (e.g., 'https://mcp.example.com').
   */
  endpoint: string;

  /**
   * The human-readable name for the McpConfig. Must be unique within your account.
   * The first segment before '-' is used as the service name for tool routing (e.g.,
   * 'github-readonly' uses 'github' as the service name).
   */
  name: string;

  /**
   * Optional description for this MCP configuration.
   */
  description?: string | null;
}

export interface McpConfigUpdateParams {
  /**
   * New glob patterns specifying which tools are allowed. Examples: ['*'] for all
   * tools, ['github.search_*'] for specific patterns.
   */
  allowed_tools?: Array<string> | null;

  /**
   * New description for this MCP configuration.
   */
  description?: string | null;

  /**
   * New target MCP server endpoint URL.
   */
  endpoint?: string | null;

  /**
   * New name for the McpConfig. Must be unique within your account.
   */
  name?: string | null;
}

export interface McpConfigListParams extends McpConfigsCursorIDPageParams {
  /**
   * Filter by ID.
   */
  id?: string;

  /**
   * Filter by name (prefix match supported).
   */
  name?: string;
}

export interface McpConfigDeleteParams {}

McpConfigs.McpConfigViewsMcpConfigsCursorIDPage = McpConfigViewsMcpConfigsCursorIDPage;

export declare namespace McpConfigs {
  export {
    type McpConfigCreateParameters as McpConfigCreateParameters,
    type McpConfigListView as McpConfigListView,
    type McpConfigUpdateParameters as McpConfigUpdateParameters,
    type McpConfigView as McpConfigView,
    McpConfigViewsMcpConfigsCursorIDPage as McpConfigViewsMcpConfigsCursorIDPage,
    type McpConfigCreateParams as McpConfigCreateParams,
    type McpConfigUpdateParams as McpConfigUpdateParams,
    type McpConfigListParams as McpConfigListParams,
    type McpConfigDeleteParams as McpConfigDeleteParams,
  };
}
