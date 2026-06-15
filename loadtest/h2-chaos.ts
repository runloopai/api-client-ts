/**
 * Chaos test — server randomly drops sockets, sends RST_STREAM, GOAWAY, or
 * delays headers. Asserts the client survives.
 *
 * Run: `npx tsx loadtest/h2-chaos.ts [durationSeconds=60]`
 */
import http2 from 'node:http2';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createH2Fetch } from '../src/lib/h2-transport/index';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function makeCerts() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'h2-chaos-'));
  const key = path.join(tmp, 'key.pem');
  const cert = path.join(tmp, 'cert.pem');
  execSync(
    `openssl req -x509 -newkey rsa:2048 -keyout ${key} -out ${cert} -days 1 -nodes -subj "/CN=localhost" 2>/dev/null`,
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

async function main() {
  const durationSec = Number(process.argv[2] ?? 60);
  const server = await startServer(42);
  const fetch = createH2Fetch({
    minConnections: 4,
    maxConnections: 20,
    connectTimeout: 5_000,
    tlsOptions: { rejectUnauthorized: false },
  });

  const end = Date.now() + durationSec * 1000;
  let getOk = 0, getFail = 0, postOk = 0, postFail = 0;

  async function get() {
    try {
      const r = (await fetch(`https://localhost:${server.port}/x`, { method: 'GET' } as any)) as any;
      await r.text();
      getOk++;
    } catch {
      getFail++;
    }
  }
  async function post() {
    try {
      const r = (await fetch(`https://localhost:${server.port}/x`, { method: 'POST', body: 'b' } as any)) as any;
      await r.text();
      postOk++;
    } catch {
      postFail++;
    }
  }

  while (Date.now() < end) {
    await Promise.all([
      ...Array.from({ length: 10 }, get),
      ...Array.from({ length: 5 }, post),
    ]);
  }

  await fetch.close();
  server.close();

  const getRate = getOk / (getOk + getFail);
  const postClean = postFail === 0 || postOk > 0;

  console.log(JSON.stringify({
    getOk, getFail, getSuccessRate: Number(getRate.toFixed(3)),
    postOk, postFail,
    durationSec,
  }, null, 2));

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
