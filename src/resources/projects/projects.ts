// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import * as Core from '../../core';
import * as ProjectsAPI from './projects';
import * as LogsAPI from './logs';

export class Projects extends APIResource {
  logs: LogsAPI.Logs = new LogsAPI.Logs(this._client);

  /**
   * Get list of all projects for the authenticated user. This includes all projects
   * that the user has access to.
   */
  list(options?: Core.RequestOptions): Core.APIPromise<ProjectListView> {
    return this._client.get('/v1/projects', options);
  }
}

export interface ProjectListView {
  installation?: ProjectListView.Installation;

  /**
   * List of projects matching given query.
   */
  projects?: Array<ProjectListView.Project>;
}

export namespace ProjectListView {
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

    /**
     * Owner of the project in Github
     */
    gh_owner?: string;

    /**
     * Project display name.
     */
    name?: string;
  }
}

export namespace Projects {
  export import ProjectListView = ProjectsAPI.ProjectListView;
  export import Logs = LogsAPI.Logs;
}
