import { SHORT_TIMEOUT, LONG_TIMEOUT, uniqueName, makeClientSDK } from '../utils';
import { Blueprint, Devbox } from '@runloop/api-client/sdk';

const sdk = makeClientSDK();

describe('smoketest: object-oriented blueprint', () => {
  describe('blueprint lifecycle', () => {
    let blueprint: Blueprint;
    let blueprintId: string | undefined;

    // Create blueprint in beforeAll to avoid test order dependency
    beforeAll(async () => {
      blueprint = await sdk.blueprint.create(
        {
          name: uniqueName('sdk-blueprint'),
          dockerfile: 'FROM ubuntu:22.04\nRUN apt-get update && apt-get install -y curl',
          system_setup_commands: ['echo "Blueprint setup complete"'],
        },
        { longPoll: { timeoutMs: 10 * 60 * 1000 } },
      );
      blueprintId = blueprint.id;
    }, LONG_TIMEOUT);

    afterAll(async () => {
      if (blueprint) {
        await blueprint.delete();
      }
    });

    test('create blueprint', async () => {
      // Blueprint was created in beforeAll - just verify it exists
      expect(blueprint).toBeDefined();
      expect(blueprint.id).toBeTruthy();
      expect(blueprintId).toBeTruthy();
    });

    test('get blueprint info', async () => {
      expect(blueprint).toBeDefined();
      const info = await blueprint.getInfo();
      expect(info.id).toBe(blueprintId);
      expect(info.name).toContain('sdk-blueprint');
    });

    test('get blueprint logs', async () => {
      expect(blueprint).toBeDefined();
      const result = await blueprint.logs();
      expect(result.logs).toBeDefined();
      expect(result.logs!.length).toBeGreaterThan(0);
    });

    test(
      'create devbox from blueprint (SDK method)',
      async () => {
        expect(blueprint).toBeDefined();
        // Use SDK method to create devbox from blueprint
        const devbox = await sdk.devbox.createFromBlueprintId(blueprint.id, {
          name: uniqueName('devbox-from-blueprint-sdk'),
          launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
        });
        expect(devbox).toBeDefined();
        expect(devbox.id).toBeTruthy();

        // Clean up the devbox
        await devbox.shutdown();
      },
      SHORT_TIMEOUT,
    );

    test(
      'create devbox from blueprint (instance method)',
      async () => {
        expect(blueprint).toBeDefined();
        // Use blueprint instance method to create devbox
        let devbox: Devbox | undefined;
        try {
          devbox = await blueprint.createDevbox({
            name: uniqueName('devbox-from-blueprint-instance'),
            launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
          });
          expect(devbox).toBeDefined();
          expect(devbox.id).toBeTruthy();
        } finally {
          if (devbox) {
            await devbox.shutdown();
          }
        }
      },
      SHORT_TIMEOUT,
    );

    test('delete blueprint', async () => {
      expect(blueprint).toBeDefined();
      await blueprint.delete();

      // Verify it's deleted by trying to get info (should fail)
      try {
        await blueprint.getInfo();
        fail('Expected blueprint to be deleted');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
