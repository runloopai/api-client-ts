// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export interface ProjectLogsView {
  /**
   * List of logs for the given project.
   */
  logs?: Array<ProjectLogsView.Log>;
}

export namespace ProjectLogsView {
  export interface Log {
    level?: string;

    message?: string;

    source?: string;

    timestamp?: string;
  }
}
