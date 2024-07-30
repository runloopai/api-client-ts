// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';
import * as BlueprintsAPI from './blueprints';
import * as AccountAPI from './account';
import * as CodeAPI from './code';

export class Blueprints extends APIResource {
  /**
   * Preview building an image with the specified configuration. You can take the
   * resulting Dockerfile and test out your build.
   */
  create(body?: BlueprintCreateParams, options?: Core.RequestOptions): Core.APIPromise<BlueprintPreviewView>;
  create(options?: Core.RequestOptions): Core.APIPromise<BlueprintPreviewView>;
  create(
    body: BlueprintCreateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<BlueprintPreviewView> {
    if (isRequestOptions(body)) {
      return this.create({}, body);
    }
    return this._client.post('/v1/blueprints', { body, ...options });
  }

  /**
   * Get a previously built Image.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<BlueprintView> {
    return this._client.get(`/v1/blueprints/${id}`, options);
  }

  /**
   * Get Image logs.
   */
  list(options?: Core.RequestOptions): Core.APIPromise<BlueprintBuildLogsListView> {
    return this._client.get('/v1/blueprints', options);
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
}
