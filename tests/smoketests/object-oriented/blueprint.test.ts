import { THIRTY_SECOND_TIMEOUT, uniqueName, makeClientSDK } from '../utils';
import { Blueprint, Devbox, StorageObject } from '@runloop/api-client/sdk';

const sdk = makeClientSDK();

describe('smoketest: object-oriented blueprint', () => {
  describe('blueprint lifecycle', () => {
    let blueprint: Blueprint;
    let blueprintId: string | undefined;

    afterAll(async () => {
      if (blueprint) {
        await blueprint.delete();
      }
    });

    test(
      'create blueprint',
      async () => {
        blueprint = await sdk.blueprint.create({
          name: uniqueName('sdk-blueprint'),
          dockerfile: 'FROM ubuntu:20.04\nRUN apt-get update && apt-get install -y curl',
          system_setup_commands: ['echo "Blueprint setup complete"'],
        });
        expect(blueprint).toBeDefined();
        expect(blueprint.id).toBeTruthy();
        blueprintId = blueprint.id;
      },
      THIRTY_SECOND_TIMEOUT,
    );

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

    test('create devbox from blueprint (SDK method)', async () => {
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
    });

    test('create devbox from blueprint (instance method)', async () => {
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
    });

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

  describe('blueprint build context with object storage and .dockerignore', () => {
    test(
      'creates blueprint with COPY using object-based build context honoring .dockerignore',
      async () => {
        const fs = require('fs/promises');
        const path = require('path');
        const os = require('os');

        let contextDir: string | undefined;
        let storageObject: StorageObject | undefined;
        let blueprint: Blueprint | undefined;
        let devbox: Devbox | undefined;

        try {
          // Create temporary build context directory
          contextDir = await fs.mkdtemp(path.join(os.tmpdir(), 'runloop-context-'));
          const includedPath = path.join(contextDir, 'included.txt');
          const ignoredPath = path.join(contextDir, 'ignored.txt');
          const dockerignorePath = path.join(contextDir, '.dockerignore');

          await fs.writeFile(includedPath, 'Hello from context');
          await fs.writeFile(ignoredPath, 'This file should be ignored');
          await fs.writeFile(dockerignorePath, 'ignored.txt\n');

          // Upload directory as build context object (tgz)
          if (!contextDir) {
            throw new Error('Context directory not created before uploadFromDir');
          }
          storageObject = await sdk.storageObject.uploadFromDir(contextDir, {
            name: uniqueName('sdk-context-object'),
            ttl_ms: 3600000, // 1 hour
          });

          // Create blueprint that uses the uploaded object as build context
          blueprint = await sdk.blueprint.create({
            name: uniqueName('sdk-blueprint-context'),
            dockerfile: `FROM ubuntu:20.04
WORKDIR /app
COPY . .`,
            build_context: storageObject,
          });

          expect(blueprint).toBeDefined();
          expect(blueprint.id).toBeTruthy();

          // Create devbox from the blueprint and verify copied files
          devbox = await blueprint.createDevbox({
            name: uniqueName('devbox-from-context'),
            launch_parameters: {
              resource_size_request: 'X_SMALL',
              keep_alive_time_seconds: 60 * 5, // 5 minutes
            },
          });

          expect(devbox).toBeDefined();
          expect(devbox.id).toBeTruthy();

          // included.txt should be present
          const includeCheck = await devbox.cmd.exec('test -f /app/included.txt');
          expect(includeCheck.exitCode).toBe(0);

          // Optionally assert content
          const includeContentResult = await devbox.cmd.exec('cat /app/included.txt');
          const includeContent = await includeContentResult.stdout();
          expect(includeContent.trim()).toBe('Hello from context');

          // ignored.txt should be absent due to .dockerignore
          const ignoredCheck = await devbox.cmd.exec('test ! -f /app/ignored.txt');
          expect(ignoredCheck.exitCode).toBe(0);

          // .dockerignore itself should also not be present in the image
          const dockerignoreCheck = await devbox.cmd.exec('test ! -f /app/.dockerignore');
          expect(dockerignoreCheck.exitCode).toBe(0);
        } finally {
          if (devbox) {
            await devbox.shutdown().catch(() => {});
          }
          if (blueprint) {
            await blueprint.delete().catch(() => {});
          }
          if (storageObject) {
            await storageObject.delete().catch(() => {});
          }
          if (contextDir) {
            await fs.rm(contextDir, { recursive: true, force: true }).catch(() => {});
          }
        }
      },
      THIRTY_SECOND_TIMEOUT * 2,
    );
  });

  describe('blueprint list and retrieval', () => {
    test('list blueprints', async () => {
      const blueprints = await sdk.blueprint.list({ limit: 10 });
      expect(Array.isArray(blueprints)).toBe(true);
    });

    test('get blueprint by ID', async () => {
      // First create a blueprint
      let blueprint: Blueprint | undefined;
      try {
        blueprint = await sdk.blueprint.create({
          name: uniqueName('sdk-blueprint-retrieve'),
          dockerfile: 'FROM ubuntu:20.04',
        });
        expect(blueprint?.id).toBeTruthy();

        // Retrieve it byID
        const retrieved = sdk.blueprint.fromId(blueprint.id);
        expect(retrieved.id).toBe(blueprint.id);
      } finally {
        if (blueprint) {
          await blueprint.delete();
        }
      }
    });
  });
});
