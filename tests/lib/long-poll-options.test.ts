import { PollingTimeoutError } from '../../src/lib/polling';
import { awaitDevboxState, DevboxStateWaitOptions } from '../../src/lib/devbox-state';

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

/**
 * Tests verifying that both the new `longPoll: { timeoutMs }` and the
 * deprecated `polling: { timeoutMs }` option paths resolve correctly
 * when used at the resource layer. The resource methods resolve the
 * effective timeout as:
 *   options?.longPoll?.timeoutMs ?? options?.polling?.timeoutMs
 * and pass it as `timeoutMs` to `awaitDevboxState` / `longPollUntil`.
 *
 * These tests exercise that resolution by calling `awaitDevboxState`
 * directly with the resolved value — mirroring what the resource methods do.
 */
describe('LongPollRequestOptions resolution', () => {
  function resolveTimeoutMs(options?: {
    longPoll?: { timeoutMs?: number };
    polling?: { timeoutMs?: number };
  }): number | undefined {
    return options?.longPoll?.timeoutMs ?? options?.polling?.timeoutMs;
  }

  describe('resolution logic', () => {
    test('longPoll.timeoutMs is used when provided', () => {
      expect(resolveTimeoutMs({ longPoll: { timeoutMs: 5000 } })).toBe(5000);
    });

    test('polling.timeoutMs is used when longPoll is not provided', () => {
      expect(resolveTimeoutMs({ polling: { timeoutMs: 3000 } })).toBe(3000);
    });

    test('longPoll.timeoutMs takes precedence over polling.timeoutMs', () => {
      expect(
        resolveTimeoutMs({
          longPoll: { timeoutMs: 5000 },
          polling: { timeoutMs: 1000 },
        }),
      ).toBe(5000);
    });

    test('returns undefined when neither is provided', () => {
      expect(resolveTimeoutMs({})).toBeUndefined();
      expect(resolveTimeoutMs(undefined)).toBeUndefined();
    });
  });

  describe('end-to-end via awaitDevboxState', () => {
    function slowTransition(): jest.Mock {
      return jest.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ status: 'provisioning', id: 'dbx-123' }), 100)),
      );
    }

    test('times out via longPoll.timeoutMs path', async () => {
      const post = slowTransition();
      const timeoutMs = resolveTimeoutMs({ longPoll: { timeoutMs: 150 } });

      await expect(
        awaitDevboxState(makeOptions({ client: { post }, timeoutMs })),
      ).rejects.toThrow(PollingTimeoutError);
    });

    test('times out via deprecated polling.timeoutMs path', async () => {
      const post = slowTransition();
      const timeoutMs = resolveTimeoutMs({ polling: { timeoutMs: 150 } });

      await expect(
        awaitDevboxState(makeOptions({ client: { post }, timeoutMs })),
      ).rejects.toThrow(PollingTimeoutError);
    });

    test('longPoll.timeoutMs wins over polling.timeoutMs (generous longPoll, tiny polling)', async () => {
      let callCount = 0;
      const post = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return new Promise((resolve) =>
            setTimeout(() => resolve({ status: 'provisioning', id: 'dbx-123' }), 10),
          );
        }
        return Promise.resolve({ status: 'running', id: 'dbx-123' });
      });

      const timeoutMs = resolveTimeoutMs({
        longPoll: { timeoutMs: 5000 },
        polling: { timeoutMs: 1 },
      });

      const value = await awaitDevboxState(makeOptions({ client: { post }, timeoutMs }));
      expect(value.status).toBe('running');
    });

    test('succeeds via longPoll.timeoutMs path when target state reached', async () => {
      const post = jest.fn().mockResolvedValue({ status: 'running', id: 'dbx-123' });
      const timeoutMs = resolveTimeoutMs({ longPoll: { timeoutMs: 5000 } });

      const value = await awaitDevboxState(makeOptions({ client: { post }, timeoutMs }));
      expect(value.status).toBe('running');
    });

    test('succeeds via deprecated polling.timeoutMs path when target state reached', async () => {
      const post = jest.fn().mockResolvedValue({ status: 'running', id: 'dbx-123' });
      const timeoutMs = resolveTimeoutMs({ polling: { timeoutMs: 5000 } });

      const value = await awaitDevboxState(makeOptions({ client: { post }, timeoutMs }));
      expect(value.status).toBe('running');
    });

    test('works with no timeout from either path', async () => {
      const post = jest.fn().mockResolvedValue({ status: 'running', id: 'dbx-123' });
      const timeoutMs = resolveTimeoutMs({});

      const value = await awaitDevboxState(makeOptions({ client: { post }, timeoutMs }));
      expect(value.status).toBe('running');
    });
  });
});
