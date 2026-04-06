import { DevboxView, TunnelView } from '@runloop/api-client/resources/devboxes';
import { makeClient, SHORT_TIMEOUT, uniqueName } from './utils';

const client = makeClient();

describe('smoketest: devboxes', () => {
  /**
   * Test V2 tunnel functionality.
   */
  describe('devbox tunnels', () => {
    test.concurrent(
      'create devbox with tunnel in create params',
      async () => {
        let devbox: DevboxView | undefined;
        try {
          devbox = await client.devboxes.createAndAwaitRunning(
            {
              name: uniqueName('smoke-devbox-tunnel-create'),
              launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
              tunnel: { auth_mode: 'open' },
            },
            {
              longPoll: { timeoutMs: 20 * 60 * 1000 },
            },
          );

          expect(devbox.id).toBeTruthy();
          expect(devbox.status).toBe('running');

          expect(devbox.tunnel).toBeDefined();
          expect(devbox.tunnel?.tunnel_key).toBeTruthy();
          expect(devbox.tunnel?.auth_mode).toBe('open');
        } finally {
          if (devbox) {
            await client.devboxes.shutdown(devbox.id);
          }
        }
      },
      SHORT_TIMEOUT,
    );

    test.concurrent(
      'create devbox with authenticated tunnel in create params (deprecated polling path)',
      async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
          if (typeof args[0] === 'string' && args[0].includes('[runloop-api-client]')) return;
          process.stderr.write(`console.warn: ${args.join(' ')}\n`);
        });
        let devbox: DevboxView | undefined;
        try {
          devbox = await client.devboxes.createAndAwaitRunning(
            {
              name: uniqueName('smoke-devbox-tunnel-auth'),
              launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
              tunnel: { auth_mode: 'authenticated' },
            },
            {
              polling: { timeoutMs: 20 * 60 * 1000 },
            },
          );

          expect(devbox.id).toBeTruthy();
          expect(devbox.status).toBe('running');

          expect(devbox.tunnel).toBeDefined();
          expect(devbox.tunnel?.tunnel_key).toBeTruthy();
          expect(devbox.tunnel?.auth_mode).toBe('authenticated');
          expect(devbox.tunnel?.auth_token).toBeTruthy();
        } finally {
          warnSpy.mockRestore();
          if (devbox) {
            await client.devboxes.shutdown(devbox.id);
          }
        }
      },
      SHORT_TIMEOUT,
    );

    test.concurrent(
      'create devbox then enable tunnel',
      async () => {
        let devbox: DevboxView | undefined;
        try {
          devbox = await client.devboxes.createAndAwaitRunning(
            {
              name: uniqueName('smoke-devbox-enable-tunnel'),
              launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
            },
            {
              longPoll: { timeoutMs: 20 * 60 * 1000 },
            },
          );

          expect(devbox.id).toBeTruthy();
          expect(devbox.status).toBe('running');

          expect(devbox.tunnel).toBeFalsy();

          const tunnel: TunnelView = await client.devboxes.enableTunnel(devbox.id, { auth_mode: 'open' });

          expect(tunnel).toBeDefined();
          expect(tunnel.tunnel_key).toBeTruthy();
          expect(tunnel.auth_mode).toBe('open');
          expect(tunnel.create_time_ms).toBeTruthy();

          const updatedDevbox = await client.devboxes.retrieve(devbox.id);
          expect(updatedDevbox.tunnel).toBeDefined();
          expect(updatedDevbox.tunnel?.tunnel_key).toBe(tunnel.tunnel_key);
        } finally {
          if (devbox) {
            await client.devboxes.shutdown(devbox.id);
          }
        }
      },
      SHORT_TIMEOUT,
    );

    test.concurrent(
      'create devbox then enable authenticated tunnel',
      async () => {
        let devbox: DevboxView | undefined;
        try {
          // Create devbox without tunnel
          devbox = await client.devboxes.createAndAwaitRunning(
            {
              name: uniqueName('smoke-devbox-enable-auth-tunnel'),
              launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
            },
            {
              longPoll: { timeoutMs: 20 * 60 * 1000 },
            },
          );

          expect(devbox.id).toBeTruthy();
          expect(devbox.status).toBe('running');

          const tunnel: TunnelView = await client.devboxes.enableTunnel(devbox.id, {
            auth_mode: 'authenticated',
          });

          expect(tunnel).toBeDefined();
          expect(tunnel.tunnel_key).toBeTruthy();
          expect(tunnel.auth_mode).toBe('authenticated');
          expect(tunnel.auth_token).toBeTruthy();
        } finally {
          if (devbox) {
            await client.devboxes.shutdown(devbox.id);
          }
        }
      },
      SHORT_TIMEOUT,
    );
  });
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

    test.concurrent(
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

    test('await running (createAndAwaitRunning, deprecated polling path)', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
          if (typeof args[0] === 'string' && args[0].includes('[runloop-api-client]')) return;
          process.stderr.write(`console.warn: ${args.join(' ')}\n`);
        });
      try {
        const created = await client.devboxes.createAndAwaitRunning(
          {
            name: uniqueName('smoketest-devbox2'),
            launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
          },
          {
            polling: { timeoutMs: 20 * 60 * 1000 },
          },
        );
        expect(created.status).toBe('running');
        devboxId = created.id;
      } finally {
        warnSpy.mockRestore();
      }
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

  test.concurrent(
    'createAndAwaitRunning long set up',
    async () => {
      // createAndAwaitRunning should poll until devbox is running
      const created = await client.devboxes.createAndAwaitRunning(
        {
          name: uniqueName('smoketest-devbox-await-running-long-set-up'),
          launch_parameters: { launch_commands: ['sleep 70'] },
        },
        {
          longPoll: { timeoutMs: 80 * 1000 },
        },
      );
      expect(created.status).toBe('running');
    },
    SHORT_TIMEOUT * 4,
  );

  test.concurrent(
    'createAndAwaitRunning timeout (deprecated polling path)',
    async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
          if (typeof args[0] === 'string' && args[0].includes('[runloop-api-client]')) return;
          process.stderr.write(`console.warn: ${args.join(' ')}\n`);
        });
      try {
        await expect(
          client.devboxes.createAndAwaitRunning(
            {
              name: uniqueName('smoketest-devbox-await-running-timeout'),
              launch_parameters: { launch_commands: ['sleep 70'], keep_alive_time_seconds: 30 },
            },
            {
              polling: { timeoutMs: 100 },
            },
          ),
        ).rejects.toThrow();
      } finally {
        warnSpy.mockRestore();
      }
    },
    SHORT_TIMEOUT * 4,
  );
});
