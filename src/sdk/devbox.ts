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
} from '../resources/devboxes/devboxes';
import { PollingOptions } from '../lib/polling';
import { Snapshot } from './snapshot';
import { Execution } from './execution';
import { ExecutionResult } from './execution-result';

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
 * Object-oriented interface for working with Devboxes.
 *
 * ## Overview
 *
 * The `Devbox` class provides a high-level, object-oriented API for managing devboxes.
 * It wraps the low-level API client and provides convenient methods for common operations.
 *
 * ## Creating Devboxes
 *
 * ### Basic Creation
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client-ts';
 *
 * const runloop = new RunloopSDK();
 * const devbox = await runloop.devbox.create({ name: 'my-devbox' });
 * console.log(`Created devbox: ${devbox.id}`);
 * ```
 *
 * ### Create from Blueprint
 * ```typescript
 * const runloop = new RunloopSDK();
 * // Using blueprint ID
 * const devbox = await runloop.devbox.createFromBlueprintId('blueprint-123', {
 *   name: 'my-devbox',
 * });
 *
 * // Using blueprint name
 * const devbox = await runloop.devbox.createFromBlueprintName('my-blueprint', {
 *   name: 'my-devbox',
 * });
 * ```
 *
 * ### Create from Snapshot
 * ```typescript
 * const runloop = new RunloopSDK();
 * const devbox = await runloop.devbox.createFromSnapshot('snapshot-123', {
 *   name: 'restored-devbox',
 * });
 * ```
 *
 * ## Command Execution
 *
 * ### Synchronous Execution
 * ```typescript
 * const result = await devbox.cmd.exec({ command: 'echo "Hello, World!"' });
 * console.log(`Exit code: ${result.exitCode}`);
 * console.log(`Output: ${await result.stdout()}`);
 * ```
 *
 * ### Execution with Streaming Logs
 * ```typescript
 * const result = await devbox.cmd.exec({
 *   command: 'npm install',
 *   stdout: (line) => console.log(`[stdout] ${line}`),
 *   stderr: (line) => console.error(`[stderr] ${line}`),
 * });
 * ```
 *
 * ### Asynchronous Execution
 * ```typescript
 * const execution = await devbox.cmd.execAsync({
 *   command: 'long-running-task',
 *   stdout: (line) => console.log(line),
 * });
 *
 * // Do other work...
 *
 * const result = await execution.result();
 * console.log(`Completed with exit code: ${result.exitCode}`);
 * ```
 *
 * ## File Operations
 *
 * ### Read File
 * ```typescript
 * const content = await devbox.file.read({ path: '/app/config.json' });
 * console.log(content);
 * ```
 *
 * ### Write File
 * ```typescript
 * await devbox.file.write({
 *   path: '/app/config.json',
 *   contents: JSON.stringify({ key: 'value' }),
 * });
 * ```
 *
 * ### Upload File
 * ```typescript
 * await devbox.file.upload({
 *   path: '/app/data.txt',
 *   file: new File(['content'], 'data.txt'),
 * });
 * ```
 *
 * ### Download File
 * ```typescript
 * const response = await devbox.file.download({ path: '/app/output.txt' });
 * const blob = await response.blob();
 * ```
 *
 * ## Lifecycle Management
 *
 * ### Suspend and Resume
 * ```typescript
 * // Suspend devbox (creates snapshot)
 * await devbox.suspend();
 *
 * // Resume later
 * await devbox.resume();
 * ```
 *
 * ### Create Snapshot
 * ```typescript
 * // Create snapshot and wait for completion
 * const snapshot = await devbox.snapshotDisk({ name: 'backup' });
 * console.log(`Snapshot created: ${snapshot.id}`);
 *
 * // Create snapshot asynchronously
 * const snapshot = await devbox.snapshotDiskAsync({ name: 'backup' });
 * await snapshot.awaitCompleted();
 * ```
 *
 * ### Shutdown
 * ```typescript
 * await devbox.shutdown();
 * ```
 *
 * ## Network Operations
 *
 * ### Create SSH Key
 * ```typescript
 * const sshKey = await devbox.net.createSSHKey();
 * console.log(`SSH Key: ${sshKey.public_key}`);
 * ```
 *
 * ### Create Tunnel
 * ```typescript
 * const tunnel = await devbox.net.createTunnel({ port: 8080 });
 * console.log(`Tunnel URL: ${tunnel.url}`);
 * ```
 *
 * ## Working with Existing Devboxes
 *
 * ```typescript
 * const runloop = new RunloopSDK();
 * // Get devbox by ID
 * const devbox = runloop.devbox.fromId('devbox-123');
 *
 * // Get current info
 * const info = await devbox.getInfo();
 * console.log(`Status: ${info.status}`);
 *
 * // Wait for running state
 * await devbox.awaitRunning();
 * ```
 */
export class Devbox {
  private client: Runloop;
  private _id: string;

  private constructor(client: Runloop, id: string) {
    this.client = client;
    this._id = id;
  }

  /**
   * Create a new Devbox and wait for it to reach the running state.
   * This is the recommended way to create a devbox as it ensures it's ready to use.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const devbox = await runloop.devbox.create({ name: 'my-devbox' });
   * console.log(`Devbox ${devbox.id} is ready!`);
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
   * @param {Runloop} client - The Runloop client instance
   * @param {string} id - The devbox ID
   * @returns {Devbox} A {@link Devbox} instance
   */
  static fromId(client: Runloop, id: string): Devbox {
    return new Devbox(client, id);
  }

  /**
   * Get the devbox ID.
   */
  get id(): string {
    return this._id;
  }

  /**
   * Start streaming logs with callbacks.
   * Returns a promise that resolves when all streams complete.
   * Uses SSE streams from the old SDK with auto-reconnect.
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
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<DevboxView>} The devbox data when suspended state is reached
   */
  async awaitSuspended(
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<DevboxView> {
    return this.client.devboxes.awaitSuspended(this._id, options);
  }

  /**
   * Command execution operations on the devbox.
   */
  get cmd() {
    return {
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
       * const result = await devbox.cmd.exec({ command: 'ls -la' });
       * console.log(await result.stdout());
       *
       * // With streaming callbacks
       * const result = await devbox.cmd.exec({
       *   command: 'npm install',
       *   stdout: (line) => process.stdout.write(line),
       *   stderr: (line) => process.stderr.write(line),
       * });
       * ```
       *
       * @param {DevboxExecuteParams & ExecuteStreamingCallbacks} params - Parameters containing the command, optional shell name, and optional callbacks
       * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxAsyncExecutionDetailView>> }} [options] - Request options with optional polling configuration
       * @returns {Promise<ExecutionResult>} {@link ExecutionResult} with stdout, stderr, and exit status
       */
      exec: async (
        params: DevboxExecuteParams & ExecuteStreamingCallbacks,
        options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxAsyncExecutionDetailView>> },
      ): Promise<ExecutionResult> => {
        const hasCallbacks = params.stdout || params.stderr || params.output;

        if (hasCallbacks) {
          // With callbacks: use async execution workflow to enable streaming
          const { stdout, stderr, output, ...executeParams } = params;
          const execution = await this.client.devboxes.executeAsync(this._id, executeParams, options);

          // Start streaming and await both completion and streaming
          const streamingPromise = this.startStreamingWithCallbacks(
            execution.execution_id,
            stdout,
            stderr,
            output,
          );

          // Wait for both command completion and streaming to finish (using allSettled for robustness)
          const results = await Promise.allSettled([
            this.client.devboxes.executions.awaitCompleted(this._id, execution.execution_id, options),
            streamingPromise,
          ]);

          // Extract command result (throw if it failed, ignore streaming errors)
          if (results[0].status === 'rejected') {
            throw results[0].reason;
          }
          const result = results[0].value;

          return new ExecutionResult(this.client, this._id, execution.execution_id, result);
        } else {
          // Without callbacks: use existing optimized workflow
          const result = await this.client.devboxes.executeAndAwaitCompletion(this._id, params, options);
          return new ExecutionResult(this.client, this._id, result.execution_id, result);
        }
      },

      /**
       * Execute a command asynchronously without waiting for completion.
       * Optionally provide callbacks to stream logs in real-time as they are produced.
       *
       * Callbacks fire in real-time as logs arrive. When you call execution.result(),
       * it will wait for both the command to complete and all streaming to finish.
       *
       * @example
       * ```typescript
       * const execution = await devbox.cmd.execAsync({
       *   command: 'long-running-task.sh',
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
       * @param {DevboxExecuteAsyncParams & ExecuteStreamingCallbacks} params - Parameters containing the command, optional shell name, and optional callbacks
       * @param {Core.RequestOptions} [options] - Request options
       * @returns {Promise<Execution>} {@link Execution} object for tracking and controlling the command
       */
      execAsync: async (
        params: DevboxExecuteAsyncParams & ExecuteStreamingCallbacks,
        options?: Core.RequestOptions,
      ): Promise<Execution> => {
        const { stdout, stderr, output, ...executeParams } = params;
        const execution = await this.client.devboxes.executeAsync(this._id, executeParams, options);

        // Start streaming in background if callbacks provided
        let streamingPromise: Promise<void> | undefined;
        if (stdout || stderr || output) {
          // Start streaming - will be awaited when result() is called
          streamingPromise = this.startStreamingWithCallbacks(execution.execution_id, stdout, stderr, output);
        }

        return new Execution(this.client, this._id, execution.execution_id, execution, streamingPromise);
      },
    };
  }

  /**
   * File operations on the devbox.
   */
  get file() {
    return {
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
      read: async (params: DevboxReadFileContentsParams, options?: Core.RequestOptions): Promise<string> => {
        return this.client.devboxes.readFileContents(this._id, params, options);
      },

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
       * @returns {Promise<unknown>} Execution result
       */
      write: async (params: DevboxWriteFileContentsParams, options?: Core.RequestOptions) => {
        return this.client.devboxes.writeFileContents(this._id, params, options);
      },

      /**
       * Download file contents (supports binary files).
       *
       * @param {DevboxDownloadFileParams} params - Parameters containing the file path
       * @param {Core.RequestOptions} [options] - Request options
       * @returns {Promise<Response>} Response with file contents
       */
      download: async (params: DevboxDownloadFileParams, options?: Core.RequestOptions) => {
        return this.client.devboxes.downloadFile(this._id, params, options);
      },

      /**
       * Upload a file to the devbox.
       *
       * @param {DevboxUploadFileParams} params - Parameters containing the file path and file to upload
       * @param {Core.RequestOptions} [options] - Request options
       * @returns {Promise<unknown>} Upload result
       */
      upload: async (params: DevboxUploadFileParams, options?: Core.RequestOptions) => {
        return this.client.devboxes.uploadFile(this._id, params, options);
      },
    };
  }

  /**
   * Shutdown the devbox.
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<unknown>} Shutdown result
   */
  async shutdown(options?: Core.RequestOptions) {
    return await this.client.devboxes.shutdown(this._id, options);
  }

  /**
   * Suspend the devbox and create a disk snapshot.
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<unknown>} Suspend result
   */
  async suspend(options?: Core.RequestOptions) {
    return this.client.devboxes.suspend(this._id, options);
  }

  /**
   * Resume a suspended devbox.
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<unknown>} Resume result
   */
  async resume(options?: Core.RequestOptions) {
    return this.client.devboxes.resume(this._id, options);
  }

  /**
   * Send a keep-alive signal to prevent idle shutdown.
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<unknown>} Keep-alive result
   */
  async keepAlive(options?: Core.RequestOptions): Promise<unknown> {
    return this.client.devboxes.keepAlive(this._id, options);
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
   * Network operations on the devbox.
   */
  get net() {
    return {
      /**
       * Create an SSH key for remote access to the devbox.
       * @param {Core.RequestOptions} [options] - Request options
       * @returns {Promise<unknown>} SSH key creation result
       */
      createSSHKey: async (options?: Core.RequestOptions) => {
        return this.client.devboxes.createSSHKey(this._id, options);
      },

      /**
       * Create a tunnel to a port on the devbox.
       * @param {DevboxCreateTunnelParams} params - Tunnel creation parameters
       * @param {Core.RequestOptions} [options] - Request options
       * @returns {Promise<unknown>} Tunnel creation result
       */
      createTunnel: async (params: DevboxCreateTunnelParams, options?: Core.RequestOptions) => {
        return this.client.devboxes.createTunnel(this._id, params, options);
      },

      /**
       * Remove a tunnel from the devbox.
       * @param {DevboxRemoveTunnelParams} params - Tunnel removal parameters
       * @param {Core.RequestOptions} [options] - Request options
       * @returns {Promise<unknown>} Tunnel removal result
       */
      removeTunnel: async (params: DevboxRemoveTunnelParams, options?: Core.RequestOptions) => {
        return this.client.devboxes.removeTunnel(this._id, params, options);
      },
    };
  }
}
