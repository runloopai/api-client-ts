import { Devbox } from '../../src/objects/devbox';
import type { DevboxView, DevboxAsyncExecutionDetailView } from '../../src/resources/devboxes/devboxes';

// Mock the Runloop client
jest.mock('../../src/index');

describe('Devbox (New API)', () => {
  let mockClient: any;
  let mockDevboxData: DevboxView;

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
        snapshotDiskAsync: jest.fn(),
        createSSHKey: jest.fn(),
        createTunnel: jest.fn(),
        removeTunnel: jest.fn(),
        diskSnapshots: {
          queryStatus: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          awaitCompleted: jest.fn(),
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
  });

  describe('create', () => {
    it('should create a devbox and return a Devbox instance', async () => {
      mockClient.devboxes.createAndAwaitRunning.mockResolvedValue(mockDevboxData);

      const devbox = await Devbox.create(mockClient, { name: 'test-devbox' });

      expect(mockClient.devboxes.createAndAwaitRunning).toHaveBeenCalledWith(
        { name: 'test-devbox' },
        undefined,
      );
      expect(devbox).toBeInstanceOf(Devbox);
      expect(devbox.id).toBe('devbox-123');
    });

    it('should pass options to the API client', async () => {
      mockClient.devboxes.createAndAwaitRunning.mockResolvedValue(mockDevboxData);

      await Devbox.create(mockClient, { name: 'test-devbox' }, { polling: { maxAttempts: 10 } });

      expect(mockClient.devboxes.createAndAwaitRunning).toHaveBeenCalledWith(
        { name: 'test-devbox' },
        { polling: { maxAttempts: 10 } },
      );
    });
  });

  describe('fromId', () => {
    it('should create a Devbox instance by ID without API call', () => {
      const devbox = Devbox.fromId(mockClient, 'devbox-123');

      expect(devbox).toBeInstanceOf(Devbox);
      expect(devbox.id).toBe('devbox-123');
    });
  });

  describe('instance methods', () => {
    let devbox: Devbox;

    beforeEach(async () => {
      mockClient.devboxes.createAndAwaitRunning.mockResolvedValue(mockDevboxData);
      devbox = await Devbox.create(mockClient, { name: 'test-devbox' });
    });

    describe('cmd.exec', () => {
      it('should execute a command and return the result', async () => {
        const mockExecution: DevboxAsyncExecutionDetailView = {
          devbox_id: 'devbox-123',
          execution_id: 'exec-456',
          status: 'completed',
          exit_status: 0,
          stdout: 'Hello World',
          stderr: '',
        };

        mockClient.devboxes.execute.mockResolvedValue(mockExecution);

        const result = await devbox.cmd.exec({ command: 'echo "Hello World"' });

        expect(mockClient.devboxes.execute).toHaveBeenCalledWith(
          'devbox-123',
          { command: 'echo "Hello World"' },
          undefined,
        );
        expect(result.stdout).toBe('Hello World');
        expect(result.exit_status).toBe(0);
      });
    });

    describe('cmd.execAsync', () => {
      it('should execute a command asynchronously', async () => {
        const mockExecution: DevboxAsyncExecutionDetailView = {
          devbox_id: 'devbox-123',
          execution_id: 'exec-456',
          status: 'running',
        };

        mockClient.devboxes.executeAsync.mockResolvedValue(mockExecution);

        const result = await devbox.cmd.execAsync({ command: 'sleep 10' });

        expect(mockClient.devboxes.executeAsync).toHaveBeenCalledWith(
          'devbox-123',
          { command: 'sleep 10' },
          undefined,
        );
        expect(result.status).toBe('running');
      });
    });

    describe('file operations', () => {
      it('should read file contents', async () => {
        mockClient.devboxes.readFileContents.mockResolvedValue('file contents');

        const contents = await devbox.file.read({ file_path: 'test.txt' });

        expect(mockClient.devboxes.readFileContents).toHaveBeenCalledWith(
          'devbox-123',
          { file_path: 'test.txt' },
          undefined,
        );
        expect(contents).toBe('file contents');
      });

      it('should write file contents', async () => {
        const mockResult = {
          devbox_id: 'devbox-123',
          exit_status: 0,
          stdout: '',
          stderr: '',
        };

        mockClient.devboxes.writeFileContents.mockResolvedValue(mockResult);

        await devbox.file.write({ file_path: 'test.txt', contents: 'new contents' });

        expect(mockClient.devboxes.writeFileContents).toHaveBeenCalledWith(
          'devbox-123',
          { file_path: 'test.txt', contents: 'new contents' },
          undefined,
        );
      });
    });

    describe('lifecycle methods', () => {
      it('should shutdown the devbox', async () => {
        mockClient.devboxes.shutdown.mockResolvedValue(undefined);

        const result = await devbox.shutdown();

        expect(mockClient.devboxes.shutdown).toHaveBeenCalledWith('devbox-123', undefined);
        expect(result).toBeUndefined(); // Should return API response
      });

      it('should suspend the devbox', async () => {
        mockClient.devboxes.suspend.mockResolvedValue(undefined);

        const result = await devbox.suspend();

        expect(mockClient.devboxes.suspend).toHaveBeenCalledWith('devbox-123', undefined);
        expect(result).toBeUndefined(); // Should return API response
      });

      it('should resume the devbox', async () => {
        mockClient.devboxes.resume.mockResolvedValue(undefined);

        const result = await devbox.resume();

        expect(mockClient.devboxes.resume).toHaveBeenCalledWith('devbox-123', undefined);
        expect(result).toBeUndefined(); // Should return API response
      });
    });

    describe('getInfo', () => {
      it('should get devbox information from API', async () => {
        const updatedData = { ...mockDevboxData, status: 'suspended' as const };
        mockClient.devboxes.retrieve.mockResolvedValue(updatedData);

        const info = await devbox.getInfo();

        expect(mockClient.devboxes.retrieve).toHaveBeenCalledWith('devbox-123', undefined);
        expect(info.status).toBe('suspended');
        expect(info.id).toBe('devbox-123');
      });
    });

    describe('id property', () => {
      it('should expose devbox ID', () => {
        expect(devbox.id).toBe('devbox-123');
      });
    });

    describe('snapshotDisk', () => {
      it('should create a disk snapshot and return Snapshot object', async () => {
        const mockSnapshotData = { id: 'snapshot-456', name: 'test-snapshot' };
        const mockStatus = { status: 'complete', snapshot: mockSnapshotData };
        mockClient.devboxes.snapshotDiskAsync.mockResolvedValue(mockSnapshotData);
        mockClient.devboxes.diskSnapshots.awaitCompleted.mockResolvedValue(mockStatus);

        const snapshot = await devbox.snapshotDisk({ name: 'test-snapshot' });

        expect(mockClient.devboxes.snapshotDiskAsync).toHaveBeenCalledWith(
          'devbox-123',
          { name: 'test-snapshot' },
          undefined,
        );
        expect(snapshot).toBeInstanceOf(require('../../src/objects/snapshot').Snapshot);
        expect(snapshot.id).toBe('snapshot-456');
      });

      it('should create snapshot without parameters', async () => {
        const mockSnapshotData = { id: 'snapshot-789' };
        const mockStatus = { status: 'complete', snapshot: mockSnapshotData };
        mockClient.devboxes.snapshotDiskAsync.mockResolvedValue(mockSnapshotData);
        mockClient.devboxes.diskSnapshots.awaitCompleted.mockResolvedValue(mockStatus);

        const snapshot = await devbox.snapshotDisk();

        expect(mockClient.devboxes.snapshotDiskAsync).toHaveBeenCalledWith(
          'devbox-123',
          undefined,
          undefined,
        );
        expect(snapshot).toBeInstanceOf(require('../../src/objects/snapshot').Snapshot);
        expect(snapshot.id).toBe('snapshot-789');
      });
    });
  });

  describe('error handling', () => {
    it('should handle devbox creation failure', async () => {
      const error = new Error('Creation failed');
      mockClient.devboxes.createAndAwaitRunning.mockRejectedValue(error);

      await expect(Devbox.create(mockClient, { name: 'failing-devbox' })).rejects.toThrow('Creation failed');
    });

    it('should handle command execution errors', async () => {
      mockClient.devboxes.createAndAwaitRunning.mockResolvedValue(mockDevboxData);
      const devbox = await Devbox.create(mockClient, { name: 'test-devbox' });

      const error = new Error('Command failed');
      mockClient.devboxes.execute.mockRejectedValue(error);

      await expect(devbox.cmd.exec({ command: 'failing-command' })).rejects.toThrow('Command failed');
    });
  });
});
