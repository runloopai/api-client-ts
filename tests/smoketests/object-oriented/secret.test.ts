import { makeClientSDK, uniqueName, MEDIUM_TIMEOUT } from '../utils';
import type { Secret } from '@runloop/api-client';

const sdk = makeClientSDK();

describe('smoketest: object-oriented secrets', () => {
  describe('secret lifecycle', () => {
    let secretName: string;
    let createdSecret: Secret | undefined;
    let createTimeMs: number;

    beforeAll(async () => {
      secretName = uniqueName('SDK_TEST_SECRET').toUpperCase().replace(/-/g, '_');
    });

    afterAll(async () => {
      if (createdSecret) {
        try {
          await createdSecret.delete();
        } catch {
          // Already deleted or doesn't exist, ignore
        }
      }
    });

    test('create secret', async () => {
      createdSecret = await sdk.secret.create({
        name: secretName,
        value: 'test-secret-value',
      });

      expect(createdSecret).toBeDefined();
      expect(createdSecret.name).toBe(secretName);

      const info = await createdSecret.getInfo();
      expect(info.id).toMatch(/^sec_/);
      expect(info.create_time_ms).toBeGreaterThan(0);
      createTimeMs = info.create_time_ms;
    });

    test('update secret via SecretOps', async () => {
      const updated = await sdk.secret.update(createdSecret!, {
        value: 'updated-secret-value',
      });

      expect(updated).toBeDefined();
      expect(updated.name).toBe(secretName);

      const info = await updated.getInfo();
      expect(info.update_time_ms).toBeGreaterThanOrEqual(createTimeMs);
    });

    test('update secret via instance method', async () => {
      const updated = await createdSecret!.update({
        value: 'updated-again-value',
      });

      expect(updated).toBeDefined();
      expect(updated.name).toBe(secretName);
    });

    test('list secrets', async () => {
      const secrets = await sdk.secret.list();

      expect(Array.isArray(secrets)).toBe(true);
      expect(secrets.length).toBeGreaterThan(0);

      const found = secrets.find((s) => s.name === secretName);
      expect(found).toBeDefined();
      expect(found?.name).toBe(secretName);
    });

    test('list secrets with limit', async () => {
      const secrets = await sdk.secret.list({ limit: 5 });

      expect(Array.isArray(secrets)).toBe(true);
      expect(secrets.length).toBeLessThanOrEqual(5);
    });

    test('fromName creates Secret without API call', () => {
      const secret = sdk.secret.fromName(secretName);
      expect(secret).toBeDefined();
      expect(secret.name).toBe(secretName);
    });

    test('delete secret', async () => {
      const deleted = await createdSecret!.delete();

      expect(deleted).toBeDefined();
      expect(deleted.name).toBe(secretName);

      createdSecret = undefined;

      const secrets = await sdk.secret.list();
      const found = secrets.find((s) => s.name === secretName);
      expect(found).toBeUndefined();
    });
  });

  describe('secret with devbox integration', () => {
    let secret: Secret;
    let devboxId: string | undefined;

    beforeAll(async () => {
      const secretName = uniqueName('SDK_DEVBOX_SECRET').toUpperCase().replace(/-/g, '_');

      secret = await sdk.secret.create({
        name: secretName,
        value: 'secret-for-devbox-test',
      });
    });

    afterAll(async () => {
      if (devboxId) {
        try {
          await sdk.devbox.fromId(devboxId).shutdown();
        } catch {
          // Already shut down, ignore
        }
      }

      try {
        await secret.delete();
      } catch {
        // Already deleted, ignore
      }
    });

    test(
      'devbox can access injected secret as env var',
      async () => {
        const devbox = await sdk.devbox.create({
          name: uniqueName('secret-test-devbox'),
          secrets: {
            MY_SECRET_VAR: secret,
          },
          launch_parameters: {
            resource_size_request: 'X_SMALL',
            keep_alive_time_seconds: 60,
          },
        });
        devboxId = devbox.id;

        const result = await devbox.cmd.exec('echo $MY_SECRET_VAR');
        const stdout = await result.stdout();

        expect(result.exitCode).toBe(0);
        expect(stdout.trim()).toBe('secret-for-devbox-test');
      },
      MEDIUM_TIMEOUT,
    );
  });
});
