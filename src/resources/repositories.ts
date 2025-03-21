// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';
import { RepositoriesCursorIDPage, type RepositoriesCursorIDPageParams } from '../pagination';

export class Repositories extends APIResource {
  /**
   * Create a connection to a Github Repository and trigger an initial inspection of
   * the repo's technical stack and developer environment requirements.
   */
  create(
    body: RepositoryCreateParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<RepositoryConnectionView> {
    return this._client.post('/v1/repositories', { body, ...options });
  }

  /**
   * Get Repository Connection details including latest inspection status and
   * generated repository insights.
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
  ): Core.PagePromise<RepositoryConnectionViewsRepositoriesCursorIDPage, RepositoryConnectionView>;
  list(
    options?: Core.RequestOptions,
  ): Core.PagePromise<RepositoryConnectionViewsRepositoriesCursorIDPage, RepositoryConnectionView>;
  list(
    query: RepositoryListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<RepositoryConnectionViewsRepositoriesCursorIDPage, RepositoryConnectionView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList('/v1/repositories', RepositoryConnectionViewsRepositoriesCursorIDPage, {
      query,
      ...options,
    });
  }

  /**
   * Permanently Delete a Repository Connection including any automatically generated
   * inspection insights.
   */
  delete(
    id: string,
    body?: RepositoryDeleteParams | null | undefined,
    options?: Core.RequestOptions,
  ): Core.APIPromise<unknown> {
    return this._client.post(`/v1/repositories/${id}/delete`, { body, ...options });
  }

  /**
   * List all analyzed versions of a repository connection including automatically
   * generated insights for each version.
   */
  versions(id: string, options?: Core.RequestOptions): Core.APIPromise<RepositoryVersionListView> {
    return this._client.get(`/v1/repositories/${id}/versions`, options);
  }
}

export class RepositoryConnectionViewsRepositoriesCursorIDPage extends RepositoriesCursorIDPage<RepositoryConnectionView> {}

export interface RepositoryConnectionListView {
  has_more: boolean;

  remaining_count: number;

  /**
   * List of repositories matching filter.
   */
  repositories: Array<RepositoryConnectionView>;

  total_count: number;
}

/**
 * The ID of the Repository.
 */
export interface RepositoryConnectionView {
  /**
   * The ID of the Repository.
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
   * Reason for failure, if the status is 'failure'.
   */
  failure_reason?: string | null;
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

  /**
   * ID of blueprint to use as base for resulting RepositoryVersion blueprint.
   */
  blueprint_id?: string | null;
}

export interface RepositoryListParams extends RepositoriesCursorIDPageParams {
  /**
   * Filter by repository name
   */
  name?: string;

  /**
   * Filter by repository owner
   */
  owner?: string;
}

export interface RepositoryDeleteParams {}

Repositories.RepositoryConnectionViewsRepositoriesCursorIDPage =
  RepositoryConnectionViewsRepositoriesCursorIDPage;

export declare namespace Repositories {
  export {
    type RepositoryConnectionListView as RepositoryConnectionListView,
    type RepositoryConnectionView as RepositoryConnectionView,
    type RepositoryVersionDetails as RepositoryVersionDetails,
    type RepositoryVersionListView as RepositoryVersionListView,
    type RepositoryDeleteResponse as RepositoryDeleteResponse,
    RepositoryConnectionViewsRepositoriesCursorIDPage as RepositoryConnectionViewsRepositoriesCursorIDPage,
    type RepositoryCreateParams as RepositoryCreateParams,
    type RepositoryListParams as RepositoryListParams,
    type RepositoryDeleteParams as RepositoryDeleteParams,
  };
}
