import { makeHttp2Fetch } from '../_shims/index';
import { type Fetch } from '../core';
import type { H2FetchOptions } from './h2-transport';

/**
 * Transport-selection logic for the client, kept out of the generated
 * `src/index.ts` (which holds only a one-line call-site hook).
 *
 * This selection matters only on Node.js. There the SDK's default transport is
 * `node-fetch`, which speaks HTTP/1.1, so using HTTP/2 means swapping in the
 * dedicated `node:http2` transport that {@link makeHttp2Fetch} builds. On
 * browsers, Deno, and Bun the platform `fetch` already negotiates HTTP/2, so the
 * shim's {@link makeHttp2Fetch} simply returns that platform `fetch` and this
 * whole resolution is effectively a no-op.
 */

// A single HTTP/2 transport shared by every client that uses the default pool,
// so short-lived clients don't each open (and leak) their own H2 sessions.
// Clients that pass explicit `H2FetchOptions` get a dedicated pool, since they
// asked to tune it.
let sharedDefaultFetch: Fetch | undefined;

function getSharedDefaultFetch(): Fetch {
  return (sharedDefaultFetch ??= makeHttp2Fetch());
}

// Each warning is emitted at most once per process. Module-scoped flags mirror
// the `fileFromPathWarned` pattern in _shims/node-runtime.ts.
let httpAgentIgnoredWarned = false;
let httpAgentFallbackWarned = false;

function warnHttpAgentIgnored(): void {
  if (httpAgentIgnoredWarned) return;
  httpAgentIgnoredWarned = true;
  console.warn(
    '[runloop] `httpAgent` is ignored when `http2` is set: the HTTP/2 transport manages ' +
      'its own connections. To tune the H2 pool, pass options as `http2` ' +
      '(e.g. `http2: { maxConnections: 20 }`).',
  );
}

function warnHttpAgentFallback(): void {
  if (httpAgentFallbackWarned) return;
  httpAgentFallbackWarned = true;
  console.warn(
    '[runloop] HTTP/2 is the default transport, but `httpAgent` is set, so this client ' +
      'uses HTTP/1.1. Remove `httpAgent` to use HTTP/2, or pass `http2: false` to select ' +
      'HTTP/1.1 explicitly and silence this warning.',
  );
}

export interface Http2TransportOptions {
  http2?: boolean | H2FetchOptions | undefined;
  httpAgent?: unknown;
}

/**
 * Resolve the `fetch` implementation for the transport, or `undefined` to fall
 * back to the default HTTP/1.1 (`node-fetch`) transport. Only called when the
 * caller did not supply a custom `fetch` (a custom `fetch` always wins).
 *
 * - `http2: false` → HTTP/1.1.
 * - `http2: true` / omitted → the shared default HTTP/2 pool.
 * - `http2: H2FetchOptions` → a dedicated HTTP/2 pool tuned with those options.
 * - a bare `httpAgent` (no explicit `http2`) → HTTP/1.1, so existing agents keep
 *   working; warns once since it overrides the HTTP/2 default.
 *
 * `httpAgent` never applies to the HTTP/2 path: a Node `http.Agent` configures
 * HTTP/1.1 socket pooling, which has no equivalent in HTTP/2's multiplexed model
 * (its knobs live on `H2FetchOptions`). So the H2 branches ignore it, warning
 * once, rather than pretending to honor it.
 */
export function resolveHttp2Fetch(options: Http2TransportOptions): Fetch | undefined {
  if (options.http2 === false) return undefined;

  if (options.http2) {
    if (options.httpAgent) warnHttpAgentIgnored();
    return typeof options.http2 === 'object' ? makeHttp2Fetch(options.http2) : getSharedDefaultFetch();
  }

  if (options.httpAgent) {
    warnHttpAgentFallback();
    return undefined;
  }

  return getSharedDefaultFetch();
}
