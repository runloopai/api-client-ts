import { DevboxView } from '@runloop/api-client/resources/devboxes';
import { makeClient, uniqueName } from './utils';

const client = makeClient();

describe('smoketest: devbox snapshots', () => {
  let devboxId: string | undefined;
  let snapshotId: string | undefined;

  test('snapshot devbox', async () => {
    let devbox: DevboxView | undefined;
    try {
      devbox = await client.devboxes.createAndAwaitRunning(
        {
          name: uniqueName('snap-devbox'),
          launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
        },
        {
          polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: 20 * 60 * 1000 },
        },
      );
      devboxId = devbox.id;

      const snap = await client.devboxes.snapshotDisk(devboxId!, { name: uniqueName('snap') });
      expect(snap.id).toBeTruthy();
      snapshotId = snap.id;
    } finally {
      if (devbox) {
        await client.devboxes.shutdown(devbox.id);
      }
    }
  }, 30_000);

  test('launch devbox from snapshot', async () => {
    let devbox: DevboxView | undefined;
    try {
      devbox = await client.devboxes.createAndAwaitRunning(
        {
          snapshot_id: snapshotId!,
          launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
        },
        {
          polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: 20 * 60 * 1000 },
        },
      );
      expect(devbox.snapshot_id).toBe(snapshotId);
    } finally {
      if (devbox) {
        await client.devboxes.shutdown(devbox.id);
      }
    }
  }, 30_000);
});
