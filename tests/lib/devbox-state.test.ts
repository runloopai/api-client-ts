import { awaitDevboxState, DevboxStateWaitOptions } from '../../src/lib/devbox-state';
import { PollingTimeoutError } from '../../src/lib/polling';
import { APIError } from '../../src/error';

type MockDevbox = { status: string; id: string };

function makeOptions(overrides: Partial<DevboxStateWaitOptions<MockDevbox>> = {}): DevboxStateWaitOptions<MockDevbox> {
  return {
    client: overrides.client ?? { post: jest.fn() },
    devboxId: 'dbx-123',
    targetState: 'running',
    statesToCheck: ['running', 'failure', 'shutdown'],
    transitionStates: ['provisioning', 'initializing'],
    errorMessage: (id, state) => `Devbox ${id} ended in ${state}`,
    ...overrides,
  };
}

describe('awaitDevboxState', () => {
  test('should return when the target state is reached immediately', async () => {
    const result: MockDevbox = { status: 'running', id: 'dbx-123' };
    const post = jest.fn().mockResolvedValue(result);

    const value = await awaitDevboxState(makeOptions({ client: { post } }));

    expect(value).toBe(result);
    expect(post).toHaveBeenCalledWith('/v1/devboxes/dbx-123/wait_for_status', {
      body: { statuses: ['running', 'failure', 'shutdown'] },
      signal: expect.any(AbortSignal),
      timeout: 600000,
      maxRetries: 0,
    });
  });

  test('should loop through transition states until target', async () => {
    const provisioning: MockDevbox = { status: 'provisioning', id: 'dbx-123' };
    const running: MockDevbox = { status: 'running', id: 'dbx-123' };
    const post = jest.fn().mockResolvedValueOnce(provisioning).mockResolvedValueOnce(running);

    const value = await awaitDevboxState(makeOptions({ client: { post } }));

    expect(value).toBe(running);
    expect(post).toHaveBeenCalledTimes(2);
  });

  test('should throw when final state is not the target', async () => {
    const failure: MockDevbox = { status: 'failure', id: 'dbx-123' };
    const post = jest.fn().mockResolvedValue(failure);

    await expect(
      awaitDevboxState(makeOptions({ client: { post } })),
    ).rejects.toThrow('Devbox dbx-123 ended in failure');
  });

  test('should use timeoutMs field for the long-poll deadline', async () => {
    const post = jest.fn().mockImplementation(
      (_url: string, opts: { signal?: AbortSignal }) => new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve({ status: 'provisioning', id: 'dbx-123' }), 100);
        opts?.signal?.addEventListener('abort', () => { clearTimeout(timer); reject(new Error('aborted')); }, { once: true });
      }),
    );

    await expect(
      awaitDevboxState(makeOptions({ client: { post }, timeoutMs: 150 })),
    ).rejects.toThrow(PollingTimeoutError);
  });

  test('should enforce timeout mid-request by aborting the request', async () => {
    const post = jest.fn().mockImplementation(
      (_url: string, opts: { signal?: AbortSignal }) => new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve({ status: 'provisioning', id: 'dbx-123' }), 5000);
        timer.unref();
        opts?.signal?.addEventListener('abort', () => { clearTimeout(timer); reject(new Error('aborted')); }, { once: true });
      }),
    );

    const start = Date.now();
    await expect(
      awaitDevboxState(makeOptions({ client: { post }, timeoutMs: 100 })),
    ).rejects.toThrow(PollingTimeoutError);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });

  test('should work with no timeout at all', async () => {
    const running: MockDevbox = { status: 'running', id: 'dbx-123' };
    const post = jest.fn().mockResolvedValue(running);

    const value = await awaitDevboxState(makeOptions({ client: { post } }));

    expect(value).toBe(running);
  });

  test('should retry on 408 errors transparently', async () => {
    const timeoutError = new APIError(408, {}, 'Request timeout', {});
    const running: MockDevbox = { status: 'running', id: 'dbx-123' };
    const post = jest.fn().mockRejectedValueOnce(timeoutError).mockResolvedValueOnce(running);

    const value = await awaitDevboxState(makeOptions({ client: { post } }));

    expect(value).toBe(running);
    expect(post).toHaveBeenCalledTimes(2);
  });
});
