import { Runloop } from '../index';
import type * as Core from '../core';
import type { DevboxAsyncExecutionDetailView } from '../resources/devboxes/devboxes';
import type { PollingOptions } from '../lib/polling';
import { ExecutionResult } from './execution-result';

/**
 * Execution object for tracking async command execution with streaming support.
 *
 * @category Execution Types
 *
 * @remarks
 * ## Overview
 *
 * The `Execution` class represents an asynchronous command execution on a devbox.
 * It provides methods to track the execution state, wait for completion, and control
 * the execution (e.g., kill it if needed).
 *
 * ## Quickstart
 *
 * Executions are typically created via `devbox.cmd.execAsync()`:
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client-ts';
 *
 * const runloop = new RunloopSDK();
 * const devbox = runloop.devbox.fromId('devbox-123');
 *
 * // Start async execution with streaming
 * const execution = await devbox.cmd.execAsync('npx http-server -p 8080', {
 *   stdout: (line) => console.log(`[LOG] ${line}`),
 *   stderr: (line) => console.error(`[ERROR] ${line}`),
 * });
 *
 * // Do other work while command runs...
 *
 * // End the process early
 * const excution.kill();
 * ```
 *
 */
export class Execution {
  private client: Runloop;
  private _devboxId: string;
  private _executionId: string;
  private _initialResult: DevboxAsyncExecutionDetailView;
  private _streamingPromise?: Promise<void>;

  /**
   * @private
   */
  constructor(
    client: Runloop,
    devboxId: string,
    executionId: string,
    initialResult: DevboxAsyncExecutionDetailView,
    streamingPromise?: Promise<void>,
  ) {
    this.client = client;
    this._devboxId = devboxId;
    this._executionId = executionId;
    this._initialResult = initialResult;
    if (streamingPromise) {
      this._streamingPromise = streamingPromise;
    }
  }

  // Doesn't work as expected, the execution is killed when the stdin is sent.
  // /**
  //  * Send input to the execution's stdin.
  //  *
  //  * @param input - The input to send
  //  * @param options - Request options
  //  */
  // async sendStdIn(input: string, options?: Core.RequestOptions): Promise<void> {
  //   await this.client.devboxes.executions.sendStdIn(
  //     this._devboxId,
  //     this._executionId,
  //     { text: input },
  //     options,
  //   );
  // }

  /**
   * Wait for the execution to complete and return the result.
   * If streaming callbacks were provided, also waits for all streams to finish.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const devbox = runloop.devbox.fromId('devbox-123');
   * const execution = await devbox.cmd.execAsync('npm install');
   *
   * // Other work while command runs...
   *
   * const result = await execution.result();
   *
   * if (result.success) {
   *   console.log('Installation successful!');
   *   console.log(await result.stdout());
   * } else {
   *   console.error('Installation failed:', await result.stderr());
   * }
   * ```
   *
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<DevboxAsyncExecutionDetailView>> }} [options] - Request options with optional polling configuration
   * @returns {Promise<ExecutionResult>} {@link ExecutionResult} with stdout, stderr, and exit code
   */
  async result(
    options?: Core.RequestOptions & {
      polling?: Partial<PollingOptions<DevboxAsyncExecutionDetailView>>;
    },
  ): Promise<ExecutionResult> {
    // Wait for both command completion and streaming to finish (using allSettled for robustness)
    const results = await Promise.allSettled([
      this.client.devboxes.waitForCommand(
        this._devboxId,
        this._executionId,
        { statuses: ['completed'] },
        options,
      ),
      this._streamingPromise || Promise.resolve(),
    ]);

    // Extract command result (throw if it failed, ignore streaming errors)
    if (results[0].status === 'rejected') {
      throw results[0].reason;
    }
    const finalResult = results[0].value;

    return new ExecutionResult(this.client, this._devboxId, this._executionId, finalResult);
  }

  /**
   * Get the current state of the execution.
   *
   * @example
   * ```typescript
   * const execution = await devbox.cmd.execAsync('npx http-server -p 8080');
   * const state = await execution.getState();
   * console.log(`Status: ${state.status}`);
   * ```
   */
  async getState(options?: Core.RequestOptions): Promise<DevboxAsyncExecutionDetailView> {
    return this.client.devboxes.executions.retrieve(this._devboxId, this._executionId, options);
  }

  /**
   * Kill the execution if it's still running.
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<void>} Promise that resolves when the execution is killed
   */
  async kill(options?: Core.RequestOptions): Promise<void> {
    await this.client.devboxes.executions.kill(this._devboxId, this._executionId, options);
  }

  /**
   * Get the execution ID.
   */
  get executionId(): string {
    return this._executionId;
  }

  /**
   * Get the devbox ID.
   */
  get devboxId(): string {
    return this._devboxId;
  }
}
