import { Snapshot } from '../../src/objects/snapshot';
import { Devbox } from '../../src/objects/devbox';
import { Runloop } from '../../src/index';
import type { DevboxSnapshotView } from '../../src/resources/devboxes/devboxes';
import type { DevboxSnapshotAsyncStatusView } from '../../src/resources/devboxes/disk-snapshots';

// Mock the Runloop client
jest.mock('../../src/index');

describe('Snapshot (New API)', () => {
  let mockClient: jest.Mocked<Runloop>;
  let mockSnapshotData: DevboxSnapshotView;

  beforeEach(() => {
    // Create mock client instance with proper structure
    mockClient = {
      devboxes: {
        createAndAwaitRunning: jest.fn(),
        retrieve: jest.fn(),
        execute: jest.fn(),
        executeAsync: jest.fn(),
        readFileContents: jest.fn(),
        writeFileContents: jest.fn(),
        downloadFile: jest.fn(),
        uploadFile: jest.fn(),
        shutdown: jest.fn(),
        suspend: jest.fn(),
        resume: jest.fn(),
        keepAlive: jest.fn(),
        snapshotDisk: jest.fn(),
        createSSHKey: jest.fn(),
        createTunnel: jest.fn(),
        removeTunnel: jest.fn(),
        listDiskSnapshots: jest.fn(),
        diskSnapshots: {
          queryStatus: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      },
      blueprints: {
        createAndAwaitBuildCompleted: jest.fn(),
        retrieve: jest.fn(),
        preview: jest.fn(),
        logs: jest.fn(),
        delete: jest.fn(),
      },
      objects: {
        create: jest.fn(),
        retrieve: jest.fn(),
        list: jest.fn(),
        delete: jest.fn(),
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

  describe('fromId', () => {
    it('should create a Snapshot instance by ID without API call', () => {
      const snapshot = Snapshot.fromId(mockClient, 'snapshot-123');

      expect(snapshot).toBeInstanceOf(Snapshot);
      expect(snapshot.id).toBe('snapshot-123');
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

      const snapshots = await Snapshot.list(mockClient, undefined);

      expect(mockClient.devboxes.listDiskSnapshots).toHaveBeenCalledWith(undefined, undefined);
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

      await Snapshot.list(mockClient, { devbox_id: 'devbox-456' });

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

      const snapshots = await Snapshot.list(mockClient, undefined);

      expect(snapshots).toHaveLength(0);
    });
  });

  describe('instance methods', () => {
    let snapshot: Snapshot;

    beforeEach(() => {
      snapshot = Snapshot.fromId(mockClient, 'snapshot-123');
    });

    describe('getInfo', () => {
      it('should get snapshot status from API using queryStatus', async () => {
        const mockStatus = {
          status: 'complete',
          snapshot: mockSnapshotData,
        };

        mockClient.devboxes.diskSnapshots.queryStatus.mockResolvedValue(mockStatus);

        const status = await snapshot.getInfo();

        expect(mockClient.devboxes.diskSnapshots.queryStatus).toHaveBeenCalledWith('snapshot-123', undefined);
        expect(status.status).toBe('complete');
        expect(status.snapshot).toEqual(mockSnapshotData);
      });

      it('should return error status when snapshot operation failed', async () => {
        const mockStatus = {
          status: 'error',
          error_message: 'Snapshot creation failed',
        };

        mockClient.devboxes.diskSnapshots.queryStatus.mockResolvedValue(mockStatus);

        const status = await snapshot.getInfo();

        expect(status.status).toBe('error');
        expect(status.error_message).toBe('Snapshot creation failed');
      });

      it('should return in-progress status when snapshot is still processing', async () => {
        const mockStatus = {
          status: 'in_progress',
        };

        mockClient.devboxes.diskSnapshots.queryStatus.mockResolvedValue(mockStatus);

        const status = await snapshot.getInfo();

        expect(status.status).toBe('in_progress');
      });
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

    describe('createDevbox', () => {
      it('should create a devbox from the snapshot', async () => {
        const mockDevboxData = {
          id: 'devbox-789',
          status: 'running' as const,
          capabilities: [],
          create_time_ms: Date.now(),
          end_time_ms: null,
          launch_parameters: {},
          metadata: {},
          state_transitions: [],
        };

        // Mock Devbox.create static method
        jest.spyOn(Devbox, 'create').mockResolvedValue(new Devbox(mockClient as any, 'devbox-789'));

        const result = await snapshot.createDevbox({
          name: 'restored-devbox',
          metadata: { restored_from: 'snapshot-123' },
        });

        expect(Devbox.create).toHaveBeenCalledWith(
          mockClient,
          {
            name: 'restored-devbox',
            metadata: { restored_from: 'snapshot-123' },
            snapshot_id: 'snapshot-123',
          },
          undefined,
        );
        expect(result).toBeInstanceOf(Devbox);
      });

      it('should create a devbox with only snapshot ID when no params provided', async () => {
        const mockDevboxData = {
          id: 'devbox-789',
          status: 'running' as const,
          capabilities: [],
          create_time_ms: Date.now(),
          end_time_ms: null,
          launch_parameters: {},
          metadata: {},
          state_transitions: [],
        };

        jest.spyOn(Devbox, 'create').mockResolvedValue(new Devbox(mockClient as any, 'devbox-789'));

        const result = await snapshot.createDevbox();

        expect(Devbox.create).toHaveBeenCalledWith(mockClient, { snapshot_id: 'snapshot-123' }, undefined);
        expect(result).toBeInstanceOf(Devbox);
      });
    });

    describe('id property', () => {
      it('should expose snapshot ID', () => {
        expect(snapshot.id).toBe('snapshot-123');
      });
    });
  });

  describe('error handling', () => {
    it('should handle update errors', async () => {
      const snapshot = Snapshot.fromId(mockClient, 'snapshot-123');
      const error = new Error('Update failed');
      mockClient.devboxes.diskSnapshots.update.mockRejectedValue(error);

      await expect(snapshot.update({ name: 'new-name' })).rejects.toThrow('Update failed');
    });

    it('should handle delete errors', async () => {
      const snapshot = Snapshot.fromId(mockClient, 'snapshot-123');
      const error = new Error('Delete failed');
      mockClient.devboxes.diskSnapshots.delete.mockRejectedValue(error);

      await expect(snapshot.delete()).rejects.toThrow('Delete failed');
    });

    it('should handle list errors', async () => {
      const error = new Error('List failed');
      mockClient.devboxes.listDiskSnapshots.mockRejectedValue(error);

      await expect(Snapshot.list(mockClient, undefined)).rejects.toThrow('List failed');
    });
  });
});
