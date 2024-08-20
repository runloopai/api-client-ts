// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';
import * as BlueprintsAPI from './blueprints';
import * as AccountAPI from './account';
import * as CodeAPI from './code';

export class Blueprints extends APIResource {
  /**
   * Build a Blueprint with the specified configuration. The Blueprint will begin
   * building upon create, ' and will transition to 'building_complete' once it is
   * ready.
   */
  create(body?: BlueprintCreateParams, options?: Core.RequestOptions): Core.APIPromise<BlueprintView>;
  create(options?: Core.RequestOptions): Core.APIPromise<BlueprintView>;
  create(
    body: BlueprintCreateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<BlueprintView> {
    if (isRequestOptions(body)) {
      return this.create({}, body);
    }
    return this._client.post('/v1/blueprints', { body, ...options });
  }

  /**
   * Get a previously built Blueprint.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<BlueprintView> {
    return this._client.get(`/v1/blueprints/${id}`, options);
  }

  /**
   * List all blueprints or filter by name. If no status is provided, all blueprints
   * are returned.
   */
  list(query?: BlueprintListParams, options?: Core.RequestOptions): Core.APIPromise<BlueprintListView>;
  list(options?: Core.RequestOptions): Core.APIPromise<BlueprintListView>;
  list(
    query: BlueprintListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<BlueprintListView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.get('/v1/blueprints', { query, ...options });
  }

  /**
   * Get Blueprint build logs.
   */
  logs(id: string, options?: Core.RequestOptions): Core.APIPromise<BlueprintBuildLogsListView> {
    return this._client.get(`/v1/blueprints/${id}/logs`, options);
  }

  /**
   * Preview building a Blueprint with the specified configuration. You can take the
   * resulting Dockerfile and test out your build.
   */
  preview(
    body?: BlueprintPreviewParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<BlueprintPreviewView>;
  preview(options?: Core.RequestOptions): Core.APIPromise<BlueprintPreviewView>;
  preview(
    body: BlueprintPreviewParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<BlueprintPreviewView> {
    if (isRequestOptions(body)) {
      return this.preview({}, body);
    }
    return this._client.post('/v1/blueprints/preview', { body, ...options });
  }
}

export interface BlueprintBuildLog {
  /**
   * Log line severity level.
   */
  level?: string;

  /**
   * Log line message.
   */
  message?: string;

  /**
   * Time of log (Unix timestamp milliseconds).
   */
  timestamp_ms?: number;
}

export interface BlueprintBuildLogsListView {
  /**
   * ID of the Blueprint.
   */
  blueprint_id?: string;

  /**
   * List of logs generated during Blueprint build.
   */
  logs?: Array<BlueprintBuildLog>;
}

export interface BlueprintBuildParameters {
  /**
   * A list of code mounts to be included in the Blueprint.
   */
  code_mounts?: Array<CodeAPI.CodeMountParameters>;

  /**
   * Dockerfile contents to be used to build the Blueprint.
   */
  dockerfile?: string;

  /**
   * (Optional) Map of paths and file contents to write before setup..
   */
  file_mounts?: Record<string, string>;

  /**
   * Parameters to configure your Devbox at launch time.
   */
  launch_parameters?: BlueprintBuildParameters.LaunchParameters;

  /**
   * Name of the Blueprint.
   */
  name?: string;

  /**
   * A list of commands to run to set up your system.
   */
  system_setup_commands?: Array<string>;
}

export namespace BlueprintBuildParameters {
  /**
   * Parameters to configure your Devbox at launch time.
   */
  export interface LaunchParameters {
    /**
     * Time in seconds after which Devbox will automatically shutdown. Default is 1
     * hour.
     */
    keep_alive_time_seconds?: number;

    /**
     * Set of commands to be run at launch time, before the entrypoint process is run.
     */
    launch_commands?: Array<string>;

    /**
     * Manual resource configuration for Devbox. If not set, defaults will be used.
     */
    resource_size_request?: AccountAPI.ResourceSize;
  }
}

export interface BlueprintListView {
  /**
   * List of blueprints matching filter.
   */
  blueprints?: Array<BlueprintView>;

  has_more?: boolean;

  total_count?: number;
}

export interface BlueprintPreviewView {
  /**
   * The Dockerfile contents that will built.
   */
  dockerfile?: string;
}

export interface BlueprintView {
  /**
   * The id of the Blueprint.
   */
  id?: string;

  /**
   * Creation time of the Blueprint (Unix timestamp milliseconds).
   */
  create_time_ms?: number;

  /**
   * The failure reason if the Blueprint build failed, if any.
   */
  failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed';

  /**
   * The name of the Blueprint.
   */
  name?: string;

  /**
   * The parameters used to create Blueprint.
   */
  parameters?: BlueprintBuildParameters;

  /**
   * The status of the Blueprint build.
   */
  status?: 'provisioning' | 'building' | 'failed' | 'build_complete';
}

export interface BlueprintCreateParams {
  /**
   * A list of code mounts to be included in the Blueprint.
   */
  code_mounts?: Array<CodeAPI.CodeMountParameters>;

  /**
   * Dockerfile contents to be used to build the Blueprint.
   */
  dockerfile?: string;

  /**
   * (Optional) Map of paths and file contents to write before setup..
   */
  file_mounts?: Record<string, string>;

  /**
   * Parameters to configure your Devbox at launch time.
   */
  launch_parameters?: BlueprintCreateParams.LaunchParameters;

  /**
   * Name of the Blueprint.
   */
  name?: string;

  /**
   * A list of commands to run to set up your system.
   */
  system_setup_commands?: Array<string>;
}

export namespace BlueprintCreateParams {
  /**
   * Parameters to configure your Devbox at launch time.
   */
  export interface LaunchParameters {
    /**
     * Time in seconds after which Devbox will automatically shutdown. Default is 1
     * hour.
     */
    keep_alive_time_seconds?: number;

    /**
     * Set of commands to be run at launch time, before the entrypoint process is run.
     */
    launch_commands?: Array<string>;

    /**
     * Manual resource configuration for Devbox. If not set, defaults will be used.
     */
    resource_size_request?: AccountAPI.ResourceSize;
  }
}

export interface BlueprintListParams {
  /**
   * Page Limit
   */
  limit?: string;

  /**
   * Filter by name
   */
  name?: string;

  /**
   * Load the next page starting after the given token.
   */
  starting_after?: string;
}

export interface BlueprintPreviewParams {
  /**
   * A list of code mounts to be included in the Blueprint.
   */
  code_mounts?: Array<CodeAPI.CodeMountParameters>;

  /**
   * Dockerfile contents to be used to build the Blueprint.
   */
  dockerfile?: string;

  /**
   * (Optional) Map of paths and file contents to write before setup..
   */
  file_mounts?: Record<string, string>;

  /**
   * Parameters to configure your Devbox at launch time.
   */
  launch_parameters?: BlueprintPreviewParams.LaunchParameters;

  /**
   * Name of the Blueprint.
   */
  name?: string;

  /**
   * A list of commands to run to set up your system.
   */
  system_setup_commands?: Array<string>;
}

export namespace BlueprintPreviewParams {
  /**
   * Parameters to configure your Devbox at launch time.
   */
  export interface LaunchParameters {
    /**
     * Time in seconds after which Devbox will automatically shutdown. Default is 1
     * hour.
     */
    keep_alive_time_seconds?: number;

    /**
     * Set of commands to be run at launch time, before the entrypoint process is run.
     */
    launch_commands?: Array<string>;

    /**
     * Manual resource configuration for Devbox. If not set, defaults will be used.
     */
    resource_size_request?: AccountAPI.ResourceSize;
  }
}

export namespace Blueprints {
  export import BlueprintBuildLog = BlueprintsAPI.BlueprintBuildLog;
  export import BlueprintBuildLogsListView = BlueprintsAPI.BlueprintBuildLogsListView;
  export import BlueprintBuildParameters = BlueprintsAPI.BlueprintBuildParameters;
  export import BlueprintListView = BlueprintsAPI.BlueprintListView;
  export import BlueprintPreviewView = BlueprintsAPI.BlueprintPreviewView;
  export import BlueprintView = BlueprintsAPI.BlueprintView;
  export import BlueprintCreateParams = BlueprintsAPI.BlueprintCreateParams;
  export import BlueprintListParams = BlueprintsAPI.BlueprintListParams;
  export import BlueprintPreviewParams = BlueprintsAPI.BlueprintPreviewParams;
}
