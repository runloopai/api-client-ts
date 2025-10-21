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

  constructor(
    client: Runloop,
    devboxId: string,
    executionId: string,
    initialResult: DevboxAsyncExecutionDetailView,
  ) {
    this.client = client;
    this._devboxId = devboxId;
    this._executionId = executionId;
    this._initialResult = initialResult;
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
   *
   * @param options - Request options with optional polling configuration
   * @returns ExecutionResult with stdout, stderr, and exit code
   */
  async result(
    options?: Core.RequestOptions & {
      polling?: Partial<PollingOptions<DevboxAsyncExecutionDetailView>>;
    },
  ): Promise<ExecutionResult> {
    // Use the existing waitForCommand method to poll for completion
    const finalResult = await this.client.devboxes.waitForCommand(
      this._devboxId,
      this._executionId,
      { statuses: ['completed'] },
      options,
    );

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
