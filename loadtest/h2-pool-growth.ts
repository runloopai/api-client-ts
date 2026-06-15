/**
 * Pool growth dynamics — ramp concurrency up then down, log pool size over time.
 *
 * Server advertises maxConcurrentStreams=10. Asserts the pool grows on
 * ramp-up and *does not* shrink back down (current implementation has no
 * shrinking — documented behavior).
 *
 * Run: `npx tsx loadtest/h2-pool-growth.ts`
 */
import http2 from 'node:http2';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createH2Fetch } from '../src/lib/h2-transport/index';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function makeCerts() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'h2-grow-'));
  const key = path.join(tmp, 'key.pem');
  const cert = path.join(tmp, 'cert.pem');
  execSync(
    `openssl req -x509 -newkey rsa:2048 -keyout ${key} -out ${cert} -days 1 -nodes -subj "/CN=localhost" 2>/dev/null`,
  );
  return { key: fs.readFileSync(key), cert: fs.readFileSync(cert), tmp };
}

async function startServer() {
  const { key, cert, tmp } = makeCerts();
  const server = http2.createSecureServer({ key, cert, settings: { maxConcurrentStreams: 10 } });
  server.on('stream', (stream) => {
    stream.on('error', () => {});
    setTimeout(() => {
      if (stream.destroyed) return;
      stream.respond({ ':status': 200 });
      stream.end('ok');
    }, 50);
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
  const server = await startServer();
  const fetch = createH2Fetch({
    minConnections: 1,
    maxConnections: 50,
    tlsOptions: { rejectUnauthorized: false },
  });

  const observations: Array<{ t: number; concurrency: number }> = [];
  const t0 = Date.now();
  let inFlight = 0;

  const sample = () => {
    observations.push({ t: Date.now() - t0, concurrency: inFlight });
  };
  const sampler = setInterval(sample, 100);

  async function burst(target: number, durationMs: number): Promise<void> {
    const end = Date.now() + durationMs;
    const ongoing = new Set<Promise<unknown>>();
    while (Date.now() < end) {
      while (ongoing.size < target && Date.now() < end) {
        inFlight++;
        const p = (async () => {
          try {
            const r = (await fetch(`https://localhost:${server.port}/x`, { method: 'GET' } as any)) as any;
            await r.text();
          } finally {
            inFlight--;
          }
        })();
        ongoing.add(p);
        p.finally(() => ongoing.delete(p));
      }
      await new Promise((r) => setTimeout(r, 10));
    }
    await Promise.all(ongoing);
  }

  console.log('ramp: 1 → 50 → 200 → 50 → 1');
  await burst(1, 2_000);
  await burst(50, 5_000);
  await burst(200, 8_000);
  await burst(50, 5_000);
  await burst(1, 5_000);

  clearInterval(sampler);
  await fetch.close();
  server.close();

  console.log(JSON.stringify({
    note: 'pool never shrinks today; peak == final is expected',
    samples: observations.length,
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
