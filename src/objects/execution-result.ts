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
   * Helper to get last N lines, filtering out trailing empty strings
   */
  private getLastNLines(text: string, n: number): string {
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
    const lines = text.split('\n');
    // Remove trailing empty strings first
    const trimmedLines = [...lines];
    while (trimmedLines.length > 0 && trimmedLines[trimmedLines.length - 1] === '') {
      trimmedLines.pop();
    }
    return trimmedLines.length;
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
   * @param numLines - Optional number of lines to return from the end (most recent logs)
   * @returns The stdout content
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
   * @param numLines - Optional number of lines to guarantee from the end (most recent logs)
   * @returns The stderr content
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
