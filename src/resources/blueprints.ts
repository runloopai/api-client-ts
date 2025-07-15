// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';
import * as Shared from './shared';
import { BlueprintsCursorIDPage, type BlueprintsCursorIDPageParams } from '../pagination';

export class Blueprints extends APIResource {
  /**
   * Starts build of custom defined container Blueprint. The Blueprint will begin in
   * the 'provisioning' step and transition to the 'building' step once it is
   * selected off the build queue., Upon build complete it will transition to
   * 'building_complete' if the build is successful.
   */
  create(body: BlueprintCreateParams, options?: Core.RequestOptions): Core.APIPromise<BlueprintView> {
    return this._client.post('/v1/blueprints', { body, ...options });
  }

  /**
   * Get the details of a previously created Blueprint including the build status.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<BlueprintView> {
    return this._client.get(`/v1/blueprints/${id}`, options);
  }

  /**
   * List all Blueprints or filter by name.
   */
  list(
    query?: BlueprintListParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<BlueprintViewsBlueprintsCursorIDPage, BlueprintView>;
  list(options?: Core.RequestOptions): Core.PagePromise<BlueprintViewsBlueprintsCursorIDPage, BlueprintView>;
  list(
    query: BlueprintListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<BlueprintViewsBlueprintsCursorIDPage, BlueprintView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList('/v1/blueprints', BlueprintViewsBlueprintsCursorIDPage, {
      query,
      ...options,
    });
  }

  /**
   * Delete a previously created Blueprint.
   */
  delete(id: string, options?: Core.RequestOptions): Core.APIPromise<unknown> {
    return this._client.post(`/v1/blueprints/${id}/delete`, options);
  }

  /**
   * Get all logs from the building of a Blueprint.
   */
  logs(id: string, options?: Core.RequestOptions): Core.APIPromise<BlueprintBuildLogsListView> {
    return this._client.get(`/v1/blueprints/${id}/logs`, options);
  }

  /**
   * Preview building a Blueprint with the specified configuration. You can take the
   * resulting Dockerfile and test out your build using any local docker tooling.
   */
  preview(
    body: BlueprintPreviewParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<BlueprintPreviewView> {
    return this._client.post('/v1/blueprints/preview', { body, ...options });
  }
}

export class BlueprintViewsBlueprintsCursorIDPage extends BlueprintsCursorIDPage<BlueprintView> {}

export interface BlueprintBuildLog {
  /**
   * Log line severity level.
   */
  level: string;

  /**
   * Log line message.
   */
  message: string;

  /**
   * Time of log (Unix timestamp milliseconds).
   */
  timestamp_ms: number;
}

export interface BlueprintBuildLogsListView {
  /**
   * ID of the Blueprint.
   */
  blueprint_id: string;

  /**
   * List of logs generated during Blueprint build.
   */
  logs: Array<BlueprintBuildLog>;
}

export interface BlueprintBuildParameters {
  /**
   * Name of the Blueprint.
   */
  name: string;

  /**
   * (Optional) ID of previously built blueprint to use as a base blueprint for this
   * build.
   */
  base_blueprint_id?: string | null;

  /**
   * A list of code mounts to be included in the Blueprint.
   */
  code_mounts?: Array<Shared.CodeMountParameters> | null;

  /**
   * Dockerfile contents to be used to build the Blueprint.
   */
  dockerfile?: string | null;

  /**
   * (Optional) Map of paths and file contents to write before setup.
   */
  file_mounts?: { [key: string]: string } | null;

  /**
   * Parameters to configure your Devbox at launch time.
   */
  launch_parameters?: Shared.LaunchParameters | null;

  /**
   * A list of commands to run to set up your system.
   */
  system_setup_commands?: Array<string> | null;
}

export interface BlueprintListView {
  /**
   * List of blueprints matching filter.
   */
  blueprints: Array<BlueprintView>;

  has_more: boolean;

  remaining_count: number;

  total_count: number;
}

export interface BlueprintPreviewView {
  /**
   * The Dockerfile contents that will built.
   */
  dockerfile: string;
}

/**
 * Blueprints are ways to create customized starting points for Devboxes. They
 * allow you to define custom starting points for Devboxes such that environment
 * set up can be cached to improve Devbox boot times.
 */
export interface BlueprintView {
  /**
   * The id of the Blueprint.
   */
  id: string;

  /**
   * Creation time of the Blueprint (Unix timestamp milliseconds).
   */
  create_time_ms: number;

  /**
   * The name of the Blueprint.
   */
  name: string;

  /**
   * The parameters used to create Blueprint.
   */
  parameters: BlueprintBuildParameters;

  /**
   * The state of the Blueprint.
   */
  state: 'created' | 'deleted';

  /**
   * The status of the Blueprint build.
   */
  status: 'provisioning' | 'building' | 'failed' | 'build_complete';

  /**
   * The ID of the base Blueprint.
   */
  base_blueprint_id?: string | null;

  /**
   * The failure reason if the Blueprint build failed, if any.
   */
  failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed' | null;
}

export type BlueprintDeleteResponse = unknown;

export interface BlueprintCreateParams {
  /**
   * Name of the Blueprint.
   */
  name: string;

  /**
   * (Optional) ID of previously built blueprint to use as a base blueprint for this
   * build.
   */
  base_blueprint_id?: string | null;

  /**
   * A list of code mounts to be included in the Blueprint.
   */
  code_mounts?: Array<Shared.CodeMountParameters> | null;

  /**
   * Dockerfile contents to be used to build the Blueprint.
   */
  dockerfile?: string | null;

  /**
   * (Optional) Map of paths and file contents to write before setup.
   */
  file_mounts?: { [key: string]: string } | null;

  /**
   * Parameters to configure your Devbox at launch time.
   */
  launch_parameters?: Shared.LaunchParameters | null;

  /**
   * A list of commands to run to set up your system.
   */
  system_setup_commands?: Array<string> | null;
}

export interface BlueprintListParams extends BlueprintsCursorIDPageParams {
  /**
   * Filter by name
   */
  name?: string;
}

export interface BlueprintPreviewParams {
  /**
   * Name of the Blueprint.
   */
  name: string;

  /**
   * (Optional) ID of previously built blueprint to use as a base blueprint for this
   * build.
   */
  base_blueprint_id?: string | null;

  /**
   * A list of code mounts to be included in the Blueprint.
   */
  code_mounts?: Array<Shared.CodeMountParameters> | null;

  /**
   * Dockerfile contents to be used to build the Blueprint.
   */
  dockerfile?: string | null;

  /**
   * (Optional) Map of paths and file contents to write before setup.
   */
  file_mounts?: { [key: string]: string } | null;

  /**
   * Parameters to configure your Devbox at launch time.
   */
  launch_parameters?: Shared.LaunchParameters | null;

  /**
   * A list of commands to run to set up your system.
   */
  system_setup_commands?: Array<string> | null;
}

Blueprints.BlueprintViewsBlueprintsCursorIDPage = BlueprintViewsBlueprintsCursorIDPage;

export declare namespace Blueprints {
  export {
    type BlueprintBuildLog as BlueprintBuildLog,
    type BlueprintBuildLogsListView as BlueprintBuildLogsListView,
    type BlueprintBuildParameters as BlueprintBuildParameters,
    type BlueprintListView as BlueprintListView,
    type BlueprintPreviewView as BlueprintPreviewView,
    type BlueprintView as BlueprintView,
    type BlueprintDeleteResponse as BlueprintDeleteResponse,
    BlueprintViewsBlueprintsCursorIDPage as BlueprintViewsBlueprintsCursorIDPage,
    type BlueprintCreateParams as BlueprintCreateParams,
    type BlueprintListParams as BlueprintListParams,
    type BlueprintPreviewParams as BlueprintPreviewParams,
  };
}
