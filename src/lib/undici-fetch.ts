/**
 * A fetch-compatible adapter backed by undici's HTTP/2 support.
 *
 * undici is the same engine that powers Node's built-in global `fetch`.
 * Constructing an `Agent` with `allowH2: true` and passing it as the
 * per-request `dispatcher` makes requests negotiate HTTP/2 via ALPN, with
 * automatic fallback to HTTP/1.1 when the origin doesn't advertise h2. undici
 * returns a standard WHATWG `Response`, so the rest of core.ts — which only
 * touches standard Response members (`.status`, `.ok`, `.headers`, `.text()`,
 * `.json()`, `.body`, `.arrayBuffer()`, `.blob()`) — is unchanged.
 *
 * Unlike the previous got@14 approach, undici is dual CJS/ESM and `require`-able
 * from this `"type": "commonjs"` package, so there is no dynamic-import hack and
 * no second HTTP stack to keep in sync.
 *
 * This lives in src/lib/ (the Stainless custom-code dir) so it survives
 * regeneration; the only generated file touched is the one-line wiring change
 * in src/_shims/node-runtime.ts.
 */
import { Agent, fetch as undiciFetchImpl } from 'undici';
import { Readable } from 'node:stream';
import { MultipartBody } from '../_shims/MultipartBody';
import { type Fetch } from '../core';

// One module-scoped dispatcher, reused across requests: this is the HTTP/2
// transport, with keep-alive. `allowH2` negotiates h2 over TLS via ALPN and
// transparently falls back to HTTP/1.1 when the origin doesn't offer h2.
const h2Dispatcher = new Agent({
  allowH2: true,
  keepAliveTimeout: 10 * 60 * 1000,
  keepAliveMaxTimeout: 10 * 60 * 1000,
});

type NormalizedBody = { body: any; isStream: boolean };

// Map the body shapes core.ts produces (string | Buffer/ArrayBufferView |
// Node Readable for multipart | null) onto a valid undici BodyInit. A Node
// Readable must become a Web ReadableStream and requires `duplex: 'half'`.
function normalizeBody(body: unknown): NormalizedBody {
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
