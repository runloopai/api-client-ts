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

/**
 * Object-oriented interface for working with Devboxes.
 *
 * Example usage:
 * ```typescript
 * // Make sure to set RUNLOOP_API_KEY environment variable
 * // export RUNLOOP_API_KEY="your-api-key"
 *
 * const devbox = await Devbox.create({ name: 'my-devbox' });
 *
 * const result = await devbox.cmd.exec({ command: 'echo "Hello World"' });
 * const contents = await devbox.file.read({ file_path: 'myfile.txt' });
 * await devbox.file.write({ file_path: 'output.txt', contents: 'Hello World' });
 * const tunnel = await devbox.net.createTunnel({ port: 3000 });
 *
 * // Get devbox information
 * const info = await devbox.getInfo();
 * console.log(info.status, info.name);
 *
 * // Lifecycle methods return the devbox instance for chaining
 * await devbox.suspend().then(d => d.resume()).then(d => d.shutdown());
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
   * @param params - Parameters for creating the devbox
   * @param options - Request options with optional polling configuration and client override
   * @returns A Devbox instance in the running state
   */
  static async create(
    params?: DevboxCreateParams,
    options?: Core.RequestOptions & { client?: Runloop; polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<Devbox> {
    const client = options?.client || Runloop.getDefaultClient();
    const requestOptions = options;

    const devboxData = await client.devboxes.createAndAwaitRunning(params, requestOptions);
    return new Devbox(client, devboxData.id);
  }

  /**
   * Create a Devbox instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * @param id - The devbox ID
   * @param options - Request options with optional client override
   * @returns A Devbox instance
   */
  static fromId(id: string, options?: Core.RequestOptions & { client?: Runloop }): Devbox {
    const client = options?.client || Runloop.getDefaultClient();
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
   * Command execution operations on the devbox.
   */
  get cmd() {
    return {
      /**
       * Execute a command on the devbox and wait for it to complete.
       *
       * @param params - Parameters containing the command and optional shell name
       * @param options - Request options with optional polling configuration
       * @returns Execution result with stdout, stderr, and exit status
       */
      exec: async (
        params: DevboxExecuteParams,
        options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxAsyncExecutionDetailView>> },
      ): Promise<DevboxAsyncExecutionDetailView> => {
        return this.client.devboxes.execute(this._id, params, options);
      },

      /**
       * Execute a command asynchronously without waiting for completion.
       *
       * @param params - Parameters containing the command and optional shell name
       * @param options - Request options
       * @returns Execution details with execution_id for tracking
       */
      execAsync: async (
        params: DevboxExecuteAsyncParams,
        options?: Core.RequestOptions,
      ): Promise<DevboxAsyncExecutionDetailView> => {
        return this.client.devboxes.executeAsync(this._id, params, options);
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
  async snapshotDisk(params?: DevboxSnapshotDiskParams, options?: Core.RequestOptions) {
    return this.client.devboxes.snapshotDisk(this._id, params, options);
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
