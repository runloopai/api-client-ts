import { RunloopSDK } from '@runloop/api-client';
import { Devbox, Execution } from '@runloop/api-client/objects';
import { makeClient, uniqueName } from '../utils';

const client = makeClient();
const sdk = new RunloopSDK({
  bearerToken: process.env['RUNLOOP_API_KEY'],
  baseURL: process.env['RUNLOOP_BASE_URL'],
  timeout: 120_000,
  maxRetries: 1,
});

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
    });

    test('check execution status', async () => {
      expect(execution).toBeDefined();
      const status = await execution.status();
      expect(status).toBeDefined();
      expect(status.status).toBeTruthy();
    });

    test('wait for execution completion', async () => {
      expect(execution).toBeDefined();
      const result = await execution.result();
      expect(result).toBeDefined();
      expect(result.exitCode).toBe(0);

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

    test('start execution with stdin enabled', async () => {
      expect(devbox).toBeDefined();
      execution = await devbox.cmd.execAsync({
        command: 'cat',
        attach_stdin: true,
      });
      expect(execution).toBeDefined();
      expect(execution.executionId).toBeTruthy();
    });

    test('send input to execution', async () => {
      expect(execution).toBeDefined();
      await execution.sendStdIn('Hello from stdin!\n');

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
    });

    test('handle execution with stderr output', async () => {
      expect(devbox).toBeDefined();
      const result = await devbox.cmd.exec({
        command: 'echo "Error message" >&2',
      });
      expect(result).toBeDefined();
      expect(result.exitCode).toBe(0);

      const stderr = await result.stderr();
      expect(stderr).toContain('Error message');
    });
  });
});
