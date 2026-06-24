/**
 * Leak / soak test — run at modest concurrency for a configurable window,
 * sample heap and FD count, report slope.
 *
 * Run: `npx tsx loadtest/h2-leak.ts [durationSeconds=600]`
 */
import http2 from 'node:http2';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createH2Fetch } from '../src/lib/h2-transport/index';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function makeCerts() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'h2-leak-'));
  const key = path.join(tmp, 'key.pem');
  const cert = path.join(tmp, 'cert.pem');
  execFileSync(
    'openssl',
    ['req', '-x509', '-newkey', 'rsa:2048', '-keyout', key, '-out', cert,
      '-days', '1', '-nodes', '-subj', '/CN=localhost'],
    { stdio: ['ignore', 'ignore', 'ignore'] },
  );
  return { key: fs.readFileSync(key), cert: fs.readFileSync(cert), tmp };
}

function fdCount(): number | null {
  try {
    return fs.readdirSync('/proc/self/fd').length;
  } catch {
    return null;
  }
}

async function startServer() {
  const { key, cert, tmp } = makeCerts();
  let streamN = 0;
  const server = http2.createSecureServer({ key, cert });
  server.on('stream', (stream) => {
    streamN++;
    const n = streamN;
    stream.on('error', () => {});
    stream.respond({ ':status': 200 });
    stream.end(JSON.stringify({ n }));
    if (n % 1000 === 0) {
      try {
        stream.session?.goaway();
      } catch {}
    }
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
  const durationSec = Number(process.argv[2] ?? 600);
  const server = await startServer();
  const fetch = createH2Fetch({
    minConnections: 4,
    maxConnections: 20,
    tlsOptions: { rejectUnauthorized: false },
  });

  const startMs = Date.now();
  const end = startMs + durationSec * 1000;
  let completed = 0;
  let failed = 0;
  const samples: Array<{ t: number; heap: number; fds: number | null }> = [];

  const sampler = setInterval(() => {
    if (global.gc) global.gc();
    samples.push({
      t: Math.round((Date.now() - startMs) / 1000),
      heap: process.memoryUsage().heapUsed,
      fds: fdCount(),
    });
  }, 30_000);

  const RATE = 50;
  const tickMs = 20;
  const perTick = Math.max(1, Math.round((RATE * tickMs) / 1000));

  while (Date.now() < end) {
    await Promise.all(
      Array.from({ length: perTick }, async () => {
        try {
          const r = (await fetch(`https://localhost:${server.port}/x`, { method: 'GET' } as any)) as any;
          await r.text();
          completed++;
        } catch {
          failed++;
        }
      }),
    );
    await new Promise((r) => setTimeout(r, tickMs));
  }

  clearInterval(sampler);
  await fetch.close();
  server.close();

  const warmup = samples[Math.min(2, samples.length - 1)]?.heap ?? 0;
  const final = samples[samples.length - 1]?.heap ?? 0;
  const heapGrowthMB = (final - warmup) / (1024 * 1024);

  console.log(
    JSON.stringify(
      {
        durationSec,
        completed,
        failed,
        rps: Math.round(completed / durationSec),
        heapWarmupMB: Math.round(warmup / (1024 * 1024)),
        heapFinalMB: Math.round(final / (1024 * 1024)),
        heapGrowthMB: Math.round(heapGrowthMB),
        samples,
      },
      null,
      2,
    ),
  );

  if (heapGrowthMB > 50) {
    console.error(`HEAP GREW BY ${heapGrowthMB.toFixed(1)}MB — possible leak`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
