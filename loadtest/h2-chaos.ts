/**
 * Chaos test — server randomly drops sockets, sends RST_STREAM, GOAWAY, or
 * delays headers. Asserts the client survives.
 *
 * Every request is bounded by REQUEST_TIMEOUT_MS and batches are drained with
 * allSettled, so a request the chaos server never answers is counted as a
 * failure instead of wedging the driver loop past `durationSeconds`.
 *
 * Run: `npx tsx loadtest/h2-chaos.ts [durationSeconds=60]`
 */
import http2 from 'node:http2';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createH2Fetch } from '../src/lib/h2-transport/index';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function makeCerts() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'h2-chaos-'));
  const key = path.join(tmp, 'key.pem');
  const cert = path.join(tmp, 'cert.pem');
  execFileSync(
    'openssl',
    [
      'req',
      '-x509',
      '-newkey',
      'rsa:2048',
      '-keyout',
      key,
      '-out',
      cert,
      '-days',
      '1',
      '-nodes',
      '-subj',
      '/CN=localhost',
    ],
    { stdio: ['ignore', 'ignore', 'ignore'] },
  );
  return { key: fs.readFileSync(key), cert: fs.readFileSync(cert), tmp };
}

async function startServer(seed: number) {
  const { key, cert, tmp } = makeCerts();
  let rng = seed >>> 0;
  const next = () => {
    rng = (rng * 1664525 + 1013904223) >>> 0;
    return rng / 0xffffffff;
  };
  const server = http2.createSecureServer({ key, cert });
  server.on('stream', (stream) => {
    stream.on('error', () => {});
    const r = next();
    if (r < 0.1) {
      try {
        stream.session?.socket?.destroy();
      } catch {}
      return;
    }
    if (r < 0.2) {
      try {
        stream.close(0x8);
      } catch {}
      return;
    }
    if (r < 0.21) {
      stream.respond({ ':status': 200 });
      stream.end('ok');
      try {
        stream.session?.goaway();
      } catch {}
      return;
    }
    const delay = r < 0.4 ? Math.floor(next() * 200) : 0;
    setTimeout(() => {
      if (stream.destroyed) return;
      stream.respond({ ':status': 200 });
      stream.end('ok');
    }, delay);
  });
  return new Promise<{ port: number; close: () => void }>((resolve) => {
    server.listen(0, () => {
      resolve({
        port: (server.address() as any).port,
        close: () => {
          server.close();
          fs.rmSync(tmp, { recursive: true, force: true });
        },
      });
    });
  });
}

/** Upper bound on any single request. The chaos server's worst honest reply is ~200ms. */
const REQUEST_TIMEOUT_MS = 5_000;
/** Grace period the last batch is allowed to run past the requested duration. */
const SHUTDOWN_GRACE_MS = 1_000;

class RequestTimeoutError extends Error {
  constructor(ms: number) {
    super(`request exceeded ${ms}ms`);
    this.name = 'RequestTimeoutError';
  }
}

/**
 * Run `op` with an abort signal and a hard deadline. If the deadline wins, the
 * request is aborted and the returned promise rejects with RequestTimeoutError.
 * `Promise.race` keeps a handler attached to the losing promise, so a late
 * rejection from the aborted request can't surface as an unhandled rejection.
 */
function withTimeout<T>(ms: number, op: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  let timer: NodeJS.Timeout | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new RequestTimeoutError(ms));
    }, ms);
  });
  return Promise.race([op(controller.signal), deadline]).finally(() => clearTimeout(timer));
}

async function main() {
  const durationSec = Number(process.argv[2] ?? 60);
  if (!Number.isFinite(durationSec) || durationSec <= 0) {
    console.error(`invalid duration: ${process.argv[2]} (must be a positive number of seconds)`);
    process.exit(2);
  }
  const server = await startServer(42);
  const fetch = createH2Fetch({
    minConnections: 4,
    maxConnections: 20,
    connectTimeout: 5_000,
    tlsOptions: { rejectUnauthorized: false },
  });

  const end = Date.now() + durationSec * 1000;
  let getOk = 0,
    getFail = 0,
    getTimedOut = 0,
    postOk = 0,
    postFail = 0,
    postTimedOut = 0;

  async function get(timeoutMs: number) {
    try {
      await withTimeout(timeoutMs, async (signal) => {
        const r = (await fetch(`https://localhost:${server.port}/x`, {
          method: 'GET',
          signal,
        } as any)) as any;
        await r.text();
      });
      getOk++;
    } catch (err) {
      getFail++;
      if (err instanceof RequestTimeoutError) getTimedOut++;
    }
  }
  async function post(timeoutMs: number) {
    try {
      await withTimeout(timeoutMs, async (signal) => {
        const r = (await fetch(`https://localhost:${server.port}/x`, {
          method: 'POST',
          body: 'b',
          signal,
        } as any)) as any;
        await r.text();
      });
      postOk++;
    } catch (err) {
      postFail++;
      if (err instanceof RequestTimeoutError) postTimedOut++;
    }
  }

  while (Date.now() < end) {
    // Shrink the per-request budget as the deadline nears so the final batch
    // can't push the run more than SHUTDOWN_GRACE_MS past `durationSec`.
    const budgetMs = Math.max(500, Math.min(REQUEST_TIMEOUT_MS, end - Date.now() + SHUTDOWN_GRACE_MS));
    // allSettled, not all: one straggler must not hold up the rest of the batch.
    await Promise.allSettled([
      ...Array.from({ length: 10 }, () => get(budgetMs)),
      ...Array.from({ length: 5 }, () => post(budgetMs)),
    ]);
  }

  await fetch.close();
  server.close();

  const getTotal = getOk + getFail;
  const postTotal = postOk + postFail;
  if (getTotal === 0) {
    console.error('no GET requests were issued — load harness produced zero coverage');
    process.exit(1);
  }
  const getRate = getOk / getTotal;
  const postClean = postFail === 0 || postOk > 0;

  console.log(
    JSON.stringify(
      {
        getOk,
        getFail,
        getTimedOut,
        getTotal,
        getSuccessRate: Number(getRate.toFixed(3)),
        postOk,
        postFail,
        postTimedOut,
        postTotal,
        durationSec,
        requestTimeoutMs: REQUEST_TIMEOUT_MS,
      },
      null,
      2,
    ),
  );

  if (getRate < 0.5) {
    console.error('GET success rate too low');
    process.exit(1);
  }
  if (!postClean) {
    console.error('POST never succeeded');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
