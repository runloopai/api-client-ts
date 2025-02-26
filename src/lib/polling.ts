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
  const { initialDelayMs, pollingIntervalMs, maxAttempts, timeoutMs, shouldStop, onPollingAttempt } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Start timeout timer if specified
  const timeoutPromise =
    timeoutMs ?
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new PollingTimeoutError(`Polling timed out after ${timeoutMs}ms`, result));
        }, timeoutMs);
      })
    : null;

  // Initial request
  let result = await initialRequest();

  // Check if we should stop after initial request
  if (shouldStop?.(result)) {
    return result;
  }

  // Wait initial delay
  await delay(initialDelayMs!);

  let attempts = 0;

  while (attempts < maxAttempts!) {
    attempts++;

    // Create polling promise
    const pollingPromise = async () => {
      result = await pollingRequest();
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
      return pollingResult as T;
    }
  }

  throw new MaxAttemptsExceededError(`Polling exceeded maximum attempts (${maxAttempts})`, result);
}
