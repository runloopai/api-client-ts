/**
 * H2 stress test: 10 concurrent 20 MB downloads over HTTP/2.
 * Verifies the h2-transport pool handles high concurrency without data corruption.
 *
 * Usage:
 *   source ~/env && SMOKE_HTTP2=1 npx tsx loadtest/h2-stress-test.ts
 */

import { createHash } from 'node:crypto';
import { Runloop } from '../src/sdk.ts';

const API_KEY = process.env['RUNLOOP_API_KEY'] ?? '';
const BASE_URL = process.env['RUNLOOP_BASE_URL'] ?? 'https://api.runloop.pro';
const USE_HTTP2 = ['1', 'true'].includes((process.env['SMOKE_HTTP2'] ?? '').toLowerCase());
const CONCURRENCY = parseInt(process.env['CONCURRENCY'] ?? '10', 10);
const FILE_SIZE_MB = parseInt(process.env['FILE_SIZE_MB'] ?? '20', 10);

if (!API_KEY) {
  console.error('RUNLOOP_API_KEY is required');
  process.exit(1);
}

const client = new Runloop({
  bearerToken: API_KEY,
  baseURL: BASE_URL,
  timeout: 300_000,
  maxRetries: 1,
  http2: USE_HTTP2,
});

function md5(data: Buffer): string {
  return createHash('md5').update(data).digest('hex');
}

async function main() {
  const transport = USE_HTTP2 ? 'HTTP/2 (h2-transport)' : 'HTTP/1.1 (node-fetch)';
  console.log(`\n=== H2 Stress Test ===`);
  console.log(`Transport:   ${transport}`);
  console.log(`Concurrency: ${CONCURRENCY} simultaneous downloads`);
  console.log(`File size:   ${FILE_SIZE_MB} MB each`);
  console.log(`Total data:  ${CONCURRENCY * FILE_SIZE_MB} MB\n`);

  console.log('Creating devbox...');
  const devbox = await client.devboxes.createAndAwaitRunning(
    {
      name: `h2-stress-${Date.now()}`,
      launch_parameters: {
        resource_size_request: 'SMALL',
        keep_alive_time_seconds: 60 * 15,
      },
    },
    { longPoll: { timeoutMs: 10 * 60 * 1000 } },
  );
  const id = devbox.id;
  console.log(`Devbox: ${id}\n`);

  try {
    // Create test files
    console.log(`Creating ${CONCURRENCY} × ${FILE_SIZE_MB} MB files on devbox...`);
    await client.devboxes.executeAndAwaitCompletion(id, {
      command: `for i in $(seq 1 ${CONCURRENCY}); do dd if=/dev/urandom bs=1M count=${FILE_SIZE_MB} of=/tmp/stress-$i.dat 2>/dev/null; done`,
    });

    const hashResult = await client.devboxes.executeAndAwaitCompletion(id, {
      command: 'md5sum /tmp/stress-*.dat',
      last_n: String(CONCURRENCY + 5),
    });

    const remoteHashes: Record<string, string> = {};
    for (const line of (hashResult.stdout ?? '').trim().split('\n')) {
      const [hash, path] = line.split(/\s+/);
      const name = path?.split('/').pop();
      if (hash && name) remoteHashes[name] = hash;
    }

    if (Object.keys(remoteHashes).length !== CONCURRENCY) {
      throw new Error(
        `Expected ${CONCURRENCY} hashes, got ${Object.keys(remoteHashes).length}:\n${hashResult.stdout}`,
      );
    }
    console.log(`Files created. Remote hashes verified for ${Object.keys(remoteHashes).length} files.\n`);

    // Concurrent downloads
    console.log(`Downloading ${CONCURRENCY} files concurrently...`);
    const t0 = Date.now();

    const downloads = await Promise.all(
      Array.from({ length: CONCURRENCY }, (_, i) => i + 1).map((n) =>
        client.devboxes
          .downloadFile(id, { path: `/tmp/stress-${n}.dat` })
          .then((r) => r.arrayBuffer())
          .then((ab) => ({ n, buf: Buffer.from(ab) })),
      ),
    );

    const elapsed = (Date.now() - t0) / 1000;

    // Verify each download
    let allOk = true;
    for (const { n, buf } of downloads) {
      const fname = `stress-${n}.dat`;
      const expectedSize = FILE_SIZE_MB * 1024 * 1024;
      const remoteHash = remoteHashes[fname];

      if (buf.length !== expectedSize) {
        console.error(
          `  ✗ File ${n}: size mismatch — expected ${expectedSize}, got ${buf.length}`,
        );
        allOk = false;
        continue;
      }

      const localHash = md5(buf);
      if (localHash !== remoteHash) {
        console.error(
          `  ✗ File ${n}: md5 mismatch — remote=${remoteHash} local=${localHash} DATA CORRUPTED`,
        );
        allOk = false;
      } else {
        console.log(`  ✓ File ${n}: ${FILE_SIZE_MB} MB, md5 OK`);
      }
    }

    const totalMB = CONCURRENCY * FILE_SIZE_MB;
    const throughput = (totalMB / elapsed).toFixed(1);
    console.log(
      `\n${CONCURRENCY} downloads completed in ${elapsed.toFixed(1)}s (${throughput} MB/s effective throughput)`,
    );

    if (allOk) {
      console.log(`\n=== PASS: all data intact (transport: ${transport}) ===`);
      process.exit(0);
    } else {
      console.error(`\n=== FAIL: data corruption detected (transport: ${transport}) ===`);
      process.exit(1);
    }
  } finally {
    console.log('\nShutting down devbox...');
    try {
      await client.devboxes.shutdown(id);
    } catch {
      // ignore
    }
  }
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
