import { Runloop } from '../index';
import type * as Core from '../core';
import type { DevboxAsyncExecutionDetailView } from '../resources/devboxes/devboxes';
import type { PollingOptions } from '../lib/polling';
import { ExecutionResult } from './execution-result';

/**
 * Execution object for tracking async command execution with streaming support.
 */
export class Execution {
  private client: Runloop;
  private _devboxId: string;
  private _executionId: string;
  private _initialResult: DevboxAsyncExecutionDetailView;
  private _streamingPromise?: Promise<void>;

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
   * Send input to the execution's stdin.
   *
   * @param input - The input to send
   * @param options - Request options
   */
  async sendStdIn(input: string, options?: Core.RequestOptions): Promise<void> {
    await this.client.devboxes.executions.sendStdIn(
      this._devboxId,
      this._executionId,
      { text: input },
      options,
    );
  }

  /**
   * Wait for the execution to complete and return the result.
   * If streaming callbacks were provided, also waits for all streams to finish.
   *
   * @param options - Request options with optional polling configuration
   * @returns ExecutionResult with stdout, stderr, and exit code
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
   */
  async getState(options?: Core.RequestOptions): Promise<DevboxAsyncExecutionDetailView> {
    return this.client.devboxes.executions.retrieve(this._devboxId, this._executionId, options);
  }

  /**
   * Kill the execution if it's still running.
   *
   * @param options - Request options
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
