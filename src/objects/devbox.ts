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
import { ObjectCreateOptions, ObjectOptions } from './types';

/**
 * Object-oriented interface for working with Devboxes.
 *
 * Example usage:
 * ```typescript
 * // Set default client (optional, can be done once at app startup)
 * Runloop.setDefaultClient(new Runloop({ bearerToken: 'your-token' }));
 *
 * // Use with default client
 * const devbox = await Devbox.create({ name: 'my-devbox' });
 *
 * // Or provide custom client
 * const devbox = await Devbox.create(
 *   { name: 'my-devbox' },
 *   { client: customClient }
 * );
 *
 * const result = await devbox.exec({ command: 'echo "Hello World"' });
 * const contents = await devbox.file.read({ file_path: 'myfile.txt' });
 * await devbox.file.write({ file_path: 'output.txt', contents: 'Hello World' });
 *
 * // Lifecycle methods return the devbox instance for chaining
 * await devbox.suspend().then(d => d.resume()).then(d => d.shutdown());
 * ```
 */
export class Devbox {
  private client: Runloop;
  private devboxData: DevboxView;

  private constructor(client: Runloop, devboxData: DevboxView) {
    this.client = client;
    this.devboxData = devboxData;
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
    options?: ObjectCreateOptions<DevboxView>,
  ): Promise<Devbox>;
  /**
   * Create a new Devbox and wait for it to reach the running state.
   * This is the recommended way to create a devbox as it ensures it's ready to use.
   *
   * @param client - The Runloop API client
   * @param params - Parameters for creating the devbox
   * @param options - Request options with optional polling configuration
   * @returns A Devbox instance in the running state
   */
  static async create(
    client: Runloop,
    params?: DevboxCreateParams,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<Devbox>;
  static async create(
    clientOrParams?: Runloop | DevboxCreateParams,
    paramsOrOptions?: DevboxCreateParams | ObjectCreateOptions<DevboxView>,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> },
  ): Promise<Devbox> {
    let client: Runloop;
    let params: DevboxCreateParams | undefined;
    let requestOptions: (Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxView>> }) | undefined;

    // Handle overloaded signatures
    if (clientOrParams && typeof clientOrParams === 'object' && 'bearerToken' in clientOrParams) {
      // Old signature: create(client, params, options)
      client = clientOrParams;
      params = paramsOrOptions as DevboxCreateParams | undefined;
      requestOptions = options;
    } else {
      // New signature: create(params, options)
      const opts = paramsOrOptions as ObjectCreateOptions<DevboxView> | undefined;
      client = opts?.client || Runloop.getDefaultClient();
      params = clientOrParams as DevboxCreateParams | undefined;
      requestOptions = opts;
    }

    const devboxData = await client.devboxes.createAndAwaitRunning(params, requestOptions);
    return new Devbox(client, devboxData);
  }

  /**
   * Load an existing Devbox by ID.
   *
   * @param id - The devbox ID
   * @param options - Request options with optional client override
   * @returns A Devbox instance
   */
  static async get(id: string, options?: ObjectOptions): Promise<Devbox>;
  /**
   * Load an existing Devbox by ID.
   *
   * @param client - The Runloop API client
   * @param id - The devbox ID
   * @param options - Request options
   * @returns A Devbox instance
   */
  static async get(client: Runloop, id: string, options?: Core.RequestOptions): Promise<Devbox>;
  static async get(
    clientOrId: Runloop | string,
    idOrOptions?: string | ObjectOptions,
    options?: Core.RequestOptions,
  ): Promise<Devbox> {
    let client: Runloop;
    let id: string;
    let requestOptions: Core.RequestOptions | undefined;

    // Handle overloaded signatures
    if (typeof clientOrId === 'string') {
      // New signature: get(id, options)
      const opts = idOrOptions as ObjectOptions | undefined;
      client = opts?.client || Runloop.getDefaultClient();
      id = clientOrId;
      requestOptions = opts;
    } else {
      // Old signature: get(client, id, options)
      client = clientOrId;
      id = idOrOptions as string;
      requestOptions = options;
    }

    const devboxData = await client.devboxes.retrieve(id, requestOptions);
    return new Devbox(client, devboxData);
  }

  /**
   * Get the devbox ID.
   */
  get id(): string {
    return this.devboxData.id;
  }

  /**
   * Get the current devbox status.
   */
  get status(): DevboxView['status'] {
    return this.devboxData.status;
  }

  /**
   * Get the complete devbox data.
   */
  get data(): DevboxView {
    return this.devboxData;
  }

  /**
   * Refresh the devbox data from the API.
   */
  async refresh(options?: Core.RequestOptions): Promise<void> {
    this.devboxData = await this.client.devboxes.retrieve(this.devboxData.id, options);
  }

  /**
   * Execute a command on the devbox and wait for it to complete.
   *
   * @param params - Parameters containing the command and optional shell name
   * @param options - Request options with optional polling configuration
   * @returns Execution result with stdout, stderr, and exit status
   */
  async exec(
    params: DevboxExecuteParams,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxAsyncExecutionDetailView>> },
  ): Promise<DevboxAsyncExecutionDetailView> {
    return this.client.devboxes.execute(this.devboxData.id, params, options);
  }

  /**
   * Execute a command asynchronously without waiting for completion.
   *
   * @param params - Parameters containing the command and optional shell name
   * @param options - Request options
   * @returns Execution details with execution_id for tracking
   */
  async execAsync(
    params: DevboxExecuteAsyncParams,
    options?: Core.RequestOptions,
  ): Promise<DevboxAsyncExecutionDetailView> {
    return this.client.devboxes.executeAsync(this.devboxData.id, params, options);
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
        return this.client.devboxes.readFileContents(this.devboxData.id, params, options);
      },

      /**
       * Write UTF-8 string contents to a file on the devbox.
       *
       * @param params - Parameters containing the file path and contents
       * @param options - Request options
       * @returns Execution result
       */
      write: async (params: DevboxWriteFileContentsParams, options?: Core.RequestOptions) => {
        return this.client.devboxes.writeFileContents(this.devboxData.id, params, options);
      },

      /**
       * Download file contents (supports binary files).
       *
       * @param params - Parameters containing the file path
       * @param options - Request options
       * @returns Response with file contents
       */
      download: async (params: DevboxDownloadFileParams, options?: Core.RequestOptions) => {
        return this.client.devboxes.downloadFile(this.devboxData.id, params, options);
      },

      /**
       * Upload a file to the devbox.
       *
       * @param params - Parameters containing the file path and file to upload
       * @param options - Request options
       */
      upload: async (params: DevboxUploadFileParams, options?: Core.RequestOptions) => {
        return this.client.devboxes.uploadFile(this.devboxData.id, params, options);
      },
    };
  }

  /**
   * Shutdown the devbox.
   */
  async shutdown(options?: Core.RequestOptions): Promise<Devbox> {
    this.devboxData = await this.client.devboxes.shutdown(this.devboxData.id, options);
    return this;
  }

  /**
   * Suspend the devbox and create a disk snapshot.
   */
  async suspend(options?: Core.RequestOptions): Promise<Devbox> {
    this.devboxData = await this.client.devboxes.suspend(this.devboxData.id, options);
    return this;
  }

  /**
   * Resume a suspended devbox.
   */
  async resume(options?: Core.RequestOptions): Promise<Devbox> {
    this.devboxData = await this.client.devboxes.resume(this.devboxData.id, options);
    return this;
  }

  /**
   * Send a keep-alive signal to prevent idle shutdown.
   */
  async keepAlive(options?: Core.RequestOptions): Promise<unknown> {
    return this.client.devboxes.keepAlive(this.devboxData.id, options);
  }

  /**
   * Create a disk snapshot of the devbox.
   */
  async snapshotDisk(params?: DevboxSnapshotDiskParams, options?: Core.RequestOptions) {
    return this.client.devboxes.snapshotDisk(this.devboxData.id, params, options);
  }

  /**
   * Create an SSH key for remote access to the devbox.
   */
  async createSSHKey(options?: Core.RequestOptions) {
    return this.client.devboxes.createSSHKey(this.devboxData.id, options);
  }

  /**
   * Create a tunnel to a port on the devbox.
   */
  async createTunnel(params: DevboxCreateTunnelParams, options?: Core.RequestOptions) {
    return this.client.devboxes.createTunnel(this.devboxData.id, params, options);
  }

  /**
   * Remove a tunnel from the devbox.
   */
  async removeTunnel(params: DevboxRemoveTunnelParams, options?: Core.RequestOptions) {
    return this.client.devboxes.removeTunnel(this.devboxData.id, params, options);
  }
}
