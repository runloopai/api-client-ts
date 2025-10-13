import { Devbox } from '../../src/objects/devbox';
import { Runloop } from '../../src/index';
import type { DevboxView, DevboxAsyncExecutionDetailView } from '../../src/resources/devboxes/devboxes';

// Mock the Runloop client
jest.mock('../../src/index');

describe('Devbox', () => {
  let mockClient: jest.Mocked<Runloop>;
  let mockDevboxData: DevboxView;

  beforeEach(() => {
    // Create mock client instance
    mockClient = {
      devboxes: {
        createAndAwaitRunning: jest.fn(),
        retrieve: jest.fn(),
        executeAndAwaitCompletion: jest.fn(),
        executeAsync: jest.fn(),
        executeSync: jest.fn(),
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
      expect(devbox.status).toBe('running');
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

  describe('get', () => {
    it('should retrieve an existing devbox by ID', async () => {
      mockClient.devboxes.retrieve.mockResolvedValue(mockDevboxData);

      const devbox = await Devbox.get(mockClient, 'devbox-123');

      expect(mockClient.devboxes.retrieve).toHaveBeenCalledWith('devbox-123', undefined);
      expect(devbox.id).toBe('devbox-123');
    });
  });

  describe('instance methods', () => {
    let devbox: Devbox;

    beforeEach(async () => {
      mockClient.devboxes.createAndAwaitRunning.mockResolvedValue(mockDevboxData);
      devbox = await Devbox.create(mockClient, { name: 'test-devbox' });
    });

    describe('exec', () => {
      it('should execute a command and return the result', async () => {
        const mockExecution: DevboxAsyncExecutionDetailView = {
          devbox_id: 'devbox-123',
          execution_id: 'exec-456',
          status: 'completed',
          exit_status: 0,
          stdout: 'Hello World',
          stderr: '',
        };

        mockClient.devboxes.executeAndAwaitCompletion.mockResolvedValue(mockExecution);

        const result = await devbox.exec('echo "Hello World"');

        expect(mockClient.devboxes.executeAndAwaitCompletion).toHaveBeenCalledWith(
          'devbox-123',
          { command: 'echo "Hello World"', shell_name: null },
          undefined,
        );
        expect(result.stdout).toBe('Hello World');
        expect(result.exit_status).toBe(0);
      });

      it('should support persistent shell names', async () => {
        const mockExecution: DevboxAsyncExecutionDetailView = {
          devbox_id: 'devbox-123',
          execution_id: 'exec-456',
          status: 'completed',
          exit_status: 0,
          stdout: '/tmp',
          stderr: '',
        };

        mockClient.devboxes.executeAndAwaitCompletion.mockResolvedValue(mockExecution);

        await devbox.exec('pwd', 'my-shell');

        expect(mockClient.devboxes.executeAndAwaitCompletion).toHaveBeenCalledWith(
          'devbox-123',
          { command: 'pwd', shell_name: 'my-shell' },
          undefined,
        );
      });
    });

    describe('execAsync', () => {
      it('should execute a command asynchronously', async () => {
        const mockExecution: DevboxAsyncExecutionDetailView = {
          devbox_id: 'devbox-123',
          execution_id: 'exec-456',
          status: 'running',
        };

        mockClient.devboxes.executeAsync.mockResolvedValue(mockExecution);

        const result = await devbox.execAsync('sleep 10');

        expect(mockClient.devboxes.executeAsync).toHaveBeenCalledWith(
          'devbox-123',
          { command: 'sleep 10', shell_name: null },
          undefined,
        );
        expect(result.status).toBe('running');
      });
    });

    describe('file operations', () => {
      it('should read file contents', async () => {
        mockClient.devboxes.readFileContents.mockResolvedValue('file contents');

        const contents = await devbox.file.read('test.txt');

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

        await devbox.file.write('test.txt', 'new contents');

        expect(mockClient.devboxes.writeFileContents).toHaveBeenCalledWith(
          'devbox-123',
          { file_path: 'test.txt', contents: 'new contents' },
          undefined,
        );
      });

      it('should download file', async () => {
        const mockResponse = new Response('file data');
        mockClient.devboxes.downloadFile.mockResolvedValue(mockResponse as any);

        const result = await devbox.file.download('data.bin');

        expect(mockClient.devboxes.downloadFile).toHaveBeenCalledWith(
          'devbox-123',
          { path: 'data.bin' },
          undefined,
        );
        expect(result).toBe(mockResponse);
      });

      it('should upload file', async () => {
        mockClient.devboxes.uploadFile.mockResolvedValue(undefined);

        const file = Buffer.from('file data');
        await devbox.file.upload('data.bin', file);

        expect(mockClient.devboxes.uploadFile).toHaveBeenCalledWith(
          'devbox-123',
          { path: 'data.bin', file },
          undefined,
        );
      });
    });

    describe('lifecycle methods', () => {
      it('should shutdown the devbox', async () => {
        const shutdownData = { ...mockDevboxData, status: 'shutdown' as const };
        mockClient.devboxes.shutdown.mockResolvedValue(shutdownData);

        const result = await devbox.shutdown();

        expect(mockClient.devboxes.shutdown).toHaveBeenCalledWith('devbox-123', undefined);
        expect(result.status).toBe('shutdown');
        expect(devbox.status).toBe('shutdown');
      });

      it('should suspend the devbox', async () => {
        const suspendedData = { ...mockDevboxData, status: 'suspended' as const };
        mockClient.devboxes.suspend.mockResolvedValue(suspendedData);

        await devbox.suspend();

        expect(mockClient.devboxes.suspend).toHaveBeenCalledWith('devbox-123', undefined);
        expect(devbox.status).toBe('suspended');
      });

      it('should resume the devbox', async () => {
        mockClient.devboxes.resume.mockResolvedValue(mockDevboxData);

        await devbox.resume();

        expect(mockClient.devboxes.resume).toHaveBeenCalledWith('devbox-123', undefined);
      });

      it('should send keep alive signal', async () => {
        mockClient.devboxes.keepAlive.mockResolvedValue(undefined);

        await devbox.keepAlive();

        expect(mockClient.devboxes.keepAlive).toHaveBeenCalledWith('devbox-123', undefined);
      });
    });

    describe('snapshot operations', () => {
      it('should create a snapshot', async () => {
        const mockSnapshot = {
          id: 'snapshot-123',
          create_time_ms: Date.now(),
          metadata: {},
          source_devbox_id: 'devbox-123',
        };

        mockClient.devboxes.snapshotDisk.mockResolvedValue(mockSnapshot);

        const result = await devbox.snapshotDisk('my-snapshot', { version: '1.0' });

        expect(mockClient.devboxes.snapshotDisk).toHaveBeenCalledWith(
          'devbox-123',
          { name: 'my-snapshot', metadata: { version: '1.0' } },
          undefined,
        );
        expect(result.id).toBe('snapshot-123');
      });
    });

    describe('network operations', () => {
      it('should create SSH key', async () => {
        const mockSSHKey = {
          id: 'devbox-123',
          ssh_private_key: 'private-key',
          url: 'ssh://...',
        };

        mockClient.devboxes.createSSHKey.mockResolvedValue(mockSSHKey);

        const result = await devbox.createSSHKey();

        expect(mockClient.devboxes.createSSHKey).toHaveBeenCalledWith('devbox-123', undefined);
        expect(result.ssh_private_key).toBe('private-key');
      });

      it('should create tunnel', async () => {
        const mockTunnel = {
          devbox_id: 'devbox-123',
          port: 8080,
          url: 'https://...',
        };

        mockClient.devboxes.createTunnel.mockResolvedValue(mockTunnel);

        const result = await devbox.createTunnel(8080);

        expect(mockClient.devboxes.createTunnel).toHaveBeenCalledWith(
          'devbox-123',
          { port: 8080 },
          undefined,
        );
        expect(result.port).toBe(8080);
      });

      it('should remove tunnel', async () => {
        mockClient.devboxes.removeTunnel.mockResolvedValue(undefined);

        await devbox.removeTunnel(8080);

        expect(mockClient.devboxes.removeTunnel).toHaveBeenCalledWith(
          'devbox-123',
          { port: 8080 },
          undefined,
        );
      });
    });

    describe('refresh', () => {
      it('should refresh devbox data from API', async () => {
        const updatedData = { ...mockDevboxData, status: 'suspended' as const };
        mockClient.devboxes.retrieve.mockResolvedValue(updatedData);

        await devbox.refresh();

        expect(mockClient.devboxes.retrieve).toHaveBeenCalledWith('devbox-123', undefined);
        expect(devbox.status).toBe('suspended');
      });
    });

    describe('property accessors', () => {
      it('should expose devbox properties', () => {
        expect(devbox.id).toBe('devbox-123');
        expect(devbox.status).toBe('running');
        expect(devbox.data).toEqual(mockDevboxData);
      });

      it('should provide access to underlying API', () => {
        expect(devbox.api).toBe(mockClient.devboxes);
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
      mockClient.devboxes.executeAndAwaitCompletion.mockRejectedValue(error);

      await expect(devbox.exec('failing-command')).rejects.toThrow('Command failed');
    });

    it('should handle file operation errors', async () => {
      mockClient.devboxes.createAndAwaitRunning.mockResolvedValue(mockDevboxData);
      const devbox = await Devbox.create(mockClient, { name: 'test-devbox' });

      const error = new Error('File not found');
      mockClient.devboxes.readFileContents.mockRejectedValue(error);

      await expect(devbox.file.read('nonexistent.txt')).rejects.toThrow('File not found');
    });

    it('should handle network operation errors', async () => {
      mockClient.devboxes.createAndAwaitRunning.mockResolvedValue(mockDevboxData);
      const devbox = await Devbox.create(mockClient, { name: 'test-devbox' });

      const error = new Error('SSH key creation failed');
      mockClient.devboxes.createSSHKey.mockRejectedValue(error);

      await expect(devbox.createSSHKey()).rejects.toThrow('SSH key creation failed');
    });
  });

  describe('edge cases', () => {
    it('should handle devbox with no parameters', async () => {
      mockClient.devboxes.createAndAwaitRunning.mockResolvedValue(mockDevboxData);

      const devbox = await Devbox.create(mockClient);

      expect(mockClient.devboxes.createAndAwaitRunning).toHaveBeenCalledWith(undefined, undefined);
      expect(devbox.id).toBe('devbox-123');
    });

    it('should handle command with empty output', async () => {
      mockClient.devboxes.createAndAwaitRunning.mockResolvedValue(mockDevboxData);
      const devbox = await Devbox.create(mockClient, { name: 'test-devbox' });

      const emptyResult = {
        devbox_id: 'devbox-123',
        execution_id: 'exec-456',
        status: 'completed' as const,
        exit_status: 0,
        stdout: '',
        stderr: '',
      };

      mockClient.devboxes.executeAndAwaitCompletion.mockResolvedValue(emptyResult);

      const result = await devbox.exec('true'); // Command that produces no output
      expect(result.stdout).toBe('');
      expect(result.stderr).toBe('');
    });

    it('should handle command with non-zero exit status', async () => {
      mockClient.devboxes.createAndAwaitRunning.mockResolvedValue(mockDevboxData);
      const devbox = await Devbox.create(mockClient, { name: 'test-devbox' });

      const failedResult = {
        devbox_id: 'devbox-123',
        execution_id: 'exec-456',
        status: 'completed' as const,
        exit_status: 1,
        stdout: '',
        stderr: 'Command failed',
      };

      mockClient.devboxes.executeAndAwaitCompletion.mockResolvedValue(failedResult);

      const result = await devbox.exec('false'); // Command that fails
      expect(result.exit_status).toBe(1);
      expect(result.stderr).toBe('Command failed');
    });

    it('should handle empty file content', async () => {
      mockClient.devboxes.createAndAwaitRunning.mockResolvedValue(mockDevboxData);
      const devbox = await Devbox.create(mockClient, { name: 'test-devbox' });

      mockClient.devboxes.readFileContents.mockResolvedValue('');

      const content = await devbox.file.read('empty-file.txt');
      expect(content).toBe('');
    });

    it('should handle snapshot without metadata', async () => {
      mockClient.devboxes.createAndAwaitRunning.mockResolvedValue(mockDevboxData);
      const devbox = await Devbox.create(mockClient, { name: 'test-devbox' });

      const snapshotWithoutMetadata = {
        id: 'snapshot-123',
        create_time_ms: Date.now(),
        metadata: {},
        source_devbox_id: 'devbox-123',
      };

      mockClient.devboxes.snapshotDisk.mockResolvedValue(snapshotWithoutMetadata);

      const result = await devbox.snapshotDisk();
      expect(result.metadata).toEqual({});
    });

    it('should handle lifecycle state transitions', async () => {
      mockClient.devboxes.createAndAwaitRunning.mockResolvedValue(mockDevboxData);
      const devbox = await Devbox.create(mockClient, { name: 'test-devbox' });

      // Test suspend
      const suspendedData = { ...mockDevboxData, status: 'suspended' as const };
      mockClient.devboxes.suspend.mockResolvedValue(suspendedData);
      await devbox.suspend();
      expect(devbox.status).toBe('suspended');

      // Test resume
      const resumedData = { ...mockDevboxData, status: 'running' as const };
      mockClient.devboxes.resume.mockResolvedValue(resumedData);
      await devbox.resume();
      expect(devbox.status).toBe('running');

      // Test shutdown
      const shutdownData = { ...mockDevboxData, status: 'shutdown' as const };
      mockClient.devboxes.shutdown.mockResolvedValue(shutdownData);
      await devbox.shutdown();
      expect(devbox.status).toBe('shutdown');
    });
  });
});
