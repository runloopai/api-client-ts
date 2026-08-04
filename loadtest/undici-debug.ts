import { Agent, fetch } from 'undici';

const BASE_URL = process.env.RUNLOOP_BASE_URL ?? 'https://api.runloop.pro';
const API_KEY = process.env.RUNLOOP_API_KEY!;

const body = JSON.stringify({
  blueprint_id: 'bp_nonexistent_loadtest_00000',
  name: 'loadtest-debug-0',
  environment_variables: { TEST_VAR_1: 'value_one' },
  launch_parameters: { resource_size_request: 'SMALL' },
});

async function main() {
  console.log('=== undici HTTP/2 debug ===\n');

  const dispatcher = new Agent({
    allowH2: true,
    connections: 2,
    pipelining: 10,
    keepAliveTimeout: 600_000,
    bodyTimeout: 0,
    headersTimeout: 0,
  });

  // Single request to inspect protocol
  const res = await fetch(`${BASE_URL}/v1/devboxes`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${API_KEY}`,
    },
    body,
    dispatcher,
  } as any);

  console.log('Status:', res.status);
  console.log('HTTP version:', res.headers.get('x-http-version') ?? '(not reported)');
  console.log('\nResponse headers:');
  for (const [k, v] of res.headers) {
    console.log(`  ${k}: ${v}`);
  }
  await res.text();

  // Quick 20-request burst to verify concurrency
  console.log('\n--- 20-request burst (2 connections, pipelining=10) ---');
  const wallStart = performance.now();
  const promises = Array.from({ length: 20 }, async () => {
    const start = performance.now();
    const r = await fetch(`${BASE_URL}/v1/devboxes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${API_KEY}` },
      body,
      dispatcher,
    } as any);
    await r.text();
    return { latencyMs: performance.now() - start, status: r.status };
  });
  const results = await Promise.all(promises);
  const wallMs = performance.now() - wallStart;

  console.log(`Wall clock: ${wallMs.toFixed(0)}ms`);
  console.log(`Throughput: ${(20 / (wallMs / 1000)).toFixed(1)} req/s`);
  const lats = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  console.log(`Latency: min=${lats[0].toFixed(0)}ms  max=${lats[lats.length - 1].toFixed(0)}ms`);

  await dispatcher.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
