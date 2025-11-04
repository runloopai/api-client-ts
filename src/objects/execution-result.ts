import { Runloop } from '../index';
import type { DevboxAsyncExecutionDetailView } from '../resources/devboxes/devboxes';

/**
 * Result object for a completed execution with streaming stdout/stderr support.
 */
export class ExecutionResult {
  private client: Runloop;
  private _devboxId: string;
  private _executionId: string;
  private _result: DevboxAsyncExecutionDetailView;

  constructor(
    client: Runloop,
    devboxId: string,
    executionId: string,
    result: DevboxAsyncExecutionDetailView,
  ) {
    this.client = client;
    this._devboxId = devboxId;
    this._executionId = executionId;
    this._result = result;
  }

  /**
   * Get the exit code of the execution.
   */
  get exitCode(): number | null {
    return this._result.exit_status ?? null;
  }

  /**
   * Get the stdout output from the execution.
   *
   * @param numLines - Optional number of lines to return (for future pagination support)
   * @returns The stdout content
   */
  async stdout(numLines?: number): Promise<string> {
    //if(this._result.)
    // For now, just return the stdout from the result
    // In the future, this will support pagination when output is truncated
    return this._result.stdout ?? '';
  }

  /**
   * Get the stderr output from the execution.
   *
   * @param numLines - Optional number of lines to return (for future pagination support)
   * @returns The stderr content
   */
  async stderr(numLines?: number): Promise<string> {
    // For now, just return the stderr from the result
    // In the future, this will collecting all of the stderr output until the execution completes. If output is truncated, it will return the truncated output.
    return this._result.stderr ?? '';
  }

  /**
   * Get the raw execution result.
   */
  get result(): DevboxAsyncExecutionDetailView {
    return this._result;
  }

  /**
   * Check if the execution completed successfully (exit code 0).
   */
  get success(): boolean {
    return this.exitCode === 0;
  }

  /**
   * Check if the execution failed (non-zero exit code).
   */
  get failed(): boolean {
    return this.exitCode !== null && this.exitCode !== 0;
  }
}
