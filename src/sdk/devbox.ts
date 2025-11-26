import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  DevboxView,
  DevboxCreateParams,
  DevboxAsyncExecutionDetailView,
  DevboxSnapshotDiskParams,
  DevboxCreateTunnelParams,
  DevboxRemoveTunnelParams,
  DevboxReadFileContentsParams,
  DevboxWriteFileContentsParams,
  DevboxDownloadFileParams,
  DevboxUploadFileParams,
  DevboxExecuteParams,
  DevboxExecuteAsyncParams,
  DevboxSnapshotView,
  DevboxKeepAliveResponse,
} from '../resources/devboxes/devboxes';
import { PollingOptions } from '../lib/polling';
import { Snapshot } from './snapshot';
import { Execution } from './execution';
import { ExecutionResult } from './execution-result';
import { uuidv7 } from 'uuidv7';

// Re-export Execution and ExecutionResult for Devbox namespace
export { Execution } from './execution';
export { ExecutionResult } from './execution-result';

/**
 * Streaming callbacks for real-time log processing.
 */
export interface ExecuteStreamingCallbacks {
  /** Callback invoked for each stdout log line */
  stdout?: (line: string) => void;
  /** Callback invoked for each stderr log line */
  stderr?: (line: string) => void;
  /** Callback invoked for all log lines (both stdout and stderr) */
  output?: (line: string) => void;
}

/**
 * Network operations for a devbox.
 * Provides methods for managing SSH keys and network tunnels.
 */
export class DevboxNetOps {
  /**
   * @private
   */
  constructor(
    private client: Runloop,
    private devboxId: string,
  ) {}

  /**
   * Create an SSH key for remote access to the devbox. The public key is installed on the devbox and the private key is returned.
   * The key can be used to SSH into the devbox. To use this you must add the private key to your SSH agent and configure it like this:
   *
   * The ssh user is the same user as defined in the {@link DevboxCreateParams.launch_parameters.user_parameters user parameters} of the {@link DevboxCreateParams  devbox creation parameters}.
   *
   * A special proxy command is required to allow SSH through the proxy. This is because the devbox is behind a proxy and the SSH client needs to be able to connect to the devbox through the proxy.
   * The proxy command is:
   * ```
   * openssl s_client -quiet -servername %h -connect {sshUrl} 2>/dev/null
   * ```
   * This command uses the OpenSSL library to connect to the devbox through the proxy.
   * The `-quiet` flag is used to suppress the output of the OpenSSL library.
   * The `-servername %h` flag is used to specify the server name to connect to.
   * The `-connect {sshUrl}` flag is used to specify the URL to connect to.
   * The `2>/dev/null` flag is used to suppress the output of the OpenSSL library.
   *
   * @example
   * ```typescript
   * const sshKeyResponse = await devbox.net.createSSHKey();
   * const sshUrl = sshKeyResponse.url;
   * const sshKey = sshKeyResponse.ssh_private_key;
   * ```
   *
   * **NOTE:** The ssh user is the same user defined in the {@link DevboxCreateParams.launch_parameters} launch parameters.
   *
   * ssh-config example:
   * ```
   *
   * Host {devbox-id}
   *   Hostname {sshKeyResponse.url}
   *   User {user} # the user defined in the devbox params
   *   IdentityFile {keyfile_path} # the path to the `sshKeyResponse.sshKey` private key
   *   ProxyCommand openssl s_client -quiet -servername %h -connect ssh.runloop.pro:443 2>/dev/null # required to allow SSH through the proxy
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<DevboxCreateSSHKeyResponse>} SSH key creation result
   */
  async createSSHKey(options?: Core.RequestOptions) {
    return this.client.devboxes.createSSHKey(this.devboxId, options);
  }

  /**
   * Open a port on the devbox to be accessible from the internet.
   *
   * @example
   * ```typescript
   * const tunnel = await devbox.net.createTunnel({ port: 8080 });
   * ```
   *
   * @param {DevboxCreateTunnelParams} params - Tunnel creation parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<DevboxTunnelView>} Tunnel creation result
   */
  async createTunnel(params: DevboxCreateTunnelParams, options?: Core.RequestOptions) {
    return this.client.devboxes.createTunnel(this.devboxId, params, options);
  }

  /**
   * Remove a tunnel from the devbox.
   *
   * @example
   * ```typescript
   * await devbox.net.removeTunnel({ port: 8080 });
   * ```
   *
   * @param {DevboxRemoveTunnelParams} params - Tunnel removal parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<DevboxRemoveTunnelResponse>} Tunnel removal result
   */
  async removeTunnel(params: DevboxRemoveTunnelParams, options?: Core.RequestOptions) {
    return this.client.devboxes.removeTunnel(this.devboxId, params, options);
  }
}

/**
 * Command execution operations for a devbox.
 * Provides methods for executing commands synchronously and asynchronously.
 */
export class DevboxCmdOps {
  /**
   * @private
   */
  constructor(
    private client: Runloop,
    private devboxId: string,
    private startStreamingWithCallbacks: (
      executionId: string,
      stdout?: (line: string) => void,
      stderr?: (line: string) => void,
      output?: (line: string) => void,
    ) => Promise<void>,
  ) {}

  /**
   * Execute a command on the devbox and wait for it to complete.
   * Optionally provide callbacks to stream logs in real-time.
   *
   * When callbacks are provided, this method waits for both the command to complete
   * AND all streaming data to be processed before returning.
   *
   * @example
   * ```typescript
   * // Simple execution
   * const result = await devbox.cmd.exec('ls -la');
   * console.log(await result.stdout());
   *
   * // With streaming callbacks
   * const result = await devbox.cmd.exec('npm install', {
   *   stdout: (line) => process.stdout.write(line),
   *   stderr: (line) => process.stderr.write(line),
   * });
   * ```
   *
   * @param {string} command - The command to execute
   * @param {Omit<DevboxExecuteParams, 'command'> & ExecuteStreamingCallbacks} [params] - Optional parameters including shell name and callbacks
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxAsyncExecutionDetailView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<ExecutionResult>} {@link ExecutionResult} with stdout, stderr, and exit status
   */
  async exec(
    command: string,
    params?: Omit<DevboxExecuteParams, 'command'> & ExecuteStreamingCallbacks,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxAsyncExecutionDetailView>> },
  ): Promise<ExecutionResult> {
    const fullParams = { ...params, command };
    const hasCallbacks = fullParams.stdout || fullParams.stderr || fullParams.output;

    if (hasCallbacks) {
      // With callbacks: use async execution workflow to enable streaming
      const { stdout, stderr, output, ...executeParams } = fullParams;
      const execution = await this.client.devboxes.executeAsync(this.devboxId, executeParams, options);

      // Start streaming and await both completion and streaming
      const streamingPromise = this.startStreamingWithCallbacks(
        execution.execution_id,
        stdout,
        stderr,
        output,
      );

      // Wait for both command completion and streaming to finish (using allSettled for robustness)
      const results = await Promise.allSettled([
        this.client.devboxes.executions.awaitCompleted(this.devboxId, execution.execution_id, options),
        streamingPromise,
      ]);

      // Extract command result (throw if it failed, ignore streaming errors)
      if (results[0].status === 'rejected') {
        throw results[0].reason;
      }
      const result = results[0].value;

      return new ExecutionResult(this.client, this.devboxId, execution.execution_id, result);
    } else {
      // Without callbacks: use existing optimized workflow
      const result = await this.client.devboxes.executeAndAwaitCompletion(this.devboxId, fullParams, options);
      return new ExecutionResult(this.client, this.devboxId, result.execution_id, result);
    }
  }

  /**
   * Execute a command asynchronously without waiting for completion.
   * Optionally provide callbacks to stream logs in real-time as they are produced.
   *
   * Callbacks fire in real-time as logs arrive. When you call execution.result(),
   * it will wait for both the command to complete and all streaming to finish.
   *
   * @example
   * ```typescript
   * const execution = await devbox.cmd.execAsync('long-running-task.sh', {
   *   stdout: (line) => console.log(`[LOG] ${line}`),
   * });
   *
   * // Do other work while command runs...
   *
   * const result = await execution.result();
   * if (result.success) {
   *   console.log('Task completed successfully!');
   * }
   * ```
   *
   * @param {string} command - The command to execute
   * @param {Omit<DevboxExecuteAsyncParams, 'command'> & ExecuteStreamingCallbacks} [params] - Optional parameters including shell name and callbacks
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Execution>} {@link Execution} object for tracking and controlling the command
   */
  async execAsync(
    command: string,
    params?: Omit<DevboxExecuteAsyncParams, 'command'> & ExecuteStreamingCallbacks,
    options?: Core.RequestOptions,
  ): Promise<Execution> {
    const fullParams = { ...params, command };
    const { stdout, stderr, output, ...executeParams } = fullParams;
    const execution = await this.client.devboxes.executeAsync(this.devboxId, executeParams, options);

    // Start streaming in background if callbacks provided
    let streamingPromise: Promise<void> | undefined;
    if (stdout || stderr || output) {
      // Start streaming - will be awaited when result() is called
      streamingPromise = this.startStreamingWithCallbacks(execution.execution_id, stdout, stderr, output);
    }

    return new Execution(this.client, this.devboxId, execution.execution_id, execution, streamingPromise);
  }
}

/**
 * Named shell operations for a devbox.
 * Provides methods for executing commands in a persistent, stateful shell session.
 *
 * Use {@link Devbox.shell} to create a named shell instance. If you use the same shell name,
 * it will re-attach to the existing named shell, preserving its state (environment variables,
 * current working directory, etc.).
 *
 * Named shells are stateful and maintain environment variables and the current working directory (CWD)
 * across commands. Commands executed through the same
 * named shell instance will execute sequentially - the shell can only run one command at a time with
 * automatic queuing. This ensures that environment changes and directory changes from one command
 * are preserved for the next command.
 *
 * @example
 * ```typescript
 * // Create a named shell
 * const shell = devbox.shell('my-session');
 *
 * // Commands execute sequentially and share state
 * await shell.exec('cd /app');
 * await shell.exec('export MY_VAR=value');
 * await shell.exec('echo $MY_VAR'); // Will output 'value' because env is preserved
 * await shell.exec('pwd'); // Will output '/app' because CWD is preserved
 * ```
 */
export class DevboxNamedShell {
  /**
   * @private
   */
  constructor(
    private devbox: Devbox,
    private shellName: string,
  ) {}

  /**
   * Execute a command in the named shell and wait for it to complete.
   * Optionally provide callbacks to stream logs in real-time.
   *
   * The command will execute in the persistent shell session, maintaining environment variables
   * and the current working directory from previous commands. Commands are queued and execute
   * sequentially - only one command runs at a time in the named shell.
   *
   * When callbacks are provided, this method waits for both the command to complete
   * AND all streaming data to be processed before returning.
   *
   * @example
   * ```typescript
   * const shell = devbox.shell('my-session');
   *
   * // Simple execution
   * const result = await shell.exec('ls -la');
   * console.log(await result.stdout());
   *
   * // With streaming callbacks
   * const result = await shell.exec('npm install', {
   *   stdout: (line) => process.stdout.write(line),
   *   stderr: (line) => process.stderr.write(line),
   * });
   *
   * // Stateful execution - environment and CWD are preserved
   * await shell.exec('cd /app');
   * await shell.exec('export NODE_ENV=production');
   * const result = await shell.exec('npm start'); // Runs in /app with NODE_ENV=production
   * ```
   *
   * @param {string} command - The command to execute
   * @param {Omit<Omit<DevboxExecuteParams, 'command'>, 'shell_name'> & ExecuteStreamingCallbacks} [params] - Optional parameters (shell_name is automatically set)
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxAsyncExecutionDetailView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<ExecutionResult>} {@link ExecutionResult} with stdout, stderr, and exit status
   */
  async exec(
    command: string,
    params?: Omit<Omit<DevboxExecuteParams, 'command'>, 'shell_name'> & ExecuteStreamingCallbacks,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxAsyncExecutionDetailView>> },
  ): Promise<ExecutionResult> {
    return this.devbox.cmd.exec(command, { ...params, shell_name: this.shellName }, options);
  }

  /**
   * Execute a command in the named shell asynchronously without waiting for completion.
   * Optionally provide callbacks to stream logs in real-time as they are produced.
   *
   * The command will execute in the persistent shell session, maintaining environment variables
   * and the current working directory from previous commands. Commands are queued and execute
   * sequentially - only one command runs at a time in the named shell.
   *
   * Callbacks fire in real-time as logs arrive. When you call execution.result(),
   * it will wait for both the command to complete and all streaming to finish.
   *
   * @example
   * ```typescript
   * const shell = devbox.shell('my-session');
   *
   * const execution = await shell.execAsync('long-running-task.sh', {
   *   stdout: (line) => console.log(`[LOG] ${line}`),
   * });
   *
   * // Do other work while command runs...
   * // Note: if you call shell.exec() or shell.execAsync() again, it will queue
   * // and wait for this command to complete first
   *
   * const result = await execution.result();
   * if (result.success) {
   *   console.log('Task completed successfully!');
   * }
   * ```
   *
   * @param {string} command - The command to execute
   * @param {Omit<Omit<DevboxExecuteAsyncParams, 'command'>, 'shell_name'> & ExecuteStreamingCallbacks} [params] - Optional parameters (shell_name is automatically set)
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Execution>} {@link Execution} object for tracking and controlling the command
   */
  async execAsync(
    command: string,
    params?: Omit<Omit<DevboxExecuteAsyncParams, 'command'>, 'shell_name'> & ExecuteStreamingCallbacks,
    options?: Core.RequestOptions,
  ): Promise<Execution> {
    return this.devbox.cmd.execAsync(command, { ...params, shell_name: this.shellName }, options);
  }
}

/**
 * File operations for a devbox.
 * Provides methods for reading, writing, uploading, and downloading files.
 */
export class DevboxFileOps {
  /**
   * @private
   */
  constructor(
    private client: Runloop,
    private devboxId: string,
  ) {}

  /**
   * Read file contents from the devbox as a UTF-8 string.
   *
   * @example
   * ```typescript
   * const content = await devbox.file.read({ path: '/app/config.json' });
   * const config = JSON.parse(content);
   * ```
   *
   * @param {DevboxReadFileContentsParams} params - Parameters containing the file path
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<string>} File contents as a string
   */
  async read(params: DevboxReadFileContentsParams, options?: Core.RequestOptions): Promise<string> {
    return this.client.devboxes.readFileContents(this.devboxId, params, options);
  }

  /**
   * Write UTF-8 string contents to a file on the devbox.
   *
   * @example
   * ```typescript
   * await devbox.file.write({
   *   path: '/app/config.json',
   *   contents: JSON.stringify({ key: 'value' }, null, 2),
   * });
   * ```
   *
   * @param {DevboxWriteFileContentsParams} params - Parameters containing the file path and contents
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<DevboxWriteFileContentsResponse>} Execution result
   */
  async write(params: DevboxWriteFileContentsParams, options?: Core.RequestOptions) {
    return this.client.devboxes.writeFileContents(this.devboxId, params, options);
  }

  /**
   * Download file contents (supports binary files).
   *
   * @example
   * ```typescript
   * const response = await devbox.file.download({ path: '/app/data.bin' });
   * const blob = await response.blob();
   * // Process binary data...
   * ```
   *
   * @param {DevboxDownloadFileParams} params - Parameters containing the file path
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<DevboxDownloadFileResponse>} Download file response
   */
  async download(params: DevboxDownloadFileParams, options?: Core.RequestOptions) {
    return this.client.devboxes.downloadFile(this.devboxId, params, options);
  }

  /**
   * Upload a file to the devbox.
   *
   * @example
   * ```typescript
   * const file = new File(['content'], 'data.txt');
   * await devbox.file.upload({
   *   path: '/app/data.txt',
   *   file: file,
   * });
   * ```
   *
   * @param {DevboxUploadFileParams} params - Parameters containing the file path and file to upload
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<DevboxUploadFileResponse>} Upload result
   */
  async upload(params: DevboxUploadFileParams, options?: Core.RequestOptions) {
    return this.client.devboxes.uploadFile(this.devboxId, params, options);
  }
}

/**
 * Object-oriented interface for working with Devboxes.
 *
 * ## Overview
 *
 * The `Devbox` class provides a high-level, object-oriented API for managing devboxes.
 * Devboxes are containers that run your code in a consistent environment. They have the the following categories of operations:
 * - {@link DevboxNetOps net} - Network operations
 * - {@link DevboxCmdOps cmd} - Command execution operations
 * - {@link DevboxFileOps file} - File operations
 *
 * ## Quickstart
 *
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client-ts';
 *
 * const runloop = new RunloopSDK();
 * const devbox = await runloop.devbox.create({ name: 'my-devbox' });
 * devbox.cmd.exec('echo "Hello, World!"');
 * ...
 * ```
 *
 */
export class Devbox {
  private client: Runloop;
  private _id: string;

  /**
   * Network operations on the devbox.
   */
  public readonly net: DevboxNetOps;

  /**
   * Command execution operations on the devbox.
   */
  public readonly cmd: DevboxCmdOps;

  /**
   * File operations on the devbox.
   */
  public readonly file: DevboxFileOps;

  private constructor(client: Runloop, id: string) {
    this.client = client;
    this._id = id;
    this.net = new DevboxNetOps(this.client, this._id);
    this.cmd = new DevboxCmdOps(this.client, this._id, this.startStreamingWithCallbacks.bind(this));
    this.file = new DevboxFileOps(this.client, this._id);
  }

  /**
   * Create a new Devbox and wait for it to reach the running state.
   * This is the recommended way to create a devbox as it ensures it's ready to use.
   *
   * See the {@link DevboxOps.create} method for calling this
   * @private
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const devbox = await runloop.devbox.create({ name: 'my-devbox' });
   *
   * devbox.cmd.exec('echo "Hello, World!"');
   * ...
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {DevboxCreateParams} [params] - Parameters for creating the devbox
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<Devbox>} A {@link Devbox} instance in the running state
   */
  static async create(
    client: Runloop,
    params?: DevboxCreateParams,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<Devbox> {
    const devboxData = await client.devboxes.createAndAwaitRunning(params, options);
    return new Devbox(client, devboxData.id);
  }

  /**
   * Create a new Devbox from a Blueprint and wait for it to reach the running state.
   *
   * See the {@link DevboxOps.createFromBlueprintId} method for calling this
   * @private
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} blueprintId - The blueprint ID to create from
   * @param {Omit<DevboxCreateParams, 'blueprint_id' | 'snapshot_id' | 'blueprint_name'>} [params] - Additional devbox creation parameters
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<Devbox>} A {@link Devbox} instance in the running state
   */
  static async createFromBlueprintId(
    client: Runloop,
    blueprintId: string,
    params?: Omit<DevboxCreateParams, 'blueprint_id' | 'snapshot_id' | 'blueprint_name'>,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<Devbox> {
    const createParams: DevboxCreateParams = {
      ...params,
      blueprint_id: blueprintId,
    };
    const devboxData = await client.devboxes.createAndAwaitRunning(createParams, options);
    return new Devbox(client, devboxData.id);
  }

  /**
   * Create a new Devbox from a Blueprint name and wait for it to reach the running state.
   *
   * See the {@link DevboxOps.createFromBlueprintName} method for calling this
   * @private
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} blueprintName - The blueprint name to create from
   * @param {Omit<DevboxCreateParams, 'blueprint_id' | 'snapshot_id' | 'blueprint_name'>} [params] - Additional devbox creation parameters
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<Devbox>} A {@link Devbox} instance in the running state
   */
  static async createFromBlueprintName(
    client: Runloop,
    blueprintName: string,
    params?: Omit<DevboxCreateParams, 'blueprint_id' | 'snapshot_id' | 'blueprint_name'>,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<Devbox> {
    const createParams: DevboxCreateParams = {
      ...params,
      blueprint_name: blueprintName,
    };
    const devboxData = await client.devboxes.createAndAwaitRunning(createParams, options);
    return new Devbox(client, devboxData.id);
  }

  /**
   * Create a new Devbox from a Snapshot and wait for it to reach the running state.
   *
   * See the {@link DevboxOps.createFromSnapshot} method for calling this
   * @private
   *
   * @example
   * ```typescript
   * const devbox = await Devbox.createFromSnapshot(
   *   runloop,
   *   snapshot.id,
   *   { name: 'restored-devbox' }
   * );
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} snapshotId - The snapshot ID to create from
   * @param {Omit<DevboxCreateParams, 'snapshot_id' | 'blueprint_id' | 'blueprint_name'>} [params] - Additional devbox creation parameters
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<Devbox>} A {@link Devbox} instance in the running state
   */
  static async createFromSnapshot(
    client: Runloop,
    snapshotId: string,
    params?: Omit<DevboxCreateParams, 'snapshot_id' | 'blueprint_id' | 'blueprint_name'>,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<Devbox> {
    const createParams: DevboxCreateParams = {
      ...params,
      snapshot_id: snapshotId,
    };
    const devboxData = await client.devboxes.createAndAwaitRunning(createParams, options);
    return new Devbox(client, devboxData.id);
  }

  /**
   * Create a Devbox instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * See the {@link DevboxOps.fromId} method for calling this
   * @private
   *
   * @example
   * ```typescript
   * const devbox = Devbox.fromId(runloop, 'devbox-123');
   * const info = await devbox.getInfo();
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} id - The devbox ID
   * @returns {Devbox} A {@link Devbox} instance
   */
  static fromId(client: Runloop, id: string): Devbox {
    return new Devbox(client, id);
  }

  /**
   * Get the devbox ID.
   * @returns {string} The devbox ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Create a named shell instance for stateful command execution.
   *
   * Named shells are stateful and maintain environment variables and the current working directory (CWD)
   * across commands, just like a real shell on your local computer. Commands executed through the same
   * named shell instance will execute sequentially - the shell can only run one command at a time with
   * automatic queuing. This ensures that environment changes and directory changes from one command
   * are preserved for the next command.
   *
   * @example
   * ```typescript
   * // Create a named shell with a custom name
   * const shell = devbox.shell('my-session');
   *
   * // Create a named shell with an auto-generated UUID name
   * const shell2 = devbox.shell();
   *
   * // Commands execute sequentially and share state
   * await shell.exec('cd /app');
   * await shell.exec('export MY_VAR=value');
   * await shell.exec('echo $MY_VAR'); // Will output 'value' because env is preserved
   * await shell.exec('pwd'); // Will output '/app' because CWD is preserved
   * ```
   *
   * @param {string} [shellName] - The name of the persistent shell session. If not provided, a UUID will be generated automatically.
   * @returns {DevboxNamedShell} A {@link DevboxNamedShell} instance for executing commands in the named shell
   */
  shell(shellName: string = uuidv7()): DevboxNamedShell {
    return new DevboxNamedShell(this, shellName);
  }

  /**
   * Start streaming logs with callbacks.
   * Returns a promise that resolves when all streams complete.
   * Uses SSE streams from the old SDK with auto-reconnect.
   *
   * @private
   * @param {string} executionId - The execution ID to stream logs for
   * @param {(line: string) => void} [stdout] - Callback for stdout log lines
   * @param {(line: string) => void} [stderr] - Callback for stderr log lines
   * @param {(line: string) => void} [output] - Callback for all log lines (both stdout and stderr)
   * @returns {Promise<void>} Promise that resolves when all streams complete
   */
  private startStreamingWithCallbacks(
    executionId: string,
    stdout?: (line: string) => void,
    stderr?: (line: string) => void,
    output?: (line: string) => void,
  ): Promise<void> {
    const streamingPromises: Promise<void>[] = [];

    // Stream stdout if stdout or output callback provided
    if (stdout || output) {
      const stdoutPromise = (async () => {
        try {
          const stream = await this.client.devboxes.executions.streamStdoutUpdates(this._id, executionId, {});
          for await (const chunk of stream) {
            if (stdout) stdout(chunk.output);
            if (output) output(chunk.output);
          }
        } catch (error) {
          // Silently handle streaming errors - don't block execution completion
          console.error('Error streaming stdout:', error);
        }
      })();
      streamingPromises.push(stdoutPromise);
    }

    // Stream stderr if stderr or output callback provided
    if (stderr || output) {
      const stderrPromise = (async () => {
        try {
          const stream = await this.client.devboxes.executions.streamStderrUpdates(this._id, executionId, {});
          for await (const chunk of stream) {
            if (stderr) stderr(chunk.output);
            if (output) output(chunk.output);
          }
        } catch (error) {
          // Silently handle streaming errors - don't block execution completion
          console.error('Error streaming stderr:', error);
        }
      })();
      streamingPromises.push(stderrPromise);
    }

    // Return promise that resolves when all streams complete
    return Promise.allSettled(streamingPromises).then(() => undefined);
  }

  /**
   * Get the complete devbox data from the API.
   *
   * @example
   * ```typescript
   * const info = await devbox.getInfo();
   * console.log(`Devbox name: ${info.name}, status: ${info.status}`);
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<DevboxView>} The devbox data
   */
  async getInfo(options?: Core.RequestOptions): Promise<DevboxView> {
    return this.client.devboxes.retrieve(this._id, options);
  }

  /**
   * Wait for the devbox to reach the running state.
   * Uses optimized server-side polling for better performance.
   *
   * @example
   * ```typescript
   * const devbox = Devbox.fromId(runloop, 'devbox-123');
   * await devbox.awaitRunning();
   * console.log('Devbox is now running');
   * ```
   *
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<DevboxView>} The devbox data when running state is reached
   */
  async awaitRunning(
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<DevboxView> {
    return this.client.devboxes.awaitRunning(this._id, options);
  }

  /**
   * Wait for the devbox to reach the suspended state.
   * Uses optimized server-side polling for better performance.
   *
   * @example
   * ```typescript
   * await devbox.suspend();
   * await devbox.awaitSuspended();
   * console.log('Devbox is now suspended');
   * ```
   *
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<DevboxView>} The devbox data when suspended state is reached
   */
  async awaitSuspended(
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<DevboxView> {
    return this.client.devboxes.awaitSuspended(this._id, options);
  }

  /**
   * Create a disk snapshot of the devbox. Returns a snapshot that is completed. If you don't want to block on completion, use snapshotDiskAsync().
   *
   * @example
   * ```typescript
   * const snapshot = await devbox.snapshotDisk({ name: 'pre-deployment' });
   * console.log(`Snapshot ${snapshot.id} created successfully`);
   * ```
   * @param {DevboxSnapshotDiskParams} [params] - Snapshot creation parameters
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxSnapshotView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<Snapshot>} A completed {@link Snapshot} instance
   */
  async snapshotDisk(
    params?: DevboxSnapshotDiskParams,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxSnapshotView>> },
  ): Promise<Snapshot> {
    const snapshotData = await this.client.devboxes.snapshotDiskAsync(this._id, params, options);
    const snapshot = Snapshot.fromId(this.client, snapshotData.id);
    await snapshot.awaitCompleted();
    return snapshot;
  }

  /**
   * Create a disk snapshot of the devbox asynchronously. Returns a snapshot that is not yet completed but has started. You can await completion using snapshot.awaitCompleted().
   *
   * @example
   * ```typescript
   * const snapshot = await devbox.snapshotDiskAsync({ name: 'backup' });
   * // Do other work...
   * await snapshot.awaitCompleted();
   * ```
   * @param {DevboxSnapshotDiskParams} [params] - Snapshot creation parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Snapshot>} A {@link Snapshot} instance that has started but may not be completed
   */
  async snapshotDiskAsync(
    params?: DevboxSnapshotDiskParams,
    options?: Core.RequestOptions,
  ): Promise<Snapshot> {
    const snapshotData = await this.client.devboxes.snapshotDiskAsync(this._id, params, options);
    return Snapshot.fromId(this.client, snapshotData.id);
  }

  /**
   * Shutdown the devbox.
   *
   * @example
   * ```typescript
   * await devbox.shutdown();
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<DevboxShutdownResponse>} Shutdown result
   */
  async shutdown(options?: Core.RequestOptions) {
    return await this.client.devboxes.shutdown(this._id, options);
  }

  /**
   * Suspend the devbox and create a disk snapshot.
   *
   * @example
   * ```typescript
   * await devbox.suspend();
   * // Optionally, wait for the devbox to reach the suspended state
   * await devbox.awaitSuspended();
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<DevboxSuspendResponse>} Suspend result
   */
  async suspend(options?: Core.RequestOptions) {
    return this.client.devboxes.suspend(this._id, options);
  }

  /**
   * Resume a suspended devbox.
   *
   * @example
   * ```typescript
   * await devbox.resume();
   * await devbox.awaitRunning();
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<DevboxResumeResponse>} Resume result
   */
  async resume(options?: Core.RequestOptions) {
    return this.client.devboxes.resume(this._id, options);
  }

  /**
   * Send a keep-alive signal to prevent idle shutdown.
   *
   * @example
   * ```typescript
   * // Send keep-alive periodically
   * setInterval(() => devbox.keepAlive(), 60000);
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<DevboxKeepAliveResponse>} Keep-alive result
   */
  async keepAlive(options?: Core.RequestOptions): Promise<DevboxKeepAliveResponse> {
    return this.client.devboxes.keepAlive(this._id, options);
  }
}

/**
 * Namespace for Devbox-related types and classes.
 * Provides convenient access to operation classes and types.
 */
export declare namespace Devbox {
  /**
   * Network operations class for devboxes.
   * @see {@link DevboxNetOps}
   */
  export {
    DevboxNetOps as NetOps,
    /**
     * Command execution operations class for devboxes.
     * @see {@link DevboxCmdOps}
     */
    DevboxCmdOps as CmdOps,
    /**
     * File operations class for devboxes.
     * @see {@link DevboxFileOps}
     */
    DevboxFileOps as FileOps,
    /**
     * Execution class for tracking async command execution.
     * @see {@link Execution}
     */
    Execution as Execution,
    /**
     * ExecutionResult class for accessing command execution results.
     * @see {@link ExecutionResult}
     */
    ExecutionResult as ExecutionResult,
    /**
     * Streaming callbacks interface for real-time log processing.
     * @see {@link ExecuteStreamingCallbacks}
     */
    type ExecuteStreamingCallbacks as ExecuteStreamingCallbacks,
    /**
     * Named shell operations class for stateful command execution.
     * @see {@link DevboxNamedShell}
     */
    DevboxNamedShell as NamedShell,
  };
}
