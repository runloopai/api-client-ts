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
   * List all inspections of a repository connection including automatically
   * generated insights for each inspection.
   */
  listInspections(id: string, options?: Core.RequestOptions): Core.APIPromise<RepositoryInspectionListView> {
    return this._client.get(`/v1/repositories/${id}/inspections`, options);
  }

  /**
   * Refresh a repository connection by inspecting the latest version including
   * repo's technical stack and developer environment requirements.
   */
  refresh(
    id: string,
    body?: RepositoryRefreshParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<unknown>;
  refresh(id: string, options?: Core.RequestOptions): Core.APIPromise<unknown>;
  refresh(
    id: string,
    body: RepositoryRefreshParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<unknown> {
    if (isRequestOptions(body)) {
      return this.refresh(id, {}, body);
    }
    return this._client.post(`/v1/repositories/${id}/refresh`, { body, ...options });
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
}

export interface RepositoryInspectionDetails {
  /**
   * The ID of the inspection.
   */
  id: string;

  /**
   * The sha of the inspected version of the Repository.
   */
  commit_sha: string;

  /**
   * Inspection time of the Repository Version (Unix timestamp milliseconds).
   */
  inspected_at: number;

  /**
   * Repository manifest containing container config and workspace details.
   */
  repository_manifest: RepositoryManifestView;

  /**
   * The status of the repository inspection.
   */
  status:
    | 'invalid'
    | 'repo_auth_pending'
    | 'repo_authentication_failure'
    | 'repo_access_failure'
    | 'inspection_pending'
    | 'inspection_failed'
    | 'inspection_success'
    | 'image_build_success'
    | 'image_build_failure'
    | 'inspection_user_manifest_added';

  /**
   * The blueprint ID associated with this inspection if successful.
   */
  blueprint_id?: string | null;

  /**
   * The blueprint name associated with this inspection if successful.
   */
  blueprint_name?: string | null;

  /**
   * User uploaded repository manifest containing container config and workspace
   * details.
   */
  user_manifest?: RepositoryManifestView | null;
}

export interface RepositoryInspectionListView {
  /**
   * List of inspections for this repository.
   */
  inspections: Array<RepositoryInspectionDetails>;
}

/**
 * The repository manifest contains container configuration and workspace
 * definitions for a repository.
 */
export interface RepositoryManifestView {
  /**
   * Container configuration specifying the base image and setup commands.
   */
  container_config: RepositoryManifestView.ContainerConfig;

  /**
   * List of workspaces within the repository. Each workspace represents a buildable
   * unit of code.
   */
  workspaces: Array<RepositoryManifestView.Workspace>;
}

export namespace RepositoryManifestView {
  /**
   * Container configuration specifying the base image and setup commands.
   */
  export interface ContainerConfig {
    /**
     * The name of the base image. Should be one of the GitHub public images like
     * ubuntu-latest, ubuntu-24.04, ubuntu-22.04, windows-latest, windows-2022,
     * macos-latest etc.
     */
    base_image_name: string;

    /**
     * Commands to run to setup the base container such as installing necessary
     * toolchains (e.g. apt install).
     */
    setup_commands?: Array<string> | null;
  }

  /**
   * A workspace is a buildable unit of code within a repository and often represents
   * a deployable unit of code like a backend service or a frontend app.
   */
  export interface Workspace {
    /**
     * Name of the package manager used (e.g. pip, npm).
     */
    package_manager: string;

    /**
     * Extracted common commands important to the developer life cycle like linting,
     * testing, building, etc.
     */
    dev_commands?: Workspace.DevCommands | null;

    /**
     * Name of the workspace. Can be empty if the workspace is the root of the
     * repository. Only necessary for monorepo style repositories.
     */
    name?: string | null;

    /**
     * Path to the workspace from the root of the repository. Can be empty if the
     * workspace is the root of the repository. Only necessary for monorepo style
     * repositories.
     */
    path?: string | null;

    /**
     * Environment variables that are required to be set for this workspace to run
     * correctly.
     */
    required_env_vars?: Array<string> | null;

    /**
     * Commands to run to refresh this workspace after pulling the latest changes to
     * the repository via git (e.g. npm install).
     */
    workspace_refresh_commands?: Array<string> | null;

    /**
     * Commands to run to setup this workspace after a fresh clone of the repository on
     * a new container such as installing necessary toolchains and dependencies (e.g.
     * npm install).
     */
    workspace_setup_commands?: Array<string> | null;
  }

  export namespace Workspace {
    /**
     * Extracted common commands important to the developer life cycle like linting,
     * testing, building, etc.
     */
    export interface DevCommands {
      /**
       * Build command (e.g. npm run build).
       */
      build?: string | null;

      /**
       * Installation command (e.g. pip install -r requirements.txt).
       */
      install?: string | null;

      /**
       * Lint command (e.g. flake8).
       */
      lint?: string | null;

      /**
       * Test command (e.g. pytest).
       */
      test?: string | null;
    }
  }
}

export type RepositoryDeleteResponse = unknown;

export type RepositoryRefreshResponse = unknown;

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

  /**
   * GitHub authentication token for accessing private repositories.
   */
  github_auth_token?: string | null;
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

export interface RepositoryRefreshParams {
  /**
   * ID of blueprint to use as base for resulting RepositoryVersion blueprint.
   */
  blueprint_id?: string | null;

  /**
   * GitHub authentication token for accessing private repositories.
   */
  github_auth_token?: string | null;
}

Repositories.RepositoryConnectionViewsRepositoriesCursorIDPage =
  RepositoryConnectionViewsRepositoriesCursorIDPage;

export declare namespace Repositories {
  export {
    type RepositoryConnectionListView as RepositoryConnectionListView,
    type RepositoryConnectionView as RepositoryConnectionView,
    type RepositoryInspectionDetails as RepositoryInspectionDetails,
    type RepositoryInspectionListView as RepositoryInspectionListView,
    type RepositoryManifestView as RepositoryManifestView,
    type RepositoryDeleteResponse as RepositoryDeleteResponse,
    type RepositoryRefreshResponse as RepositoryRefreshResponse,
    RepositoryConnectionViewsRepositoriesCursorIDPage as RepositoryConnectionViewsRepositoriesCursorIDPage,
    type RepositoryCreateParams as RepositoryCreateParams,
    type RepositoryListParams as RepositoryListParams,
    type RepositoryDeleteParams as RepositoryDeleteParams,
    type RepositoryRefreshParams as RepositoryRefreshParams,
  };
}
