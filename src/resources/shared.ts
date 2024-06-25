// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export interface FunctionInvocationDetailView {
  /**
   * Unique ID of the invocation.
   */
  id?: string;

  error?: string;

  /**
   * Unique name of the function.
   */
  function_name?: string;

  /**
   * Unique name of the project associated with function.
   */
  project_name?: string;

  result?: unknown;

  status?: 'created' | 'running' | 'success' | 'failure' | 'canceled' | 'suspended';
}

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
