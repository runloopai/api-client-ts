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

function makeRequest(index: number): Promise<{ latencyMs: number; status: number }> {
  const start = performance.now();
  return new Promise((resolve, reject) => {
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
        res.on('end', () => resolve({ latencyMs: performance.now() - start, status: res.statusCode! }));
        res.on('error', reject);
      },
    );
    req.on('error', reject);
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
  const statusCounts = new Map<number, number>();
  for (const r of results) {
    statusCounts.set(r.status, (statusCounts.get(r.status) ?? 0) + 1);
  }

  console.log(`\nWall clock:  ${(wallMs / 1000).toFixed(2)}s`);
  console.log(`Throughput:  ${(REQUEST_COUNT / (wallMs / 1000)).toFixed(1)} req/s`);
  console.log(`\nLatency (ms):`);
  console.log(`  min: ${latencies[0].toFixed(1)}`);
  console.log(`  p50: ${percentile(latencies, 50).toFixed(1)}`);
  console.log(`  p90: ${percentile(latencies, 90).toFixed(1)}`);
  console.log(`  p95: ${percentile(latencies, 95).toFixed(1)}`);
  console.log(`  p99: ${percentile(latencies, 99).toFixed(1)}`);
  console.log(`  max: ${latencies[latencies.length - 1].toFixed(1)}`);
  console.log(`\nStatus codes:`);
  for (const [s, c] of [...statusCounts.entries()].sort()) console.log(`  ${s}: ${c}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
