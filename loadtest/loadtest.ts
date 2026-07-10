// Import the in-repo SDK source directly (run via `npx tsx`) so the benchmark
// always exercises the exact code in this checkout — not a published build.
import { Runloop } from '../src/sdk.ts';

const REQUEST_COUNT = parseInt(process.env.REQUEST_COUNT ?? '100000', 10);
const RUNLOOP_BASE_URL = process.env.RUNLOOP_BASE_URL;
// HTTP/2 is the SDK's default transport; set USE_HTTP2=0 to benchmark HTTP/1.1.
const USE_HTTP2 = (process.env.USE_HTTP2 ?? '1') === '1';
const PROGRESS_INTERVAL_MS = 2000;

function buildClient(): Runloop {
  const opts: ConstructorParameters<typeof Runloop>[0] = {
    maxRetries: 0,
    timeout: 120_000,
  };
  if (RUNLOOP_BASE_URL) {
    opts.baseURL = RUNLOOP_BASE_URL;
  }
  // Set explicitly: since HTTP/2 is the default, HTTP/1.1 must be opted into
  // with `http2: false` (omitting it would now select HTTP/2).
  (opts as any).http2 = USE_HTTP2;
  return new Runloop(opts);
}

interface RequestResult {
  index: number;
  latencyMs: number;
  status: number | null;
  error: string | null;
}

async function sendRequest(client: Runloop, index: number, runId: string): Promise<RequestResult> {
  const start = performance.now();
  try {
    await client.devboxes.create({
      blueprint_id: 'bp_nonexistent_loadtest_00000',
      name: `loadtest-${runId}-${index}`,
      environment_variables: {
        TEST_VAR_1: 'value_one',
        TEST_VAR_2: 'value_two',
      },
      metadata: {
        test_run: runId,
        index: String(index),
      },
      launch_parameters: {
        resource_size_request: 'SMALL',
        keep_alive_time_seconds: 300,
      },
    });
    return {
      index,
      latencyMs: performance.now() - start,
      status: 200,
      error: null,
    };
  } catch (err: any) {
    return {
      index,
      latencyMs: performance.now() - start,
      status: err?.status ?? null,
      error: err?.message ?? String(err),
    };
  }
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function printMetrics(results: RequestResult[], wallClockMs: number): void {
  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);

  const statusCounts = new Map<string, number>();
  for (const r of results) {
    const key = r.status != null ? String(r.status) : 'network_error';
    statusCounts.set(key, (statusCounts.get(key) ?? 0) + 1);
  }

  console.log('\n=== Load Test Results ===');
  console.log(`Requests:        ${results.length}`);
  console.log(`Wall clock:      ${(wallClockMs / 1000).toFixed(2)}s`);
  console.log(`Throughput:      ${(results.length / (wallClockMs / 1000)).toFixed(1)} req/s`);
  console.log('');
  if (latencies.length > 0) {
    console.log('Latency (ms):');
    console.log(`  min:           ${latencies[0].toFixed(1)}`);
    console.log(`  p50:           ${percentile(latencies, 50).toFixed(1)}`);
    console.log(`  p90:           ${percentile(latencies, 90).toFixed(1)}`);
    console.log(`  p95:           ${percentile(latencies, 95).toFixed(1)}`);
    console.log(`  p99:           ${percentile(latencies, 99).toFixed(1)}`);
    console.log(`  max:           ${latencies[latencies.length - 1].toFixed(1)}`);
    console.log('');
  }
  console.log('Status codes:');
  for (const [status, count] of [...statusCounts.entries()].sort()) {
    console.log(`  ${status}: ${count}`);
  }
}

async function main(): Promise<void> {
  const fdLimit = await checkFileDescriptorLimit();
  if (!USE_HTTP2 && fdLimit < 10000) {
    console.warn(
      `\nWARNING: File descriptor limit is ${fdLimit}. For 100k HTTP/1.1 requests, run:\n` +
        `  ulimit -n 65536\n` +
        `Or use HTTP/2 multiplexing: USE_HTTP2=1\n`,
    );
  }

  const client = buildClient();
  const runId = `run-${Date.now()}`;

  console.log(`Starting load test: ${REQUEST_COUNT} concurrent requests`);
  console.log(`Run ID: ${runId}`);
  console.log(`HTTP mode: ${USE_HTTP2 ? 'HTTP/2 (SDK native node:http2)' : 'HTTP/1.1 (node-fetch)'}`);
  console.log(`Base URL: ${RUNLOOP_BASE_URL ?? '(SDK default)'}`);
  console.log(`File descriptor limit: ${fdLimit}`);
  console.log('');

  let completed = 0;
  const progressTimer = setInterval(() => {
    console.log(
      `  progress: ${completed}/${REQUEST_COUNT} (${((completed / REQUEST_COUNT) * 100).toFixed(1)}%)`,
    );
  }, PROGRESS_INTERVAL_MS);

  const wallStart = performance.now();

  const promises = Array.from({ length: REQUEST_COUNT }, (_, i) =>
    sendRequest(client, i, runId).then((result) => {
      completed++;
      return result;
    }),
  );

  const results = await Promise.all(promises);

  const wallClockMs = performance.now() - wallStart;
  clearInterval(progressTimer);

  printMetrics(results, wallClockMs);
}

async function checkFileDescriptorLimit(): Promise<number> {
  try {
    const { execSync } = await import('child_process');
    return parseInt(execSync('ulimit -n', { encoding: 'utf-8' }).trim(), 10);
  } catch {
    return -1;
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
