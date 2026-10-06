import { makeClientSDK, uniqueName, MEDIUM_TIMEOUT } from '../utils';
import { NotFoundError, type Secret } from '@runloop/api-client';

const sdk = makeClientSDK();

describe('smoketest: object-oriented secrets', () => {
  test(
    'secret lifecycle through name and ID handles',
    async () => {
      const name = `sec_${uniqueName('SDK_TEST_SECRET').replace(/-/g, '_')}`;
      const secret = await sdk.secret.create({ name, value: 'synthetic-initial' });
      expect(secret.name).toBe(name);
      expect(secret.id).toMatch(/^sec_/);
      const ids = [secret.id!];
      try {
        const named = sdk.secret.fromName(name);
        expect(named.id).toBeUndefined();
        const info = await named.getInfo();
        expect(info.id).toBe(secret.id);
        expect(info.create_time_ms).toBeGreaterThan(0);
        const updated = await sdk.secret.update(secret, { value: 'synthetic-ops' });
        expect(updated.name).toBe(name);
        expect((await updated.getInfo()).update_time_ms).toBeGreaterThanOrEqual(info.create_time_ms);
        expect(await secret.update({ value: 'synthetic-name' })).toBe(secret);
        expect((await sdk.secret.list()).some((item) => item.id === secret.id)).toBe(true);
        expect((await sdk.secret.list({ limit: 5 })).length).toBeGreaterThan(0);

        const exact = sdk.secret.fromId(secret.id!);
        expect((await exact.getInfo()).name).toBe(name);
        expect((await exact.update({ value: 'synthetic-id' })).id).toBe(exact.id);
        expect((await exact.delete()).id).toBe(exact.id);
        const replacement = await sdk.secret.create({ name, value: 'synthetic-replacement' });
        expect(replacement.id).toBeDefined();
        ids.push(replacement.id!);
        expect(replacement.id).not.toBe(exact.id);
        // The original wrapper still follows its name, not its captured ID.
        expect((await secret.getInfo()).id).toBe(replacement.id);
        expect(secret.id).toBe(exact.id);
        await expect(exact.getInfo()).rejects.toBeInstanceOf(NotFoundError);
        await expect(exact.update({ value: 'must-not-update-replacement' })).rejects.toBeInstanceOf(
          NotFoundError,
        );
        await expect(exact.delete()).rejects.toBeInstanceOf(NotFoundError);
        expect((await secret.delete()).id).toBe(replacement.id);
        expect((await sdk.secret.list()).some((item) => item.name === name)).toBe(false);
      } finally {
        await Promise.all(
          ids.map(async (id) => {
            try {
              await sdk.secret.fromId(id).delete();
            } catch (error) {
              if (!(error instanceof NotFoundError)) throw error;
            }
          }),
        );
      }
    },
    MEDIUM_TIMEOUT,
  );

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

    test.concurrent(
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
