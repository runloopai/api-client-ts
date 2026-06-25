/**
 * In-process multiplex throughput test.
 *
 * Boots a local h2 server that returns a 1KB JSON body after ~5ms of simulated
 * latency, then fires N concurrent requests through createH2Fetch and reports
 * throughput, p50/p95/p99, and peak pool size.
 *
 * Run: `npx tsx loadtest/h2-multiplex.ts [N=1000]`
 */
import http2 from 'node:http2';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createH2Fetch } from '../src/lib/h2-transport/index';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function makeCerts() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'h2-mux-'));
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

async function startServer(simulatedLatencyMs: number) {
  const { key, cert, tmp } = makeCerts();
  const payload = Buffer.from(JSON.stringify({ ok: true, data: 'x'.repeat(1000) }));
  const server = http2.createSecureServer({ key, cert });
  server.on('stream', (stream) => {
    stream.on('error', () => {});
    setTimeout(() => {
      if (stream.destroyed) return;
      stream.respond({ ':status': 200, 'content-type': 'application/json' });
      stream.end(payload);
    }, simulatedLatencyMs);
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

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const i = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[i]!;
}

async function main() {
  const N = Number(process.argv[2] ?? 1000);
  const server = await startServer(5);
  const fetch = createH2Fetch({
    minConnections: 4,
    maxConnections: 20,
    tlsOptions: { rejectUnauthorized: false },
  });

  const latencies: number[] = [];
  let failures = 0;
  const t0 = process.hrtime.bigint();
  await Promise.all(
    Array.from({ length: N }, async (_, i) => {
      const start = process.hrtime.bigint();
      try {
        const r = (await fetch(`https://localhost:${server.port}/i/${i}`, { method: 'GET' } as any)) as any;
        await r.json();
        const us = Number(process.hrtime.bigint() - start) / 1000;
        latencies.push(us);
      } catch {
        failures++;
      }
    }),
  );
  const totalMs = Number(process.hrtime.bigint() - t0) / 1e6;

  latencies.sort((a, b) => a - b);
  const successful = latencies.length;
  console.log(
    JSON.stringify(
      {
        N,
        successful,
        failures,
        totalMs: Math.round(totalMs),
        attemptedRps: Math.round((N / totalMs) * 1000),
        effectiveRps: Math.round((successful / totalMs) * 1000),
        p50_us: Math.round(percentile(latencies, 50)),
        p95_us: Math.round(percentile(latencies, 95)),
        p99_us: Math.round(percentile(latencies, 99)),
        max_us: Math.round(latencies[latencies.length - 1] ?? 0),
      },
      null,
      2,
    ),
  );

  await fetch.close();
  server.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
