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
import { MultipartBody } from '../../_shims/MultipartBody';
import { type Fetch } from '../../core';

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

function normalizeBody(body: unknown): string | Buffer | null {
  if (body == null) return null;
  if (typeof body === 'string') return body;
  if (Buffer.isBuffer(body)) return body;
  if (body instanceof MultipartBody) return normalizeBody((body as MultipartBody).body);
  if (body instanceof Readable) {
    // Multipart bodies arrive as Node Readable. For H2, we need to buffer them
    // since session.request() takes string | Buffer. The Readable is a
    // FormDataEncoder stream with a known content-length, so buffering is safe.
    // Streaming uploads could be added later if needed.
    throw new Error(
      'h2-transport: streaming request bodies (Readable) are not yet supported. ' +
        'Use a string or Buffer body.',
    );
  }
  if (ArrayBuffer.isView(body)) return Buffer.from(body.buffer, body.byteOffset, body.byteLength);
  if (body instanceof ArrayBuffer) return Buffer.from(body);
  return String(body);
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
    const body = normalizeBody(rawBody);

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
    return pool.request(path, method.toUpperCase(), reqHeaders, body, signal) as any;
  }) as H2Fetch;

  h2Fetch.close = async () => {
    const closeTasks = [...pools.values()].map((pool) => pool.close());
    pools.clear();
    await Promise.all(closeTasks);
  };

  return h2Fetch;
}
