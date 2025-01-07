// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';

export class Repositories extends APIResource {
  /**
   * Create a connection a Repository with the specified configuration.
   */
  create(
    body: RepositoryCreateParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<RepositoryConnectionView> {
    return this._client.post('/v1/repositories', { body, ...options });
  }

  /**
   * Get repository connection details.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<RepositoryConnectionView> {
    return this._client.get(`/v1/repositories/${id}`, options);
  }

  /**
   * List all available repository connections.
   */
  list(
    query?: RepositoryListParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<RepositoryConnectionListView>;
  list(options?: Core.RequestOptions): Core.APIPromise<RepositoryConnectionListView>;
  list(
    query: RepositoryListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<RepositoryConnectionListView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.get('/v1/repositories', { query, ...options });
  }

  /**
   * Delete a repository connection.
   */
  delete(
    id: string,
    body?: RepositoryDeleteParams | null | undefined,
    options?: Core.RequestOptions,
  ): Core.APIPromise<unknown> {
    return this._client.post(`/v1/repositories/${id}/delete`, { body, ...options });
  }

  /**
   * List all analyzed versions of a repository connection.
   */
  versions(id: string, options?: Core.RequestOptions): Core.APIPromise<RepositoryVersionListView> {
    return this._client.get(`/v1/repositories/${id}/versions`, options);
  }
}

export interface RepositoryConnectionListView {
  has_more: boolean;

  /**
   * List of repositories matching filter.
   */
  repositories: Array<RepositoryConnectionView>;

  total_count: number;
}

export interface RepositoryConnectionView {
  /**
   * The id of the Repository.
   */
  id: string;

  /**
   * The name of the Repository.
   */
  name: string;

  /**
   * The account owner of the Repository.
   */
  owner: string;

  /**
   * The current status of the Repository.
   */
  status: 'pending' | 'failure' | 'active';

  /**
   * Reason for failure, if any.
   */
  failure_reason?: string;
}

export interface RepositoryVersionDetails {
  /**
   * Analyzed time of the Repository Version (Unix timestamp milliseconds).
   */
  analyzed_at: number;

  /**
   * The sha of the analyzed version of the Repository.
   */
  commit_sha: string;

  /**
   * Tools discovered during inspection.
   */
  extracted_tools: RepositoryVersionDetails.ExtractedTools;

  /**
   * Commands required to set up repository environment.
   */
  repository_setup_details: RepositoryVersionDetails.RepositorySetupDetails;

  /**
   * The account owner of the Repository.
   */
  status: 'inspecting' | 'inspection_failed' | 'success';
}

export namespace RepositoryVersionDetails {
  /**
   * Tools discovered during inspection.
   */
  export interface ExtractedTools {
    /**
     * The set of available commands on this repository such as building etc.
     */
    commands: Record<string, string>;

    /**
     * What package manager this repository uses.
     */
    package_manager: string;
  }

  /**
   * Commands required to set up repository environment.
   */
  export interface RepositorySetupDetails {
    /**
     * The blueprint built that supports setting up this repository.
     */
    blueprint_id: string;

    /**
     * Command to initialize the env we need to run the commands for this repository.
     */
    env_initialization_command: string;

    /**
     * Setup commands necessary to support repository i.e. apt install XXX.
     */
    workspace_setup: Array<string>;
  }
}

export interface RepositoryVersionListView {
  /**
   * List of analyzed versions of this repository.
   */
  analyzed_versions: Array<RepositoryVersionDetails>;
}

export type RepositoryDeleteResponse = unknown;

export interface RepositoryCreateParams {
  /**
   * Name of the repository.
   */
  name: string;

  /**
   * Account owner of the repository.
   */
  owner: string;
}

export interface RepositoryListParams {
  /**
   * Page Limit
   */
  limit?: number;

  /**
   * Load the next page starting after the given token.
   */
  starting_after?: string;
}

export interface RepositoryDeleteParams {}

export declare namespace Repositories {
  export {
    type RepositoryConnectionListView as RepositoryConnectionListView,
    type RepositoryConnectionView as RepositoryConnectionView,
    type RepositoryVersionDetails as RepositoryVersionDetails,
    type RepositoryVersionListView as RepositoryVersionListView,
    type RepositoryDeleteResponse as RepositoryDeleteResponse,
    type RepositoryCreateParams as RepositoryCreateParams,
    type RepositoryListParams as RepositoryListParams,
    type RepositoryDeleteParams as RepositoryDeleteParams,
  };
}
