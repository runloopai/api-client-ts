/**
 * A fetch-compatible adapter backed by undici's HTTP/2 support.
 *
 * undici is the same engine that powers Node's built-in global `fetch`.
 * Constructing an `Agent` with `allowH2: true` and passing it as the
 * per-request `dispatcher` makes requests negotiate HTTP/2 via ALPN, with
 * automatic fallback to HTTP/1.1 when the origin doesn't advertise h2.
 *
 * This adapter intentionally uses `undici.request` rather than `undici.fetch`.
 * In undici 6.x, the fetch path opens too many H2 sessions under high
 * concurrency. `request` respects the bounded dispatcher pool, then we wrap its
 * output in Undici's WHATWG `Response` so core.ts can keep using standard
 * Response members (`.status`, `.ok`, `.headers`, `.text()`, `.json()`,
 * `.body`, `.arrayBuffer()`, `.blob()`).
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
import { Readable } from 'node:stream';
import { MultipartBody } from '../_shims/MultipartBody';
import { type Fetch } from '../core';

// One module-scoped dispatcher, reused across requests: this is the HTTP/2
// transport, with keep-alive. `allowH2` negotiates h2 over TLS via ALPN and
// transparently falls back to HTTP/1.1 when the origin doesn't offer h2.
const h2Dispatcher = new Agent({
  allowH2: true,
  connections: 4,
  maxConcurrentStreams: 64,
  pipelining: 64,
  keepAliveTimeout: 10 * 60 * 1000,
  keepAliveMaxTimeout: 10 * 60 * 1000,
});

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

  const result = await undiciRequest(url as any, {
    ...rest,
    body: normalizeBody(rawBody),
    maxRedirections: redirect === 'manual' || redirect === 'error' ? 0 : 20,
    // core.ts passes a standard web AbortSignal (from `new AbortController()`),
    // which undici accepts directly.
    signal: signal ?? undefined,
    dispatcher: h2Dispatcher,
  });

  const responseBody = statusMustNotHaveBody(result.statusCode) ? null : result.body;
  if (responseBody === null) await result.body.dump();

  const response = new Response(responseBody, {
    status: result.statusCode,
    headers: toResponseHeaders(result.headers),
  });
  Object.defineProperty(response, 'url', { value: String(url) });

  // The SDK is typed against the node-fetch Response, so cast through `any`;
  // at runtime core.ts only uses standard Response members.
  return response as any;
};

export default undiciFetch;
