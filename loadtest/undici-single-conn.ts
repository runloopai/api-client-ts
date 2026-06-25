import { Client, Agent, fetch } from "undici";

const BASE_URL = process.env.RUNLOOP_BASE_URL ?? "https://api.runloop.pro";
const API_KEY = process.env.RUNLOOP_API_KEY!;
const PIPELINING = parseInt(process.env.PIPELINING ?? "100", 10);

const body = JSON.stringify({
  blueprint_id: "bp_nonexistent_loadtest_00000",
  name: "loadtest-single-0",
  environment_variables: { TEST_VAR_1: "value_one" },
  launch_parameters: { resource_size_request: "SMALL" },
});

async function testClient() {
  console.log(`\n--- undici.Client (single connection, pipelining=${PIPELINING}) ---`);
  const url = new URL(BASE_URL);
  const client = new Client(url.origin, {
    allowH2: true,
    pipelining: PIPELINING,
    bodyTimeout: 0,
    headersTimeout: 0,
  });

  // Warm up - single request to establish connection
  const warmup = await client.request({
    method: "POST",
    path: "/v1/devboxes",
    headers: { "content-type": "application/json", authorization: `Bearer ${API_KEY}` },
    body,
  });
  await warmup.body.text();
  console.log(`Warmup: status=${warmup.statusCode}`);

  // Burst 50 requests on single connection
  const count = 50;
  const wallStart = performance.now();
  const promises = Array.from({ length: count }, async () => {
    const start = performance.now();
    const res = await client.request({
      method: "POST",
      path: "/v1/devboxes",
      headers: { "content-type": "application/json", authorization: `Bearer ${API_KEY}` },
      body,
    });
    await res.body.text();
    return { latencyMs: performance.now() - start, status: res.statusCode };
  });
  const results = await Promise.all(promises);
  const wallMs = performance.now() - wallStart;

  const lats = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  console.log(`${count} requests in ${wallMs.toFixed(0)}ms (${(count / (wallMs / 1000)).toFixed(1)} req/s)`);
  console.log(`Latency: min=${lats[0].toFixed(0)}ms  p50=${lats[Math.floor(count / 2)].toFixed(0)}ms  max=${lats[lats.length - 1].toFixed(0)}ms`);

  await client.close();
}

async function testAgent() {
  console.log(`\n--- undici.Agent (connections=1, pipelining=${PIPELINING}) ---`);
  const dispatcher = new Agent({
    allowH2: true,
    connections: 1,
    pipelining: PIPELINING,
    bodyTimeout: 0,
    headersTimeout: 0,
  });

  // Warm up
  const warmup = await fetch(`${BASE_URL}/v1/devboxes`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${API_KEY}` },
    body,
    dispatcher,
  } as any);
  await warmup.text();
  console.log(`Warmup: status=${warmup.status}`);

  // Burst 50 requests
  const count = 50;
  const wallStart = performance.now();
  const promises = Array.from({ length: count }, async () => {
    const start = performance.now();
    const r = await fetch(`${BASE_URL}/v1/devboxes`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${API_KEY}` },
      body,
      dispatcher,
    } as any);
    await r.text();
    return { latencyMs: performance.now() - start, status: r.status };
  });
  const results = await Promise.all(promises);
  const wallMs = performance.now() - wallStart;

  const lats = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  console.log(`${count} requests in ${wallMs.toFixed(0)}ms (${(count / (wallMs / 1000)).toFixed(1)} req/s)`);
  console.log(`Latency: min=${lats[0].toFixed(0)}ms  p50=${lats[Math.floor(count / 2)].toFixed(0)}ms  max=${lats[lats.length - 1].toFixed(0)}ms`);

  await dispatcher.close();
}

async function main() {
  await testClient();
  await testAgent();
}

main().catch((e) => { console.error(e); process.exit(1); });
