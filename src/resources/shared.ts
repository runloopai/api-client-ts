// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export interface AfterIdle {
  /**
   * After idle_time_seconds, on_idle action will be taken.
   */
  idle_time_seconds: number;

  /**
   * Action to take after Devbox becomes idle.
   */
  on_idle: 'unknown' | 'shutdown' | 'suspend';
}

export interface FunctionInvocationExecutionDetailView {
  /**
   * Unique ID of the invocation.
   */
  id?: string;

  /**
   * End time of the invocation.
   */
  end_time_ms?: number;

  error?: string;

  /**
   * Unique name of the function.
   */
  function_name?: string;

  /**
   * The Git sha of the project this invocation used..
   */
  gh_commit_sha?: string;

  /**
   * The Github Owner of the Project.
   */
  gh_owner?: string;

  /**
   * The Devboxes created and used by this invocation.
   */
  linked_devboxes?: Array<string>;

  /**
   * Unique name of the project associated with function.
   */
  project_name?: string;

  request?: unknown;

  result?: unknown;

  /**
   * Start time of the invocation.
   */
  start_time_ms?: number;

  status?: 'created' | 'running' | 'success' | 'failure' | 'canceled' | 'suspended';
}

export interface LaunchParameters {
  /**
   * Configure Devbox lifecycle based on idle activity. If after_idle is set, Devbox
   * will ignore keep_alive_time_seconds.
   */
  after_idle?: AfterIdle;

  /**
   * A list of ports to make available on the Devbox. Call createTunnel to open a
   * tunnel to the port.
   */
  available_ports?: Array<number>;

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
  resource_size_request?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE';
}

export interface ProjectLogsView {
  /**
   * List of logs for the given project.
   */
  logs: Array<ProjectLogsView.Log>;
}

export namespace ProjectLogsView {
  export interface Log {
    level: string;

    message: string;

    source: string;

    timestamp: string;
  }
}
