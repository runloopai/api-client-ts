import { Execution } from '../../src/sdk/execution';
import { RunloopError } from '../../src/error';
import type { DevboxAsyncExecutionDetailView } from '../../src/resources/devboxes/devboxes';

jest.mock('../../src/index');

describe('Execution', () => {
  let mockClient: any;
  let execution: Execution;

  beforeEach(() => {
    mockClient = {
      post: jest.fn(),
    } as any;

    const initialResult: DevboxAsyncExecutionDetailView = {
      devbox_id: 'devbox-123',
      execution_id: 'exec-456',
      status: 'running',
    };
    execution = new Execution(mockClient, 'devbox-123', 'exec-456', initialResult);
  });

  describe('sendStdIn', () => {
    it('sends text to the execution stdin', async () => {
      mockClient.post.mockResolvedValue({
        devbox_id: 'devbox-123',
        execution_id: 'exec-456',
        success: true,
      });

      await execution.sendStdIn('hello\n', { timeout: 1000 });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/v1/devboxes/devbox-123/executions/exec-456/send_std_in',
        { timeout: 1000, body: { text: 'hello\n' } },
      );
    });

    it('rejects when the API reports the input was not sent', async () => {
      mockClient.post.mockResolvedValue({
        devbox_id: 'devbox-123',
        execution_id: 'exec-456',
        success: false,
      });

      await expect(execution.sendStdIn('hello\n')).rejects.toThrow(RunloopError);
    });
  });

  describe('closeStdIn', () => {
    it('sends an EOF signal to the execution stdin', async () => {
      mockClient.post.mockResolvedValue({
        devbox_id: 'devbox-123',
        execution_id: 'exec-456',
        success: true,
      });

      await execution.closeStdIn();

      expect(mockClient.post).toHaveBeenCalledWith(
        '/v1/devboxes/devbox-123/executions/exec-456/send_std_in',
        { body: { signal: 'EOF' } },
      );
    });

    it('rejects when the API reports EOF was not sent', async () => {
      mockClient.post.mockResolvedValue({
        devbox_id: 'devbox-123',
        execution_id: 'exec-456',
        success: false,
      });

      await expect(execution.closeStdIn()).rejects.toThrow(RunloopError);
    });
  });
});
