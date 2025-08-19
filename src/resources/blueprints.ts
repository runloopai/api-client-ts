// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';
import * as Shared from './shared';
import { BlueprintsCursorIDPage, type BlueprintsCursorIDPageParams } from '../pagination';
import { RunloopError } from '../error';
import { PollingOptions, poll } from '../lib/polling';

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
   * Wait for a blueprint to complete building.
   * Polls the blueprint status until it reaches building_complete state or fails with an error.
   */
  async awaitBuildComplete(
    id: string,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<BlueprintView>> },
  ): Promise<BlueprintView> {
    const finalResult = await poll(
      () => this.retrieve(id, options),
      () => this.retrieve(id, options),
      {
        ...options?.polling,
        shouldStop: (result) => {
          return !['provisioning', 'building'].includes(result.status);
        },
      },
    );

    // Now we check if the blueprint build completed successfully otherwise throw an error
    if (finalResult.status !== 'build_complete') {
      throw new RunloopError(`Blueprint ${id} is in non-complete state ${finalResult.status}`);
    }

    return finalResult;
  }

  /**
   * Create a blueprint and wait for it to complete building.
   * This is a convenience method that combines create() and awaitBuildCompleted().
   */
  async createAndAwaitBuildCompleted(
    body: BlueprintCreateParams,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<BlueprintView>> },
  ): Promise<BlueprintView> {
    const blueprint = await this.create(body, options);
    return this.awaitBuildComplete(blueprint.id, options);
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
   * A list of code mounts to be included in the Blueprint.
   */
  code_mounts?: Array<Shared.CodeMountParameters> | null;

  /**
   * Dockerfile contents to be used to build the Blueprint.
   */
  dockerfile?: string | null;

  /**
   * (Optional) Map of paths and file contents to write before setup..
   */
  file_mounts?: { [key: string]: string } | null;

  /**
   * Parameters to configure your Devbox at launch time.
   */
  launch_parameters?: Shared.LaunchParameters | null;

  /**
   * (Optional) List of containerized services to include in the Blueprint. These
   * services will be pre-pulled during the build phase for optimized startup
   * performance.
   */
  services?: Array<BlueprintBuildParameters.Service> | null;

  /**
   * A list of commands to run to set up your system.
   */
  system_setup_commands?: Array<string> | null;
}

export namespace BlueprintBuildParameters {
  export interface Service {
    /**
     * The image of the container service.
     */
    image: string;

    /**
     * The name of the container service.
     */
    name: string;

    /**
     * The credentials of the container service.
     */
    credentials?: Service.Credentials | null;

    /**
     * The environment variables of the container service.
     */
    env?: { [key: string]: string } | null;

    /**
     * Additional Docker container create options.
     */
    options?: string | null;

    /**
     * The port mappings of the container service. Port mappings are in the format of
     * <host_port>:<container_port>.
     */
    port_mappings?: Array<string> | null;
  }

  export namespace Service {
    /**
     * The credentials of the container service.
     */
    export interface Credentials {
      /**
       * The password of the container service.
       */
      password: string;

      /**
       * The username of the container service.
       */
      username: string;
    }
  }
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
   * List of ContainerizedServices available in the Blueprint. Services can be
   * explicitly started when creating a Devbox.
   */
  containerized_services?: Array<BlueprintView.ContainerizedService> | null;

  /**
   * The failure reason if the Blueprint build failed, if any.
   */
  failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed' | null;

  /**
   * Whether this Blueprint is publicly accessible to all users.
   */
  is_public?: boolean;

  /**
   * User defined metadata associated with the blueprint.
   */
  metadata?: { [key: string]: string } | null;
}

export namespace BlueprintView {
  export interface ContainerizedService {
    /**
     * The image of the container service.
     */
    image: string;

    /**
     * The name of the container service.
     */
    name: string;

    /**
     * The credentials of the container service.
     */
    credentials?: ContainerizedService.Credentials | null;

    /**
     * The environment variables of the container service.
     */
    env?: { [key: string]: string } | null;

    /**
     * Additional Docker container create options.
     */
    options?: string | null;

    /**
     * The port mappings of the container service. Port mappings are in the format of
     * <host_port>:<container_port>.
     */
    port_mappings?: Array<string> | null;
  }

  export namespace ContainerizedService {
    /**
     * The credentials of the container service.
     */
    export interface Credentials {
      /**
       * The password of the container service.
       */
      password: string;

      /**
       * The username of the container service.
       */
      username: string;
    }
  }
}

export type BlueprintDeleteResponse = unknown;

export interface BlueprintCreateParams {
  /**
   * Name of the Blueprint.
   */
  name: string;

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
   * (Optional) List of containerized services to include in the Blueprint. These
   * services will be pre-pulled during the build phase for optimized startup
   * performance.
   */
  services?: Array<BlueprintCreateParams.Service> | null;

  /**
   * A list of commands to run to set up your system.
   */
  system_setup_commands?: Array<string> | null;
}

export namespace BlueprintCreateParams {
  export interface Service {
    /**
     * The image of the container service.
     */
    image: string;

    /**
     * The name of the container service.
     */
    name: string;

    /**
     * The credentials of the container service.
     */
    credentials?: Service.Credentials | null;

    /**
     * The environment variables of the container service.
     */
    env?: { [key: string]: string } | null;

    /**
     * Additional Docker container create options.
     */
    options?: string | null;

    /**
     * The port mappings of the container service. Port mappings are in the format of
     * <host_port>:<container_port>.
     */
    port_mappings?: Array<string> | null;
  }

  export namespace Service {
    /**
     * The credentials of the container service.
     */
    export interface Credentials {
      /**
       * The password of the container service.
       */
      password: string;

      /**
       * The username of the container service.
       */
      username: string;
    }
  }
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
   * (Optional) List of containerized services to include in the Blueprint. These
   * services will be pre-pulled during the build phase for optimized startup
   * performance.
   */
  services?: Array<BlueprintPreviewParams.Service> | null;

  /**
   * A list of commands to run to set up your system.
   */
  system_setup_commands?: Array<string> | null;
}

export namespace BlueprintPreviewParams {
  export interface Service {
    /**
     * The image of the container service.
     */
    image: string;

    /**
     * The name of the container service.
     */
    name: string;

    /**
     * The credentials of the container service.
     */
    credentials?: Service.Credentials | null;

    /**
     * The environment variables of the container service.
     */
    env?: { [key: string]: string } | null;

    /**
     * Additional Docker container create options.
     */
    options?: string | null;

    /**
     * The port mappings of the container service. Port mappings are in the format of
     * <host_port>:<container_port>.
     */
    port_mappings?: Array<string> | null;
  }

  export namespace Service {
    /**
     * The credentials of the container service.
     */
    export interface Credentials {
      /**
       * The password of the container service.
       */
      password: string;

      /**
       * The username of the container service.
       */
      username: string;
    }
  }
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
