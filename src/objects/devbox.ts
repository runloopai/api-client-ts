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
 * Extended execution parameters with optional streaming callbacks.
 * Callbacks are invoked in real-time as logs are produced.
 */
export interface DevboxExecuteParamsWithCallbacks extends DevboxExecuteParams {
  /** Callback invoked for each stdout log line */
  stdout?: (line: string) => void;
  /** Callback invoked for each stderr log line */
  stderr?: (line: string) => void;
  /** Callback invoked for all log lines (both stdout and stderr) */
  output?: (line: string) => void;
}

/**
 * Extended async execution parameters with optional streaming callbacks.
 * Callbacks are invoked in real-time as logs are produced.
 */
export interface DevboxExecuteAsyncParamsWithCallbacks extends DevboxExecuteAsyncParams {
  /** Callback invoked for each stdout log line */
  stdout?: (line: string) => void;
  /** Callback invoked for each stderr log line */
  stderr?: (line: string) => void;
  /** Callback invoked for all log lines (both stdout and stderr) */
  output?: (line: string) => void;
}

/**
 * Object-oriented interface for working with Devboxes.
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
   * @param client - The Runloop client instance
   * @param params - Parameters for creating the devbox
   * @param options - Request options with optional polling configuration
   * @returns A Devbox instance in the running state
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
   * @param client - The Runloop client instance
   * @param blueprintId - The blueprint ID to create from
   * @param params - Additional devbox creation parameters
   * @param options - Request options with optional polling configuration
   * @returns A Devbox instance in the running state
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
   * @param client - The Runloop client instance
   * @param blueprintName - The blueprint name to create from
   * @param params - Additional devbox creation parameters
   * @param options - Request options with optional polling configuration
   * @returns A Devbox instance in the running state
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
   * @param client - The Runloop client instance
   * @param snapshotId - The snapshot ID to create from
   * @param params - Additional devbox creation parameters
   * @param options - Request options with optional polling configuration
   * @returns A Devbox instance in the running state
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
   * @param client - The Runloop client instance
   * @param id - The devbox ID
   * @returns A Devbox instance
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
    callbacks: {
      stdout?: (line: string) => void;
      stderr?: (line: string) => void;
      output?: (line: string) => void;
    },
  ): Promise<void> {
    const streamingPromises: Promise<void>[] = [];

    // Stream stdout if stdout or output callback provided
    if (callbacks.stdout || callbacks.output) {
      const stdoutPromise = (async () => {
        try {
          const stream = await this.client.devboxes.executions.streamStdoutUpdates(this._id, executionId, {});
          for await (const chunk of stream) {
            if (callbacks.stdout) callbacks.stdout(chunk.output);
            if (callbacks.output) callbacks.output(chunk.output);
          }
        } catch (error) {
          // Silently handle streaming errors - don't block execution completion
          console.error('Error streaming stdout:', error);
        }
      })();
      streamingPromises.push(stdoutPromise);
    }

    // Stream stderr if stderr or output callback provided
    if (callbacks.stderr || callbacks.output) {
      const stderrPromise = (async () => {
        try {
          const stream = await this.client.devboxes.executions.streamStderrUpdates(this._id, executionId, {});
          for await (const chunk of stream) {
            if (callbacks.stderr) callbacks.stderr(chunk.output);
            if (callbacks.output) callbacks.output(chunk.output);
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
   */
  async getInfo(options?: Core.RequestOptions): Promise<DevboxView> {
    return this.client.devboxes.retrieve(this._id, options);
  }

  /**
   * Wait for the devbox to reach the running state.
   * Uses optimized server-side polling for better performance.
   *
   * @param options - Request options with optional polling configuration
   * @returns The devbox data when running state is reached
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
   * @param options - Request options with optional polling configuration
   * @returns The devbox data when suspended state is reached
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
       * @param params - Parameters containing the command, optional shell name, and optional callbacks
       * @param options - Request options with optional polling configuration
       * @returns ExecutionResult with stdout, stderr, and exit status
       */
      exec: async (
        params: DevboxExecuteParamsWithCallbacks,
        options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxAsyncExecutionDetailView>> },
      ): Promise<ExecutionResult> => {
        const hasCallbacks = params.stdout || params.stderr || params.output;

        if (hasCallbacks) {
          // With callbacks: use async execution workflow to enable streaming
          const { stdout, stderr, output, ...executeParams } = params;
          const execution = await this.client.devboxes.executeAsync(this._id, executeParams, options);

          // Start streaming and await both completion and streaming
          const callbacks: {
            stdout?: (line: string) => void;
            stderr?: (line: string) => void;
            output?: (line: string) => void;
          } = {};
          if (stdout) callbacks.stdout = stdout;
          if (stderr) callbacks.stderr = stderr;
          if (output) callbacks.output = output;
          const streamingPromise = this.startStreamingWithCallbacks(execution.execution_id, callbacks);

          // Wait for both command completion and streaming to finish
          const [result] = await Promise.all([
            this.client.devboxes.executions.awaitCompleted(this._id, execution.execution_id, options),
            streamingPromise,
          ]);

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
       * Note: Streaming runs independently in the background. Callbacks will continue
       * firing even after calling execution.result(). This allows you to see live logs
       * while the command runs and after it completes.
       *
       * @param params - Parameters containing the command, optional shell name, and optional callbacks
       * @param options - Request options
       * @returns Execution object for tracking and controlling the command
       */
      execAsync: async (
        params: DevboxExecuteAsyncParamsWithCallbacks,
        options?: Core.RequestOptions,
      ): Promise<Execution> => {
        const { stdout, stderr, output, ...executeParams } = params;
        const execution = await this.client.devboxes.executeAsync(this._id, executeParams, options);

        // Start streaming in background if callbacks provided (fire and forget)
        if (stdout || stderr || output) {
          const callbacks: {
            stdout?: (line: string) => void;
            stderr?: (line: string) => void;
            output?: (line: string) => void;
          } = {};
          if (stdout) callbacks.stdout = stdout;
          if (stderr) callbacks.stderr = stderr;
          if (output) callbacks.output = output;
          // Start streaming - it runs independently in the background
          this.startStreamingWithCallbacks(execution.execution_id, callbacks).catch((error) => {
            console.error('Error in background streaming:', error);
          });
        }

        return new Execution(this.client, this._id, execution.execution_id, execution);
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
       * @param params - Parameters containing the file path
       * @param options - Request options
       * @returns File contents as a string
       */
      read: async (params: DevboxReadFileContentsParams, options?: Core.RequestOptions): Promise<string> => {
        return this.client.devboxes.readFileContents(this._id, params, options);
      },

      /**
       * Write UTF-8 string contents to a file on the devbox.
       *
       * @param params - Parameters containing the file path and contents
       * @param options - Request options
       * @returns Execution result
       */
      write: async (params: DevboxWriteFileContentsParams, options?: Core.RequestOptions) => {
        return this.client.devboxes.writeFileContents(this._id, params, options);
      },

      /**
       * Download file contents (supports binary files).
       *
       * @param params - Parameters containing the file path
       * @param options - Request options
       * @returns Response with file contents
       */
      download: async (params: DevboxDownloadFileParams, options?: Core.RequestOptions) => {
        return this.client.devboxes.downloadFile(this._id, params, options);
      },

      /**
       * Upload a file to the devbox.
       *
       * @param params - Parameters containing the file path and file to upload
       * @param options - Request options
       */
      upload: async (params: DevboxUploadFileParams, options?: Core.RequestOptions) => {
        return this.client.devboxes.uploadFile(this._id, params, options);
      },
    };
  }

  /**
   * Shutdown the devbox.
   */
  async shutdown(options?: Core.RequestOptions) {
    return await this.client.devboxes.shutdown(this._id, options);
  }

  /**
   * Suspend the devbox and create a disk snapshot.
   */
  async suspend(options?: Core.RequestOptions) {
    return this.client.devboxes.suspend(this._id, options);
  }

  /**
   * Resume a suspended devbox.
   */
  async resume(options?: Core.RequestOptions) {
    return this.client.devboxes.resume(this._id, options);
  }

  /**
   * Send a keep-alive signal to prevent idle shutdown.
   */
  async keepAlive(options?: Core.RequestOptions): Promise<unknown> {
    return this.client.devboxes.keepAlive(this._id, options);
  }

  /**
   * Create a disk snapshot of the devbox. Returns a snapshot that is completed. If you don't want to block on completion, use snapshotDiskAsync().
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
       */
      createSSHKey: async (options?: Core.RequestOptions) => {
        return this.client.devboxes.createSSHKey(this._id, options);
      },

      /**
       * Create a tunnel to a port on the devbox.
       */
      createTunnel: async (params: DevboxCreateTunnelParams, options?: Core.RequestOptions) => {
        return this.client.devboxes.createTunnel(this._id, params, options);
      },

      /**
       * Remove a tunnel from the devbox.
       */
      removeTunnel: async (params: DevboxRemoveTunnelParams, options?: Core.RequestOptions) => {
        return this.client.devboxes.removeTunnel(this._id, params, options);
      },
    };
  }
}
