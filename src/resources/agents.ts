// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';
import * as Shared from './shared';
import { AgentsCursorIDPage, type AgentsCursorIDPageParams } from '../pagination';

export class Agents extends APIResource {
  /**
   * Create a new Agent with a name and optional public visibility. The Agent will be
   * assigned a unique ID.
   */
  create(body: AgentCreateParams, options?: Core.RequestOptions): Core.APIPromise<AgentView> {
    return this._client.post('/v1/agents', { body, ...options });
  }

  /**
   * Retrieve a specific Agent by its unique identifier.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<AgentView> {
    return this._client.get(`/v1/agents/${id}`, options);
  }

  /**
   * List all Agents for the authenticated account with pagination support.
   */
  list(
    query?: AgentListParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<AgentViewsAgentsCursorIDPage, AgentView>;
  list(options?: Core.RequestOptions): Core.PagePromise<AgentViewsAgentsCursorIDPage, AgentView>;
  list(
    query: AgentListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<AgentViewsAgentsCursorIDPage, AgentView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList('/v1/agents', AgentViewsAgentsCursorIDPage, { query, ...options });
  }
}

export class AgentViewsAgentsCursorIDPage extends AgentsCursorIDPage<AgentView> {}

/**
 * Parameters for creating a new Agent.
 */
export interface AgentCreateParameters {
  /**
   * The name of the Agent.
   */
  name: string;

  /**
   * The source configuration for the Agent.
   */
  source?: Shared.AgentSource | null;
}

/**
 * A paginated list of Agents.
 */
export interface AgentListView {
  /**
   * The list of Agents.
   */
  agents: Array<AgentView>;

  /**
   * Whether there are more Agents to fetch.
   */
  has_more: boolean;

  /**
   * The count of remaining Agents.
   */
  remaining_count: number;

  /**
   * The total count of Agents.
   */
  total_count: number;
}

/**
 * An Agent represents a registered AI agent entity.
 */
export interface AgentView {
  /**
   * The unique identifier of the Agent.
   */
  id: string;

  /**
   * The creation time of the Agent (Unix timestamp milliseconds).
   */
  create_time_ms: number;

  /**
   * Whether the Agent is publicly accessible.
   */
  is_public: boolean;

  /**
   * The name of the Agent.
   */
  name: string;

  /**
   * The source configuration for the Agent.
   */
  source?: Shared.AgentSource | null;
}

export interface AgentCreateParams {
  /**
   * The name of the Agent.
   */
  name: string;

  /**
   * The source configuration for the Agent.
   */
  source?: Shared.AgentSource | null;
}

export interface AgentListParams extends AgentsCursorIDPageParams {
  /**
   * Filter agents by public visibility.
   */
  is_public?: boolean;

  /**
   * Filter agents by name (partial match supported).
   */
  name?: string;

  /**
   * Search by agent ID or name.
   */
  search?: string;
}

Agents.AgentViewsAgentsCursorIDPage = AgentViewsAgentsCursorIDPage;

export declare namespace Agents {
  export {
    type AgentCreateParameters as AgentCreateParameters,
    type AgentListView as AgentListView,
    type AgentView as AgentView,
    AgentViewsAgentsCursorIDPage as AgentViewsAgentsCursorIDPage,
    type AgentCreateParams as AgentCreateParams,
    type AgentListParams as AgentListParams,
  };
}
