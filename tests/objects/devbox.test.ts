import { Devbox } from '../../src/sdk/devbox';
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
        executeAndAwaitCompletion: jest.fn(),
        readFileContents: jest.fn(),
        writeFileContents: jest.fn(),
        downloadFile: jest.fn(),
        uploadFile: jest.fn(),
        shutdown: jest.fn(),
        suspend: jest.fn(),
        resume: jest.fn(),
        awaitRunning: jest.fn(),
        awaitSuspended: jest.fn(),
        keepAlive: jest.fn(),
        snapshotDisk: jest.fn(),
        snapshotDiskAsync: jest.fn(),
        createSSHKey: jest.fn(),
        createTunnel: jest.fn(),
        enableTunnel: jest.fn(),
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

        mockClient.devboxes.executeAndAwaitCompletion.mockResolvedValue(mockExecution);

        const result = await devbox.cmd.exec('echo "Hello World"');

        expect(mockClient.devboxes.executeAndAwaitCompletion).toHaveBeenCalledWith(
          'devbox-123',
          { command: 'echo "Hello World"' },
          undefined,
        );
        expect(result).toBeInstanceOf(require('../../src/sdk/execution-result').ExecutionResult);
        expect(result.exitCode).toBe(0);
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

        const result = await devbox.cmd.execAsync('sleep 10');

        expect(mockClient.devboxes.executeAsync).toHaveBeenCalledWith(
          'devbox-123',
          { command: 'sleep 10' },
          undefined,
        );
        expect(result).toBeInstanceOf(require('../../src/sdk/execution').Execution);
        expect(result.executionId).toBe('exec-456');
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
        const mockRunningData = { ...mockDevboxData, status: 'running' as const };
        mockClient.devboxes.resume.mockResolvedValue(undefined);
        mockClient.devboxes.awaitRunning.mockResolvedValue(mockRunningData);

        const result = await devbox.resume();

        expect(mockClient.devboxes.resume).toHaveBeenCalledWith('devbox-123', undefined);
        expect(mockClient.devboxes.awaitRunning).toHaveBeenCalledWith('devbox-123', undefined);
        expect(result).toEqual(mockRunningData); // Should return devbox data when running
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

    describe('getTunnel', () => {
      it('should return tunnel info when tunnel exists', async () => {
        const mockTunnel = {
          tunnel_key: 'abc123xyz',
          auth_mode: 'open' as const,
          create_time_ms: Date.now(),
        };
        const dataWithTunnel = { ...mockDevboxData, tunnel: mockTunnel };
        mockClient.devboxes.retrieve.mockResolvedValue(dataWithTunnel);

        const tunnel = await devbox.getTunnel();

        expect(mockClient.devboxes.retrieve).toHaveBeenCalledWith('devbox-123', undefined);
        expect(tunnel).toEqual(mockTunnel);
        expect(tunnel?.tunnel_key).toBe('abc123xyz');
      });

      it('should return null when no tunnel exists', async () => {
        const dataWithoutTunnel = { ...mockDevboxData, tunnel: null };
        mockClient.devboxes.retrieve.mockResolvedValue(dataWithoutTunnel);

        const tunnel = await devbox.getTunnel();

        expect(mockClient.devboxes.retrieve).toHaveBeenCalledWith('devbox-123', undefined);
        expect(tunnel).toBeNull();
      });

      it('should return null when tunnel is undefined', async () => {
        mockClient.devboxes.retrieve.mockResolvedValue(mockDevboxData);

        const tunnel = await devbox.getTunnel();

        expect(tunnel).toBeNull();
      });
    });

    describe('getTunnelUrl', () => {
      it('should return the correct tunnel URL for a given port', async () => {
        const mockTunnel = {
          tunnel_key: 'abc123xyz',
          auth_mode: 'open' as const,
          create_time_ms: Date.now(),
        };
        const dataWithTunnel = { ...mockDevboxData, tunnel: mockTunnel };
        mockClient.devboxes.retrieve.mockResolvedValue(dataWithTunnel);

        const url = await devbox.getTunnelUrl(8080);

        expect(url).toBe('https://8080-abc123xyz.tunnel.runloop.ai');
      });

      it('should work with different port numbers', async () => {
        const mockTunnel = {
          tunnel_key: 'mykey456',
          auth_mode: 'authenticated' as const,
          create_time_ms: Date.now(),
          auth_token: 'secret-token',
        };
        const dataWithTunnel = { ...mockDevboxData, tunnel: mockTunnel };
        mockClient.devboxes.retrieve.mockResolvedValue(dataWithTunnel);

        const url = await devbox.getTunnelUrl(3000);

        expect(url).toBe('https://3000-mykey456.tunnel.runloop.ai');
      });

      it('should throw error when no tunnel has been enabled', async () => {
        const dataWithoutTunnel = { ...mockDevboxData, tunnel: null };
        mockClient.devboxes.retrieve.mockResolvedValue(dataWithoutTunnel);

        await expect(devbox.getTunnelUrl(8080)).rejects.toThrow(
          'No tunnel has been enabled for this devbox. Call net.enableTunnel() first.',
        );
      });
    });

    describe('id property', () => {
      it('should expose devbox ID', () => {
        expect(devbox.id).toBe('devbox-123');
      });
    });

    describe('net operations', () => {
      it('should create SSH key', async () => {
        const mockSSHKey = { url: 'ssh.example.com', ssh_private_key: 'private-key' };
        mockClient.devboxes.createSSHKey.mockResolvedValue(mockSSHKey);

        const result = await devbox.net.createSSHKey();

        expect(mockClient.devboxes.createSSHKey).toHaveBeenCalledWith('devbox-123', undefined);
        expect(result).toEqual(mockSSHKey);
      });

      it('should create legacy tunnel', async () => {
        const mockTunnel = { devbox_id: 'devbox-123', port: 8080 };
        mockClient.devboxes.createTunnel.mockResolvedValue(mockTunnel);

        const result = await devbox.net.createTunnel({ port: 8080 });

        expect(mockClient.devboxes.createTunnel).toHaveBeenCalledWith(
          'devbox-123',
          { port: 8080 },
          undefined,
        );
        expect(result).toEqual(mockTunnel);
      });

      it('should enable V2 tunnel with params', async () => {
        const mockTunnel = { tunnel_key: 'abc123', auth_mode: 'open', create_time_ms: Date.now() };
        mockClient.devboxes.enableTunnel.mockResolvedValue(mockTunnel);

        const result = await devbox.net.enableTunnel({ auth_mode: 'open' });

        expect(mockClient.devboxes.enableTunnel).toHaveBeenCalledWith(
          'devbox-123',
          { auth_mode: 'open' },
          undefined,
        );
        expect(result).toEqual(mockTunnel);
      });

      it('should enable V2 tunnel without params', async () => {
        const mockTunnel = { tunnel_key: 'abc123', auth_mode: 'open', create_time_ms: Date.now() };
        mockClient.devboxes.enableTunnel.mockResolvedValue(mockTunnel);

        const result = await devbox.net.enableTunnel();

        expect(mockClient.devboxes.enableTunnel).toHaveBeenCalledWith('devbox-123', undefined, undefined);
        expect(result).toEqual(mockTunnel);
      });

      it('should remove legacy tunnel', async () => {
        mockClient.devboxes.removeTunnel.mockResolvedValue(undefined);

        const result = await devbox.net.removeTunnel({ port: 8080 });

        expect(mockClient.devboxes.removeTunnel).toHaveBeenCalledWith(
          'devbox-123',
          { port: 8080 },
          undefined,
        );
        expect(result).toBeUndefined();
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
        expect(snapshot).toBeInstanceOf(require('../../src/sdk/snapshot').Snapshot);
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
        expect(snapshot).toBeInstanceOf(require('../../src/sdk/snapshot').Snapshot);
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
      mockClient.devboxes.executeAndAwaitCompletion.mockRejectedValue(error);

      await expect(devbox.cmd.exec('failing-command')).rejects.toThrow('Command failed');
    });

    it('should throw when awaitCompleted rejects while using streaming callbacks', async () => {
      mockClient.devboxes.createAndAwaitRunning.mockResolvedValue(mockDevboxData);
      const devbox = await Devbox.create(mockClient, { name: 'test-devbox' });

      // Mock executeAsync to return a valid execution
      const mockExecution: DevboxAsyncExecutionDetailView = {
        devbox_id: 'devbox-123',
        execution_id: 'exec-456',
        status: 'running',
      };
      mockClient.devboxes.executeAsync.mockResolvedValue(mockExecution);

      // Mock executions.awaitCompleted to reject
      mockClient.devboxes.executions = {
        awaitCompleted: jest.fn().mockRejectedValue(new Error('Execution timed out')),
        streamStdoutUpdates: jest.fn().mockResolvedValue({
          [Symbol.asyncIterator]: () => ({
            next: () => Promise.resolve({ done: true }),
          }),
        }),
        streamStderrUpdates: jest.fn().mockResolvedValue({
          [Symbol.asyncIterator]: () => ({
            next: () => Promise.resolve({ done: true }),
          }),
        }),
      };

      // Call exec with a callback to trigger the streaming code path
      await expect(devbox.cmd.exec('failing-command', { stdout: () => {} })).rejects.toThrow(
        'Execution timed out',
      );
    });

    it('should handle streaming errors gracefully and not block execution', async () => {
      mockClient.devboxes.createAndAwaitRunning.mockResolvedValue(mockDevboxData);
      const devbox = await Devbox.create(mockClient, { name: 'test-devbox' });

      const mockExecution: DevboxAsyncExecutionDetailView = {
        devbox_id: 'devbox-123',
        execution_id: 'exec-456',
        status: 'running',
      };
      mockClient.devboxes.executeAsync.mockResolvedValue(mockExecution);

      const completedExecution: DevboxAsyncExecutionDetailView = {
        devbox_id: 'devbox-123',
        execution_id: 'exec-456',
        status: 'completed',
        exit_status: 0,
        stdout: 'output',
        stderr: '',
      };

      mockClient.devboxes.executions = {
        awaitCompleted: jest.fn().mockResolvedValue(completedExecution),
        streamStdoutUpdates: jest.fn().mockRejectedValue(new Error('Streaming stdout failed')),
        streamStderrUpdates: jest.fn().mockRejectedValue(new Error('Streaming stderr failed')),
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await devbox.cmd.exec('echo hello', {
        stdout: () => {},
        stderr: () => {},
      });

      expect(result.exitCode).toBe(0);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error streaming stdout:', expect.any(Error));
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error streaming stderr:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('should invoke streaming callbacks when stream yields data', async () => {
      mockClient.devboxes.createAndAwaitRunning.mockResolvedValue(mockDevboxData);
      const devbox = await Devbox.create(mockClient, { name: 'test-devbox' });

      const mockExecution: DevboxAsyncExecutionDetailView = {
        devbox_id: 'devbox-123',
        execution_id: 'exec-456',
        status: 'running',
      };
      mockClient.devboxes.executeAsync.mockResolvedValue(mockExecution);

      const completedExecution: DevboxAsyncExecutionDetailView = {
        devbox_id: 'devbox-123',
        execution_id: 'exec-456',
        status: 'completed',
        exit_status: 0,
        stdout: 'line1\nline2',
        stderr: 'err1',
      };

      const createMockStream = (chunks: { output: string }[]) => {
        let index = 0;
        return {
          [Symbol.asyncIterator]: () => ({
            next: () => {
              if (index < chunks.length) {
                return Promise.resolve({ value: chunks[index++], done: false });
              }
              return Promise.resolve({ value: undefined, done: true });
            },
          }),
        };
      };

      mockClient.devboxes.executions = {
        awaitCompleted: jest.fn().mockResolvedValue(completedExecution),
        streamStdoutUpdates: jest
          .fn()
          .mockResolvedValue(createMockStream([{ output: 'line1\n' }, { output: 'line2\n' }])),
        streamStderrUpdates: jest.fn().mockResolvedValue(createMockStream([{ output: 'err1\n' }])),
      };

      const stdoutLines: string[] = [];
      const stderrLines: string[] = [];
      const outputLines: string[] = [];

      const result = await devbox.cmd.exec('echo hello', {
        stdout: (line) => stdoutLines.push(line),
        stderr: (line) => stderrLines.push(line),
        output: (line) => outputLines.push(line),
      });

      expect(result.exitCode).toBe(0);

      expect(stdoutLines).toEqual(['line1\n', 'line2\n']);
      expect(stderrLines).toEqual(['err1\n']);
      expect(outputLines).toContain('line1\n');
      expect(outputLines).toContain('line2\n');
      expect(outputLines).toContain('err1\n');
    });
  });
});
