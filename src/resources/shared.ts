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

export interface AgentMountParameters {
  /**
   * The ID of the agent to mount.
   */
  agent_id: string;

  type: 'agent_mount';

  /**
   * Optional path to mount the agent on the Devbox. Required for git and object
   * agents. Use absolute path (e.g., /home/user/agent)
   */
  agent_path?: string | null;
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
   * The target architecture for the Devbox. If unset, defaults to arm64.
   */
  architecture?: 'x86_64' | 'arm64' | null;

  /**
   * A list of ports to make available on the Devbox. Only ports made available will
   * be surfaced to create tunnels via the 'createTunnel' API.
   */
  available_ports?: Array<number> | null;

  /**
   * custom resource size, number of cpu cores, must be multiple of 2. Min is 1, max
   * is 16.
   */
  custom_cpu_cores?: number | null;

  /**
   * custom disk size, number in GiB, must be a multiple of 2. Min is 2GiB, max is
   * 64GiB.
   */
  custom_disk_size?: number | null;

  /**
   * custom memory size, number in GiB, must be a multiple of 2. Min is 2GiB, max is
   * 64GiB.
   */
  custom_gb_memory?: number | null;

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
   * A list of ContainerizedService names to be started when a Devbox is created. A
   * valid ContainerizedService must be specified in Blueprint to be started.
   */
  required_services?: Array<string> | null;

  /**
   * Manual resource configuration for Devbox. If not set, defaults will be used.
   */
  resource_size_request?:
    | 'X_SMALL'
    | 'SMALL'
    | 'MEDIUM'
    | 'LARGE'
    | 'X_LARGE'
    | 'XX_LARGE'
    | 'CUSTOM_SIZE'
    | null;

  /**
   * Specify the user for execution on Devbox. If not set, default `user` will be
   * used.
   */
  user_parameters?: LaunchParameters.UserParameters | null;
}

export namespace LaunchParameters {
  /**
   * Specify the user for execution on Devbox. If not set, default `user` will be
   * used.
   */
  export interface UserParameters {
    /**
     * User ID (UID) for the Linux user. Must be a positive integer.
     */
    uid: number;

    /**
     * Username for the Linux user.
     */
    username: string;
  }
}

export type Mount = ObjectMountParameters | AgentMountParameters;

export interface ObjectMountParameters {
  /**
   * The ID of the object to write.
   */
  object_id: string;

  /**
   * The path to write the object on the Devbox. Use absolute path of object (ie
   * /home/user/object.txt, or directory if archive /home/user/archive_dir)
   */
  object_path: string;

  type: 'object_mount';
}

export interface RunProfile {
  /**
   * Mapping of Environment Variable to Value. May be shown in devbox logging.
   * Example: {"DB_PASS": "DATABASE_PASSWORD"} would set the environment variable
   * 'DB_PASS' to the value 'DATABASE_PASSWORD_VALUE'.
   */
  envVars?: { [key: string]: string } | null;

  /**
   * Additional runtime LaunchParameters to apply after the devbox starts.
   */
  launchParameters?: LaunchParameters | null;

  /**
   * Purpose of the run.
   */
  purpose?: string | null;

  /**
   * Mapping of Environment Variable to User Secret Name. Never shown in devbox
   * logging. Example: {"DB_PASS": "DATABASE_PASSWORD"} would set the environment
   * variable 'DB_PASS' to the value of the secret 'DATABASE_PASSWORD'.
   */
  secrets?: { [key: string]: string } | null;
}
