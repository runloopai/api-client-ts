import { makeClient, uniqueName } from './utils';

const client = makeClient();

describe('smoketest: devbox snapshots', () => {
  let devboxId: string | undefined;
  let snapshotId: string | undefined;

  afterAll(async () => {
    if (devboxId) {
      await client.devboxes.shutdown(devboxId);
    }
    if (snapshotId) {
      await client.devboxes.diskSnapshots.delete(snapshotId);
    }
  });

  test('snapshot devbox', async () => {
    const created = await client.devboxes.createAndAwaitRunning(
      {
        name: uniqueName('snap-devbox'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      },
      {
        polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: 20 * 60 * 1000 },
      },
    );
    devboxId = created.id;

    const snap = await client.devboxes.snapshotDisk(devboxId!, { name: uniqueName('snap') });
    expect(snap.id).toBeTruthy();
    snapshotId = snap.id;
  }, 30_000);

  test('launch devbox from snapshot', async () => {
    const launched = await client.devboxes.createAndAwaitRunning(
      {
        snapshot_id: snapshotId!,
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      },
      {
        polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: 20 * 60 * 1000 },
      },
    );
    expect(launched.snapshot_id).toBe(snapshotId);
  }, 30_000);
});
