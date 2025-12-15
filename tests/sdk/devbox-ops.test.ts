import { DevboxOps, SDKDevboxCreateParams, MountInstance, InlineObjectMount } from '../../src/sdk';
import { Devbox } from '../../src/sdk/devbox';
import { StorageObject } from '../../src/sdk/storage-object';
import type { DevboxView } from '../../src/resources/devboxes/devboxes';
import * as Shared from '../../src/resources/shared';

// Mock the Devbox class
jest.mock('../../src/sdk/devbox');

describe('DevboxOps', () => {
  let mockClient: any;
  let devboxOps: DevboxOps;
  let mockDevboxData: DevboxView;
  let mockDevboxInstance: Devbox;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock client
    mockClient = {
      devboxes: {
        createAndAwaitRunning: jest.fn(),
        retrieve: jest.fn(),
        list: jest.fn(),
      },
    } as any;

    devboxOps = new DevboxOps(mockClient);

    // Mock devbox data
    mockDevboxData = {
      id: 'devbox-123',
      status: 'running',
      capabilities: [],
      create_time_ms: Date.now(),
      end_time_ms: null,
      launch_parameters: {},
      metadata: {},
      state_transitions: [],
    };

    // Mock Devbox.create to return a mock Devbox instance
    mockDevboxInstance = { id: 'devbox-123', getInfo: jest.fn() } as unknown as Devbox;
    jest.spyOn(Devbox as any, 'create').mockResolvedValue(mockDevboxInstance);
  });

  describe('create with SDK mount syntax', () => {
    describe('InlineObjectMount transformation', () => {
      it('should transform a single InlineObjectMount to ObjectMountParameters', async () => {
        // Create a mock StorageObject
        const mockStorageObject = { id: 'obj-123' } as StorageObject;

        await devboxOps.create({
          name: 'test-devbox',
          mounts: [{ '/home/user/file.txt': mockStorageObject }],
        });

        expect(Devbox.create).toHaveBeenCalledWith(
          mockClient,
          {
            name: 'test-devbox',
            mounts: [
              {
                type: 'object_mount',
                object_id: 'obj-123',
                object_path: '/home/user/file.txt',
              },
            ],
          },
          undefined,
        );
      });

      it('should transform multiple InlineObjectMounts in a single object', async () => {
        const mockStorageObject1 = { id: 'obj-123' } as StorageObject;
        const mockStorageObject2 = { id: 'obj-456' } as StorageObject;

        await devboxOps.create({
          name: 'test-devbox',
          mounts: [
            {
              '/home/user/file1.txt': mockStorageObject1,
              '/home/user/file2.txt': mockStorageObject2,
            },
          ],
        });

        expect(Devbox.create).toHaveBeenCalledWith(
          mockClient,
          {
            name: 'test-devbox',
            mounts: expect.arrayContaining([
              {
                type: 'object_mount',
                object_id: 'obj-123',
                object_path: '/home/user/file1.txt',
              },
              {
                type: 'object_mount',
                object_id: 'obj-456',
                object_path: '/home/user/file2.txt',
              },
            ]),
          },
          undefined,
        );
      });

      it('should transform multiple separate InlineObjectMount items', async () => {
        const mockStorageObject1 = { id: 'obj-123' } as StorageObject;
        const mockStorageObject2 = { id: 'obj-456' } as StorageObject;

        await devboxOps.create({
          name: 'test-devbox',
          mounts: [
            { '/home/user/config.txt': mockStorageObject1 },
            { '/home/user/data.json': mockStorageObject2 },
          ],
        });

        expect(Devbox.create).toHaveBeenCalledWith(
          mockClient,
          {
            name: 'test-devbox',
            mounts: [
              {
                type: 'object_mount',
                object_id: 'obj-123',
                object_path: '/home/user/config.txt',
              },
              {
                type: 'object_mount',
                object_id: 'obj-456',
                object_path: '/home/user/data.json',
              },
            ],
          },
          undefined,
        );
      });
    });

    describe('mixed mount types', () => {
      it('should handle mixed SDK and standard mount types', async () => {
        const mockStorageObject = { id: 'obj-123' } as StorageObject;
        const standardMount: Shared.CodeMountParameters = {
          type: 'code_mount',
          repo_name: 'my-repo',
          repo_owner: 'owner',
        };

        await devboxOps.create({
          name: 'test-devbox',
          mounts: [{ '/home/user/file.txt': mockStorageObject }, standardMount],
        });

        expect(Devbox.create).toHaveBeenCalledWith(
          mockClient,
          {
            name: 'test-devbox',
            mounts: [
              {
                type: 'object_mount',
                object_id: 'obj-123',
                object_path: '/home/user/file.txt',
              },
              {
                type: 'code_mount',
                repo_name: 'my-repo',
                repo_owner: 'owner',
              },
            ],
          },
          undefined,
        );
      });

      it('should pass through standard ObjectMountParameters unchanged', async () => {
        const standardObjectMount: Shared.ObjectMountParameters = {
          type: 'object_mount',
          object_id: 'obj-789',
          object_path: '/home/user/existing.txt',
        };

        await devboxOps.create({
          name: 'test-devbox',
          mounts: [standardObjectMount],
        });

        expect(Devbox.create).toHaveBeenCalledWith(
          mockClient,
          {
            name: 'test-devbox',
            mounts: [standardObjectMount],
          },
          undefined,
        );
      });

      it('should pass through file_mount unchanged', async () => {
        const fileMount: Shared.Mount = {
          type: 'file_mount',
          files: {
            '/home/user/config.json': '{"key": "value"}',
          },
        };

        await devboxOps.create({
          name: 'test-devbox',
          mounts: [fileMount],
        });

        expect(Devbox.create).toHaveBeenCalledWith(
          mockClient,
          {
            name: 'test-devbox',
            mounts: [fileMount],
          },
          undefined,
        );
      });
    });

    describe('edge cases', () => {
      it('should handle empty mounts array', async () => {
        await devboxOps.create({
          name: 'test-devbox',
          mounts: [],
        });

        expect(Devbox.create).toHaveBeenCalledWith(
          mockClient,
          {
            name: 'test-devbox',
            mounts: [],
          },
          undefined,
        );
      });

      it('should handle undefined mounts', async () => {
        await devboxOps.create({
          name: 'test-devbox',
        });

        expect(Devbox.create).toHaveBeenCalledWith(
          mockClient,
          {
            name: 'test-devbox',
          },
          undefined,
        );
      });

      it('should handle null mounts', async () => {
        await devboxOps.create({
          name: 'test-devbox',
          mounts: null,
        });

        expect(Devbox.create).toHaveBeenCalledWith(
          mockClient,
          {
            name: 'test-devbox',
            mounts: null,
          },
          undefined,
        );
      });

      it('should handle undefined params', async () => {
        await devboxOps.create();

        expect(Devbox.create).toHaveBeenCalledWith(mockClient, undefined, undefined);
      });

      it('should pass through other params unchanged', async () => {
        const mockStorageObject = { id: 'obj-123' } as StorageObject;

        await devboxOps.create({
          name: 'test-devbox',
          blueprint_id: 'bp-123',
          environment_variables: { NODE_ENV: 'production' },
          mounts: [{ '/home/user/file.txt': mockStorageObject }],
          metadata: { project: 'demo' },
        });

        expect(Devbox.create).toHaveBeenCalledWith(
          mockClient,
          {
            name: 'test-devbox',
            blueprint_id: 'bp-123',
            environment_variables: { NODE_ENV: 'production' },
            mounts: [
              {
                type: 'object_mount',
                object_id: 'obj-123',
                object_path: '/home/user/file.txt',
              },
            ],
            metadata: { project: 'demo' },
          },
          undefined,
        );
      });

      it('should pass options through to Devbox.create', async () => {
        await devboxOps.create({ name: 'test-devbox' }, { polling: { maxAttempts: 10 } });

        expect(Devbox.create).toHaveBeenCalledWith(
          mockClient,
          { name: 'test-devbox' },
          { polling: { maxAttempts: 10 } },
        );
      });
    });
  });

  describe('type inference', () => {
    // These tests ensure the types work correctly at compile time
    it('should accept SDKDevboxCreateParams type', async () => {
      const params: SDKDevboxCreateParams = {
        name: 'test-devbox',
        mounts: [{ '/path': { id: 'obj-123' } as StorageObject }],
      };

      await devboxOps.create(params);

      expect(Devbox.create).toHaveBeenCalled();
    });

    it('should accept MountInstance array', async () => {
      const mockStorageObject = { id: 'obj-123' } as StorageObject;
      const mounts: MountInstance[] = [
        { '/path1': mockStorageObject },
        { type: 'object_mount', object_id: 'obj-456', object_path: '/path2' },
      ];

      await devboxOps.create({ name: 'test-devbox', mounts });

      expect(Devbox.create).toHaveBeenCalled();
    });
  });
});

