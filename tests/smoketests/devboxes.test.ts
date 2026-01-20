import { DevboxView } from '@runloop/api-client/resources/devboxes';
import { makeClient, SHORT_TIMEOUT, uniqueName } from './utils';

const client = makeClient();

describe('smoketest: devboxes', () => {
  /**
   * Test the lifecycle of a devbox. These tests are dependent on each other to save time.
   */
  describe('devbox lifecycle', () => {
    let devboxId: string | undefined;

    afterAll(async () => {
      if (devboxId) {
        await client.devboxes.shutdown(devboxId);
      }
    });

    test(
      'create devbox',
      async () => {
        let devbox: DevboxView | undefined;
        try {
          devbox = await client.devboxes.create({
            name: uniqueName('smoke-devbox'),
            launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
          });
          expect(devbox?.id).toBeTruthy();
        } finally {
          if (devbox) {
            await client.devboxes.shutdown(devbox.id);
          }
        }
      },
      SHORT_TIMEOUT,
    );

    test('await running (createAndAwaitRunning)', async () => {
      const created = await client.devboxes.createAndAwaitRunning(
        {
          name: uniqueName('smoketest-devbox2'),
          launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
        },
        {
          polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: 20 * 60 * 1000 },
        },
      );
      expect(created.status).toBe('running');
      devboxId = created.id;
    });

    test('list devboxes', async () => {
      const page = await client.devboxes.list({ limit: 10 });
      expect(Array.isArray(page.devboxes)).toBe(true);
      expect(page.devboxes.length).toBeGreaterThan(0);
    });

    test('retrieve devbox', async () => {
      expect(devboxId).toBeTruthy();
      const view = await client.devboxes.retrieve(devboxId!);
      expect(view.id).toBe(devboxId);
    });

    test('shutdown devbox', async () => {
      expect(devboxId).toBeTruthy();
      const view = await client.devboxes.shutdown(devboxId!);
      expect(view.id).toBe(devboxId);
      expect(view.status).toBe('shutdown');
    });
  });

  test(
    'createAndAwaitRunning long set up',
    async () => {
      // createAndAwaitRunning should poll until devbox is running
      const created = await client.devboxes.createAndAwaitRunning(
        {
          name: uniqueName('smoketest-devbox-await-running-long-set-up'),
          launch_parameters: { launch_commands: ['sleep 70'] },
        },
        {
          polling: { pollingIntervalMs: 5_000, timeoutMs: 80 * 1000 },
        },
      );
      expect(created.status).toBe('running');
    },
    SHORT_TIMEOUT * 4,
  );

  test(
    'createAndAwaitRunning timeout',
    async () => {
      // Fail via exhausting attempts quickly instead of wall-clock timeout
      await expect(
        client.devboxes.createAndAwaitRunning(
          {
            name: uniqueName('smoketest-devbox-await-running-timeout'),
            launch_parameters: { launch_commands: ['sleep 70'], keep_alive_time_seconds: 30 },
          },
          {
            polling: { initialDelayMs: 0, pollingIntervalMs: 100, maxAttempts: 1 },
          },
        ),
      ).rejects.toThrow();
    },
    SHORT_TIMEOUT * 4,
  );
});
