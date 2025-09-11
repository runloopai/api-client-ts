import { APIError } from '../error';

export interface PollingOptions<T> {
  /** Initial delay before starting polling (in milliseconds) */
  initialDelayMs?: number;
  /** Delay between subsequent polling attempts (in milliseconds) */
  pollingIntervalMs?: number;
  /** Maximum number of polling attempts before throwing an error */
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
  initialDelayMs: 1000,
  pollingIntervalMs: 1000,
  maxAttempts: 120,
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
  console.log('timeoutMs', timeoutMs);

  let result: T;
  let timeoutId: NodeJS.Timeout | null = null;
  const timeoutPromise =
    timeoutMs ?
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new PollingTimeoutError(`Polling timed out after ${timeoutMs}ms`, result));
        }, timeoutMs);
      })
    : null;

  const clearTimeoutIfExists = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  try {
    // Initial request
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
      clearTimeoutIfExists();
      return result;
    }

    await delay(initialDelayMs!);

    let attempts = 0;

    while (attempts < maxAttempts!) {
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

        if (attempts === maxAttempts) {
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

    throw new MaxAttemptsExceededError(`Polling exceeded maximum attempts (${maxAttempts})`, result);
  } catch (error) {
    clearTimeoutIfExists();
    throw error;
  }
}
