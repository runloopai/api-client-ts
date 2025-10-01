import { Snapshot } from '../../src/objects/snapshot';
import { Runloop } from '../../src/index';
import type { DevboxSnapshotView } from '../../src/resources/devboxes/devboxes';
import type { DevboxSnapshotAsyncStatusView } from '../../src/resources/devboxes/disk-snapshots';

// Mock the Runloop client
jest.mock('../../src/index');

describe('Snapshot', () => {
  let mockClient: jest.Mocked<Runloop>;
  let mockSnapshotData: DevboxSnapshotView;

  beforeEach(() => {
    // Create mock client instance
    mockClient = {
      devboxes: {
        listDiskSnapshots: jest.fn(),
        diskSnapshots: {
          update: jest.fn(),
          delete: jest.fn(),
          queryStatus: jest.fn(),
        },
      },
    } as any;

    // Mock snapshot data
    mockSnapshotData = {
      id: 'snapshot-123',
      create_time_ms: Date.now(),
      metadata: { version: '1.0', author: 'test' },
      source_devbox_id: 'devbox-456',
      name: 'test-snapshot',
    };
  });

  describe('constructor', () => {
    it('should create a Snapshot instance', () => {
      const snapshot = new Snapshot(mockClient, mockSnapshotData);

      expect(snapshot.id).toBe('snapshot-123');
      expect(snapshot.name).toBe('test-snapshot');
      expect(snapshot.sourceDevboxId).toBe('devbox-456');
    });
  });

  describe('get', () => {
    it('should retrieve an existing snapshot by ID', async () => {
      const mockPage = {
        [Symbol.asyncIterator]: async function* () {
          yield mockSnapshotData;
        },
      };

      mockClient.devboxes.listDiskSnapshots.mockResolvedValue(mockPage as any);

      const snapshot = await Snapshot.get(mockClient, 'snapshot-123');

      expect(mockClient.devboxes.listDiskSnapshots).toHaveBeenCalledWith({}, undefined);
      expect(snapshot.id).toBe('snapshot-123');
      expect(snapshot.name).toBe('test-snapshot');
    });

    it('should throw error if snapshot not found', async () => {
      const mockPage = {
        [Symbol.asyncIterator]: async function* () {
          yield { id: 'other-snapshot', create_time_ms: Date.now(), metadata: {}, source_devbox_id: 'devbox-1' };
        },
      };

      mockClient.devboxes.listDiskSnapshots.mockResolvedValue(mockPage as any);

      await expect(Snapshot.get(mockClient, 'non-existent')).rejects.toThrow(
        'Snapshot with ID non-existent not found',
      );
    });
  });

  describe('list', () => {
    it('should list all snapshots', async () => {
      const snapshot1: DevboxSnapshotView = {
        id: 'snapshot-1',
        create_time_ms: Date.now(),
        metadata: {},
        source_devbox_id: 'devbox-1',
      };

      const snapshot2: DevboxSnapshotView = {
        id: 'snapshot-2',
        create_time_ms: Date.now(),
        metadata: {},
        source_devbox_id: 'devbox-2',
      };

      const mockPage = {
        [Symbol.asyncIterator]: async function* () {
          yield snapshot1;
          yield snapshot2;
        },
      };

      mockClient.devboxes.listDiskSnapshots.mockResolvedValue(mockPage as any);

      const snapshots = await Snapshot.list(mockClient);

      expect(mockClient.devboxes.listDiskSnapshots).toHaveBeenCalledWith({}, undefined);
      expect(snapshots).toHaveLength(2);
      expect(snapshots[0].id).toBe('snapshot-1');
      expect(snapshots[1].id).toBe('snapshot-2');
    });

    it('should filter by devbox ID', async () => {
      const mockPage = {
        [Symbol.asyncIterator]: async function* () {
          yield mockSnapshotData;
        },
      };

      mockClient.devboxes.listDiskSnapshots.mockResolvedValue(mockPage as any);

      await Snapshot.list(mockClient, { devboxId: 'devbox-456' });

      expect(mockClient.devboxes.listDiskSnapshots).toHaveBeenCalledWith(
        { devbox_id: 'devbox-456' },
        undefined,
      );
    });

    it('should return empty array when no snapshots found', async () => {
      const mockPage = {
        [Symbol.asyncIterator]: async function* () {
          // Empty iterator
        },
      };

      mockClient.devboxes.listDiskSnapshots.mockResolvedValue(mockPage as any);

      const snapshots = await Snapshot.list(mockClient);

      expect(snapshots).toHaveLength(0);
    });
  });

  describe('instance methods', () => {
    let snapshot: Snapshot;

    beforeEach(() => {
      snapshot = new Snapshot(mockClient, mockSnapshotData);
    });

    describe('update', () => {
      it('should update snapshot name and metadata', async () => {
        const updatedData: DevboxSnapshotView = {
          ...mockSnapshotData,
          name: 'updated-snapshot',
          metadata: { version: '2.0' },
        };

        mockClient.devboxes.diskSnapshots.update.mockResolvedValue(updatedData);

        await snapshot.update({
          name: 'updated-snapshot',
          metadata: { version: '2.0' },
        });

        expect(mockClient.devboxes.diskSnapshots.update).toHaveBeenCalledWith(
          'snapshot-123',
          {
            name: 'updated-snapshot',
            metadata: { version: '2.0' },
          },
          undefined,
        );
        expect(snapshot.name).toBe('updated-snapshot');
        expect(snapshot.metadata).toEqual({ version: '2.0' });
      });

      it('should update only name', async () => {
        const updatedData: DevboxSnapshotView = {
          ...mockSnapshotData,
          name: 'new-name',
        };

        mockClient.devboxes.diskSnapshots.update.mockResolvedValue(updatedData);

        await snapshot.update({ name: 'new-name' });

        expect(mockClient.devboxes.diskSnapshots.update).toHaveBeenCalledWith(
          'snapshot-123',
          { name: 'new-name' },
          undefined,
        );
      });

      it('should update only metadata', async () => {
        const updatedData: DevboxSnapshotView = {
          ...mockSnapshotData,
          metadata: { key: 'value' },
        };

        mockClient.devboxes.diskSnapshots.update.mockResolvedValue(updatedData);

        await snapshot.update({ metadata: { key: 'value' } });

        expect(mockClient.devboxes.diskSnapshots.update).toHaveBeenCalledWith(
          'snapshot-123',
          { metadata: { key: 'value' } },
          undefined,
        );
      });
    });

    describe('delete', () => {
      it('should delete the snapshot', async () => {
        mockClient.devboxes.diskSnapshots.delete.mockResolvedValue(undefined);

        await snapshot.delete();

        expect(mockClient.devboxes.diskSnapshots.delete).toHaveBeenCalledWith('snapshot-123', undefined);
      });
    });

    describe('queryStatus', () => {
      it('should query snapshot status for async operations', async () => {
        const mockStatus: DevboxSnapshotAsyncStatusView = {
          status: 'complete',
          snapshot: mockSnapshotData,
        };

        mockClient.devboxes.diskSnapshots.queryStatus.mockResolvedValue(mockStatus);

        const status = await snapshot.queryStatus();

        expect(mockClient.devboxes.diskSnapshots.queryStatus).toHaveBeenCalledWith('snapshot-123', undefined);
        expect(status.status).toBe('complete');
        expect(status.snapshot).toEqual(mockSnapshotData);
      });

      it('should handle in-progress status', async () => {
        const mockStatus: DevboxSnapshotAsyncStatusView = {
          status: 'in_progress',
        };

        mockClient.devboxes.diskSnapshots.queryStatus.mockResolvedValue(mockStatus);

        const status = await snapshot.queryStatus();

        expect(status.status).toBe('in_progress');
        expect(status.snapshot).toBeUndefined();
      });

      it('should handle error status', async () => {
        const mockStatus: DevboxSnapshotAsyncStatusView = {
          status: 'error',
          error_message: 'Snapshot creation failed',
        };

        mockClient.devboxes.diskSnapshots.queryStatus.mockResolvedValue(mockStatus);

        const status = await snapshot.queryStatus();

        expect(status.status).toBe('error');
        expect(status.error_message).toBe('Snapshot creation failed');
      });
    });

    describe('property accessors', () => {
      it('should expose snapshot properties', () => {
        expect(snapshot.id).toBe('snapshot-123');
        expect(snapshot.name).toBe('test-snapshot');
        expect(snapshot.sourceDevboxId).toBe('devbox-456');
        expect(snapshot.metadata).toEqual({ version: '1.0', author: 'test' });
        expect(snapshot.createTimeMs).toBe(mockSnapshotData.create_time_ms);
        expect(snapshot.data).toEqual(mockSnapshotData);
      });

      it('should return null for name when not set', () => {
        const snapshotWithoutName = new Snapshot(mockClient, {
          ...mockSnapshotData,
          name: null,
        });

        expect(snapshotWithoutName.name).toBeNull();
      });

      it('should provide access to underlying API', () => {
        expect(snapshot.api).toBe(mockClient.devboxes.diskSnapshots);
      });
    });
  });

  describe('error handling', () => {
    it('should handle update errors', async () => {
      const snapshot = new Snapshot(mockClient, mockSnapshotData);
      const error = new Error('Update failed');
      mockClient.devboxes.diskSnapshots.update.mockRejectedValue(error);

      await expect(snapshot.update({ name: 'new-name' })).rejects.toThrow('Update failed');
    });

    it('should handle delete errors', async () => {
      const snapshot = new Snapshot(mockClient, mockSnapshotData);
      const error = new Error('Delete failed');
      mockClient.devboxes.diskSnapshots.delete.mockRejectedValue(error);

      await expect(snapshot.delete()).rejects.toThrow('Delete failed');
    });

    it('should handle list errors', async () => {
      const error = new Error('List failed');
      mockClient.devboxes.listDiskSnapshots.mockRejectedValue(error);

      await expect(Snapshot.list(mockClient)).rejects.toThrow('List failed');
    });
  });
});
