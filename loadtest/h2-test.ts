import http2 from 'node:http2';

const REQUEST_COUNT = parseInt(process.env.REQUEST_COUNT ?? '10000', 10);
const NUM_CONNECTIONS = parseInt(process.env.NUM_CONNECTIONS ?? '10', 10);
const BASE_URL = process.env.RUNLOOP_BASE_URL ?? 'https://api.runloop.pro';
const API_KEY = process.env.RUNLOOP_API_KEY!;

const body = JSON.stringify({
  blueprint_id: 'bp_nonexistent_loadtest_00000',
  name: 'loadtest-h2-0',
  environment_variables: { TEST_VAR_1: 'value_one', TEST_VAR_2: 'value_two' },
  metadata: { test_run: 'h2', index: '0' },
  launch_parameters: { resource_size_request: 'SMALL', keep_alive_time_seconds: 300 },
});

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function connectH2(origin: string): Promise<http2.ClientHttp2Session> {
  return new Promise((resolve, reject) => {
    const client = http2.connect(origin);
    client.on('connect', () => resolve(client));
    client.on('error', reject);
  });
}

function sendRequest(client: http2.ClientHttp2Session): Promise<{ latencyMs: number; status: number }> {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const req = client.request({
      ':method': 'POST',
      ':path': '/v1/devboxes',
      'content-type': 'application/json',
      authorization: `Bearer ${API_KEY}`,
    });
    req.on('response', (headers) => {
      const status = headers[':status'] as number;
      req.on('data', () => {});
      req.on('end', () => resolve({ latencyMs: performance.now() - start, status }));
    });
    req.on('error', reject);
    req.end(body);
  });
}

async function main() {
  console.log(`HTTP/2 test: ${REQUEST_COUNT} requests, ${NUM_CONNECTIONS} connections to ${BASE_URL}`);

  const url = new URL(BASE_URL);
  const clients = await Promise.all(Array.from({ length: NUM_CONNECTIONS }, () => connectH2(url.origin)));

  const maxStreams = clients[0].remoteSettings?.maxConcurrentStreams;
  console.log(`Server MAX_CONCURRENT_STREAMS: ${maxStreams ?? 'unknown'}`);
  console.log(`${NUM_CONNECTIONS} connections established\n`);

  let completed = 0;
  const progressTimer = setInterval(() => {
    console.log(
      `  progress: ${completed}/${REQUEST_COUNT} (${((completed / REQUEST_COUNT) * 100).toFixed(1)}%)`,
    );
  }, 2000);

  const wallStart = performance.now();

  const promises = Array.from({ length: REQUEST_COUNT }, (_, i) => {
    const client = clients[i % NUM_CONNECTIONS];
    return sendRequest(client).then((r) => {
      completed++;
      return r;
    });
  });

  const results = await Promise.all(promises);
  const wallMs = performance.now() - wallStart;
  clearInterval(progressTimer);

  for (const c of clients) c.close();

  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const statusCounts = new Map<number, number>();
  for (const r of results) {
    statusCounts.set(r.status, (statusCounts.get(r.status) ?? 0) + 1);
  }

  console.log(`\n=== HTTP/2 Results ===`);
  console.log(`Requests:    ${REQUEST_COUNT}`);
  console.log(`Connections: ${NUM_CONNECTIONS}`);
  console.log(`Wall clock:  ${(wallMs / 1000).toFixed(2)}s`);
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
