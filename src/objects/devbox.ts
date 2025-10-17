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
} from '../resources/devboxes/devboxes';
import { PollingOptions } from '../lib/polling';
import { Snapshot } from './snapshot';
import { Execution } from './execution';
import { ExecutionResult } from './execution-result';

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
   * Create a Devbox instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * @param client - The Runloop client instance
   * @param id - The devbox ID
   * @param options - Request options
   * @returns A Devbox instance
   */
  static fromId(client: Runloop, id: string, options?: Core.RequestOptions): Devbox {
    return new Devbox(client, id);
  }

  /**
   * Get the devbox ID.
   */
  get id(): string {
    return this._id;
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
       *
       * @param params - Parameters containing the command and optional shell name
       * @param options - Request options with optional polling configuration
       * @returns ExecutionResult with stdout, stderr, and exit status
       */
      exec: async (
        params: DevboxExecuteParams,
        options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxAsyncExecutionDetailView>> },
      ): Promise<ExecutionResult> => {
        const result = await this.client.devboxes.executeAndAwaitCompletion(this._id, params, options);
        return new ExecutionResult(this.client, this._id, result.execution_id, result);
      },

      /**
       * Execute a command asynchronously without waiting for completion.
       *
       * @param params - Parameters containing the command and optional shell name
       * @param options - Request options
       * @returns Execution object for tracking and controlling the command
       */
      execAsync: async (
        params: DevboxExecuteAsyncParams,
        options?: Core.RequestOptions,
      ): Promise<Execution> => {
        const execution = await this.client.devboxes.executeAsync(this._id, params, options);
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
   * Create a disk snapshot of the devbox.
   */
  async snapshotDisk(params?: DevboxSnapshotDiskParams, options?: Core.RequestOptions): Promise<Snapshot> {
    const snapshotData = await this.client.devboxes.snapshotDiskAsync(this._id, params, options);
    const snapshot = Snapshot.fromId(this.client, snapshotData.id);
    await snapshot.awaitCompleted();
    return snapshot;
  }

  /**
   * Create a disk snapshot of the devbox.
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
