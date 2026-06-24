/**
 * Pool growth dynamics — ramp concurrency up then down against a real H2Pool,
 * sample actual session count over time, then assert grow-on-ramp /
 * no-shrink / bounded-by-maxConnections behavior.
 *
 * Server advertises maxConcurrentStreams=10. We drive the pool directly
 * (instead of through createH2Fetch) so we can read `_sessions.length` —
 * createH2Fetch's per-origin pool map is closure-private.
 *
 * Run: `npx tsx loadtest/h2-pool-growth.ts`
 */
import http2 from 'node:http2';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { H2Pool } from '../src/lib/h2-transport/pool';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const MAX_CONNECTIONS = 50;

function makeCerts() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'h2-grow-'));
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
  const pool = new H2Pool(`https://localhost:${server.port}`, {
    minConnections: 1,
    maxConnections: MAX_CONNECTIONS,
    tlsOptions: { rejectUnauthorized: false },
  });

  const observations: Array<{ t: number; concurrency: number; sessions: number }> = [];
  const t0 = Date.now();
  let inFlight = 0;
  const stages: Record<string, { peakSessions: number; peakConcurrency: number }> = {};
  let currentStage = '';

  const sessionsNow = () => (pool as any)._sessions.length as number;

  const sample = () => {
    const sessions = sessionsNow();
    observations.push({ t: Date.now() - t0, concurrency: inFlight, sessions });
    if (currentStage) {
      const s = stages[currentStage]!;
      s.peakSessions = Math.max(s.peakSessions, sessions);
      s.peakConcurrency = Math.max(s.peakConcurrency, inFlight);
    }
  };
  const sampler = setInterval(sample, 100);

  async function burst(name: string, target: number, durationMs: number): Promise<void> {
    currentStage = name;
    stages[name] = { peakSessions: 0, peakConcurrency: 0 };
    const end = Date.now() + durationMs;
    const ongoing = new Set<Promise<unknown>>();
    while (Date.now() < end) {
      while (ongoing.size < target && Date.now() < end) {
        inFlight++;
        const p = (async () => {
          try {
            const r = await pool.request('/x', 'GET', {}, null);
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
    currentStage = '';
  }

  console.log('ramp: 1 → 50 → 200 → 50 → 1');
  await burst('s1_low', 1, 2_000);
  await burst('s2_mid', 50, 5_000);
  await burst('s3_peak', 200, 8_000);
  await burst('s4_back_mid', 50, 5_000);
  await burst('s5_back_low', 1, 5_000);

  clearInterval(sampler);
  const finalSessions = sessionsNow();
  await pool.close();
  server.close();

  const result = {
    stages,
    peakSessionsOverall: Math.max(...observations.map((o) => o.sessions)),
    finalSessions,
    samples: observations.length,
  };
  console.log(JSON.stringify(result, null, 2));

  const failures: string[] = [];
  if (stages.s3_peak!.peakSessions <= stages.s1_low!.peakSessions) {
    failures.push(
      `pool did not grow on ramp-up: low=${stages.s1_low!.peakSessions} peak=${stages.s3_peak!.peakSessions}`,
    );
  }
  if (finalSessions < stages.s3_peak!.peakSessions) {
    failures.push(
      `pool shrank after ramp-down: peak=${stages.s3_peak!.peakSessions} final=${finalSessions} (no-shrink is documented behavior)`,
    );
  }
  if (result.peakSessionsOverall > MAX_CONNECTIONS) {
    failures.push(`pool exceeded maxConnections: peak=${result.peakSessionsOverall} > ${MAX_CONNECTIONS}`);
  }

  if (failures.length) {
    for (const f of failures) console.error('FAIL:', f);
    process.exit(1);
  }
  console.log('all invariants held');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
