import { RunloopSDK } from '@runloop/api-client';
import { Devbox } from '@runloop/api-client/objects';
import { makeClient, THIRTY_SECOND_TIMEOUT, uniqueName } from '../utils';

const client = makeClient();
const sdk = new RunloopSDK({
  bearerToken: process.env['RUNLOOP_API_KEY'],
  baseURL: process.env['RUNLOOP_BASE_URL'],
  timeout: 120_000,
  maxRetries: 1,
});

describe('smoketest: object-oriented devbox', () => {
  describe('devbox lifecycle', () => {
    let devbox: Devbox;
    let devboxId: string | undefined;

    afterAll(async () => {
      if (devbox) {
        await devbox.shutdown();
      }
    });

    test(
      'create devbox',
      async () => {
        devbox = await sdk.devbox.create({
          name: uniqueName('sdk-devbox'),
          launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
        });
        expect(devbox).toBeDefined();
        expect(devbox.id).toBeTruthy();
        devboxId = devbox.id;
      },
      THIRTY_SECOND_TIMEOUT,
    );

    test('get devbox info', async () => {
      expect(devbox).toBeDefined();
      const info = await devbox.getInfo();
      expect(info.id).toBe(devboxId);
      expect(info.name).toContain('sdk-devbox');
    });

    test('execute synchronous command', async () => {
      expect(devbox).toBeDefined();
      const result = await devbox.cmd.exec({ command: 'echo "Hello from SDK!"' });
      expect(result).toBeDefined();
      expect(result.exitCode).toBe(0);
      const output = await result.stdout();
      expect(output).toContain('Hello from SDK!');
    });

    test('execute asynchronous command', async () => {
      expect(devbox).toBeDefined();
      const execution = await devbox.cmd.execAsync({ command: 'sleep 2 && echo "Async command completed"' });
      expect(execution).toBeDefined();
      expect(execution.executionId).toBeTruthy();

      // Wait for completion
      const result = await execution.result();
      expect(result.exitCode).toBe(0);
      const output = await result.stdout();
      expect(output).toContain('Async command completed');
    });

    test('file operations', async () => {
      expect(devbox).toBeDefined();

      // Write a file
      await devbox.file.write({
        file_path: '/tmp/test.txt',
        contents: 'Hello from SDK file operations!',
      });

      // Read the file
      const content = await devbox.file.read({ file_path: '/tmp/test.txt' });
      expect(content).toBe('Hello from SDK file operations!');
    });

    test('shutdown devbox', async () => {
      expect(devbox).toBeDefined();
      const info = await devbox.getInfo();
      expect(info.status).toBe('running');
      await devbox.shutdown();
      const info2 = await devbox.getInfo();
      expect(info2.status).toBe('shutdown');
    });
  });

  describe('devbox list and retrieval', () => {
    test('list devboxes', async () => {
      const devboxes = await sdk.devbox.list({ limit: 10 });
      expect(Array.isArray(devboxes)).toBe(true);
      expect(devboxes.length).toBeGreaterThan(0);
    });

    test('get devbox by ID', async () => {
      // First create a devbox
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-retrieve'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      });
      expect(devbox.id).toBeTruthy();

      // Retrieve it by ID
      const retrieved = await sdk.devbox.fromId(devbox.id);
      expect(retrieved.id).toBe(devbox.id);

      // Clean up
      await devbox.shutdown();
    });
  });
});
