import { makeClientSDK, LONG_TIMEOUT, uniqueName } from '../utils';

const sdk = makeClientSDK();

describe('smoketest: object-oriented devbox', () => {
  describe('devbox creation from blueprint and snapshot', () => {
    test.concurrent(
      'create devbox from blueprint ID',
      async () => {
        // First create a blueprint with extended long-poll timeout
        const blueprint = await sdk.blueprint.create(
          {
            name: uniqueName('sdk-blueprint-for-devbox'),
            dockerfile: 'FROM ubuntu:22.04\nRUN apt-get update && apt-get install -y curl',
          },
          { longPoll: { timeoutMs: 10 * 60 * 1000 } },
        );
        expect(blueprint).toBeDefined();

        // Create devbox from blueprint using SDK method with blueprint ID
        const devbox = await sdk.devbox.createFromBlueprintId(blueprint.id, {
          name: uniqueName('sdk-devbox-from-blueprint-id'),
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
      },
      LONG_TIMEOUT,
    );

    test.concurrent(
      'create devbox from blueprint name',
      async () => {
        // First create a blueprint with a specific name and extended long-poll timeout
        const blueprintName = uniqueName('sdk-blueprint-name-test');
        const blueprint = await sdk.blueprint.create(
          {
            name: blueprintName,
            dockerfile: 'FROM ubuntu:22.04\nRUN apt-get update && apt-get install -y wget',
          },
          { longPoll: { timeoutMs: 10 * 60 * 1000 } },
        );
        expect(blueprint).toBeDefined();

        // Create devbox from blueprint using SDK method with blueprint name
        const devbox = await sdk.devbox.createFromBlueprintName(blueprintName, {
          name: uniqueName('sdk-devbox-from-blueprint-name'),
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
      },
      LONG_TIMEOUT,
    );

    test.concurrent('create devbox from snapshot', async () => {
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

    test.concurrent('snapshot disk async', async () => {
      const sourceDevbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-for-async-snapshot'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });

      let snapshot: Awaited<ReturnType<typeof sourceDevbox.snapshotDiskAsync>> | undefined;
      try {
        snapshot = await sourceDevbox.snapshotDisk({
          name: uniqueName('sdk-async-snapshot'),
          commit_message: 'Async snapshot test',
        });
        expect(snapshot).toBeDefined();
        expect(snapshot.id).toBeTruthy();
      } finally {
        // force=true required because the async snapshot may still be in progress
        await sdk.api.devboxes.shutdown(sourceDevbox.id);
        if (snapshot) await snapshot.delete();
      }
    });
  });
});
