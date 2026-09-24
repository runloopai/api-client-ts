import { Runloop } from '../index';
import type * as Core from '../core';
import { RunloopError } from '../error';
import type { DevboxAsyncExecutionDetailView, DevboxSendStdInResult } from '../resources/devboxes/devboxes';
import type { ExecutionSendStdInParams } from '../resources/devboxes/executions';
import { longPollUntil, resolveLongPollTimeoutMs, type LongPollRequestOptions } from '../lib/polling';
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

  /**
   * Send input to the execution's stdin. The execution must have been started with `attach_stdin: true`.
   *
   * @example
   * ```typescript
   * const execution = await devbox.cmd.execAsync('cat', { attach_stdin: true });
   * await execution.sendStdIn('Hello from stdin!\n');
   * await execution.closeStdIn();
   * const result = await execution.result();
   * ```
   *
   * @param {string} input - The text to write to stdin
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<void>} Promise that resolves once the input has been delivered
   * @throws {RunloopError} If the API reports that the input was not delivered
   */
  async sendStdIn(input: string, options?: Core.RequestOptions): Promise<void> {
    await this.sendStdInRequest({ text: input }, options);
  }

  /**
   * Close the execution's stdin by sending EOF, so commands that read until end of input can finish.
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<void>} Promise that resolves once EOF has been delivered
   * @throws {RunloopError} If the API reports that EOF was not delivered
   */
  async closeStdIn(options?: Core.RequestOptions): Promise<void> {
    await this.sendStdInRequest({ signal: 'EOF' }, options);
  }

  private async sendStdInRequest(
    body: ExecutionSendStdInParams,
    options?: Core.RequestOptions,
  ): Promise<void> {
    // executions.sendStdIn() would treat `{ signal: 'EOF' }` as RequestOptions (its `signal` key collides
    // with the AbortSignal option) and drop the body, so post to the endpoint directly.
    const response = await this.client.post<unknown, DevboxSendStdInResult>(
      `/v1/devboxes/${this._devboxId}/executions/${this._executionId}/send_std_in`,
      { ...options, body },
    );
    if (!response.success) {
      throw new RunloopError(`Failed to send stdin to execution ${this._executionId}`);
    }
  }

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
   * @param {LongPollRequestOptions<DevboxAsyncExecutionDetailView>} [options] - Request options with optional long-poll configuration
   * @returns {Promise<ExecutionResult>} {@link ExecutionResult} with stdout, stderr, and exit code
   */
  async result(options?: LongPollRequestOptions<DevboxAsyncExecutionDetailView>): Promise<ExecutionResult> {
    const effectiveTimeoutMs = resolveLongPollTimeoutMs(options);
    const { longPoll: _lp, polling: _p, ...requestOptions } = options ?? {};

    const commandPromise = longPollUntil(
      (signal) =>
        this.client.devboxes.waitForCommand(
          this._devboxId,
          this._executionId,
          { statuses: ['completed'] },
          {
            ...requestOptions,
            signal,
            // Per-request HTTP timeout must exceed the server's max long-poll hold (25s)
            // so the server's 408 always arrives before the client aborts the connection.
            // The longPollUntil AbortSignal enforces the caller's actual deadline.
            timeout: 600000,
            // Disable base-client retries so 408s surface immediately to longPollUntil
            // (the server's wait_for_status endpoint sets x-should-retry: true for executions).
            maxRetries: 0,
          },
        ),
      {
        timeoutMs: effectiveTimeoutMs,
        shouldStop: (result) => result.status === 'completed',
        signal: requestOptions.signal,
      },
    );

    // Wait for both command completion and streaming to finish (using allSettled for robustness)
    const results = await Promise.allSettled([commandPromise, this._streamingPromise || Promise.resolve()]);

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
