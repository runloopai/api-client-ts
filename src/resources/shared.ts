// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export interface AfterIdle {
  /**
   * After idle_time_seconds, on_idle action will be taken.
   */
  idle_time_seconds: number;

  /**
   * Action to take after Devbox becomes idle.
   */
  on_idle: 'shutdown' | 'suspend';
}

export interface CodeMountParameters {
  /**
   * The name of the repo to mount. By default, code will be mounted at
   * /home/user/{repo_name}s.
   */
  repo_name: string;

  /**
   * The owner of the repo.
   */
  repo_owner: string;

  /**
   * The authentication token necessary to pull repo.
   */
  token?: string | null;

  /**
   * Installation command to install and setup repository.
   */
  install_command?: string | null;
}

/**
 * LaunchParameters enable you to customize the resources available to your Devbox
 * as well as the environment set up that should be completed before the Devbox is
 * marked as 'running'.
 */
export interface LaunchParameters {
  /**
   * Configure Devbox lifecycle based on idle activity. If after_idle is set, Devbox
   * will ignore keep_alive_time_seconds.
   */
  after_idle?: AfterIdle | null;

  /**
   * A list of ports to make available on the Devbox. Only ports made available will
   * be surfaced to create tunnels via the 'createTunnel' API.
   */
  available_ports?: Array<number> | null;

  /**
   * Time in seconds after which Devbox will automatically shutdown. Default is 1
   * hour.
   */
  keep_alive_time_seconds?: number | null;

  /**
   * Set of commands to be run at launch time, before the entrypoint process is run.
   */
  launch_commands?: Array<string> | null;

  /**
   * Manual resource configuration for Devbox. If not set, defaults will be used.
   */
  resource_size_request?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE' | null;
}
