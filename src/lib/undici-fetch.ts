/**
 * A fetch-compatible adapter backed by undici's HTTP/2 support, using a bounded
 * connection pool that multiplexes many concurrent requests over a few TLS sessions.
 *
 * undici is the same engine that powers Node's built-in global `fetch`. An `Agent`
 * with `allowH2: true` negotiates HTTP/2 via ALPN and transparently falls back to
 * HTTP/1.1 when the origin doesn't advertise h2. Two options make it actually
 * multiplex rather than open one connection per request:
 *   - `connections` bounds the pool to a few TLS sessions per origin. Without it
 *     undici opens a fresh connection for every concurrent request (a connection
 *     storm) instead of reusing sessions.
 *   - `pipelining` (undici default: 1) is the max concurrent streams undici runs
 *     per session; it must be > 1 for H2 stream multiplexing to happen at all.
 *
 * undici returns a standard WHATWG `Response`, so the rest of core.ts — which only
 * touches standard Response members (`.status`, `.ok`, `.headers`, `.text()`,
 * `.json()`, `.body`, `.arrayBuffer()`, `.blob()`) — is unchanged. undici is dual
 * CJS/ESM and `require`-able from this `"type": "commonjs"` package, so there is no
 * dynamic-import hack and no second HTTP stack.
 *
 * Note: `pipelining > 1` also enables HTTP/1.1 request pipelining on the fallback
 * path, so `http2: true` (opt-in) is intended for h2-capable origins. Requires
 * undici >= 7.23.0 — multiplexed H2 assert-crashes on 6.x (undici PR #4845) — and
 * therefore Node >= 20.18.1.
 *
 * Lives in src/lib/ (the Stainless custom-code dir) so it survives regeneration.
 */
import { Agent, fetch as undiciFetchImpl } from 'undici';
import { Readable } from 'node:stream';
import { MultipartBody } from '../_shims/MultipartBody';
import { type Fetch } from '../core';

const KEEP_ALIVE_TIMEOUT_MS = 10 * 60 * 1000;
// Bound the pool to a few TLS sessions per origin and multiplex many H2 streams
// over each. 4 x 64 = 256 concurrent requests in flight before undici queues the rest.
const H2_MAX_CONNECTIONS = 4;
const H2_MAX_CONCURRENT_STREAMS = 64;

// One module-scoped dispatcher, reused across requests: a bounded HTTP/2 pool with
// keep-alive. `allowH2` negotiates h2 over TLS via ALPN and transparently falls back
// to HTTP/1.1 when the origin doesn't offer h2; `connections`/`pipelining` make it
// multiplex (see the file header).
const h2Dispatcher = new Agent({
  allowH2: true,
  connections: H2_MAX_CONNECTIONS,
  pipelining: H2_MAX_CONCURRENT_STREAMS,
  keepAliveTimeout: KEEP_ALIVE_TIMEOUT_MS,
  keepAliveMaxTimeout: KEEP_ALIVE_TIMEOUT_MS,
});

type NormalizedBody = { body: any; isStream: boolean };

// Map the body shapes core.ts produces (string | Buffer/ArrayBufferView |
// Node Readable for multipart | null) onto a valid undici BodyInit. A Node
// Readable must become a Web ReadableStream and requires `duplex: 'half'`.
// Exported for unit tests. @internal
export function normalizeBody(body: unknown): NormalizedBody {
  if (body == null) return { body: undefined, isStream: false };
  if (typeof body === 'string') return { body, isStream: false };
  if (Buffer.isBuffer(body)) return { body, isStream: false };
  // Unwrap MultipartBody (wraps a Readable in `.body`). core.ts already unwraps
  // it, but handle it defensively.
  if (body instanceof MultipartBody) return normalizeBody((body as MultipartBody).body);
  if (body instanceof Readable) {
    return { body: Readable.toWeb(body) as any, isStream: true };
  }
  // ArrayBufferView (Uint8Array, DataView, typed arrays) and ArrayBuffer are
  // valid BodyInit as-is / after a Buffer wrap.
  if (ArrayBuffer.isView(body)) return { body, isStream: false };
  if (body instanceof ArrayBuffer) return { body: Buffer.from(body), isStream: false };
  return { body: String(body), isStream: false };
}

export const undiciFetch: Fetch = async (url, init) => {
  // core.ts injects a node-fetch-style `agent` in RequestInit; undici uses a
  // `dispatcher` instead, so drop `agent`. Pull `signal` and `body` out to
  // normalize them; pass everything else (method, headers, redirect, …) through.
  const { agent: _ignoredAgent, body: rawBody, signal, ...rest } = (init ?? {}) as any;

  const { body, isStream } = normalizeBody(rawBody);

  const undiciInit: any = {
    ...rest,
    body,
    // core.ts passes a standard web AbortSignal (from `new AbortController()`),
    // which undici accepts directly.
    signal: signal ?? undefined,
    dispatcher: h2Dispatcher,
  };
  // A streamed request body requires the half-duplex hint or undici throws.
  if (isStream) undiciInit.duplex = 'half';

  // undici returns a genuine WHATWG Response. The SDK is typed against the
  // node-fetch Response, so cast through `any` (the prior got adapter did the
  // same); at runtime core.ts only uses standard Response members.
  return (await undiciFetchImpl(url as any, undiciInit)) as any;
};

export default undiciFetch;
