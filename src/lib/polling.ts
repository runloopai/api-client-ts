import { APIError } from '../error';

export interface PollingOptions<T> {
  /** Delay after the initial request completes before the first poll iteration (in milliseconds) */
  initialDelayMs?: number;
  /** Delay between subsequent polling attempts (in milliseconds) */
  pollingIntervalMs?: number;
  /** Maximum number of polling attempts before throwing an error. 0 means no polling (initial request only). Defaults to infinite (no limit). */
  maxAttempts?: number;
  /** Optional timeout for the entire polling operation (in milliseconds) */
  timeoutMs?: number;
  /**
   * Condition to check if polling should stop
   * Return true when the condition is met and polling should stop
   */
  shouldStop?: (result: T) => boolean;
  /** Optional callback for each polling attempt */
  onPollingAttempt?: (attempt: number, result: T) => void;
  /**
   * Optional error handler for polling requests
   * Return a result to continue polling with that result, or throw to stop polling
   */
  onError?: (error: APIError) => T;
}

const DEFAULT_OPTIONS: Partial<PollingOptions<any>> = {
  initialDelayMs: 0,
  pollingIntervalMs: 1000,
};

export class PollingTimeoutError extends Error {
  constructor(
    message: string,
    public lastResult: unknown,
  ) {
    super(`${message}. Last result: ${JSON.stringify(lastResult, null, 2)}`);
    this.name = 'PollingTimeoutError';
  }
}

export class MaxAttemptsExceededError extends Error {
  constructor(
    message: string,
    public lastResult: unknown,
  ) {
    super(`${message}. Last result: ${JSON.stringify(lastResult, null, 2)}`);
    this.name = 'MaxAttemptsExceededError';
  }
}

export interface LongPollOptions<T> {
  /** Optional timeout for the entire long-poll operation (in milliseconds) */
  timeoutMs?: number | undefined;
  /** Condition to check if long-polling should stop. Return true when done. */
  shouldStop: (result: T) => boolean;
  /** Optional callback for each long-poll attempt */
  onAttempt?: ((attempt: number, result: T) => void) | undefined;
}

/**
 * Long-poll loop for server-side blocking endpoints (e.g. wait_for_status).
 * Retries automatically on 408 (server timeout). No sleep between attempts
 * because the server already blocks.
 */
export async function longPollUntil<T>(request: () => Promise<T>, options: LongPollOptions<T>): Promise<T> {
  const { timeoutMs, shouldStop, onAttempt } = options;

  if (timeoutMs !== undefined && timeoutMs <= 0) {
    throw new Error('timeoutMs must be positive');
  }

  const deadline = timeoutMs ? Date.now() + timeoutMs : undefined;
  let attempts = 0;
  let lastResult: T | undefined;

  while (true) {
    if (deadline && Date.now() >= deadline) {
      throw new PollingTimeoutError(`Long poll timed out after ${timeoutMs}ms`, lastResult);
    }
    try {
      const result = await request();
      lastResult = result;
      attempts++;
      onAttempt?.(attempts, result);
      if (shouldStop(result)) return result;
    } catch (error) {
      if (error instanceof APIError && error.status === 408) continue;
      throw error;
    }
  }
}

/**
 * Delay execution for specified milliseconds
 */
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generic polling function that handles polling logic with configurable options
 * @param initialRequest Function that performs the initial API request
 * @param pollingRequest Function that performs subsequent polling requests
 * @param options Polling configuration options
 * @returns The final result of type T
 */
export async function poll<T>(
  initialRequest: () => Promise<T>,
  pollingRequest: () => Promise<T>,
  options: PollingOptions<T> = {},
): Promise<T> {
  const { initialDelayMs, pollingIntervalMs, maxAttempts, timeoutMs, shouldStop, onPollingAttempt, onError } =
    {
      ...DEFAULT_OPTIONS,
      ...options,
    };

  if (initialDelayMs !== undefined && initialDelayMs < 0) {
    throw new Error('initialDelayMs must be non-negative');
  }
  if (pollingIntervalMs !== undefined && pollingIntervalMs < 0) {
    throw new Error('pollingIntervalMs must be non-negative');
  }
  if (timeoutMs !== undefined && timeoutMs <= 0) {
    throw new Error('timeoutMs must be positive');
  }
  if (maxAttempts !== undefined && maxAttempts < 0) {
    throw new Error('maxAttempts must be non-negative');
  }

  let result: T;
  let timeoutId: NodeJS.Timeout | null = null;

  const clearTimeoutIfExists = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  try {
    // Initial request (not governed by the polling timeout — the HTTP request timeout applies)
    try {
      result = await initialRequest();
    } catch (error) {
      if (onError && error instanceof APIError) {
        result = onError(error);
      } else {
        throw error;
      }
    }

    // Check if we should stop after initial request
    if (shouldStop?.(result)) {
      return result;
    }

    // maxAttempts === 0 means no polling iterations after the initial request
    if (maxAttempts === 0) {
      return result;
    }

    // Start the timeout *after* the initial request so result is always populated
    const timeoutPromise =
      timeoutMs ?
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new PollingTimeoutError(`Polling timed out after ${timeoutMs}ms`, result));
          }, timeoutMs);
        })
      : null;

    await delay(initialDelayMs!);

    let attempts = 0;

    // maxAttempts === undefined means infinite polling (by design, see PollingOptions.maxAttempts JSDoc)
    while (maxAttempts === undefined || attempts < maxAttempts) {
      ++attempts;

      const pollingPromise = async () => {
        try {
          result = await pollingRequest();
        } catch (error) {
          if (onError && error instanceof APIError) {
            result = onError(error);
          } else {
            throw error;
          }
        }

        onPollingAttempt?.(attempts, result);

        if (shouldStop?.(result)) {
          return result;
        }

        if (maxAttempts !== undefined && attempts === maxAttempts) {
          throw new MaxAttemptsExceededError(`Polling exceeded maximum attempts (${maxAttempts})`, result);
        }

        await delay(pollingIntervalMs!);
        return null;
      };

      // Race between polling and timeout if timeout is specified
      const pollingResult =
        timeoutPromise ? await Promise.race([pollingPromise(), timeoutPromise]) : await pollingPromise();

      if (pollingResult !== null) {
        clearTimeoutIfExists();
        return pollingResult as T;
      }
    }

    // This should only be reachable if maxAttempts is defined
    throw new MaxAttemptsExceededError(`Polling exceeded maximum attempts (${maxAttempts})`, result!);
  } catch (error) {
    clearTimeoutIfExists();
    throw error;
  }
}
