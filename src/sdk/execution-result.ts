import { Runloop } from '../index';
import type { DevboxAsyncExecutionDetailView } from '../resources/devboxes/devboxes';

/**
 * Result object for a completed execution with streaming stdout/stderr support.
 *
 * ## Overview
 *
 * The `ExecutionResult` class provides access to the results of a completed command execution.
 * It includes the exit code, stdout/stderr output, and convenient methods for checking success/failure.
 *
 * ## Usage
 *
 * Execution results are typically obtained from `devbox.cmd.exec()` or `execution.result()`:
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client-ts';
 *
 * const runloop = new RunloopSDK();
 * const devbox = runloop.devbox.fromId('devbox-123');
 *
 * // Get result from synchronous execution
 * const result = await devbox.cmd.exec({ command: 'ls -la' });
 *
 * // Check success
 * if (result.success) {
 *   console.log('Command succeeded!');
 *   console.log(await result.stdout());
 * } else {
 *   console.error(`Command failed with exit code: ${result.exitCode}`);
 *   console.error(await result.stderr());
 * }
 * ```
 *
 * ## Accessing Output
 *
 * ### Get Full Output
 * ```typescript
 * const stdout = await result.stdout();
 * const stderr = await result.stderr();
 * ```
 *
 * ### Get Last N Lines
 * ```typescript
 * // Get last 10 lines of stdout
 * const lastLines = await result.stdout(10);
 *
 * // Get last 5 lines of stderr
 * const errors = await result.stderr(5);
 * ```
 *
 * ## Properties
 *
 * - `exitCode`: The exit code of the command (null if not available)
 * - `success`: Boolean indicating if exit code is 0
 * - `failed`: Boolean indicating if exit code is non-zero
 * - `result`: Raw execution result data
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
   * Helper to get last N lines, filtering out trailing empty strings
   */
  private getLastNLines(text: string, n: number): string {
    if (n <= 0) {
      return '';
    }
    const lines = text.split('\n');
    // Remove trailing empty strings (from trailing newlines)
    while (lines.length > 0 && lines[lines.length - 1] === '') {
      lines.pop();
    }
    return lines.slice(-n).join('\n');
  }

  /**
   * Helper to count non-empty lines (excluding trailing empty strings)
   */
  private countNonEmptyLines(text: string): number {
    const countLines = text.split('\n');
    // Remove trailing empty strings first
    const trimmedLines = [...countLines];
    while (trimmedLines.length > 0 && trimmedLines[trimmedLines.length - 1] === '') {
      trimmedLines.pop();
    }
    // Filter out all empty strings (including those in the middle)
    return trimmedLines.filter((line) => line !== '').length;
  }

  /**
   * Common logic for getting output (stdout or stderr) with optional line limiting
   */
  private async getOutput(
    currentOutput: string,
    isOutputTruncated: boolean,
    numLines: number | undefined,
    streamFn: () => Promise<AsyncIterable<{ output: string }>>,
  ): Promise<string> {
    // If numLines is specified, check if we have enough lines already
    if (numLines !== undefined) {
      const nonEmptyCount = this.countNonEmptyLines(currentOutput);
      if (!isOutputTruncated || nonEmptyCount >= numLines) {
        // We have enough lines, return the last N lines
        return this.getLastNLines(currentOutput, numLines);
      }
    }

    // If output is truncated and we need all lines (or more than available), stream all logs
    if (isOutputTruncated) {
      const stream = await streamFn();
      let output = '';
      for await (const chunk of stream) {
        output += chunk.output;
      }

      // If numLines was specified, return only the last N lines
      if (numLines !== undefined) {
        return this.getLastNLines(output, numLines);
      }
      return output;
    }

    // Output is not truncated, return what we have
    if (numLines !== undefined) {
      return this.getLastNLines(currentOutput, numLines);
    }
    return currentOutput;
  }

  /**
   * Get the stdout output from the execution. If numLines is specified, it will return the last N lines. If numLines is not specified, it will return the entire stdout output.
   * Note after the execution is completed, the stdout is not available anymore.
   *
   * @example
   * ```typescript
   * // Get full stdout
   * const fullOutput = await result.stdout();
   *
   * // Get last 10 lines
   * const lastLines = await result.stdout(10);
   * ```
   *
   * @param {number} [numLines] - Optional number of lines to return from the end (most recent logs)
   * @returns {Promise<string>} The stdout content
   */
  async stdout(numLines?: number): Promise<string> {
    const currentStdout = this._result.stdout ?? '';
    const isOutputTruncated = this._result.stdout_truncated === true;

    return this.getOutput(currentStdout, isOutputTruncated, numLines, () =>
      this.client.devboxes.executions.streamStdoutUpdates(this._devboxId, this._executionId),
    );
  }

  /**
   * Get the stderr output from the execution. If numLines is specified, it will return the last N lines. If numLines is not specified, it will return the entire stderr output.
   * Note after the execution is completed, the stderr is not available anymore.
   *
   * @example
   * ```typescript
   * // Get full stderr
   * const fullErrors = await result.stderr();
   *
   * // Get last 5 lines
   * const recentErrors = await result.stderr(5);
   * ```
   *
   * @param {number} [numLines] - Optional number of lines to guarantee from the end (most recent logs)
   * @returns {Promise<string>} The stderr content
   */
  async stderr(numLines?: number): Promise<string> {
    const currentStderr = this._result.stderr ?? '';
    const isOutputTruncated = this._result.stderr_truncated === true;

    return this.getOutput(currentStderr, isOutputTruncated, numLines, () =>
      this.client.devboxes.executions.streamStderrUpdates(this._devboxId, this._executionId),
    );
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
