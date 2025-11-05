import { Devbox, Snapshot } from '@runloop/api-client/objects';
import { makeClientSDK, uniqueName } from '../utils';

const sdk = makeClientSDK();

describe('smoketest: object-oriented snapshot', () => {
  describe('snapshot operations', () => {
    let devbox: Devbox;
    let snapshot: Snapshot;
    let snapshotId: string | undefined;

    beforeAll(async () => {
      // Create a devbox first
      devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-snapshot'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      });
      expect(devbox).toBeDefined();
    });

    afterAll(async () => {
      if (snapshot) {
        await snapshot.delete();
      }
      if (devbox) {
        await devbox.shutdown();
      }
    });

    test('create snapshot from devbox', async () => {
      expect(devbox).toBeDefined();
      snapshot = await devbox.snapshotDisk({
        name: uniqueName('sdk-snapshot'),
        commit_message: 'Test snapshot from SDK',
      });
      expect(snapshot).toBeDefined();
      expect(snapshot.id).toBeTruthy();
      snapshotId = snapshot.id;
    });

    test('create snapshot async from devbox', async () => {
      expect(devbox).toBeDefined();
      let asyncSnapshot: Snapshot | undefined;
      try {
        asyncSnapshot = await devbox.snapshotDiskAsync({
          name: uniqueName('sdk-snapshot-async'),
          commit_message: 'Test async snapshot from SDK',
        });
        expect(asyncSnapshot).toBeDefined();
        expect(asyncSnapshot.id).toBeTruthy();
      } finally {
        if (asyncSnapshot) {
          await asyncSnapshot.awaitCompleted();
          await asyncSnapshot.delete();
        }
      }
    });

    test('get snapshot info', async () => {
      expect(snapshot).toBeDefined();
      const result = await snapshot.getInfo();
      expect(result.snapshot?.id).toBe(snapshotId);
      expect(result.snapshot?.name).toContain('sdk-snapshot');
    });

    test('query snapshot status', async () => {
      expect(snapshot).toBeDefined();
      const status = await snapshot.queryStatus();
      expect(status).toBeDefined();
      expect(status.status).toBeTruthy();
    });

    test('update snapshot', async () => {
      expect(snapshot).toBeDefined();
      await snapshot.update({
        name: 'updated-sdk-snapshot',
        metadata: { version: 'v1.0' },
      });

      const info = await snapshot.getInfo();
      expect(info.snapshot?.name).toBe('updated-sdk-snapshot');
    });

    test('create devbox from snapshot (SDK method)', async () => {
      expect(snapshot).toBeDefined();
      // Use SDK method to create devbox from snapshot
      let newDevbox: Devbox | undefined;
      try {
        newDevbox = await sdk.devbox.createFromSnapshot(snapshot.id, {
          name: uniqueName('devbox-from-snapshot-sdk'),
        });
        expect(newDevbox).toBeDefined();
        expect(newDevbox.id).toBeTruthy();
      } finally {
        if (newDevbox) {
          await newDevbox.shutdown();
        }
      }
    });

    test('create devbox from snapshot (instance method)', async () => {
      expect(snapshot).toBeDefined();
      // Use snapshot instance method to create devbox
      let newDevbox: Devbox | undefined;
      try {
        newDevbox = await snapshot.createDevbox({
          name: uniqueName('devbox-from-snapshot-instance'),
        });
        expect(newDevbox).toBeDefined();
        expect(newDevbox.id).toBeTruthy();
      } finally {
        if (newDevbox) {
          await newDevbox.shutdown();
        }
      }
    });

    test('delete snapshot', async () => {
      expect(snapshot).toBeDefined();
      await snapshot.delete();

      // Verify it's deleted by trying to get info (should fail)
      try {
        await snapshot.getInfo();
        fail('Expected snapshot to be deleted');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('snapshot list and retrieval', () => {
    test('list snapshots', async () => {
      const snapshots = await sdk.snapshot.list({ limit: 10 });
      expect(Array.isArray(snapshots)).toBe(true);
    });

    test('list snapshots for specific devbox', async () => {
      // Create a devbox and snapshot
      let devbox: Devbox | undefined;
      let snapshot: Snapshot | undefined;
      try {
        devbox = await sdk.devbox.create({
          name: uniqueName('sdk-devbox-snapshot-list'),
          launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
        });

        snapshot = await devbox.snapshotDisk({
          name: uniqueName('sdk-snapshot-list'),
          commit_message: 'Test snapshot for list',
        });

        const snapshots = await sdk.snapshot.list({ devbox_id: devbox.id });
        expect(Array.isArray(snapshots)).toBe(true);
        expect(snapshots.length).toBeGreaterThan(0);
      } finally {
        if (devbox) {
          await devbox.shutdown();
        }
        if (snapshot) {
          await snapshot.delete();
        }
      }
    });

    test('get snapshot by ID', async () => {
      let devbox: Devbox | undefined;
      let snapshot: Snapshot | undefined;
      try {
        devbox = await sdk.devbox.create({
          name: uniqueName('sdk-devbox-snapshot-retrieve'),
          launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
        });

        snapshot = await devbox.snapshotDisk({
          name: uniqueName('sdk-snapshot-retrieve'),
          commit_message: 'Test snapshot for retrieve',
        });

        const retrieved = sdk.snapshot.fromId(snapshot.id);
        expect(retrieved.id).toBe(snapshot.id);
      } finally {
        if (devbox) {
          await devbox.shutdown();
        }
        if (snapshot) {
          await snapshot.delete();
        }
      }
    });
  });
});
