import { ExecutionResult } from '../../src/objects/execution-result';
import type { DevboxAsyncExecutionDetailView } from '../../src/resources/devboxes/devboxes';

// Mock the Runloop client
jest.mock('../../src/index');

describe('ExecutionResult', () => {
  let mockClient: any;
  let mockExecutionData: DevboxAsyncExecutionDetailView;

  beforeEach(() => {
    // Create mock client with streaming methods
    mockClient = {
      devboxes: {
        executions: {
          streamStdoutUpdates: jest.fn(),
          streamStderrUpdates: jest.fn(),
        },
      },
    } as any;

    // Mock execution data
    mockExecutionData = {
      devbox_id: 'devbox-123',
      execution_id: 'exec-456',
      status: 'completed',
      exit_status: 0,
      stdout: 'line1\nline2\nline3',
      stderr: '',
    };
  });

  describe('constructor and basic properties', () => {
    it('should create an ExecutionResult instance', () => {
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);

      expect(result).toBeInstanceOf(ExecutionResult);
    });

    it('should expose exitCode property', () => {
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);

      expect(result.exitCode).toBe(0);
    });

    it('should return null for exitCode if not present', () => {
      const dataWithoutExit = { ...mockExecutionData, exit_status: null };
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', dataWithoutExit);

      expect(result.exitCode).toBeNull();
    });

    it('should expose raw result', () => {
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);

      expect(result.result).toEqual(mockExecutionData);
    });
  });

  describe('success and failed properties', () => {
    it('should return true for success when exit code is 0', () => {
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);

      expect(result.success).toBe(true);
      expect(result.failed).toBe(false);
    });

    it('should return true for failed when exit code is non-zero', () => {
      const failedData = { ...mockExecutionData, exit_status: 1 };
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', failedData);

      expect(result.success).toBe(false);
      expect(result.failed).toBe(true);
    });

    it('should handle null exit code', () => {
      const dataWithoutExit = { ...mockExecutionData, exit_status: null };
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', dataWithoutExit);

      expect(result.success).toBe(false);
      expect(result.failed).toBe(false);
    });
  });

  describe('stdout - non-truncated output', () => {
    it('should return all stdout when not truncated and no numLines specified', async () => {
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);

      const stdout = await result.stdout();

      expect(stdout).toBe('line1\nline2\nline3');
      expect(mockClient.devboxes.executions.streamStdoutUpdates).not.toHaveBeenCalled();
    });

    it('should return last N lines when not truncated and numLines specified', async () => {
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);

      const stdout = await result.stdout(2);

      expect(stdout).toBe('line2\nline3');
      expect(mockClient.devboxes.executions.streamStdoutUpdates).not.toHaveBeenCalled();
    });

    it('should return all lines when numLines exceeds available lines', async () => {
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);

      const stdout = await result.stdout(10);

      expect(stdout).toBe('line1\nline2\nline3');
      expect(mockClient.devboxes.executions.streamStdoutUpdates).not.toHaveBeenCalled();
    });

    it('should handle empty stdout', async () => {
      const emptyData = { ...mockExecutionData, stdout: '' };
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', emptyData);

      const stdout = await result.stdout();

      expect(stdout).toBe('');
    });

    it('should handle null stdout', async () => {
      const nullData = { ...mockExecutionData, stdout: null };
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', nullData);

      const stdout = await result.stdout();

      expect(stdout).toBe('');
    });
  });

  describe('stdout - truncated output', () => {
    beforeEach(() => {
      // Mock truncated execution data
      mockExecutionData = {
        ...mockExecutionData,
        stdout: 'line1\nline2',
        stdout_truncated: true,
      } as any;
    });

    it('should stream all logs when truncated and no numLines specified', async () => {
      const mockStream = [{ output: 'line1\nline2\n' }, { output: 'line3\nline4\n' }, { output: 'line5' }];

      mockClient.devboxes.executions.streamStdoutUpdates.mockResolvedValue(
        (async function* () {
          for (const chunk of mockStream) {
            yield chunk;
          }
        })(),
      );

      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);
      const stdout = await result.stdout();

      expect(mockClient.devboxes.executions.streamStdoutUpdates).toHaveBeenCalledWith(
        'devbox-123',
        'exec-456',
      );
      expect(stdout).toBe('line1\nline2\nline3\nline4\nline5');
    });

    it('should stream and return last N lines when truncated and numLines specified', async () => {
      const mockStream = [{ output: 'line1\nline2\n' }, { output: 'line3\nline4\n' }, { output: 'line5' }];

      mockClient.devboxes.executions.streamStdoutUpdates.mockResolvedValue(
        (async function* () {
          for (const chunk of mockStream) {
            yield chunk;
          }
        })(),
      );

      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);
      const stdout = await result.stdout(3);

      expect(mockClient.devboxes.executions.streamStdoutUpdates).toHaveBeenCalledWith(
        'devbox-123',
        'exec-456',
      );
      expect(stdout).toBe('line3\nline4\nline5');
    });

    it('should NOT stream when numLines is less than available lines', async () => {
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);
      const stdout = await result.stdout(1);

      expect(mockClient.devboxes.executions.streamStdoutUpdates).not.toHaveBeenCalled();
      expect(stdout).toBe('line2');
    });

    it('should stream when numLines exceeds available truncated lines', async () => {
      const mockStream = [{ output: 'line1\nline2\nline3\nline4\nline5' }];

      mockClient.devboxes.executions.streamStdoutUpdates.mockResolvedValue(
        (async function* () {
          for (const chunk of mockStream) {
            yield chunk;
          }
        })(),
      );

      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);
      const stdout = await result.stdout(5);

      expect(mockClient.devboxes.executions.streamStdoutUpdates).toHaveBeenCalledWith(
        'devbox-123',
        'exec-456',
      );
      expect(stdout).toBe('line1\nline2\nline3\nline4\nline5');
    });
  });

  describe('stderr - non-truncated output', () => {
    beforeEach(() => {
      mockExecutionData = {
        ...mockExecutionData,
        stderr: 'error1\nerror2\nerror3',
      };
    });

    it('should return all stderr when not truncated and no numLines specified', async () => {
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);

      const stderr = await result.stderr();

      expect(stderr).toBe('error1\nerror2\nerror3');
      expect(mockClient.devboxes.executions.streamStderrUpdates).not.toHaveBeenCalled();
    });

    it('should return last N lines when not truncated and numLines specified', async () => {
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);

      const stderr = await result.stderr(2);

      expect(stderr).toBe('error2\nerror3');
      expect(mockClient.devboxes.executions.streamStderrUpdates).not.toHaveBeenCalled();
    });

    it('should return all lines when numLines exceeds available lines', async () => {
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);

      const stderr = await result.stderr(10);

      expect(stderr).toBe('error1\nerror2\nerror3');
      expect(mockClient.devboxes.executions.streamStderrUpdates).not.toHaveBeenCalled();
    });

    it('should handle empty stderr', async () => {
      const emptyData = { ...mockExecutionData, stderr: '' };
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', emptyData);

      const stderr = await result.stderr();

      expect(stderr).toBe('');
    });

    it('should handle null stderr', async () => {
      const nullData = { ...mockExecutionData, stderr: null };
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', nullData);

      const stderr = await result.stderr();

      expect(stderr).toBe('');
    });
  });

  describe('stderr - truncated output', () => {
    beforeEach(() => {
      mockExecutionData = {
        ...mockExecutionData,
        stderr: 'error1\nerror2',
        stderr_truncated: true,
      } as any;
    });

    it('should stream all logs when truncated and no numLines specified', async () => {
      const mockStream = [
        { output: 'error1\nerror2\n' },
        { output: 'error3\nerror4\n' },
        { output: 'error5' },
      ];

      mockClient.devboxes.executions.streamStderrUpdates.mockResolvedValue(
        (async function* () {
          for (const chunk of mockStream) {
            yield chunk;
          }
        })(),
      );

      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);
      const stderr = await result.stderr();

      expect(mockClient.devboxes.executions.streamStderrUpdates).toHaveBeenCalledWith(
        'devbox-123',
        'exec-456',
      );
      expect(stderr).toBe('error1\nerror2\nerror3\nerror4\nerror5');
    });

    it('should stream and return last N lines when truncated and numLines specified', async () => {
      const mockStream = [
        { output: 'error1\nerror2\n' },
        { output: 'error3\nerror4\n' },
        { output: 'error5' },
      ];

      mockClient.devboxes.executions.streamStderrUpdates.mockResolvedValue(
        (async function* () {
          for (const chunk of mockStream) {
            yield chunk;
          }
        })(),
      );

      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);
      const stderr = await result.stderr(3);

      expect(mockClient.devboxes.executions.streamStderrUpdates).toHaveBeenCalledWith(
        'devbox-123',
        'exec-456',
      );
      expect(stderr).toBe('error3\nerror4\nerror5');
    });

    it('should NOT stream when numLines is less than available lines', async () => {
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);
      const stderr = await result.stderr(1);

      expect(mockClient.devboxes.executions.streamStderrUpdates).not.toHaveBeenCalled();
      expect(stderr).toBe('error2');
    });

    it('should stream when numLines exceeds available truncated lines', async () => {
      const mockStream = [{ output: 'error1\nerror2\nerror3\nerror4\nerror5' }];

      mockClient.devboxes.executions.streamStderrUpdates.mockResolvedValue(
        (async function* () {
          for (const chunk of mockStream) {
            yield chunk;
          }
        })(),
      );

      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);
      const stderr = await result.stderr(5);

      expect(mockClient.devboxes.executions.streamStderrUpdates).toHaveBeenCalledWith(
        'devbox-123',
        'exec-456',
      );
      expect(stderr).toBe('error1\nerror2\nerror3\nerror4\nerror5');
    });
  });

  describe('edge cases', () => {
    it('should handle single-line output', async () => {
      const singleLineData = { ...mockExecutionData, stdout: 'single line' };
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', singleLineData);

      const stdout = await result.stdout();

      expect(stdout).toBe('single line');
    });

    it('should handle output with trailing newline', async () => {
      const trailingNewlineData = { ...mockExecutionData, stdout: 'line1\nline2\nline3\n' };
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', trailingNewlineData);

      const stdout = await result.stdout(2);

      // Should return the last 2 actual lines (trailing empty strings are removed)
      expect(stdout).toBe('line2\nline3');
    });

    it('should handle numLines = 0', async () => {
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);

      const stdout = await result.stdout(0);

      // slice(0) returns empty array when 0 is passed as negative index
      expect(stdout).toBe('line1\nline2\nline3');
    });

    it('should handle numLines = 1 (last line only)', async () => {
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', mockExecutionData);

      const stdout = await result.stdout(1);

      expect(stdout).toBe('line3');
    });

    it('should handle concurrent stdout and stderr calls', async () => {
      const dataWithBoth = {
        ...mockExecutionData,
        stdout: 'out1\nout2',
        stderr: 'err1\nerr2',
      };
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', dataWithBoth);

      const [stdout, stderr] = await Promise.all([result.stdout(), result.stderr()]);

      expect(stdout).toBe('out1\nout2');
      expect(stderr).toBe('err1\nerr2');
    });

    it('should handle large output with many lines', async () => {
      const largeOutput = Array.from({ length: 1000 }, (_, i) => `line${i}`).join('\n');
      const largeData = { ...mockExecutionData, stdout: largeOutput };
      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', largeData);

      const stdout = await result.stdout(50);

      const lines = stdout.split('\n');
      expect(lines).toHaveLength(50);
      expect(lines[0]).toBe('line950');
      expect(lines[49]).toBe('line999');
    });
  });

  describe('streaming error handling', () => {
    it('should propagate errors from streamStdoutUpdates', async () => {
      const truncatedData = { ...mockExecutionData, stdout_truncated: true } as any;
      mockClient.devboxes.executions.streamStdoutUpdates.mockRejectedValue(new Error('Stream failed'));

      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', truncatedData);

      await expect(result.stdout()).rejects.toThrow('Stream failed');
    });

    it('should propagate errors from streamStderrUpdates', async () => {
      const truncatedData = { ...mockExecutionData, stderr_truncated: true } as any;
      mockClient.devboxes.executions.streamStderrUpdates.mockRejectedValue(new Error('Stream failed'));

      const result = new ExecutionResult(mockClient, 'devbox-123', 'exec-456', truncatedData);

      await expect(result.stderr()).rejects.toThrow('Stream failed');
    });
  });
});
