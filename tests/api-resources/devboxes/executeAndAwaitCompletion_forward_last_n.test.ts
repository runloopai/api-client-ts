import Runloop from '@runloop/api-client';

describe('Devboxes.executeAndAwaitCompletion forwards last_n to waitForCommand', () => {
  const client = new Runloop({ bearerToken: 'test-token', baseURL: 'http://127.0.0.1:4010' });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('last_n is forwarded during polling', async () => {
    const execId = 'exec-123';

    // Arrange: stub execute to simulate an in-progress execution
    jest.spyOn(client.devboxes, 'execute').mockResolvedValue({
      devbox_id: 'dev-1',
      execution_id: execId,
      status: 'running',
    } as any);

    // Stub waitForCommand to immediately return completed
    const waitSpy = jest.spyOn(client.devboxes, 'waitForCommand').mockResolvedValue({
      devbox_id: 'dev-1',
      execution_id: execId,
      status: 'completed',
      exit_status: 0,
      stdout: 'ok',
      stderr: '',
    } as any);

    // Act
    const completed = await client.devboxes.executeAndAwaitCompletion('dev-1', {
      command: 'echo hello',
      last_n: '1000',
    });

    // Assert
    expect(completed.status).toBe('completed');
    expect(waitSpy).toHaveBeenCalled();
    const lastCallArgs = waitSpy.mock.calls[waitSpy.mock.calls.length - 1]!;
    expect(lastCallArgs[0]).toBe('dev-1');
    expect(lastCallArgs[1]).toBe(execId);
    expect(lastCallArgs[2]).toMatchObject({ statuses: ['completed'], last_n: '1000' });
  });
});
