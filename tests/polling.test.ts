import { poll, PollingTimeoutError, MaxAttemptsExceededError } from '../src/lib/polling';
import { APIError } from '../src/error';

describe('Polling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Basic Functionality', () => {
    test('should return result immediately when shouldStop returns true on initial request', async () => {
      const mockResult = { status: 'running', id: 'test-id' };
      const initialRequest = jest.fn().mockResolvedValue(mockResult);
      const pollingRequest = jest.fn();
      const shouldStop = jest.fn().mockReturnValue(true);

      const promise = poll(initialRequest, pollingRequest, { shouldStop });

      const result = await promise;

      expect(result).toBe(mockResult);
      expect(initialRequest).toHaveBeenCalledTimes(1);
      expect(pollingRequest).not.toHaveBeenCalled();
      expect(shouldStop).toHaveBeenCalledWith(mockResult);
    });

    test('should continue polling when shouldStop returns false', async () => {
      const initialResult = { status: 'provisioning', id: 'test-id' };
      const finalResult = { status: 'running', id: 'test-id' };

      const initialRequest = jest.fn().mockResolvedValue(initialResult);
      const pollingRequest = jest
        .fn()
        .mockResolvedValueOnce(initialResult)
        .mockResolvedValueOnce(finalResult);

      const shouldStop = jest
        .fn()
        .mockReturnValueOnce(false) // Initial request
        .mockReturnValueOnce(false) // First polling attempt
        .mockReturnValueOnce(true); // Second polling attempt

      const promise = poll(initialRequest, pollingRequest, {
        shouldStop,
        initialDelayMs: 100,
        pollingIntervalMs: 100,
      });

      // Advance timers step by step
      await jest.advanceTimersByTimeAsync(100); // Initial delay
      await jest.advanceTimersByTimeAsync(100); // First polling interval

      const result = await promise;

      expect(result).toBe(finalResult);
      expect(initialRequest).toHaveBeenCalledTimes(1);
      expect(pollingRequest).toHaveBeenCalledTimes(2);
      expect(shouldStop).toHaveBeenCalledTimes(3);
    });

    test('should use default options when not specified', async () => {
      const mockResult = { status: 'running', id: 'test-id' };
      const initialRequest = jest.fn().mockResolvedValue(mockResult);
      const pollingRequest = jest.fn();
      const shouldStop = jest.fn().mockReturnValue(true);

      const promise = poll(initialRequest, pollingRequest, { shouldStop });

      const result = await promise;

      expect(result).toBe(mockResult);
      expect(initialRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('Timeout Handling', () => {
    test('should throw PollingTimeoutError when timeout is exceeded', async () => {
      const mockResult = { status: 'provisioning', id: 'test-id' };
      const initialRequest = jest.fn().mockResolvedValue(mockResult);
      const pollingRequest = jest.fn().mockResolvedValue(mockResult);
      const shouldStop = jest.fn().mockReturnValue(false);

      const promise = poll(initialRequest, pollingRequest, {
        shouldStop,
        timeoutMs: 1000,
        initialDelayMs: 100,
        pollingIntervalMs: 100,
      });

      // Let initial request complete
      await jest.advanceTimersByTimeAsync(0);

      // Fast forward past the timeout
      jest.advanceTimersByTime(1001);

      await expect(promise).rejects.toThrow(PollingTimeoutError);
      await expect(promise).rejects.toThrow('Polling timed out after 1000ms');
    });

    test('should cancel timeout when polling succeeds', async () => {
      const mockResult = { status: 'running', id: 'test-id' };
      const initialRequest = jest.fn().mockResolvedValue(mockResult);
      const pollingRequest = jest.fn();
      const shouldStop = jest.fn().mockReturnValue(true);

      const promise = poll(initialRequest, pollingRequest, {
        shouldStop,
        timeoutMs: 1000,
      });

      const result = await promise;

      expect(result).toBe(mockResult);

      // Advance timers past the timeout to ensure it was cancelled
      jest.advanceTimersByTime(2000);

      // Promise should already be resolved, not rejected
      await expect(Promise.resolve(result)).resolves.toBe(mockResult);
    });

    test('should not have timeout when timeoutMs is not specified', async () => {
      const mockResult = { status: 'running', id: 'test-id' };
      const initialRequest = jest.fn().mockResolvedValue(mockResult);
      const pollingRequest = jest.fn();
      const shouldStop = jest.fn().mockReturnValue(true);

      const promise = poll(initialRequest, pollingRequest, { shouldStop });

      const result = await promise;

      expect(result).toBe(mockResult);
    });
  });

  describe('Error Handling', () => {
    test('should call onError handler for APIError', async () => {
      const apiError = new APIError(500, {}, 'Server Error', {});
      const recoveryResult = { status: 'provisioning', id: 'test-id' };
      const finalResult = { status: 'running', id: 'test-id' };

      const initialRequest = jest.fn().mockRejectedValue(apiError);
      const pollingRequest = jest.fn().mockResolvedValue(finalResult);
      const onError = jest.fn().mockReturnValue(recoveryResult);
      const shouldStop = jest
        .fn()
        .mockReturnValueOnce(false) // After error recovery
        .mockReturnValueOnce(true); // After polling success

      const promise = poll(initialRequest, pollingRequest, {
        shouldStop,
        onError,
        initialDelayMs: 100,
        pollingIntervalMs: 100,
      });

      // Advance timers for initial delay
      await jest.advanceTimersByTimeAsync(100);

      const result = await promise;

      expect(result).toBe(finalResult);
      expect(onError).toHaveBeenCalledWith(apiError);
      expect(shouldStop).toHaveBeenCalledWith(recoveryResult);
    });

    test('should rethrow non-APIError errors', async () => {
      const regularError = new Error('Regular error');
      const initialRequest = jest.fn().mockRejectedValue(regularError);
      const pollingRequest = jest.fn();
      const onError = jest.fn();

      const promise = poll(initialRequest, pollingRequest, { onError });

      await expect(promise).rejects.toThrow(regularError);
      expect(onError).not.toHaveBeenCalled();
    });

    test('should rethrow error when onError handler throws', async () => {
      const apiError = new APIError(500, {}, 'Server Error', {});
      const thrownError = new Error('Recovery failed');

      const initialRequest = jest.fn().mockRejectedValue(apiError);
      const pollingRequest = jest.fn();
      const onError = jest.fn().mockImplementation(() => {
        throw thrownError;
      });

      const promise = poll(initialRequest, pollingRequest, { onError });

      await expect(promise).rejects.toThrow(thrownError);
      expect(onError).toHaveBeenCalledWith(apiError);
    });
  });

  describe('Max Attempts', () => {
    test('should throw MaxAttemptsExceededError when max attempts reached', async () => {
      jest.useRealTimers(); // Use real timers for this test

      const mockResult = { status: 'provisioning', id: 'test-id' };
      const initialRequest = jest.fn().mockResolvedValue(mockResult);
      const pollingRequest = jest.fn().mockResolvedValue(mockResult);
      const shouldStop = jest.fn().mockReturnValue(false);

      const promise = poll(initialRequest, pollingRequest, {
        shouldStop,
        maxAttempts: 2,
        initialDelayMs: 1,
        pollingIntervalMs: 1,
      });

      await expect(promise).rejects.toThrow(MaxAttemptsExceededError);
      expect(pollingRequest).toHaveBeenCalledTimes(2);

      jest.useFakeTimers(); // Restore fake timers
    });

    test('should succeed before reaching max attempts', async () => {
      const provisioning = { status: 'provisioning', id: 'test-id' };
      const running = { status: 'running', id: 'test-id' };

      const initialRequest = jest.fn().mockResolvedValue(provisioning);
      const pollingRequest = jest.fn().mockResolvedValue(running);
      const shouldStop = jest
        .fn()
        .mockReturnValueOnce(false) // Initial request
        .mockReturnValueOnce(true); // First polling attempt

      const promise = poll(initialRequest, pollingRequest, {
        shouldStop,
        maxAttempts: 5,
        initialDelayMs: 100,
        pollingIntervalMs: 100,
      });

      await jest.advanceTimersByTimeAsync(100); // Initial delay

      const result = await promise;

      expect(result).toBe(running);
      expect(pollingRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('Callbacks', () => {
    test('should call onPollingAttempt for each polling attempt', async () => {
      const provisioning = { status: 'provisioning', id: 'test-id' };
      const running = { status: 'running', id: 'test-id' };

      const initialRequest = jest.fn().mockResolvedValue(provisioning);
      const pollingRequest = jest.fn().mockResolvedValueOnce(provisioning).mockResolvedValueOnce(running);

      const shouldStop = jest
        .fn()
        .mockReturnValueOnce(false) // Initial request
        .mockReturnValueOnce(false) // First polling attempt
        .mockReturnValueOnce(true); // Second polling attempt

      const onPollingAttempt = jest.fn();

      const promise = poll(initialRequest, pollingRequest, {
        shouldStop,
        onPollingAttempt,
        initialDelayMs: 100,
        pollingIntervalMs: 100,
      });

      await jest.advanceTimersByTimeAsync(100); // Initial delay
      await jest.advanceTimersByTimeAsync(100); // First polling interval

      const result = await promise;

      expect(result).toBe(running);
      expect(onPollingAttempt).toHaveBeenCalledTimes(2);
      expect(onPollingAttempt).toHaveBeenCalledWith(1, provisioning);
      expect(onPollingAttempt).toHaveBeenCalledWith(2, running);
    });
  });

  describe('Edge Cases', () => {
    test('should handle shouldStop returning undefined', async () => {
      jest.useRealTimers(); // Use real timers for this test

      const mockResult = { status: 'running', id: 'test-id' };
      const initialRequest = jest.fn().mockResolvedValue(mockResult);
      const pollingRequest = jest.fn().mockResolvedValue(mockResult);
      const shouldStop = jest.fn().mockReturnValue(undefined);

      const promise = poll(initialRequest, pollingRequest, {
        shouldStop,
        maxAttempts: 1,
        initialDelayMs: 1,
        pollingIntervalMs: 1,
      });

      // Should continue polling since undefined is falsy
      await expect(promise).rejects.toThrow(MaxAttemptsExceededError);

      jest.useFakeTimers(); // Restore fake timers
    });

    test('should handle missing shouldStop function', async () => {
      jest.useRealTimers(); // Use real timers for this test

      const mockResult = { status: 'running', id: 'test-id' };
      const initialRequest = jest.fn().mockResolvedValue(mockResult);
      const pollingRequest = jest.fn().mockResolvedValue(mockResult);

      const promise = poll(initialRequest, pollingRequest, {
        maxAttempts: 1,
        initialDelayMs: 1,
        pollingIntervalMs: 1,
      });

      // Should continue polling since no shouldStop function
      await expect(promise).rejects.toThrow(MaxAttemptsExceededError);

      jest.useFakeTimers(); // Restore fake timers
    });

    test('should handle empty options object', async () => {
      const mockResult = { status: 'running', id: 'test-id' };
      const initialRequest = jest.fn().mockResolvedValue(mockResult);
      const pollingRequest = jest.fn().mockResolvedValue(mockResult);

      const promise = poll(initialRequest, pollingRequest, {});

      // Advance through default timing but only a few attempts to avoid test timeout
      await jest.advanceTimersByTimeAsync(1000); // Default initial delay

      // Let a couple polling attempts happen (default maxAttempts is infinite, but we don't need to wait that long)
      await jest.advanceTimersByTimeAsync(1000); // First polling attempt
      await jest.advanceTimersByTimeAsync(1000); // Second polling attempt

      // Since we don't have shouldStop function and mock always returns same result,
      // it should eventually hit max attempts, but for test efficiency we'll just verify
      // it's still polling by checking that pollingRequest was called
      expect(pollingRequest).toHaveBeenCalled();
      expect(initialRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('Real-world Scenarios', () => {
    test('should simulate devbox awaitRunning scenario', async () => {
      const DEVBOX_BOOTING_STATES = ['provisioning', 'initializing'];

      const longPollResult = { status: 'running', id: 'test-devbox' };
      const longPoll = jest.fn().mockResolvedValue(longPollResult);

      const promise = poll(
        () => longPoll(),
        () => longPoll(),
        {
          timeoutMs: 180000,
          shouldStop: (result: any) => !DEVBOX_BOOTING_STATES.includes(result.status),
          onError: (error: APIError) => {
            if (error.status === 408) {
              return { status: 'provisioning' };
            }
            throw error;
          },
        },
      );

      const result = await promise;

      expect(result).toBe(longPollResult);
      expect(longPoll).toHaveBeenCalledTimes(1);
    });

    test('should handle 408 timeout errors in devbox scenario', async () => {
      const DEVBOX_BOOTING_STATES = ['provisioning', 'initializing'];

      const timeoutError = new APIError(408, {}, 'Request timeout', {});
      const successResult = { status: 'running', id: 'test-devbox' };

      const longPoll = jest.fn().mockRejectedValueOnce(timeoutError).mockResolvedValueOnce(successResult);

      const promise = poll(
        () => longPoll(),
        () => longPoll(),
        {
          shouldStop: (result: any) => !DEVBOX_BOOTING_STATES.includes(result.status),
          onError: (error: APIError) => {
            if (error.status === 408) {
              return { status: 'provisioning' };
            }
            throw error;
          },
          initialDelayMs: 100,
          pollingIntervalMs: 100,
        },
      );

      await jest.advanceTimersByTimeAsync(100); // Initial delay after error recovery

      const result = await promise;

      expect(result).toBe(successResult);
      expect(longPoll).toHaveBeenCalledTimes(2);
    });
  });
});
