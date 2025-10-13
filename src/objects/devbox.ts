import type { Runloop } from '../index';
import type * as Core from '../core';
import type {
  DevboxView,
  DevboxCreateParams,
  DevboxAsyncExecutionDetailView,
  DevboxExecutionDetailView,
} from '../resources/devboxes/devboxes';
import { PollingOptions } from '../lib/polling';

/**
 * Object-oriented interface for working with Devboxes.
 *
 * Example usage:
 * ```typescript
 * const devbox = await Devbox.create(client, { name: 'my-devbox' });
 * const result = await devbox.exec('echo "Hello World"');
 * const contents = await devbox.file.read('myfile.txt');
 * await devbox.file.write('output.txt', 'Hello World');
 * await devbox.shutdown();
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
   * @param client - The Runloop API client
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
    return new Devbox(client, devboxData);
  }

  /**
   * Load an existing Devbox by ID.
   *
   * @param client - The Runloop API client
   * @param id - The devbox ID
   * @param options - Request options
   * @returns A Devbox instance
   */
  static async get(client: Runloop, id: string, options?: Core.RequestOptions): Promise<Devbox> {
    const devboxData = await client.devboxes.retrieve(id, options);
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
   * @param command - The command to execute
   * @param shellName - Optional persistent shell name
   * @param options - Request options with optional polling configuration
   * @returns Execution result with stdout, stderr, and exit status
   */
  async exec(
    command: string,
    shellName?: string,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxAsyncExecutionDetailView>> },
  ): Promise<DevboxAsyncExecutionDetailView> {
    return this.client.devboxes.executeAndAwaitCompletion(
      this.devboxData.id,
      { command, shell_name: shellName ?? null },
      options,
    );
  }

  /**
   * Execute a command asynchronously without waiting for completion.
   *
   * @param command - The command to execute
   * @param shellName - Optional persistent shell name
   * @param options - Request options
   * @returns Execution details with execution_id for tracking
   */
  async execAsync(
    command: string,
    shellName?: string,
    options?: Core.RequestOptions,
  ): Promise<DevboxAsyncExecutionDetailView> {
    return this.client.devboxes.executeAsync(
      this.devboxData.id,
      { command, shell_name: shellName ?? null },
      options,
    );
  }

  /**
   * Execute a command synchronously (deprecated - use exec instead).
   *
   * @deprecated Use exec() instead
   */
  async execSync(
    command: string,
    shellName?: string,
    options?: Core.RequestOptions,
  ): Promise<DevboxExecutionDetailView> {
    return this.client.devboxes.executeSync(
      this.devboxData.id,
      { command, shell_name: shellName ?? null },
      options,
    );
  }

  /**
   * File operations on the devbox.
   */
  get file() {
    return {
      /**
       * Read file contents from the devbox as a UTF-8 string.
       *
       * @param path - The file path relative to user home directory
       * @param options - Request options
       * @returns File contents as a string
       */
      read: async (path: string, options?: Core.RequestOptions): Promise<string> => {
        return this.client.devboxes.readFileContents(this.devboxData.id, { file_path: path }, options);
      },

      /**
       * Write UTF-8 string contents to a file on the devbox.
       *
       * @param path - The file path relative to user home directory
       * @param contents - The contents to write
       * @param options - Request options
       * @returns Execution result
       */
      write: async (
        path: string,
        contents: string,
        options?: Core.RequestOptions,
      ): Promise<DevboxExecutionDetailView> => {
        return this.client.devboxes.writeFileContents(
          this.devboxData.id,
          { file_path: path, contents },
          options,
        );
      },

      /**
       * Download file contents (supports binary files).
       *
       * @param path - The file path relative to user home directory
       * @param options - Request options
       * @returns Response with file contents
       */
      download: async (path: string, options?: Core.RequestOptions) => {
        return this.client.devboxes.downloadFile(this.devboxData.id, { path }, options);
      },

      /**
       * Upload a file to the devbox.
       *
       * @param path - The destination path relative to user home directory
       * @param file - The file to upload
       * @param options - Request options
       */
      upload: async (path: string, file: Core.Uploadable, options?: Core.RequestOptions) => {
        return this.client.devboxes.uploadFile(this.devboxData.id, { path, file }, options);
      },
    };
  }

  /**
   * Shutdown the devbox.
   */
  async shutdown(options?: Core.RequestOptions): Promise<DevboxView> {
    this.devboxData = await this.client.devboxes.shutdown(this.devboxData.id, options);
    return this.devboxData;
  }

  /**
   * Suspend the devbox and create a disk snapshot.
   */
  async suspend(options?: Core.RequestOptions): Promise<DevboxView> {
    this.devboxData = await this.client.devboxes.suspend(this.devboxData.id, options);
    return this.devboxData;
  }

  /**
   * Resume a suspended devbox.
   */
  async resume(options?: Core.RequestOptions): Promise<DevboxView> {
    this.devboxData = await this.client.devboxes.resume(this.devboxData.id, options);
    return this.devboxData;
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
  async snapshotDisk(name?: string, metadata?: { [key: string]: string }, options?: Core.RequestOptions) {
    return this.client.devboxes.snapshotDisk(
      this.devboxData.id,
      { name: name ?? null, metadata: metadata ?? null },
      options,
    );
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
  async createTunnel(port: number, options?: Core.RequestOptions) {
    return this.client.devboxes.createTunnel(this.devboxData.id, { port }, options);
  }

  /**
   * Remove a tunnel from the devbox.
   */
  async removeTunnel(port: number, options?: Core.RequestOptions) {
    return this.client.devboxes.removeTunnel(this.devboxData.id, { port }, options);
  }

  /**
   * Access to the underlying devboxes API resource for advanced operations.
   */
  get api() {
    return this.client.devboxes;
  }
}
