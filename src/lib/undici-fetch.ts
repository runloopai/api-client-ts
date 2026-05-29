/**
 * A fetch-compatible adapter backed by a bounded HTTP/2 transport.
 *
 * The HTTPS/H2 path uses node:http2 directly so high-concurrency SDK calls share
 * a few TLS sessions with many streams. undici 6.26.0's fetch/request H2 paths
 * can still assert-crash under this workload, so undici is kept for the
 * WHATWG `Response` implementation and HTTP/1.1 fallback only. The rest of
 * core.ts keeps using standard Response members (`.status`, `.ok`, `.headers`,
 * `.text()`, `.json()`, `.body`, `.arrayBuffer()`, `.blob()`).
 *
 * Unlike the previous got@14 approach, undici is dual CJS/ESM and `require`-able
 * from this `"type": "commonjs"` package, so there is no dynamic-import hack and
 * no second HTTP stack to keep in sync.
 *
 * This lives in src/lib/ (the Stainless custom-code dir) so it survives
 * regeneration; the only generated file touched is the one-line wiring change
 * in src/_shims/node-runtime.ts.
 */
import { Agent, Headers, Response, request as undiciRequest } from 'undici';
import diagnosticsChannel from 'node:diagnostics_channel';
import http2 from 'node:http2';
import { Readable } from 'node:stream';
import { MultipartBody } from '../_shims/MultipartBody';
import { type Fetch } from '../core';

const MAX_H2_SESSIONS = 4;
const MAX_H2_STREAMS_PER_SESSION = 64;
const KEEP_ALIVE_TIMEOUT_MS = 10 * 60 * 1000;

// HTTP/1.1 fallback for non-HTTPS origins and HTTPS origins that don't
// negotiate h2. The H2 path below uses node:http2 directly because undici 6.26.0
// can assert-crash under high-concurrency H2 request multiplexing.
const h1Dispatcher = new Agent({
  allowH2: false,
  connections: 4,
  keepAliveTimeout: KEEP_ALIVE_TIMEOUT_MS,
  keepAliveMaxTimeout: KEEP_ALIVE_TIMEOUT_MS,
});

const connectedChannel = diagnosticsChannel.channel('undici:client:connected');
const pools = new Map<string, H2Pool>();

// Map the body shapes core.ts produces (string | Buffer/ArrayBufferView |
// Node Readable for multipart | null) onto a valid undici.request body.
function normalizeBody(body: unknown): any {
  if (body == null) return undefined;
  if (typeof body === 'string') return body;
  if (Buffer.isBuffer(body)) return body;
  // Unwrap MultipartBody (wraps a Readable in `.body`). core.ts already unwraps
  // it, but handle it defensively.
  if (body instanceof MultipartBody) return normalizeBody((body as MultipartBody).body);
  if (body instanceof Readable) return body;
  // ArrayBufferView (Uint8Array, DataView, typed arrays) and ArrayBuffer are
  // valid undici bodies as-is / after a Buffer wrap.
  if (ArrayBuffer.isView(body)) return body;
  if (body instanceof ArrayBuffer) return Buffer.from(body);
  return String(body);
}

function toResponseHeaders(headers: Record<string, string | string[] | undefined>): Headers {
  const responseHeaders = new Headers();
  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) responseHeaders.append(name, item);
    } else {
      responseHeaders.append(name, value);
    }
  }
  return responseHeaders;
}

function statusMustNotHaveBody(status: number): boolean {
  return status === 204 || status === 205 || status === 304;
}

function abortError(): Error {
  const error = new Error('The operation was aborted');
  error.name = 'AbortError';
  return error;
}

function originFor(url: URL): string {
  return `${url.protocol}//${url.host}`;
}

function pathFor(url: URL): string {
  return `${url.pathname}${url.search}`;
}

function filterH2RequestHeaders(headers: Record<string, any> | undefined): Record<string, string> {
  const filtered: Record<string, string> = {};
  if (!headers) return filtered;

  for (const [rawName, rawValue] of Object.entries(headers)) {
    if (rawValue == null) continue;
    const name = rawName.toLowerCase();
    if (
      name === 'connection' ||
      name === 'keep-alive' ||
      name === 'proxy-connection' ||
      name === 'transfer-encoding' ||
      name === 'upgrade' ||
      name === 'host'
    ) {
      continue;
    }
    filtered[name] = String(rawValue);
  }
  return filtered;
}

function toH2ResponseHeaders(headers: http2.IncomingHttpHeaders): Headers {
  const responseHeaders = new Headers();
  for (const [name, value] of Object.entries(headers)) {
    if (name.startsWith(':') || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) responseHeaders.append(name, String(item));
    } else {
      responseHeaders.append(name, String(value));
    }
  }
  return responseHeaders;
}

function getPool(url: URL): H2Pool {
  const origin = originFor(url);
  let pool = pools.get(origin);
  if (!pool) {
    pool = new H2Pool(origin);
    pools.set(origin, pool);
  }
  return pool;
}

type H2SessionEntry = {
  session: http2.ClientHttp2Session;
  activeStreams: number;
  ready: Promise<void>;
  alpnProtocol: string | false | undefined;
  closed: boolean;
  idleTimer: NodeJS.Timeout | undefined;
};

class H2Pool {
  private sessions: H2SessionEntry[] = [];
  private waiters: Array<(entry: H2SessionEntry) => void> = [];

  constructor(private readonly origin: string) {}

  async request(url: URL, init: any): Promise<any> {
    const entry = await this.acquire();
    try {
      await entry.ready;
    } catch (error) {
      this.release(entry);
      throw error;
    }

    if (entry.alpnProtocol !== 'h2') {
      this.release(entry);
      entry.session.close();
      throw new Error(`HTTP/2 was not negotiated; ALPN=${String(entry.alpnProtocol || 'none')}`);
    }

    return this.dispatch(entry, url, init);
  }

  private acquire(): Promise<H2SessionEntry> {
    const existing = this.sessions.find(
      (entry) => !entry.closed && entry.activeStreams < MAX_H2_STREAMS_PER_SESSION,
    );
    if (existing) {
      if (existing.idleTimer) {
        clearTimeout(existing.idleTimer);
        existing.idleTimer = undefined;
      }
      existing.session.ref?.();
      existing.activeStreams++;
      return Promise.resolve(existing);
    }

    if (this.sessions.filter((entry) => !entry.closed).length < MAX_H2_SESSIONS) {
      const created = this.createSession();
      created.session.ref?.();
      created.activeStreams++;
      return Promise.resolve(created);
    }

    return new Promise((resolve) => {
      this.waiters.push(resolve);
    });
  }

  private createSession(): H2SessionEntry {
    const session = http2.connect(this.origin, {
      ALPNProtocols: ['h2', 'http/1.1'],
    });

    const entry: H2SessionEntry = {
      session,
      activeStreams: 0,
      ready: Promise.resolve(),
      alpnProtocol: undefined,
      closed: false,
      idleTimer: undefined,
    };

    entry.ready = new Promise<void>((resolve, reject) => {
      session.once('connect', () => {
        entry.alpnProtocol = (session.socket as any).alpnProtocol;
        connectedChannel.publish({ socket: session.socket });
        resolve();
      });
      session.once('error', reject);
    });

    session.once('close', () => {
      entry.closed = true;
      if (entry.idleTimer) clearTimeout(entry.idleTimer);
      this.sessions = this.sessions.filter((item) => item !== entry);
      this.drainWaiters();
    });

    session.on('error', () => {
      entry.closed = true;
    });

    this.sessions.push(entry);
    return entry;
  }

  private dispatch(entry: H2SessionEntry, url: URL, init: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (init.signal?.aborted) {
        this.release(entry);
        reject(abortError());
        return;
      }

      const body = normalizeBody(init.body);
      const requestHeaders: http2.OutgoingHttpHeaders = {
        ...filterH2RequestHeaders(init.headers),
        [http2.constants.HTTP2_HEADER_METHOD]: init.method ?? 'GET',
        [http2.constants.HTTP2_HEADER_SCHEME]: url.protocol.slice(0, -1),
        [http2.constants.HTTP2_HEADER_AUTHORITY]: url.host,
        [http2.constants.HTTP2_HEADER_PATH]: pathFor(url),
      };

      const stream = entry.session.request(requestHeaders, { endStream: body === undefined });
      let settled = false;
      let released = false;

      const releaseOnce = () => {
        if (released) return;
        released = true;
        this.release(entry);
      };

      const rejectOnce = (error: Error) => {
        if (settled) return;
        settled = true;
        releaseOnce();
        reject(error);
      };

      const onAbort = () => {
        stream.close(http2.constants.NGHTTP2_CANCEL);
        rejectOnce(abortError());
      };

      init.signal?.addEventListener('abort', onAbort, { once: true });

      stream.once('response', (headers) => {
        if (settled) return;
        settled = true;

        const status = Number(headers[http2.constants.HTTP2_HEADER_STATUS] ?? 0);
        const responseBody = statusMustNotHaveBody(status) || init.method === 'HEAD' ? null : stream;
        if (responseBody === null) stream.resume();

        const response = new Response(responseBody as any, {
          status,
          headers: toH2ResponseHeaders(headers),
        });
        Object.defineProperty(response, 'url', { value: String(url) });

        stream.once('end', releaseOnce);
        stream.once('close', releaseOnce);
        stream.once('error', releaseOnce);
        resolve(response);
      });

      stream.once('error', (error) => {
        rejectOnce(error);
      });

      stream.once('close', () => {
        init.signal?.removeEventListener('abort', onAbort);
        if (!settled) rejectOnce(new Error('HTTP/2 stream closed before response headers'));
      });

      if (body instanceof Readable) {
        body.once('error', (error) => stream.destroy(error));
        body.pipe(stream);
      } else if (body !== undefined) {
        stream.end(body);
      }
    });
  }

  private release(entry: H2SessionEntry) {
    entry.activeStreams = Math.max(0, entry.activeStreams - 1);
    this.drainWaiters();

    if (entry.activeStreams === 0 && !entry.closed && !entry.idleTimer) {
      entry.session.unref?.();
      entry.idleTimer = setTimeout(() => {
        entry.session.close();
      }, KEEP_ALIVE_TIMEOUT_MS);
      entry.idleTimer.unref?.();
    }
  }

  private drainWaiters() {
    while (this.waiters.length > 0) {
      const entry = this.sessions.find(
        (candidate) => !candidate.closed && candidate.activeStreams < MAX_H2_STREAMS_PER_SESSION,
      );
      if (!entry) return;

      if (entry.idleTimer) {
        clearTimeout(entry.idleTimer);
        entry.idleTimer = undefined;
      }
      entry.session.ref?.();
      entry.activeStreams++;
      const resolve = this.waiters.shift();
      resolve?.(entry);
    }
  }
}

async function undiciFallbackFetch(url: URL, init: any): Promise<any> {
  const result = await undiciRequest(url as any, {
    ...init,
    body: normalizeBody(init.body),
    dispatcher: h1Dispatcher,
  });

  const responseBody =
    statusMustNotHaveBody(result.statusCode) || init.method === 'HEAD' ? null : result.body;
  if (responseBody === null) await result.body.dump();

  const response = new Response(responseBody, {
    status: result.statusCode,
    headers: toResponseHeaders(result.headers),
  });
  Object.defineProperty(response, 'url', { value: String(url) });
  return response;
}

export const undiciFetch: Fetch = async (url, init) => {
  // core.ts injects a node-fetch-style `agent` in RequestInit; undici uses a
  // `dispatcher` instead, so drop `agent`. Drop fetch-only fields that
  // undici.request doesn't understand, and map redirects onto maxRedirections.
  const {
    agent: _ignoredAgent,
    body: rawBody,
    duplex: _ignoredDuplex,
    redirect,
    signal,
    ...rest
  } = (init ?? {}) as any;

  const requestURL = new URL(String(url));
  const requestInit = {
    ...rest,
    body: rawBody,
    maxRedirections: redirect === 'manual' || redirect === 'error' ? 0 : 20,
    // core.ts passes a standard web AbortSignal (from `new AbortController()`),
    signal: signal ?? undefined,
  };

  if (requestURL.protocol !== 'https:') return undiciFallbackFetch(requestURL, requestInit);

  try {
    return (await getPool(requestURL).request(requestURL, requestInit)) as any;
  } catch (error) {
    if (error instanceof Error && /^HTTP\/2 was not negotiated/.test(error.message)) {
      return undiciFallbackFetch(requestURL, requestInit);
    }
    throw error;
  }
};

export default undiciFetch;
