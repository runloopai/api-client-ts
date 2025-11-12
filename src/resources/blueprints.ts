// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';
import * as Shared from './shared';
import { BlueprintsCursorIDPage, type BlueprintsCursorIDPageParams } from '../pagination';
import { RunloopError } from '../error';
import { PollingOptions, poll } from '../lib/polling';
import { FILE_MOUNT_MAX_SIZE_BYTES, FILE_MOUNT_TOTAL_MAX_SIZE_BYTES } from '../lib/constants';

function formatBytes(numBytes: number): string {
  if (numBytes < 1024) return `${numBytes} bytes`;
  const units: Array<[number, string]> = [
    [1 << 30, 'GB'],
    [1 << 20, 'MB'],
    [1 << 10, 'KB'],
  ];
  for (const [factor, unit] of units) {
    if (numBytes >= factor) {
      const value = numBytes / factor;
      if (Number.isInteger(value)) return `${value} ${unit}`;
      return `${value.toFixed(1)} ${unit}`;
    }
  }
  return `${numBytes} bytes`;
}

function getUtf8ByteLength(input: string): number {
  let byteLength = 0;
  for (let i = 0; i < input.length; i++) {
    const codeUnit = input.charCodeAt(i);
    if (codeUnit < 0x80) {
      byteLength += 1;
    } else if (codeUnit < 0x800) {
      byteLength += 2;
    } else if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      // Surrogate pair (4 bytes in UTF-8)
      i += 1;
      byteLength += 4;
    } else {
      byteLength += 3;
    }
  }
  return byteLength;
}

function validateFileMounts(fileMounts?: { [key: string]: string } | null): Array<string> {
  const errors: Array<string> = [];
  if (!fileMounts) return errors;

  let totalSizeBytes = 0;
  for (const [mountPath, content] of Object.entries(fileMounts)) {
    const sizeBytes = getUtf8ByteLength(content ?? '');
    if (sizeBytes > FILE_MOUNT_MAX_SIZE_BYTES) {
      const over = sizeBytes - FILE_MOUNT_MAX_SIZE_BYTES;
      errors.push(
        `file_mount '${mountPath}' is ${formatBytes(over)} over the limit (` +
          `${formatBytes(sizeBytes)} / ${formatBytes(FILE_MOUNT_MAX_SIZE_BYTES)}). Use object_mounts instead.`,
      );
    }
    totalSizeBytes += sizeBytes;
  }

  if (totalSizeBytes > FILE_MOUNT_TOTAL_MAX_SIZE_BYTES) {
    const totalOver = totalSizeBytes - FILE_MOUNT_TOTAL_MAX_SIZE_BYTES;
    errors.push(
      `total file_mounts size is ${formatBytes(totalOver)} over the limit (` +
        `${formatBytes(totalSizeBytes)} / ${formatBytes(FILE_MOUNT_TOTAL_MAX_SIZE_BYTES)}). Use object_mounts instead.`,
    );
  }

  return errors;
}

export class Blueprints extends APIResource {
  /**
   * Starts build of custom defined container Blueprint. The Blueprint will begin in
   * the 'provisioning' step and transition to the 'building' step once it is
   * selected off the build queue., Upon build complete it will transition to
   * 'building_complete' if the build is successful.
   */
  create(body: BlueprintCreateParams, options?: Core.RequestOptions): Core.APIPromise<BlueprintView> {
    const errors = validateFileMounts(body?.file_mounts);
    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
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
   * Delete a previously created Blueprint. If a blueprint has dependent snapshots,
   * it cannot be deleted. You can find them by querying: GET
   * /v1/devboxes/disk_snapshots?source_blueprint_id={blueprint_id}.
   */
  delete(id: string, options?: Core.RequestOptions): Core.APIPromise<unknown> {
    return this._client.post(`/v1/blueprints/${id}/delete`, options);
  }

  /**
   * Starts build of custom defined container Blueprint using a RepositoryConnection
   * Inspection as a source container specification.
   */
  createFromInspection(
    body: BlueprintCreateFromInspectionParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<BlueprintView> {
    const errors = validateFileMounts(body?.file_mounts);
    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
    return this._client.post('/v1/blueprints/create_from_inspection', { body, ...options });
  }

  /**
   * List all public Blueprints that are available to all users.
   */
  listPublic(
    query?: BlueprintListPublicParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<BlueprintViewsBlueprintsCursorIDPage, BlueprintView>;
  listPublic(
    options?: Core.RequestOptions,
  ): Core.PagePromise<BlueprintViewsBlueprintsCursorIDPage, BlueprintView>;
  listPublic(
    query: BlueprintListPublicParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<BlueprintViewsBlueprintsCursorIDPage, BlueprintView> {
    if (isRequestOptions(query)) {
      return this.listPublic({}, query);
    }
    return this._client.getAPIList('/v1/blueprints/list_public', BlueprintViewsBlueprintsCursorIDPage, {
      query,
      ...options,
    });
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

export interface BlueprintBuildFromInspectionParameters {
  /**
   * (Optional) Use a RepositoryInspection a source of a Blueprint build. The
   * Dockerfile will be automatically created based on the RepositoryInspection
   * contents.
   */
  inspection_source: InspectionSource;

  /**
   * Name of the Blueprint.
   */
  name: string;

  /**
   * (Optional) Map of paths and file contents to write before setup.
   */
  file_mounts?: { [key: string]: string } | null;

  /**
   * Parameters to configure your Devbox at launch time.
   */
  launch_parameters?: Shared.LaunchParameters | null;

  /**
   * (Optional) User defined metadata for the Blueprint.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * (Optional) Map of mount IDs/environment variable names to secret names. Secrets
   * can be used as environment variables in system_setup_commands. Example:
   * {"GITHUB_TOKEN": "gh_secret"} makes 'gh_secret' available as GITHUB_TOKEN.
   */
  secrets?: { [key: string]: string } | null;

  /**
   * A list of commands to run to set up your system.
   */
  system_setup_commands?: Array<string> | null;
}

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
   * (Optional) Name of previously built blueprint to use as a base blueprint for
   * this build. When set, this will load the latest successfully built Blueprint
   * with the given name. Only one of (base_blueprint_id, base_blueprint_name) should
   * be specified.
   */
  base_blueprint_name?: string | null;

  /**
   * (Optional) Arbitrary Docker build args to pass during build.
   */
  build_args?: { [key: string]: string } | null;

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
   * (Optional) User defined metadata for the Blueprint.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * (Optional) Map of mount IDs/environment variable names to secret names. Secrets
   * will be available to commands during the build. Secrets are NOT stored in the
   * blueprint image. Example: {"DB_PASS": "DATABASE_PASSWORD"} makes the secret
   * 'DATABASE_PASSWORD' available as environment variable 'DB_PASS'.
   */
  secrets?: { [key: string]: string } | null;

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
  status: 'queued' | 'provisioning' | 'building' | 'failed' | 'build_complete';

  /**
   * The ID of the base Blueprint.
   */
  base_blueprint_id?: string | null;

  /**
   * Build completion time of the Blueprint (Unix timestamp milliseconds).
   */
  build_finish_time_ms?: number | null;

  /**
   * List of ContainerizedServices available in the Blueprint. Services can be
   * explicitly started when creating a Devbox.
   */
  containerized_services?: Array<BlueprintView.ContainerizedService> | null;

  /**
   * Capabilities that will be available on Devbox.
   */
  devbox_capabilities?: Array<'unknown' | 'computer_usage' | 'browser_usage' | 'docker_in_docker'> | null;

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

/**
 * Use a RepositoryInspection a source of a Blueprint build.
 */
export interface InspectionSource {
  /**
   * The ID of a repository inspection.
   */
  inspection_id: string;

  /**
   * GitHub authentication token for accessing private repositories.
   */
  github_auth_token?: string | null;
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
   * (Optional) Name of previously built blueprint to use as a base blueprint for
   * this build. When set, this will load the latest successfully built Blueprint
   * with the given name. Only one of (base_blueprint_id, base_blueprint_name) should
   * be specified.
   */
  base_blueprint_name?: string | null;

  /**
   * (Optional) Arbitrary Docker build args to pass during build.
   */
  build_args?: { [key: string]: string } | null;

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
   * (Optional) User defined metadata for the Blueprint.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * (Optional) Map of mount IDs/environment variable names to secret names. Secrets
   * will be available to commands during the build. Secrets are NOT stored in the
   * blueprint image. Example: {"DB_PASS": "DATABASE_PASSWORD"} makes the secret
   * 'DATABASE_PASSWORD' available as environment variable 'DB_PASS'.
   */
  secrets?: { [key: string]: string } | null;

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

export interface BlueprintCreateFromInspectionParams {
  /**
   * (Optional) Use a RepositoryInspection a source of a Blueprint build. The
   * Dockerfile will be automatically created based on the RepositoryInspection
   * contents.
   */
  inspection_source: InspectionSource;

  /**
   * Name of the Blueprint.
   */
  name: string;

  /**
   * (Optional) Map of paths and file contents to write before setup.
   */
  file_mounts?: { [key: string]: string } | null;

  /**
   * Parameters to configure your Devbox at launch time.
   */
  launch_parameters?: Shared.LaunchParameters | null;

  /**
   * (Optional) User defined metadata for the Blueprint.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * (Optional) Map of mount IDs/environment variable names to secret names. Secrets
   * can be used as environment variables in system_setup_commands. Example:
   * {"GITHUB_TOKEN": "gh_secret"} makes 'gh_secret' available as GITHUB_TOKEN.
   */
  secrets?: { [key: string]: string } | null;

  /**
   * A list of commands to run to set up your system.
   */
  system_setup_commands?: Array<string> | null;
}

export interface BlueprintListPublicParams extends BlueprintsCursorIDPageParams {
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
   * (Optional) Name of previously built blueprint to use as a base blueprint for
   * this build. When set, this will load the latest successfully built Blueprint
   * with the given name. Only one of (base_blueprint_id, base_blueprint_name) should
   * be specified.
   */
  base_blueprint_name?: string | null;

  /**
   * (Optional) Arbitrary Docker build args to pass during build.
   */
  build_args?: { [key: string]: string } | null;

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
   * (Optional) User defined metadata for the Blueprint.
   */
  metadata?: { [key: string]: string } | null;

  /**
   * (Optional) Map of mount IDs/environment variable names to secret names. Secrets
   * will be available to commands during the build. Secrets are NOT stored in the
   * blueprint image. Example: {"DB_PASS": "DATABASE_PASSWORD"} makes the secret
   * 'DATABASE_PASSWORD' available as environment variable 'DB_PASS'.
   */
  secrets?: { [key: string]: string } | null;

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
    type BlueprintBuildFromInspectionParameters as BlueprintBuildFromInspectionParameters,
    type BlueprintBuildLog as BlueprintBuildLog,
    type BlueprintBuildLogsListView as BlueprintBuildLogsListView,
    type BlueprintBuildParameters as BlueprintBuildParameters,
    type BlueprintListView as BlueprintListView,
    type BlueprintPreviewView as BlueprintPreviewView,
    type BlueprintView as BlueprintView,
    type InspectionSource as InspectionSource,
    type BlueprintDeleteResponse as BlueprintDeleteResponse,
    BlueprintViewsBlueprintsCursorIDPage as BlueprintViewsBlueprintsCursorIDPage,
    type BlueprintCreateParams as BlueprintCreateParams,
    type BlueprintListParams as BlueprintListParams,
    type BlueprintCreateFromInspectionParams as BlueprintCreateFromInspectionParams,
    type BlueprintListPublicParams as BlueprintListPublicParams,
    type BlueprintPreviewParams as BlueprintPreviewParams,
  };
}
