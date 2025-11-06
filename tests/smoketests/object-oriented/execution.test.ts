import { Devbox, Execution } from '@runloop/api-client/objects';
import { makeClientSDK, uniqueName } from '../utils';

const sdk = makeClientSDK();

describe('smoketest: object-oriented execution', () => {
  describe('execution lifecycle', () => {
    let devbox: Devbox;
    let execution: Execution;

    beforeAll(async () => {
      // Create a devbox first
      devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-execution'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      });
      expect(devbox).toBeDefined();
    });

    afterAll(async () => {
      if (execution) {
        await execution.kill();
      }
      if (devbox) {
        await devbox.shutdown();
      }
    });

    test('start asynchronous execution', async () => {
      expect(devbox).toBeDefined();
      execution = await devbox.cmd.execAsync({
        command: 'sleep 5 && echo "Execution completed successfully"',
      });
      expect(execution).toBeDefined();
      expect(execution.executionId).toBeTruthy();
      expect(execution.devboxId).toBeTruthy();
      expect(execution.devboxId).toBe(devbox.id);
    });

    test('check execution status', async () => {
      expect(execution).toBeDefined();
      const status = await execution.getState();
      expect(status).toBeDefined();
      expect(status.status).toBeTruthy();
    });

    test('wait for execution completion', async () => {
      expect(execution).toBeDefined();
      const result = await execution.result();
      expect(result).toBeDefined();
      expect(result.exitCode).toBe(0);
      expect(result.success).toBe(true);
      expect(result.failed).toBe(false);
      expect(result.result).toBeDefined();

      const output = await result.stdout();
      expect(output).toContain('Execution completed successfully');
    });

    test('get execution result after completion', async () => {
      expect(execution).toBeDefined();
      const result = await execution.result();
      expect(result).toBeDefined();
      expect(result.exitCode).toBe(0);

      const output = await result.stdout();
      expect(output).toContain('Execution completed successfully');
    });
  });

  describe('execution with stdin', () => {
    let devbox: Devbox;
    let execution: Execution;

    beforeAll(async () => {
      // Create a devbox first
      devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-execution-stdin'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      });
      expect(devbox).toBeDefined();
    });

    afterAll(async () => {
      if (execution) {
        await execution.kill();
      }
      if (devbox) {
        await devbox.shutdown();
      }
    });

    test.skip('start execution with stdin enabled', async () => {
      expect(devbox).toBeDefined();
      execution = await devbox.cmd.execAsync({
        command: 'cat',
        attach_stdin: true,
      });
      expect(execution).toBeDefined();
      expect(execution.executionId).toBeTruthy();
      expect((await execution.getState()).status).toBe('running');
    });

    test.skip('send input to execution', async () => {
      expect(execution).toBeDefined();
      expect((await execution.getState()).status).toBe('running');
      try {
        //await execution.sendStdIn('Hello from stdin!\n');
      } catch (error) {
        console.error('Error sending input to execution:', error);
      }

      // Wait a bit for the input to be processed
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Kill the execution to get the result
      await execution.kill();

      const result = await execution.result();
      expect(result).toBeDefined();

      const output = await result.stdout();
      expect(output).toContain('Hello from stdin!');
    });
  });

  describe('execution error handling', () => {
    let devbox: Devbox;
    let execution: Execution;

    beforeAll(async () => {
      // Create a devbox first
      devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-execution-error'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      });
      expect(devbox).toBeDefined();
    });

    afterAll(async () => {
      if (devbox) {
        await devbox.shutdown();
      }
    });

    test('handle execution with non-zero exit code', async () => {
      expect(devbox).toBeDefined();
      execution = await devbox.cmd.execAsync({
        command: 'exit 42',
      });
      expect(execution).toBeDefined();

      const result = await execution.result();
      expect(result).toBeDefined();
      expect(result.exitCode).toBe(42);
      expect(result.success).toBe(false);
      expect(result.failed).toBe(true);
    });

    test('handle execution with stderr output', async () => {
      expect(devbox).toBeDefined();
      // Generate 1000 lines to stderr to test large output handling
      const result = await devbox.cmd.exec({
        command: 'for i in {1..1000}; do echo "Error message $i" >&2; done',
      });
      expect(result).toBeDefined();
      expect(result.exitCode).toBe(0);

      // Get all stderr output
      const allStderr = await result.stderr();
      expect(allStderr).toBeDefined();
      expect(typeof allStderr).toBe('string');

      // Verify it contains expected error messages
      expect(allStderr).toContain('Error message 1');
      expect(allStderr).toContain('Error message 1000');

      // Get last 10 lines to test numLines parameter
      const last10Lines = await result.stderr(10);
      const last10LinesArray = last10Lines.split('\n').filter((line) => line.trim().length > 0);

      // Should contain the last error messages
      expect(last10Lines).toContain('Error message 1000');
      expect(last10LinesArray.length).toBeGreaterThanOrEqual(1);

      // Verify it's the last lines, not the first (check actual error numbers)
      const errorNumbers = last10LinesArray
        .map((line) => {
          const match = line.match(/Error message (\d+)/);
          return match && match[1] ? parseInt(match[1], 10) : null;
        })
        .filter((num): num is number => num !== null);
      expect(errorNumbers.length).toBeGreaterThan(0);
      expect(Math.min(...errorNumbers)).toBeGreaterThanOrEqual(991);
      expect(Math.max(...errorNumbers)).toBeLessThanOrEqual(1000);
    });

    test('handle execution with no output', async () => {
      expect(devbox).toBeDefined();
      const result = await devbox.cmd.exec({
        command: 'true', // Command that produces no output
      });
      expect(result).toBeDefined();
      expect(result.exitCode).toBe(0);

      const stdout = await result.stdout();
      const stderr = await result.stderr();
      // These should return empty strings or handle null gracefully
      expect(typeof stdout).toBe('string');
      expect(typeof stderr).toBe('string');
    });
  });

  describe('execution output with numLines', () => {
    let devbox: Devbox;

    beforeAll(async () => {
      // Create a devbox first
      devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-execution-numlines'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      });
      expect(devbox).toBeDefined();
    });

    afterAll(async () => {
      if (devbox) {
        await devbox.shutdown();
      }
    });

    test('get last N lines from stdout', async () => {
      expect(devbox).toBeDefined();
      // Generate output with multiple lines
      const result = await devbox.cmd.exec({
        command: 'for i in {1..10}; do echo "Line $i"; done',
      });
      expect(result).toBeDefined();
      expect(result.exitCode).toBe(0);

      // Get all stdout
      const allStdout = await result.stdout();
      expect(allStdout).toContain('Line 1');
      expect(allStdout).toContain('Line 10');

      // Get last 3 lines
      const last3Lines = await result.stdout(3);
      const lines = last3Lines.split('\n').filter((line) => line.trim().length > 0);
      // Should have exactly 3 lines
      expect(lines.length).toBeGreaterThanOrEqual(3);
      // Must contain all last 3 lines
      expect(last3Lines).toContain('Line 10');
      expect(last3Lines).toContain('Line 9');
      expect(last3Lines).toContain('Line 8');
      // Should not contain earlier lines (check actual line numbers, not substrings)
      const lineNumbers = lines
        .map((line) => {
          const match = line.match(/Line (\d+)/);
          return match && match[1] ? parseInt(match[1], 10) : null;
        })
        .filter((num): num is number => num !== null);
      expect(lineNumbers.length).toBeGreaterThan(0);
      expect(Math.min(...lineNumbers)).toBeGreaterThanOrEqual(8);
      expect(Math.max(...lineNumbers)).toBeLessThanOrEqual(10);
    });

    test('get last N lines from stderr', async () => {
      expect(devbox).toBeDefined();
      // Generate stderr output with multiple lines
      const result = await devbox.cmd.exec({
        command: 'for i in {1..10}; do echo "Error $i" >&2; done',
      });
      expect(result).toBeDefined();
      expect(result.exitCode).toBe(0);

      // Get all stderr
      const allStderr = await result.stderr();
      expect(allStderr).toContain('Error 1');
      expect(allStderr).toContain('Error 10');

      // Get last 3 lines
      const last3Lines = await result.stderr(3);
      // Must contain all last 3 lines
      expect(last3Lines).toContain('Error 10');
      expect(last3Lines).toContain('Error 9');
      expect(last3Lines).toContain('Error 8');
      // Should not contain earlier errors (check actual error numbers, not substrings)
      const errorLines = last3Lines.split('\n').filter((line) => line.trim().length > 0);
      const errorNumbers = errorLines
        .map((line) => {
          const match = line.match(/Error (\d+)/);
          return match && match[1] ? parseInt(match[1], 10) : null;
        })
        .filter((num): num is number => num !== null);
      expect(errorNumbers.length).toBeGreaterThan(0);
      expect(Math.min(...errorNumbers)).toBeGreaterThanOrEqual(8);
      expect(Math.max(...errorNumbers)).toBeLessThanOrEqual(10);
    });

    test('get last 1 line (most recent)', async () => {
      expect(devbox).toBeDefined();
      const result = await devbox.cmd.exec({
        command: 'echo "First line"; echo "Second line"; echo "Last line"',
      });
      expect(result).toBeDefined();
      expect(result.exitCode).toBe(0);

      // Get all output first to verify it exists
      const allOutput = await result.stdout();
      expect(allOutput).toContain('Last line');

      const lastLine = await result.stdout(1);
      // Should contain the last line (might have trailing newline)
      expect(lastLine.trim()).toContain('Last line');
      expect(lastLine).not.toContain('First line');
      expect(lastLine).not.toContain('Second line');
    });

    test('get all lines when numLines exceeds available lines', async () => {
      expect(devbox).toBeDefined();
      const result = await devbox.cmd.exec({
        command: 'echo "Line 1"; echo "Line 2"',
      });
      expect(result).toBeDefined();
      expect(result.exitCode).toBe(0);

      // Request more lines than available
      const output = await result.stdout(100);
      expect(output).toContain('Line 1');
      expect(output).toContain('Line 2');
    });

    test('get last N lines from both stdout and stderr', async () => {
      expect(devbox).toBeDefined();
      const result = await devbox.cmd.exec({
        command: 'for i in {1..5}; do echo "Out $i"; echo "Err $i" >&2; done',
      });
      expect(result).toBeDefined();
      expect(result.exitCode).toBe(0);

      const last2Stdout = await result.stdout(2);
      const last2Stderr = await result.stderr(2);

      // Verify stdout contains last 2 lines
      expect(last2Stdout).toContain('Out 5');
      expect(last2Stdout).toContain('Out 4');
      // Check actual line numbers to avoid substring matches
      const stdoutLines = last2Stdout.split('\n').filter((line) => line.trim().length > 0);
      const stdoutNumbers = stdoutLines
        .map((line) => {
          const match = line.match(/Out (\d+)/);
          return match && match[1] ? parseInt(match[1], 10) : null;
        })
        .filter((num): num is number => num !== null);
      expect(stdoutNumbers.length).toBeGreaterThan(0);
      expect(Math.min(...stdoutNumbers)).toBeGreaterThanOrEqual(4);
      expect(Math.max(...stdoutNumbers)).toBeLessThanOrEqual(5);

      // Verify stderr contains last 2 lines
      expect(last2Stderr).toContain('Err 5');
      expect(last2Stderr).toContain('Err 4');
      const stderrLines = last2Stderr.split('\n').filter((line) => line.trim().length > 0);
      const stderrNumbers = stderrLines
        .map((line) => {
          const match = line.match(/Err (\d+)/);
          return match && match[1] ? parseInt(match[1], 10) : null;
        })
        .filter((num): num is number => num !== null);
      expect(stderrNumbers.length).toBeGreaterThan(0);
      expect(Math.min(...stderrNumbers)).toBeGreaterThanOrEqual(4);
      expect(Math.max(...stderrNumbers)).toBeLessThanOrEqual(5);
    });

    test('handle truncated output with last N lines', async () => {
      expect(devbox).toBeDefined();
      // Generate 1000 lines to trigger truncation
      const result = await devbox.cmd.exec({
        command: 'for i in {1..1000}; do echo "Line $i"; done',
      });
      expect(result).toBeDefined();
      expect(result.exitCode).toBe(0);

      // Check if output was truncated (it should be with 1000 lines)
      const allStdout = await result.stdout();
      const allLines = allStdout.split('\n').filter((line) => line.trim().length > 0);

      // If truncated, we should get fewer than 1000 lines initially
      // Try to get last 10 lines - should work whether truncated or not
      const last10Lines = await result.stdout(10);
      const last10LinesArray = last10Lines.split('\n').filter((line) => line.trim().length > 0);

      // Should contain the last line
      expect(last10Lines).toContain('Line 1000');
      expect(last10LinesArray.length).toBeGreaterThanOrEqual(1); // At least 1 line

      // If we got all lines (not truncated), verify we have the last lines
      if (allLines.length >= 1000) {
        expect(last10LinesArray.length).toBeLessThanOrEqual(10);
        // Should contain lines 991-1000
        expect(last10Lines).toContain('Line 991');
        expect(last10Lines).toContain('Line 1000');
        // Check actual line numbers to avoid substring matches
        const lineNumbers = last10LinesArray
          .map((line) => {
            const match = line.match(/Line (\d+)/);
            return match && match[1] ? parseInt(match[1], 10) : null;
          })
          .filter((num): num is number => num !== null);
        expect(lineNumbers.length).toBeGreaterThan(0);
        expect(Math.min(...lineNumbers)).toBeGreaterThanOrEqual(991);
        expect(Math.max(...lineNumbers)).toBeLessThanOrEqual(1000);
      } else {
        // Truncated case - verify we still get the last available lines
        expect(last10LinesArray.length).toBeLessThanOrEqual(allLines.length);
      }
    });

    test('handle truncated stderr with last N lines', async () => {
      expect(devbox).toBeDefined();
      // Generate 1000 lines to stderr to trigger truncation
      const result = await devbox.cmd.exec({
        command: 'for i in {1..1000}; do echo "Error $i" >&2; done',
      });
      expect(result).toBeDefined();
      expect(result.exitCode).toBe(0);

      // Get last 10 lines from stderr
      const last10Lines = await result.stderr(10);
      const last10LinesArray = last10Lines.split('\n').filter((line) => line.trim().length > 0);

      // Should contain the last error
      expect(last10Lines).toContain('Error 1000');
      expect(last10LinesArray.length).toBeGreaterThanOrEqual(1);

      // Verify it's the last lines, not the first (check actual error numbers)
      const errorNumbers = last10LinesArray
        .map((line) => {
          const match = line.match(/Error (\d+)/);
          return match && match[1] ? parseInt(match[1], 10) : null;
        })
        .filter((num): num is number => num !== null);
      expect(errorNumbers.length).toBeGreaterThan(0);
      expect(Math.min(...errorNumbers)).toBeGreaterThanOrEqual(991);
      expect(Math.max(...errorNumbers)).toBeLessThanOrEqual(1000);
    });
  });
});
