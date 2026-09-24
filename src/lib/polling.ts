import { APIError } from '../error';
import type * as Core from '../core';

export interface PollingOptions<T> {
  /** Delay after the initial request completes before the first poll iteration (in milliseconds) */
  initialDelayMs?: number;
  /** Delay between subsequent polling attempts (in milliseconds) */
  pollingIntervalMs?: number;
  /** Maximum number of polling attempts before throwing an error. 0 means no polling (initial request only). Defaults to infinite (no limit). */
  maxAttempts?: number;
  /** Optional timeout for the entire polling operation (in milliseconds) */
  timeoutMs?: number;
  /** Optional AbortSignal to cancel polling and in-flight delays between attempts. */
  signal?: AbortSignal | null | undefined;
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
  /** Optional timeout for the entire long-poll operation (in milliseconds). Enforced mid-request via Promise.race. */
  timeoutMs?: number | undefined;
  /** Condition to check if long-polling should stop. Return true when done. */
  shouldStop: (result: T) => boolean;
  /**
   * Optional callback for each successful long-poll attempt.
   * The attempt counter includes 408 retries, but this callback is only
   * invoked when the server returns a non-error response.
   */
  onAttempt?: ((attempt: number, result: T) => void) | undefined;
  /** Optional AbortSignal to cancel the long-poll loop externally. */
  signal?: AbortSignal | null | undefined;
}

/**
 * Request options for methods that use server-side long-polling.
 * Extends `Core.RequestOptions` with long-poll configuration alongside
 * the deprecated `polling` field for backwards compatibility.
 */
export type LongPollRequestOptions<T> = Core.RequestOptions & {
  /** Options for the long-poll operation. */
  longPoll?:
    | {
        /** Timeout in milliseconds for the entire long-poll operation. */
        timeoutMs?: number;
      }
    | undefined;
  /** @deprecated Use `longPoll` instead. Only `timeoutMs` is extracted; other fields are ignored for long-poll endpoints. */
  polling?: Partial<PollingOptions<T>> | undefined;
};

const DEPRECATED_POLLING_FIELDS = ['maxAttempts', 'pollingIntervalMs', 'initialDelayMs'] as const;
let _warnedDeprecatedPolling = false;

/**
 * Resolve the effective `timeoutMs` from {@link LongPollRequestOptions},
 * preferring `longPoll.timeoutMs` over the deprecated `polling.timeoutMs`.
 *
 * Emits a one-time `console.warn` when callers supply deprecated polling
 * fields that are silently ignored by long-poll endpoints.
 */
export function resolveLongPollTimeoutMs<T>(options?: LongPollRequestOptions<T>): number | undefined {
  if (options?.polling && !_warnedDeprecatedPolling) {
    const ignored = DEPRECATED_POLLING_FIELDS.filter(
      (f) => (options.polling as Record<string, unknown>)?.[f] !== undefined,
    );
    if (ignored.length > 0) {
      console.warn(
        `[runloop-api-client] polling options { ${ignored.join(', ')} } are ignored for long-poll endpoints. ` +
          `Only \`timeoutMs\` is honoured. Migrate to \`longPoll: { timeoutMs }\` instead.`,
      );
      _warnedDeprecatedPolling = true;
    } else if (options.polling.timeoutMs !== undefined && !options.longPoll?.timeoutMs) {
      console.warn(
        '[runloop-api-client] `polling: { timeoutMs }` is deprecated. Use `longPoll: { timeoutMs }` instead.',
      );
      _warnedDeprecatedPolling = true;
    }
  }
  return options?.longPoll?.timeoutMs ?? options?.polling?.timeoutMs;
}

/** @internal Resets the deprecation warning flag — only for tests. */
export function _resetDeprecationWarning(): void {
  _warnedDeprecatedPolling = false;
}

/**
 * Long-poll loop for server-side blocking endpoints (e.g. wait_for_status).
 * Retries automatically on 408 (server timeout). No sleep between attempts
 * because the server already blocks. Each iteration's request is given an
 * AbortSignal so that timeouts and external cancellation actually cancel the
 * in-flight HTTP request rather than just racing past it.
 */
export async function longPollUntil<T>(
  request: (signal: AbortSignal) => Promise<T>,
  options: LongPollOptions<T>,
): Promise<T> {
  const { timeoutMs, shouldStop, onAttempt, signal } = options;

  if (timeoutMs !== undefined && timeoutMs <= 0) {
    throw new Error('timeoutMs must be positive');
  }

  if (signal?.aborted) {
    throw new LongPollAbortError('Long poll aborted', undefined);
  }

  const deadline = timeoutMs ? Date.now() + timeoutMs : undefined;
  let attempts = 0;
  let lastResult: T | undefined;

  while (true) {
    if (signal?.aborted) {
      throw new LongPollAbortError('Long poll aborted', lastResult);
    }

    attempts++;
    const iterationController = new AbortController();
    const iterationSignal = iterationController.signal;

    const onExternalAbort = () => iterationController.abort();
    signal?.addEventListener('abort', onExternalAbort, { once: true });

    let deadlineTimer: ReturnType<typeof setTimeout> | undefined;
    if (deadline) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        signal?.removeEventListener('abort', onExternalAbort);
        throw new PollingTimeoutError(`Long poll timed out after ${timeoutMs}ms`, lastResult);
      }
      deadlineTimer = setTimeout(() => iterationController.abort(), remaining);
    }

    try {
      const result = await request(iterationSignal);
      lastResult = result;
      onAttempt?.(attempts, result);
      if (shouldStop(result)) return result;
    } catch (error) {
      if (error instanceof APIError && error.status === 408) continue;
      if (iterationSignal.aborted) {
        if (signal?.aborted) {
          throw new LongPollAbortError('Long poll aborted', lastResult);
        }
        throw new PollingTimeoutError(`Long poll timed out after ${timeoutMs}ms`, lastResult);
      }
      throw error;
    } finally {
      clearTimeout(deadlineTimer);
      signal?.removeEventListener('abort', onExternalAbort);
    }
  }
}

export class LongPollAbortError extends Error {
  constructor(
    message: string,
    public lastResult: unknown,
  ) {
    super(message);
    this.name = 'LongPollAbortError';
  }
}

/**
 * Delay execution for specified milliseconds, aborting with {@link LongPollAbortError} when `signal` is aborted.
 */
function abortableDelay(
  ms: number,
  signal: AbortSignal | null | undefined,
  lastResult: unknown,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new LongPollAbortError('Polling aborted', lastResult));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new LongPollAbortError('Polling aborted', lastResult));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

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
  const {
    initialDelayMs,
    pollingIntervalMs,
    maxAttempts,
    timeoutMs,
    shouldStop,
    onPollingAttempt,
    onError,
    signal,
  } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  if (signal?.aborted) {
    throw new LongPollAbortError('Polling aborted', undefined);
  }

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

  let lastResult: T | undefined;
  let timeoutId: NodeJS.Timeout | null = null;

  const clearTimeoutIfExists = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const timeoutPromise =
    timeoutMs ?
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new PollingTimeoutError(`Polling timed out after ${timeoutMs}ms`, lastResult));
        }, timeoutMs);
      })
    : null;

  const raceTimeout = <R>(promise: Promise<R>): Promise<R> =>
    timeoutPromise ? Promise.race([promise, timeoutPromise]) : promise;

  const raceAbort = <R>(promise: Promise<R>): Promise<R> => {
    if (!signal) return promise;
    const abortSignal = signal;
    if (abortSignal.aborted) {
      return Promise.reject(new LongPollAbortError('Polling aborted', lastResult));
    }
    return new Promise((resolve, reject) => {
      const onAbort = () => {
        abortSignal.removeEventListener('abort', onAbort);
        reject(new LongPollAbortError('Polling aborted', lastResult));
      };
      abortSignal.addEventListener('abort', onAbort);
      promise.then(
        (value) => {
          abortSignal.removeEventListener('abort', onAbort);
          resolve(value);
        },
        (err) => {
          abortSignal.removeEventListener('abort', onAbort);
          reject(err);
        },
      );
    });
  };

  try {
    let result: T;
    try {
      result = await raceAbort(raceTimeout(initialRequest()));
    } catch (error) {
      if (onError && error instanceof APIError) {
        result = onError(error);
      } else {
        throw error;
      }
    }
    lastResult = result;

    if (shouldStop?.(result)) {
      return result;
    }

    // maxAttempts === 0 means no polling iterations after the initial request
    if (maxAttempts === 0) {
      return result;
    }

    await raceAbort(raceTimeout(abortableDelay(initialDelayMs!, signal, lastResult)));

    let attempts = 0;

    // maxAttempts === undefined means infinite polling (by design, see PollingOptions.maxAttempts JSDoc)
    while (maxAttempts === undefined || attempts < maxAttempts) {
      ++attempts;

      try {
        result = await raceAbort(raceTimeout(pollingRequest()));
      } catch (error) {
        if (onError && error instanceof APIError) {
          result = onError(error);
        } else {
          throw error;
        }
      }
      lastResult = result;

      onPollingAttempt?.(attempts, result);

      if (shouldStop?.(result)) {
        return result;
      }

      if (maxAttempts !== undefined && attempts === maxAttempts) {
        throw new MaxAttemptsExceededError(`Polling exceeded maximum attempts (${maxAttempts})`, result);
      }

      await raceAbort(raceTimeout(abortableDelay(pollingIntervalMs!, signal, lastResult)));
    }

    // This should only be reachable if maxAttempts is defined
    throw new MaxAttemptsExceededError(`Polling exceeded maximum attempts (${maxAttempts})`, lastResult!);
  } finally {
    clearTimeoutIfExists();
  }
}
