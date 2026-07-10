import https from 'node:https';

const REQUEST_COUNT = parseInt(process.env.REQUEST_COUNT ?? '10000', 10);
const BASE_URL = process.env.RUNLOOP_BASE_URL ?? 'https://api.runloop.pro';
const API_KEY = process.env.RUNLOOP_API_KEY!;

const agent = new https.Agent({
  keepAlive: true,
  maxSockets: Infinity,
  maxFreeSockets: 4096,
});

const body = JSON.stringify({
  blueprint_id: 'bp_nonexistent_loadtest_00000',
  name: 'loadtest-raw-0',
  environment_variables: { TEST_VAR_1: 'value_one', TEST_VAR_2: 'value_two' },
  metadata: { test_run: 'raw', index: '0' },
  launch_parameters: { resource_size_request: 'SMALL', keep_alive_time_seconds: 300 },
});

function makeRequest(index: number): Promise<{ latencyMs: number; status: number | null }> {
  const start = performance.now();
  return new Promise((resolve) => {
    // Settle exactly once. A request/response error or a mid-stream abort resolves
    // with status=null (a failure) rather than hanging or rejecting the whole batch.
    let settled = false;
    const done = (status: number | null) => {
      if (settled) return;
      settled = true;
      resolve({ latencyMs: performance.now() - start, status });
    };
    const url = new URL('/v1/devboxes', BASE_URL);
    const req = https.request(
      url,
      {
        method: 'POST',
        agent,
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${API_KEY}`,
          'content-length': Buffer.byteLength(body).toString(),
        },
      },
      (res) => {
        res.resume();
        res.on('end', () => done(res.statusCode ?? null));
        res.on('aborted', () => done(null));
        res.on('error', () => done(null));
      },
    );
    req.on('error', () => done(null));
    req.end(body);
  });
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function main() {
  console.log(`Raw node:https test: ${REQUEST_COUNT} concurrent requests to ${BASE_URL}`);

  const wallStart = performance.now();
  const results = await Promise.all(Array.from({ length: REQUEST_COUNT }, (_, i) => makeRequest(i)));
  const wallMs = performance.now() - wallStart;

  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const statusCounts = new Map<string, number>();
  for (const r of results) {
    const key = r.status != null ? String(r.status) : 'network_error';
    statusCounts.set(key, (statusCounts.get(key) ?? 0) + 1);
  }

  console.log(`\nWall clock:  ${(wallMs / 1000).toFixed(2)}s`);
  console.log(`Throughput:  ${(REQUEST_COUNT / (wallMs / 1000)).toFixed(1)} req/s`);
  if (latencies.length > 0) {
    console.log(`\nLatency (ms):`);
    console.log(`  min: ${latencies[0].toFixed(1)}`);
    console.log(`  p50: ${percentile(latencies, 50).toFixed(1)}`);
    console.log(`  p90: ${percentile(latencies, 90).toFixed(1)}`);
    console.log(`  p95: ${percentile(latencies, 95).toFixed(1)}`);
    console.log(`  p99: ${percentile(latencies, 99).toFixed(1)}`);
    console.log(`  max: ${latencies[latencies.length - 1].toFixed(1)}`);
  }
  console.log(`\nStatus codes:`);
  for (const [s, c] of [...statusCounts.entries()].sort()) console.log(`  ${s}: ${c}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
