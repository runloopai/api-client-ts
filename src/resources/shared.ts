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

export interface AgentMount {
  /**
   * The ID of the agent to mount. Either agent_id or name must be set.
   */
  agent_id: string | null;

  /**
   * The name of the agent to mount. Returns the most recent agent with a matching
   * name if no agent id string provided. Either agent id or name must be set
   */
  agent_name: string | null;

  type: 'agent_mount';

  /**
   * Path to mount the agent on the Devbox. Required for git and object agents. Use
   * absolute path (e.g., /home/user/agent)
   */
  agent_path?: string | null;

  /**
   * Optional auth token for private repositories. Only used for git agents.
   */
  auth_token?: string | null;
}

/**
 * Agent source configuration.
 */
export interface AgentSource {
  /**
   * Source type: npm, pip, object, or git
   */
  type: string;

  /**
   * Git-based agent source configuration.
   */
  git?: AgentSource.Git | null;

  /**
   * NPM-based agent source configuration.
   */
  npm?: AgentSource.Npm | null;

  /**
   * Object store agent source configuration.
   */
  object?: AgentSource.Object | null;

  /**
   * Pip-based agent source configuration.
   */
  pip?: AgentSource.Pip | null;
}

export namespace AgentSource {
  /**
   * Git-based agent source configuration.
   */
  export interface Git {
    /**
     * Git repository URL
     */
    repository: string;

    /**
     * Setup commands to run after cloning
     */
    agent_setup?: Array<string> | null;

    /**
     * Optional Git ref (branch/tag/commit), defaults to main/HEAD
     */
    ref?: string | null;
  }

  /**
   * NPM-based agent source configuration.
   */
  export interface Npm {
    /**
     * NPM package name
     */
    package_name: string;

    /**
     * Setup commands to run after installation
     */
    agent_setup?: Array<string> | null;

    /**
     * NPM registry URL
     */
    registry_url?: string | null;
  }

  /**
   * Object store agent source configuration.
   */
  export interface Object {
    /**
     * Object ID
     */
    object_id: string;

    /**
     * Setup commands to run after unpacking
     */
    agent_setup?: Array<string> | null;
  }

  /**
   * Pip-based agent source configuration.
   */
  export interface Pip {
    /**
     * Pip package name
     */
    package_name: string;

    /**
     * Setup commands to run after installation
     */
    agent_setup?: Array<string> | null;

    /**
     * Pip registry URL
     */
    registry_url?: string | null;
  }
}

export interface BrokerMount {
  /**
   * The ID of the axon event stream to mount onto the Devbox.
   */
  axon_id: string;

  type: 'broker_mount';

  /**
   * Binary to launch the agent (e.g., 'opencode'). Used by protocols that launch a
   * subprocess (acp, claude_json, codex_json).
   */
  agent_binary?: string | null;

  /**
   * Arguments to pass to the agent command (e.g., ['acp']). Used by protocols that
   * launch a subprocess (acp, claude_json, codex_json).
   */
  launch_args?: Array<string> | null;

  /**
   * The protocol used by the broker to deliver events to the agent.
   */
  protocol?: 'acp' | 'claude_json' | 'codex_json' | null;

  /**
   * Working directory in which to launch the agent binary. Defaults to the home
   * directory if not specified.
   */
  working_directory?: string | null;
}

export interface CodeMountParameters {
  /**
   * The name of the repo to mount. By default, code will be mounted at
   * /home/user/{repo_name}.
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
   * Optional git ref (branch or tag) to checkout. Defaults to the repository default
   * branch.
   */
  git_ref?: string | null;

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
   * will ignore keep_alive_time_seconds. If both after_idle and lifecycle.after_idle
   * are set, they must have the same value. Use lifecycle.after_idle instead.
   */
  after_idle?: AfterIdle | null;

  /**
   * The target architecture for the Devbox. If unset, defaults to x86_64.
   */
  architecture?: 'x86_64' | 'arm64' | null;

  /**
   * [Deprecated] A list of ports to make available on the Devbox. This field is
   * ignored.
   */
  available_ports?: Array<number> | null;

  /**
   * Custom CPU cores. Must be 0.5, 1, or a multiple of 2. Max is 16.
   */
  custom_cpu_cores?: number | null;

  /**
   * Custom disk size in GiB. Must be a multiple of 2. Min is 2GiB, max is 64GiB.
   */
  custom_disk_size?: number | null;

  /**
   * Custom memory size in GiB. Must be 1 or a multiple of 2. Max is 64GiB.
   */
  custom_gb_memory?: number | null;

  /**
   * Time in seconds after which Devbox will automatically shutdown. Default is 1
   * hour. Maximum is 48 hours (172800 seconds).
   */
  keep_alive_time_seconds?: number | null;

  /**
   * Set of commands to be run at launch time, before the entrypoint process is run.
   */
  launch_commands?: Array<string> | null;

  /**
   * Lifecycle configuration for Devbox idle and resume behavior. Configure idle
   * policy via after_idle, resume triggers via resume_triggers, and optional
   * lifecycle hooks via lifecycle_hooks.
   */
  lifecycle?: LifecycleConfiguration | null;

  /**
   * (Optional) ID of the network policy to apply to Devboxes launched with these
   * parameters. When set on a Blueprint launch parameters, Devboxes created from it
   * will inherit this policy unless explicitly overridden.
   */
  network_policy_id?: string | null;

  /**
   * (Optional, Alpha) standard is default and flex is lazily provisioned and may be
   * pre-empted. This is an alpha feature and its behavior may change without notice.
   */
  provisioning_tier?: 'standard' | 'flex' | null;

  /**
   * A list of ContainerizedService names to be started when a Devbox is created. A
   * valid ContainerizedService must be specified in Blueprint to be started.
   */
  required_services?: Array<string> | null;

  /**
   * The size of the Devbox resources for Runloop to allocate.
   *
   * X_SMALL: 0.5 cpu x 1GiB memory x 4GiB disk SMALL: 1 cpu x 2GiB memory x 4GiB
   * disk MEDIUM: 2 cpu x 4GiB memory x 8GiB disk LARGE: 2 cpu x 8GiB memory x 16GiB
   * disk X_LARGE: 4 cpu x 16GiB memory x 16GiB disk XX_LARGE: 8 cpu x 32GiB memory x
   * 16GiB disk CUSTOM_SIZE: To choose a custom size, set this enum and also the
   * custom_cpu_cores, custom_gb_memory, and optionally custom_disk_size in launch
   * parameters. CPU must be 0.5, 1, or a multiple of 2 (max 16). Memory must be 1 or
   * a multiple of 2 (max 64GiB). Disk must be a multiple of 2 (min 2GiB, max 64GiB).
   * The cpu:memory ratio must be between 1:2 and 1:8 inclusive.
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
   * Configuration for the Linux user in the Devbox environment.
   */
  user_parameters?: LaunchParameters.UserParameters | null;
}

export namespace LaunchParameters {
  /**
   * Configuration for the Linux user in the Devbox environment.
   */
  export interface UserParameters {
    /**
     * User ID (UID) for the Linux user. Must be a non-negative integer.
     */
    uid: number;

    /**
     * Username for the Linux user.
     */
    username: string;
  }
}

/**
 * Lifecycle configuration for Devbox idle and resume behavior. Configure idle
 * policy via after_idle, resume triggers via resume_triggers, and optional
 * lifecycle hooks via lifecycle_hooks.
 */
export interface LifecycleConfiguration {
  /**
   * Configure Devbox lifecycle based on idle activity. If both this and the
   * top-level after_idle are set, they must have the same value. Prefer this field
   * for new integrations.
   */
  after_idle?: AfterIdle | null;

  /**
   * Lifecycle hooks for Devbox suspend. suspend_commands run sequentially as the
   * configured Devbox user before the Devbox suspends; failures are logged but do
   * not block suspending. The suspend_deadline_ms budget defaults to 30000 ms, may
   * not exceed 60000 ms, and covers broker drain plus suspend_commands. If the
   * deadline is exceeded, suspend work is abandoned, the timeout is logged, and the
   * Devbox still proceeds to suspend. launch_commands still run on every startup,
   * including after resume.
   */
  lifecycle_hooks?: LifecycleHooks | null;

  /**
   * Triggers that can resume a suspended Devbox.
   */
  resume_triggers?: ResumeTriggers | null;
}

/**
 * Lifecycle hooks for Devbox suspend. suspend_commands run sequentially as the
 * configured Devbox user before the Devbox suspends; failures are logged but do
 * not block suspending. The suspend_deadline_ms budget defaults to 30000 ms, may
 * not exceed 60000 ms, and covers broker drain plus suspend_commands. If the
 * deadline is exceeded, suspend work is abandoned, the timeout is logged, and the
 * Devbox still proceeds to suspend. launch_commands still run on every startup,
 * including after resume.
 */
export interface LifecycleHooks {
  /**
   * Commands to run through the suspend path before the Devbox suspends (e.g.
   * cleanup, quiesce daemons).
   */
  suspend_commands?: Array<string> | null;

  /**
   * Deadline in milliseconds for broker drain and suspend_commands during suspend.
   * Defaults to 30000 ms and may not exceed 60000 ms. If exceeded, suspend work is
   * abandoned, the timeout is logged, and the Devbox still proceeds to suspend by
   * shutting down vmagent and killing the VM.
   */
  suspend_deadline_ms?: number | null;
}

export type Mount = ObjectMount | AgentMount | Mount.CodeMount | Mount.FileMount | BrokerMount;

export namespace Mount {
  export interface CodeMount {
    /**
     * The name of the repo to mount. By default, code will be mounted at
     * /home/user/{repo_name}.
     */
    repo_name: string;

    /**
     * The owner of the repo.
     */
    repo_owner: string;

    type: 'code_mount';

    /**
     * The authentication token necessary to pull repo.
     */
    token?: string | null;

    /**
     * Optional git ref (branch or tag) to checkout. Defaults to the repository default
     * branch.
     */
    git_ref?: string | null;

    /**
     * Installation command to install and setup repository.
     */
    install_command?: string | null;
  }

  export interface FileMount {
    /**
     * Content of the file to mount.
     */
    content: string;

    /**
     * Target path where the file should be mounted.
     */
    target: string;

    type: 'file_mount';
  }
}

export interface ObjectMount {
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

/**
 * Triggers that can resume a suspended Devbox.
 */
export interface ResumeTriggers {
  /**
   * When true, axon events targeting a suspended Devbox will trigger a resume.
   */
  axon_event?: boolean | null;

  /**
   * When true, HTTP traffic to a suspended Devbox via tunnel will trigger a resume.
   */
  http?: boolean | null;
}

export interface RunProfile {
  /**
   * Mapping of Environment Variable to Value. May be shown in devbox logging.
   * Example: {"DB_PASS": "DATABASE_PASSWORD"} would set the environment variable
   * 'DB_PASS' to the value 'DATABASE_PASSWORD_VALUE'.
   */
  envVars?: { [key: string]: string } | null;

  /**
   * LaunchParameters enable you to customize the resources available to your Devbox
   * as well as the environment set up that should be completed before the Devbox is
   * marked as 'running'.
   */
  launchParameters?: LaunchParameters | null;

  /**
   * A list of mounts to be included in the scenario run.
   */
  mounts?: Array<Mount> | null;

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
