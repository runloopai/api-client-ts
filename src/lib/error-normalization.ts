/** Stable, transport-independent details attached to public SDK errors. */
export interface RunloopErrorDetails {
  code?: string | undefined;
  phase?: string | undefined;
  retryable?: boolean | undefined;
  requestID?: string | undefined;
  /** Server requested retry delay, in seconds. */
  retryAfter?: number | undefined;
  attempts?: number | undefined;
  cause?: Error | undefined;
}

type ErrorLike = Error & { code?: unknown; cause?: unknown; opaqueData?: unknown; debugData?: unknown };

/** Marks an AbortError produced by the SDK's own request deadline. */
export class SDKRequestTimeoutError extends Error {
  readonly code = 'RUNLOOP_REQUEST_TIMEOUT';

  constructor(readonly cause: Error) {
    super(cause.message || 'Request timed out.');
    this.name = 'AbortError';
  }
}

function errorChain(error: Error): ErrorLike[] {
  const chain: ErrorLike[] = [];
  const seen = new Set<unknown>();
  let current: unknown = error;
  while (current instanceof Error && !seen.has(current)) {
    seen.add(current);
    chain.push(current as ErrorLike);
    current = (current as ErrorLike).cause;
  }
  return chain;
}

/** Whether an error originated in a fetch/HTTP transport rather than response parsing or user code. */
export function isTransportError(error: Error): boolean {
  const chain = errorChain(error);
  if (
    chain.some(
      (item) =>
        typeof item.code === 'string' &&
        (/^(?:UND_ERR_|ERR_HTTP2_)/.test(item.code) ||
          /^(?:ECONN|ENET|EHOST|EPIPE|ETIMEDOUT|EPROTO|ESOCKET|EAI_)/.test(item.code)),
    )
  ) {
    return true;
  }
  // Native fetch commonly rejects with a top-level TypeError, but its transport
  // cause carries one of the codes above. Treating every TypeError as transport
  // would also mask ordinary response parser failures (for example, reading an
  // already-consumed body), so require transport-specific evidence instead.
  if (chain.some((item) => item.name === 'AbortError')) return true;
  return chain.some((item) => /http\/2|protocol error/i.test(item.message));
}

function stringData(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value instanceof Uint8Array) return new TextDecoder().decode(value);
  return '';
}

/** Normalize native fetch, Undici, node:http2, and custom transport failures. */
export function normalizeTransportError(error: Error, attempts: number): RunloopErrorDetails {
  const chain = errorChain(error);
  const codes = chain.map((item) => (typeof item.code === 'string' ? item.code : undefined));
  const text = chain
    .map((item) => `${item.message} ${stringData(item.opaqueData)} ${stringData(item.debugData)}`)
    .join(' ')
    .toLowerCase();

  let code = 'connection_error';
  let phase = 'transport';
  let retryable = false;

  if (error instanceof SDKRequestTimeoutError) {
    code = 'request_timeout';
    phase = 'request';
    retryable = true;
  } else if (codes.includes('UND_ERR_CONNECT_TIMEOUT')) {
    code = 'connection_timeout';
    phase = 'connect';
    retryable = true;
  } else if (codes.includes('UND_ERR_HEADERS_TIMEOUT')) {
    code = 'response_headers_timeout';
    phase = 'response_headers';
  } else if (codes.includes('UND_ERR_BODY_TIMEOUT')) {
    code = 'response_read_timeout';
    phase = 'response_read';
  } else if (codes.includes('ERR_HTTP2_GOAWAY_SESSION') && text.includes('idle_timeout')) {
    code = 'http2_idle_timeout';
    phase = 'response_read';
  } else if (codes.includes('ECONNRESET')) {
    code = 'connection_reset';
  } else if (
    codes.some((value) => value?.startsWith('ERR_HTTP2_')) ||
    text.includes('http/2') ||
    text.includes('protocol error')
  ) {
    code = 'http2_protocol_error';
  } else if (
    codes.includes('ECONNREFUSED') ||
    codes.includes('ENETUNREACH') ||
    codes.includes('EHOSTUNREACH')
  ) {
    phase = 'connect';
    retryable = true;
  }

  return {
    code,
    phase,
    retryable,
    attempts,
    cause: error instanceof SDKRequestTimeoutError ? error.cause : error,
  };
}

export function parseRetryAfter(headers: Record<string, string | null | undefined>): number | undefined {
  const milliseconds = headers['retry-after-ms'];
  if (milliseconds) {
    const parsed = Number.parseFloat(milliseconds);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed / 1000;
  }

  const value = headers['retry-after'];
  if (!value) return undefined;
  const seconds = Number.parseFloat(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds;
  const date = Date.parse(value);
  return Number.isNaN(date) ? undefined : Math.max(0, (date - Date.now()) / 1000);
}

/** Extract details from the backwards-compatible Runloop JSON error envelope. */
export function normalizeResponseError(
  body: unknown,
  headers: Record<string, string | null | undefined>,
  attempts: number,
): RunloopErrorDetails {
  const envelope = body && typeof body === 'object' ? (body as Record<string, unknown>) : undefined;
  const headerCode = headers['x-runloop-error-code'];
  const headerRequestID = headers['x-runloop-request-id'];
  return {
    code:
      headerCode ||
      (typeof envelope?.['error'] === 'string' ? envelope['error'] : undefined) ||
      (typeof envelope?.['code'] === 'string' ? envelope['code'] : undefined),
    phase: typeof envelope?.['phase'] === 'string' ? envelope['phase'] : undefined,
    retryable: typeof envelope?.['retryable'] === 'boolean' ? envelope['retryable'] : undefined,
    requestID:
      headerRequestID || (typeof envelope?.['request_id'] === 'string' ? envelope['request_id'] : undefined),
    retryAfter: parseRetryAfter(headers),
    attempts,
  };
}
