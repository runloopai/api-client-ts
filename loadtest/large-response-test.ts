/**
 * Large-response loadtest for the Runloop TypeScript SDK.
 *
 * Exercises paths stressed by the recent h2-transport changes:
 *   - Large exec stdout / stderr (multi-MB)
 *   - Large file round-trip via writeFileContents + readFileContents
 *   - Binary file download via downloadFile (streaming body path)
 *   - Concurrent large downloads (exercises h2 pool stream slots)
 *   - SSE streaming with high-volume output
 *   - Early SSE cancellation (exercises the ReadableStream cancel path that
 *     previously caused uncaught exceptions with the h2-transport)
 *
 * Usage:
 *   source ~/env && npx tsx loadtest/large-response-test.ts
 *   # Force http2:
 *   source ~/env && SMOKE_HTTP2=1 npx tsx loadtest/large-response-test.ts
 */

import { createHash } from 'node:crypto';
import { Runloop } from '../src/sdk.ts';

const API_KEY = process.env['RUNLOOP_API_KEY'] ?? '';
const BASE_URL = process.env['RUNLOOP_BASE_URL'] ?? 'https://api.runloop.pro';
const USE_HTTP2 = ['1', 'true'].includes((process.env['SMOKE_HTTP2'] ?? '').toLowerCase());

if (!API_KEY) {
  console.error('RUNLOOP_API_KEY is required');
  process.exit(1);
}

const client = new Runloop({
  bearerToken: API_KEY,
  baseURL: BASE_URL,
  timeout: 300_000,
  maxRetries: 2,
  http2: USE_HTTP2,
});

// ---------------------------------------------------------------------------
// Failure tracking
// ---------------------------------------------------------------------------

const failures: string[] = [];

function pass(name: string, detail = '') {
  console.log(`  ✓ PASS  ${name}${detail ? `  (${detail})` : ''}`);
}

function fail(name: string, err: unknown) {
  failures.push(name);
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`  ✗ FAIL  ${name}: ${msg}`);
  if (err instanceof Error && err.stack) {
    console.error(err.stack.split('\n').slice(1, 4).join('\n'));
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function md5(data: string | Buffer): string {
  return createHash('md5').update(data).digest('hex');
}

/** Read the entire body of a binary Response into a Buffer. */
async function readBinaryResponse(response: Response): Promise<Buffer> {
  const ab = await response.arrayBuffer();
  return Buffer.from(ab);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function testLargeExecStdout(devboxId: string) {
  const name = 'large exec stdout (~1 MB of base64)';
  try {
    // 768 KiB of random bytes → base64 → ~1.02 MB text, no wrapping (-w 0)
    const result = await client.devboxes.executeAndAwaitCompletion(devboxId, {
      command: 'dd if=/dev/urandom bs=768K count=1 2>/dev/null | base64 -w 0',
    });

    if (result.status !== 'completed') throw new Error(`status=${result.status}`);
    const stdout = result.stdout ?? '';
    if (stdout.length < 900_000) throw new Error(`stdout too short: ${stdout.length} bytes (expected ~1 MB)`);
    if (/\s/.test(stdout.trim())) throw new Error('stdout contains unexpected whitespace (base64 wrap bug?)');

    pass(name, `${(stdout.length / 1024).toFixed(0)} KB received`);
  } catch (err) {
    fail(name, err);
  }
}

async function testVeryLargeExecStdout(devboxId: string) {
  const name = 'very large exec stdout (~10 MB of base64)';
  try {
    const result = await client.devboxes.executeAndAwaitCompletion(devboxId, {
      command: 'dd if=/dev/urandom bs=7680K count=1 2>/dev/null | base64 -w 0',
    });

    if (result.status !== 'completed') throw new Error(`status=${result.status}`);
    const stdout = result.stdout ?? '';
    if (stdout.length < 9_000_000)
      throw new Error(`stdout too short: ${stdout.length} bytes (expected ~10 MB)`);

    pass(name, `${(stdout.length / 1024 / 1024).toFixed(1)} MB received`);
  } catch (err) {
    fail(name, err);
  }
}

async function testLargeExecManyLines(devboxId: string) {
  // The execute endpoint defaults to returning the last 100 lines (last_n=100).
  // We set last_n to 1000 so we get all lines from a 500-line sequence.
  const name = 'large exec stdout (500 lines, last_n=1000)';
  try {
    const result = await client.devboxes.executeAndAwaitCompletion(devboxId, {
      command: 'seq 1 500',
      last_n: '1000',
    });

    if (result.status !== 'completed') throw new Error(`status=${result.status}`);
    const stdout = result.stdout ?? '';
    const lines = stdout.trim().split('\n');
    if (lines.length !== 500) throw new Error(`expected 500 lines, got ${lines.length}`);
    if (lines[0] !== '1') throw new Error(`first line wrong: ${lines[0]}`);
    if (lines[499] !== '500') throw new Error(`last line wrong: ${lines[499]}`);

    pass(name, `${lines.length} lines, ${(stdout.length / 1024).toFixed(0)} KB`);
  } catch (err) {
    fail(name, err);
  }
}

async function testExecLargeStderr(devboxId: string) {
  const name = 'large exec stderr (~1 MB)';
  try {
    const result = await client.devboxes.executeAndAwaitCompletion(devboxId, {
      command: 'dd if=/dev/urandom bs=768K count=1 2>/dev/null | base64 -w 0 >&2',
    });

    if (result.status !== 'completed') throw new Error(`status=${result.status}`);
    const stderr = result.stderr ?? '';
    if (stderr.length < 900_000) throw new Error(`stderr too short: ${stderr.length} bytes (expected ~1 MB)`);

    pass(name, `${(stderr.length / 1024).toFixed(0)} KB received on stderr`);
  } catch (err) {
    fail(name, err);
  }
}

async function testFileRoundTripModerate(devboxId: string) {
  const name = 'file round-trip via writeFileContents + readFileContents (512 KB)';
  try {
    const line = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ\n'; // 63 chars
    const content = line.repeat(Math.ceil((512 * 1024) / line.length)).slice(0, 512 * 1024);
    const expectedHash = md5(content);

    await client.devboxes.writeFileContents(devboxId, {
      file_path: '/tmp/loadtest-roundtrip.txt',
      contents: content,
    });

    const readBack = await client.devboxes.readFileContents(devboxId, {
      file_path: '/tmp/loadtest-roundtrip.txt',
    });

    if (readBack.length !== content.length)
      throw new Error(`length mismatch: wrote ${content.length}, got ${readBack.length}`);
    if (md5(readBack) !== expectedHash) throw new Error(`md5 mismatch: data corrupted in transit`);

    pass(name, `${(readBack.length / 1024).toFixed(0)} KB intact`);
  } catch (err) {
    fail(name, err);
  }
}

async function testLargeReadFileContents(devboxId: string) {
  const name = 'readFileContents large file (2 MB text)';
  try {
    // Write a 2 MB deterministic text file on the devbox
    await client.devboxes.executeAndAwaitCompletion(devboxId, {
      command:
        'python3 -c "import sys; [sys.stdout.write(str(i % 10000).zfill(5) + chr(10)) for i in range(400000)]" > /tmp/loadtest-large-read.txt',
    });
    const sizeResult = await client.devboxes.executeAndAwaitCompletion(devboxId, {
      command: 'wc -c /tmp/loadtest-large-read.txt && md5sum /tmp/loadtest-large-read.txt',
      last_n: '5',
    });
    const [sizeLine, hashLine] = (sizeResult.stdout ?? '').trim().split('\n');
    const expectedSize = parseInt(sizeLine?.trim().split(/\s+/)[0] ?? '0', 10);
    const remoteHash = hashLine?.trim().split(/\s+/)[0] ?? '';

    if (expectedSize < 2_000_000) throw new Error(`file too small: ${expectedSize}`);

    const content = await client.devboxes.readFileContents(devboxId, {
      file_path: '/tmp/loadtest-large-read.txt',
    });

    if (content.length !== expectedSize)
      throw new Error(`length mismatch: server=${expectedSize}, received=${content.length}`);
    if (md5(content) !== remoteHash) throw new Error(`md5 mismatch: remote=${remoteHash} — DATA CORRUPTED`);

    pass(name, `${(content.length / 1024 / 1024).toFixed(1)} MB received, md5 verified`);
  } catch (err) {
    fail(name, err);
  }
}

async function testBinaryDownload(devboxId: string) {
  const name = 'binary file download via downloadFile (5 MB)';
  try {
    const writeResult = await client.devboxes.executeAndAwaitCompletion(devboxId, {
      command:
        'dd if=/dev/urandom bs=1M count=5 of=/tmp/loadtest-bin.dat 2>/dev/null && md5sum /tmp/loadtest-bin.dat',
    });
    if (writeResult.status !== 'completed') throw new Error(`write status=${writeResult.status}`);
    const remoteHash = (writeResult.stdout ?? '').split(/\s+/)[0];
    if (!remoteHash || remoteHash.length !== 32)
      throw new Error(`bad md5 from devbox: ${writeResult.stdout}`);

    const response = await client.devboxes.downloadFile(devboxId, {
      path: '/tmp/loadtest-bin.dat',
    });
    const buf = await readBinaryResponse(response);

    if (buf.length !== 5 * 1024 * 1024)
      throw new Error(`size mismatch: expected ${5 * 1024 * 1024}, got ${buf.length}`);
    const localHash = md5(buf);
    if (localHash !== remoteHash)
      throw new Error(`md5 mismatch: remote=${remoteHash} local=${localHash} — DATA CORRUPTED`);

    pass(name, `${(buf.length / 1024 / 1024).toFixed(0)} MB, md5 verified`);
  } catch (err) {
    fail(name, err);
  }
}

async function testLargeBinaryDownload(devboxId: string) {
  const name = 'large binary file download via downloadFile (50 MB)';
  try {
    const writeResult = await client.devboxes.executeAndAwaitCompletion(devboxId, {
      command:
        'dd if=/dev/urandom bs=1M count=50 of=/tmp/loadtest-large.dat 2>/dev/null && md5sum /tmp/loadtest-large.dat',
    });
    if (writeResult.status !== 'completed') throw new Error(`write status=${writeResult.status}`);
    const remoteHash = (writeResult.stdout ?? '').split(/\s+/)[0];
    if (!remoteHash || remoteHash.length !== 32)
      throw new Error(`bad md5 from devbox: ${writeResult.stdout}`);

    const response = await client.devboxes.downloadFile(devboxId, {
      path: '/tmp/loadtest-large.dat',
    });
    const buf = await readBinaryResponse(response);

    if (buf.length !== 50 * 1024 * 1024)
      throw new Error(`size mismatch: expected ${50 * 1024 * 1024}, got ${buf.length}`);
    const localHash = md5(buf);
    if (localHash !== remoteHash)
      throw new Error(`md5 mismatch: remote=${remoteHash} local=${localHash} — DATA CORRUPTED`);

    pass(name, `${(buf.length / 1024 / 1024).toFixed(0)} MB, md5 verified`);
  } catch (err) {
    fail(name, err);
  }
}

async function testConcurrentLargeDownloads(devboxId: string) {
  const name = 'concurrent large downloads (5 × 5 MB in parallel)';
  try {
    await client.devboxes.executeAndAwaitCompletion(devboxId, {
      command:
        'for i in $(seq 1 5); do dd if=/dev/urandom bs=1M count=5 of=/tmp/loadtest-concurrent-$i.dat 2>/dev/null; done',
    });

    const hashResult = await client.devboxes.executeAndAwaitCompletion(devboxId, {
      command: 'md5sum /tmp/loadtest-concurrent-*.dat',
      last_n: '10',
    });
    if (hashResult.status !== 'completed') throw new Error('md5sum failed');

    const remoteHashes: Record<string, string> = {};
    for (const line of (hashResult.stdout ?? '').trim().split('\n')) {
      const [hash, path] = line.split(/\s+/);
      const fileName = path?.split('/').pop();
      if (hash && fileName) remoteHashes[fileName] = hash;
    }
    if (Object.keys(remoteHashes).length !== 5)
      throw new Error(`expected 5 hashes, got ${Object.keys(remoteHashes).length}`);

    const downloads = await Promise.all(
      [1, 2, 3, 4, 5].map((i) =>
        client.devboxes
          .downloadFile(devboxId, { path: `/tmp/loadtest-concurrent-${i}.dat` })
          .then(readBinaryResponse)
          .then((buf) => ({ i, buf })),
      ),
    );

    for (const { i, buf } of downloads) {
      const fileName = `loadtest-concurrent-${i}.dat`;
      const expectedHash = remoteHashes[fileName];
      if (!expectedHash) throw new Error(`no hash for ${fileName}`);
      if (buf.length !== 5 * 1024 * 1024) throw new Error(`file ${i}: size mismatch (got ${buf.length})`);
      const localHash = md5(buf);
      if (localHash !== expectedHash)
        throw new Error(`file ${i}: md5 mismatch remote=${expectedHash} local=${localHash} — DATA CORRUPTED`);
    }

    pass(name, `5 × 5 MB downloaded and verified`);
  } catch (err) {
    fail(name, err);
  }
}

async function testSseStreamingLargeOutput(devboxId: string) {
  const name = 'SSE streaming with large output (10k lines)';
  try {
    const started = await client.devboxes.executions.executeAsync(devboxId, {
      command: 'seq 1 10000',
    });
    const execId = started.execution_id;
    await client.devboxes.executions.awaitCompleted(devboxId, execId, {
      longPoll: { timeoutMs: 60_000 },
    });

    const stream = await client.devboxes.executions.streamStdoutUpdates(devboxId, execId, {});
    let received = '';
    for await (const chunk of stream) {
      received += chunk.output ?? '';
    }

    const lines = received.trim().split('\n');
    if (lines.length !== 10000) throw new Error(`expected 10000 lines via SSE, got ${lines.length}`);
    if (lines[0] !== '1') throw new Error(`first SSE line wrong: ${JSON.stringify(lines[0])}`);
    if (lines[9999] !== '10000') throw new Error(`last SSE line wrong: ${JSON.stringify(lines[9999])}`);

    pass(name, `${lines.length} lines streamed via SSE`);
  } catch (err) {
    fail(name, err);
  }
}

async function testSseEarlyCancel(devboxId: string) {
  // Exercises the ReadableStream cancel() path: break out of the for-await loop
  // early while lots of SSE data is still in flight. Before the h2-transport fix,
  // this caused controller.enqueue() to throw on a cancelled ReadableStream,
  // producing uncaught exceptions that could crash the process.
  const name = 'SSE early cancel does not crash the process or poison the h2 pool';
  const uncaughtDuringTest: string[] = [];
  const uncaughtHandler = (e: Error) => uncaughtDuringTest.push(e.message);
  process.on('uncaughtException', uncaughtHandler);

  try {
    const started = await client.devboxes.executions.executeAsync(devboxId, {
      command: 'seq 1 50000', // large output — many SSE events in flight when we cancel
    });
    await client.devboxes.executions.awaitCompleted(devboxId, started.execution_id, {
      longPoll: { timeoutMs: 30_000 },
    });

    const stream = await client.devboxes.executions.streamStdoutUpdates(devboxId, started.execution_id, {});

    // Break after the very first event — cancels the ReadableStream immediately
    // while the h2 session still has a large backlog of DATA frames buffered.
    let count = 0;
    for await (const _chunk of stream) {
      count++;
      break;
    }

    // Give the event loop a chance to process any residual data/close events.
    await new Promise((r) => setTimeout(r, 500));

    if (uncaughtDuringTest.length > 0) {
      throw new Error(
        `${uncaughtDuringTest.length} uncaught exception(s) after cancel: ${uncaughtDuringTest.join('; ')}`,
      );
    }

    // Confirm the h2 pool is still usable after the cancel.
    const healthCheck = await client.devboxes.executeAndAwaitCompletion(devboxId, {
      command: 'echo pool-still-alive',
    });
    if (!healthCheck.stdout?.includes('pool-still-alive'))
      throw new Error('pool health check failed after SSE cancel');

    pass(name, `broke after ${count} chunk(s), pool healthy`);
  } catch (err) {
    fail(name, err);
  } finally {
    process.off('uncaughtException', uncaughtHandler);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const transport = USE_HTTP2 ? 'HTTP/2 (h2-transport)' : 'HTTP/1.1 (node-fetch)';
  console.log(`\n=== Runloop Large-Response Loadtest ===`);
  console.log(`Transport: ${transport}`);
  console.log(`API:       ${BASE_URL}\n`);

  console.log('Creating devbox...');
  let devboxId: string | undefined;
  try {
    const devbox = await client.devboxes.createAndAwaitRunning(
      {
        name: `loadtest-large-${Date.now()}`,
        launch_parameters: { resource_size_request: 'SMALL', keep_alive_time_seconds: 60 * 15 },
      },
      { longPoll: { timeoutMs: 10 * 60 * 1000 } },
    );
    devboxId = devbox.id;
    console.log(`Devbox ready: ${devboxId}\n`);
  } catch (err) {
    console.error('Failed to create devbox:', err);
    process.exit(1);
  }

  try {
    await testLargeExecStdout(devboxId);
    await testLargeExecManyLines(devboxId);
    await testExecLargeStderr(devboxId);
    await testFileRoundTripModerate(devboxId);
    await testLargeReadFileContents(devboxId);
    await testBinaryDownload(devboxId);
    await testLargeBinaryDownload(devboxId);
    await testConcurrentLargeDownloads(devboxId);
    await testSseStreamingLargeOutput(devboxId);
    await testSseEarlyCancel(devboxId);
    await testVeryLargeExecStdout(devboxId);
  } finally {
    console.log('\nShutting down devbox...');
    try {
      await client.devboxes.shutdown(devboxId);
      console.log('Devbox shut down.');
    } catch {
      console.warn('Shutdown failed (may already be gone)');
    }
  }

  console.log('\n=== Summary ===');
  if (failures.length === 0) {
    console.log(`All tests PASSED (transport: ${transport})`);
    process.exit(0);
  } else {
    console.error(`${failures.length} test(s) FAILED (transport: ${transport}): ${failures.join(', ')}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
