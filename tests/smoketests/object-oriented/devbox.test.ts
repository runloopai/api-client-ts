import { RunloopSDK, toFile } from '@runloop/api-client';
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

      // Download the file
      const downloadResponse = await devbox.file.download({ path: '/tmp/test.txt' });
      expect(downloadResponse).toBeDefined();

      // Upload a file
      await devbox.file.upload({
        path: '~/uploaded.txt',
        file: await toFile(Buffer.from('Uploaded content'), 'uploaded.txt'),
      });
      const content2 = await devbox.file.read({ file_path: '~/uploaded.txt' });
      expect(content2).toBe('Uploaded content');
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
      let devbox: Devbox | undefined;
      try {
        devbox = await sdk.devbox.create({
          name: uniqueName('sdk-devbox-retrieve'),
          launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
        });
        expect(devbox.id).toBeTruthy();

        // Retrieve it by ID
        const retrieved = sdk.devbox.fromId(devbox.id);
        expect(retrieved.id).toBe(devbox.id);

        // Clean up
      } finally {
        if (devbox) {
          await devbox.shutdown();
        }
      }
    });
  });

  describe('devbox suspend and resume', () => {
    test('suspend and resume devbox', async () => {
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-suspend'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      });

      // Suspend the devbox
      await devbox.suspend();
      await devbox.awaitSuspended();
      const suspendedInfo = await devbox.getInfo();
      expect(suspendedInfo.status).toBe('suspended');

      // Resume the devbox
      await devbox.resume();
      await devbox.awaitRunning();
      const resumedInfo = await devbox.getInfo();
      expect(resumedInfo.status).toBe('running');

      // Clean up
      await devbox.shutdown();
    });

    test('keep alive', async () => {
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-keepalive'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      });

      // Send keep alive signal
      const result = await devbox.keepAlive();
      expect(result).toBeDefined();

      // Clean up
      await devbox.shutdown();
    });
  });

  describe('devbox networking', () => {
    test('create SSH key', async () => {
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-ssh'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      });

      const sshKey = await devbox.net.createSSHKey();
      expect(sshKey).toBeDefined();

      // Clean up
      await devbox.shutdown();
    });

    test('create and remove tunnel', async () => {
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-tunnel'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      });

      // Create tunnel
      const tunnel = await devbox.net.createTunnel({ port: 8080 });
      expect(tunnel).toBeDefined();

      // Remove tunnel
      await devbox.net.removeTunnel({ port: 8080 });

      // Clean up
      await devbox.shutdown();
    });
  });

  describe('devbox creation from blueprint and snapshot', () => {
    test('create devbox from blueprint', async () => {
      // First create a blueprint
      const blueprint = await sdk.blueprint.create({
        name: uniqueName('sdk-blueprint-for-devbox'),
        dockerfile: 'FROM ubuntu:20.04\nRUN apt-get update && apt-get install -y curl',
      });
      expect(blueprint).toBeDefined();

      // Create devbox from blueprint using SDK method
      const devbox = await sdk.devbox.createFromBlueprint(blueprint.id, {
        name: uniqueName('sdk-devbox-from-blueprint'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });
      expect(devbox).toBeDefined();
      expect(devbox.id).toBeTruthy();

      // Verify it's running
      const info = await devbox.getInfo();
      expect(info.status).toBe('running');

      // Clean up
      await devbox.shutdown();
      await blueprint.delete();
    });

    test('create devbox from snapshot', async () => {
      // First create a devbox
      const sourceDevbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-for-snapshot'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });
      expect(sourceDevbox).toBeDefined();

      // Create a snapshot
      const snapshot = await sourceDevbox.snapshotDisk({
        name: uniqueName('sdk-snapshot-for-devbox'),
        commit_message: 'Test snapshot for devbox creation',
      });
      expect(snapshot).toBeDefined();

      // Create devbox from snapshot using SDK method
      const devbox = await sdk.devbox.createFromSnapshot(snapshot.id, {
        name: uniqueName('sdk-devbox-from-snapshot'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });
      expect(devbox).toBeDefined();
      expect(devbox.id).toBeTruthy();

      // Verify it's running
      const info = await devbox.getInfo();
      expect(info.status).toBe('running');

      // Clean up
      await devbox.shutdown();
      await sourceDevbox.shutdown();
      await snapshot.delete();
    });
  });
});
