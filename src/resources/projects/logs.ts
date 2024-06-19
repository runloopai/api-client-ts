// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as Core from '../../core';
import { APIResource } from '../../resource';
import * as LogsAPI from './logs';

export class Logs extends APIResource {
  /**
   * Get list of all logs from a project.
   */
  list(id: string, options?: Core.RequestOptions): Core.APIPromise<ProjectLogs> {
    return this._client.get(`/v1/projects/${id}/logs`, options);
  }
}

export interface ProjectLogs {
  /**
   * List of logs for the given project.
   */
  logs?: Array<ProjectLogs.Log>;
}

export namespace ProjectLogs {
  export interface Log {
    level?: string;

    message?: string;

    timestamp?: string;
  }
}

export namespace Logs {
  export import ProjectLogs = LogsAPI.ProjectLogs;
}
