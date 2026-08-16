import { APIConnectionError, APIError } from '../error';

export interface TunnelReadinessOptions {
  /** Overall bounded deadline in milliseconds. Defaults to 30 seconds. */
  timeoutMs?: number;
  /** Delay used when the server does not provide Retry-After. Defaults to 250ms. */
  retryIntervalMs?: number;
  signal?: AbortSignal;
}

const READINESS_CODES = new Set([
  'tunnel_service_not_ready',
  'tunnel_backend_connect_timeout',
  'tunnel_unavailable',
]);

function canRetryReadiness(error: unknown): error is APIError {
  if (!(error instanceof APIError) || error.retryable === false) return false;
  if (error instanceof APIConnectionError) return error.phase === 'connect';
  return READINESS_CODES.has(error.code ?? '') && error.phase !== 'response_read';
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new Error('Tunnel readiness wait aborted'));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason ?? new Error('Tunnel readiness wait aborted'));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/** Poll an idempotent tunnel GET until it is ready, retaining the last normalized failure. */
export async function awaitTunnelServiceReady<T>(
  request: (remainingMs: number) => Promise<T>,
  options: TunnelReadinessOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 30_000;
  const retryIntervalMs = options.retryIntervalMs ?? 250;
  if (timeoutMs <= 0) throw new RangeError('timeoutMs must be positive');
  if (retryIntervalMs < 0) throw new RangeError('retryIntervalMs must not be negative');

  const deadline = Date.now() + timeoutMs;
  let attempts = 0;
  while (true) {
    attempts++;
    try {
      return await request(Math.max(1, deadline - Date.now()));
    } catch (error) {
      if (!canRetryReadiness(error)) {
        if (error instanceof APIError) {
          Object.defineProperty(error, 'attempts', { value: attempts, configurable: true });
        }
        throw error;
      }
      const remaining = deadline - Date.now();
      const requestedDelay = error.retryAfter === undefined ? retryIntervalMs : error.retryAfter * 1000;
      if (remaining <= 0 || requestedDelay >= remaining) {
        Object.defineProperty(error, 'attempts', { value: attempts, configurable: true });
        throw error;
      }
      await delay(requestedDelay, options.signal);
    }
  }
}
