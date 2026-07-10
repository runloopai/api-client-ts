import http2 from 'node:http2';

const BASE_URL = process.env.RUNLOOP_BASE_URL ?? 'https://api.runloop.pro';
const API_KEY = process.env.RUNLOOP_API_KEY!;

const body = JSON.stringify({
  blueprint_id: 'bp_nonexistent_loadtest_00000',
  name: 'loadtest-h2s-0',
  environment_variables: { TEST_VAR_1: 'value_one' },
  launch_parameters: { resource_size_request: 'SMALL' },
});

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
  const url = new URL(BASE_URL);
  const client = http2.connect(url.origin);
  await new Promise<void>((resolve, reject) => {
    client.on('connect', resolve);
    client.on('error', reject);
  });

  const maxStreams = client.remoteSettings?.maxConcurrentStreams;
  console.log(`Server MAX_CONCURRENT_STREAMS: ${maxStreams}`);

  // Warmup
  const w = await sendRequest(client);
  console.log(`Warmup: status=${w.status}, latency=${w.latencyMs.toFixed(0)}ms`);

  // Burst 50 requests on single warmed connection
  const count = 50;
  console.log(`\nBursting ${count} requests on 1 warmed connection...`);
  const wallStart = performance.now();
  const results = await Promise.all(Array.from({ length: count }, () => sendRequest(client)));
  const wallMs = performance.now() - wallStart;

  const lats = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  console.log(`${count} requests in ${wallMs.toFixed(0)}ms (${(count / (wallMs / 1000)).toFixed(1)} req/s)`);
  console.log(
    `Latency: min=${lats[0].toFixed(0)}ms  p50=${lats[Math.floor(count / 2)].toFixed(0)}ms  max=${lats[lats.length - 1].toFixed(0)}ms`,
  );

  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
