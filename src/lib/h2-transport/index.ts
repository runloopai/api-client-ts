/**
 * A high-performance HTTP/2 fetch adapter built on Node's native `node:http2`.
 *
 * Replaces undici for HTTP/2 transport. Manages a pool of persistent H2 sessions
 * per origin, multiplexing requests as concurrent streams. Each session handles up
 * to the server-advertised MAX_CONCURRENT_STREAMS; the pool auto-scales between
 * minConnections and maxConnections as load requires.
 *
 * Usage:
 *   const fetch = createH2Fetch({ maxConnections: 20 });
 *   const response = await fetch('https://api.example.com/v1/items', {
 *     method: 'POST',
 *     headers: { 'content-type': 'application/json' },
 *     body: JSON.stringify({ name: 'test' }),
 *   });
 */

import { Readable } from 'node:stream';
import { H2Pool, type H2PoolOptions } from './pool';
import type { H2Response } from './response';
import { MultipartBody } from '../../_shims/MultipartBody';
import { Response } from 'node-fetch';
import { type Fetch } from '../../core';

// Statuses that must not carry a body per the Fetch spec; node-fetch's Response
// rejects a non-null body for these.
const NULL_BODY_STATUSES = new Set([101, 204, 205, 304]);

const MIN_NODE_MAJOR = 18;

function checkNodeVersion(): void {
  const match = process.versions?.node?.match(/^(\d+)/);
  if (!match?.[1]) return; // non-Node runtime, let it fail naturally
  const major = parseInt(match[1], 10);
  if (major < MIN_NODE_MAJOR) {
    throw new Error(
      `h2-transport requires Node.js ${MIN_NODE_MAJOR} or later (found ${process.versions.node}). ` +
        `The HTTP/2 transport depends on node:stream/web which is not available in older versions.`,
    );
  }
}

export type { H2PoolOptions as H2FetchOptions };

export type H2Fetch = Fetch & {
  close: () => Promise<void>;
};

async function bufferReadable(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function normalizeBody(body: unknown): Promise<string | Buffer | null> {
  if (body == null) return null;
  if (typeof body === 'string') return body;
  if (Buffer.isBuffer(body)) return body;
  if (body instanceof MultipartBody) return normalizeBody((body as MultipartBody).body);
  if (body instanceof Readable) {
    // Multipart bodies arrive as a FormDataEncoder Readable with a known
    // content-length. session.request() takes string | Buffer, so buffer here.
    return bufferReadable(body);
  }
  if (ArrayBuffer.isView(body)) return Buffer.from(body.buffer, body.byteOffset, body.byteLength);
  if (body instanceof ArrayBuffer) return Buffer.from(body);
  return String(body);
}

/**
 * Adapt an internal {@link H2Response} to a standard node-fetch `Response`, so
 * callers get the same type the default (HTTP/1.1) transport returns — including
 * `instanceof Response`. Body streaming is preserved: the H2 body is a web
 * `ReadableStream`, which node-fetch consumes as a Node `Readable`.
 */
function toFetchResponse(h2: H2Response): Response {
  const headers: Record<string, string> = {};
  for (const [key, value] of h2.headers.entries()) headers[key] = value;

  const body = NULL_BODY_STATUSES.has(h2.status) ? null : Readable.fromWeb(h2.body as any);
  const response = new Response(body as any, { status: h2.status, headers });

  // node-fetch derives `url` from the request internals it never saw; expose the
  // real request URL (`Response.url` is a prototype getter, shadowed here).
  Object.defineProperty(response, 'url', { value: h2.url, configurable: true });
  return response;
}

/**
 * Build a fetch adapter backed by native HTTP/2 connection pools.
 *
 * Compatible with the SDK's `makeHttp2Fetch` interface: called with no arguments
 * for `http2: true`, or with options for `http2: <H2FetchOptions>`.
 */
export function createH2Fetch(options?: H2PoolOptions): H2Fetch {
  checkNodeVersion();
  const pools = new Map<string, H2Pool>();

  function getPool(origin: string): H2Pool {
    let pool = pools.get(origin);
    if (!pool) {
      pool = new H2Pool(origin, options);
      pools.set(origin, pool);
    }
    return pool;
  }

  const h2Fetch = (async (url, init) => {
    const {
      agent: _ignored, // node-fetch artifact injected by core.ts
      body: rawBody,
      signal,
      method = 'GET',
      headers: rawHeaders,
    } = (init ?? {}) as any;

    const parsed = typeof url === 'string' ? new URL(url) : new URL(url.toString());
    const path = parsed.pathname + parsed.search;
    const body = await normalizeBody(rawBody);

    const reqHeaders: Record<string, string> = {};
    if (rawHeaders) {
      if (typeof rawHeaders.entries === 'function') {
        for (const [k, v] of rawHeaders.entries()) {
          reqHeaders[k.toLowerCase()] = v;
        }
      } else {
        for (const [k, v] of Object.entries(rawHeaders as Record<string, string>)) {
          reqHeaders[k.toLowerCase()] = v;
        }
      }
    }

    const pool = getPool(parsed.origin);
    const h2resp = await pool.request(path, method.toUpperCase(), reqHeaders, body, signal);
    return toFetchResponse(h2resp) as any;
  }) as H2Fetch;

  h2Fetch.close = async () => {
    const closeTasks = [...pools.values()].map((pool) => pool.close());
    pools.clear();
    await Promise.all(closeTasks);
  };

  return h2Fetch;
}
