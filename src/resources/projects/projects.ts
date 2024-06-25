// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '@runloop/api-client/resource';
import * as Core from '@runloop/api-client/core';
import * as ProjectsAPI from '@runloop/api-client/resources/projects/projects';
import * as LogsAPI from '@runloop/api-client/resources/projects/logs';

export class Projects extends APIResource {
  logs: LogsAPI.Logs = new LogsAPI.Logs(this._client);

  /**
   * Get list of all projects for the authenticated user. This includes all projects
   * that the user has access to.
   */
  list(options?: Core.RequestOptions): Core.APIPromise<ProjectList> {
    return this._client.get('/v1/projects', options);
  }
}

export interface ProjectList {
  installation?: ProjectList.Installation;

  /**
   * List of projects matching given query.
   */
  projects?: Array<ProjectList.Project>;
}

export namespace ProjectList {
  export interface Installation {
    /**
     * Status of the installation (installed | uninstalled | never_installed).
     */
    status?: string;
  }

  export interface Project {
    /**
     * Unique id of Project.
     */
    id?: string;

    active_deploy?: Project.ActiveDeploy;

    in_progress_deploy?: Project.InProgressDeploy;

    /**
     * Project display name.
     */
    name?: string;

    /**
     * Last deployment attempts (up to 10)
     */
    recent_deployments?: Array<Project.RecentDeployment>;
  }

  export namespace Project {
    export interface ActiveDeploy {
      /**
       * Time the Deploy was started (Unix timestamp milliseconds).
       */
      deploy_start_time_ms: number;

      /**
       * ID of the deployment.
       */
      id?: string;

      /**
       * Associated Commit Sha
       */
      deploy_commit_sha?: string;

      /**
       * Associated Commit Time
       */
      deploy_commit_time_ms?: number;

      /**
       * Time the Deploy completed (Unix timestamp milliseconds).
       */
      deploy_end_time_ms?: number;

      /**
       * The list of deployed functions.
       */
      deployed_functions?: Array<string>;

      /**
       * Failure code (generic_failure | git_clone_failure | not_runloop_repo |
       * secrets_failure | provision_failure | runtime_failure). Only set on
       * deploy_failed.
       */
      failure_code?: string;

      /**
       * Failure message
       */
      failure_message?: string;

      /**
       * Status of the deploy (deploy_in_progress | deployed | deploy_failed |
       * not_started).
       */
      status?: string;
    }

    export interface InProgressDeploy {
      /**
       * Time the Deploy was started (Unix timestamp milliseconds).
       */
      deploy_start_time_ms: number;

      /**
       * ID of the deployment.
       */
      id?: string;

      /**
       * Associated Commit Sha
       */
      deploy_commit_sha?: string;

      /**
       * Associated Commit Time
       */
      deploy_commit_time_ms?: number;

      /**
       * Time the Deploy completed (Unix timestamp milliseconds).
       */
      deploy_end_time_ms?: number;

      /**
       * The list of deployed functions.
       */
      deployed_functions?: Array<string>;

      /**
       * Failure code (generic_failure | git_clone_failure | not_runloop_repo |
       * secrets_failure | provision_failure | runtime_failure). Only set on
       * deploy_failed.
       */
      failure_code?: string;

      /**
       * Failure message
       */
      failure_message?: string;

      /**
       * Status of the deploy (deploy_in_progress | deployed | deploy_failed |
       * not_started).
       */
      status?: string;
    }

    export interface RecentDeployment {
      /**
       * Time the Deploy was started (Unix timestamp milliseconds).
       */
      deploy_start_time_ms: number;

      /**
       * ID of the deployment.
       */
      id?: string;

      /**
       * Associated Commit Sha
       */
      deploy_commit_sha?: string;

      /**
       * Associated Commit Time
       */
      deploy_commit_time_ms?: number;

      /**
       * Time the Deploy completed (Unix timestamp milliseconds).
       */
      deploy_end_time_ms?: number;

      /**
       * The list of deployed functions.
       */
      deployed_functions?: Array<string>;

      /**
       * Failure code (generic_failure | git_clone_failure | not_runloop_repo |
       * secrets_failure | provision_failure | runtime_failure). Only set on
       * deploy_failed.
       */
      failure_code?: string;

      /**
       * Failure message
       */
      failure_message?: string;

      /**
       * Status of the deploy (deploy_in_progress | deployed | deploy_failed |
       * not_started).
       */
      status?: string;
    }
  }
}

export namespace Projects {
  export import ProjectList = ProjectsAPI.ProjectList;
  export import Logs = LogsAPI.Logs;
  export import ProjectLogs = LogsAPI.ProjectLogs;
}
