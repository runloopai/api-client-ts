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
   * Get the stdout output from the execution. If numLines is specified, it will return the last N lines. If numLines is not specified, it will return the entire stdout output.
   * Note after the execution is completed, the stdout is not available anymore.
   *
   * @param numLines - Optional number of lines to return from the end (most recent logs)
   * @returns The stdout content
   */
  async stdout(numLines?: number): Promise<string> {
    const currentStdout = this._result.stdout ?? '';
    const isOutputTruncated = (this._result as any).stdout_truncated === true;

    // Helper to get last N lines, filtering out trailing empty strings
    const getLastNLines = (text: string, n: number): string => {
      const lines = text.split('\n');
      // Remove trailing empty strings (from trailing newlines)
      while (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop();
      }
      return lines.slice(-n).join('\n');
    };

    // If numLines is specified, check if we have enough lines already
    if (numLines !== undefined) {
      const currentLines = currentStdout.split('\n');
      // Count non-empty lines (excluding trailing empty strings)
      // Remove trailing empty strings first
      const trimmedLines = [...currentLines];
      while (trimmedLines.length > 0 && trimmedLines[trimmedLines.length - 1] === '') {
        trimmedLines.pop();
      }
      const nonEmptyCount = trimmedLines.length;
      if (!isOutputTruncated || nonEmptyCount >= numLines) {
        // We have enough lines, return the last N lines
        return getLastNLines(currentStdout, numLines);
      }
    }

    // If output is truncated and we need all lines (or more than available), stream all logs
    if (isOutputTruncated) {
      const stream = await this.client.devboxes.executions.streamStdoutUpdates(
        this._devboxId,
        this._executionId,
      );
      let stdout = '';
      for await (const chunk of stream) {
        stdout += chunk.output;
      }

      // If numLines was specified, return only the last N lines
      if (numLines !== undefined) {
        return getLastNLines(stdout, numLines);
      }
      return stdout;
    }

    // Output is not truncated, return what we have
    if (numLines !== undefined) {
      return getLastNLines(currentStdout, numLines);
    }
    return currentStdout;
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
    const isOutputTruncated = (this._result as any).stderr_truncated === true;

    // Helper to get last N lines, filtering out trailing empty strings
    const getLastNLines = (text: string, n: number): string => {
      const lines = text.split('\n');
      // Remove trailing empty strings (from trailing newlines)
      while (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop();
      }
      return lines.slice(-n).join('\n');
    };

    // If numLines is specified, check if we have enough lines already
    if (numLines !== undefined) {
      const currentLines = currentStderr.split('\n');
      // Count non-empty lines (excluding trailing empty strings)
      // Remove trailing empty strings first
      const trimmedLines = [...currentLines];
      while (trimmedLines.length > 0 && trimmedLines[trimmedLines.length - 1] === '') {
        trimmedLines.pop();
      }
      const nonEmptyCount = trimmedLines.length;
      if (!isOutputTruncated || nonEmptyCount >= numLines) {
        // We have enough lines, return the last N lines
        return getLastNLines(currentStderr, numLines);
      }
    }

    // If output is truncated and we need all lines (or more than available), stream all logs
    if (isOutputTruncated) {
      const stream = await this.client.devboxes.executions.streamStderrUpdates(
        this._devboxId,
        this._executionId,
      );
      let stderr = '';
      for await (const chunk of stream) {
        stderr += chunk.output;
      }

      // If numLines was specified, return only the last N lines
      if (numLines !== undefined) {
        return getLastNLines(stderr, numLines);
      }
      return stderr;
    }

    // Output is not truncated, return what we have
    if (numLines !== undefined) {
      return getLastNLines(currentStderr, numLines);
    }
    return currentStderr;
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
