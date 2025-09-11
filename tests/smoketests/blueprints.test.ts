import { makeClient, THIRTY_SECOND_TIMEOUT, uniqueName } from './utils';

const client = makeClient();

describe('smoketest: blueprints', () => {
  /**
   * Test the lifecycle of a blueprint. These tests are dependent on each other to save time.
   */
  describe('blueprint lifecycle', () => {
    let blueprintId: string | undefined;
    let blueprintName = uniqueName('bp');

    afterAll(async () => {
      await client.blueprints.delete(blueprintId!);
    });

    test(
      'create blueprint and await build',
      async () => {
        const created = await client.blueprints.createAndAwaitBuildCompleted(
          {
            name: blueprintName,
          },
          {
            polling: { maxAttempts: 180, pollingIntervalMs: 5_000, timeoutMs: 30 * 60 * 1000 },
          },
        );
        expect(created.status).toBe('build_complete');
        blueprintId = created.id;
      },
      THIRTY_SECOND_TIMEOUT,
    );

    test(
      'start devbox from base blueprint by ID',
      async () => {
        const devbox = await client.devboxes.createAndAwaitRunning(
          { blueprint_id: blueprintId! },
          {
            polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: 20 * 60 * 1000 },
          },
        );
        expect(devbox.blueprint_id).toBe(blueprintId);
        await client.devboxes.shutdown(devbox.id);
      },
      THIRTY_SECOND_TIMEOUT,
    );

    test(
      'start devbox from base blueprint by Name',
      async () => {
        const devbox = await client.devboxes.createAndAwaitRunning(
          { blueprint_name: blueprintName },
          {
            polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: 20 * 60 * 1000 },
          },
        );
        expect(devbox.blueprint_id).toBeTruthy();
        await client.devboxes.shutdown(devbox.id);
      },
      THIRTY_SECOND_TIMEOUT,
    );
  });
});
