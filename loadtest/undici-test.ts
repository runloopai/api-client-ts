import { Agent, fetch } from "undici";

const REQUEST_COUNT = parseInt(process.env.REQUEST_COUNT ?? "10000", 10);
const NUM_CONNECTIONS = parseInt(process.env.NUM_CONNECTIONS ?? "20", 10);
const PIPELINING = parseInt(process.env.PIPELINING ?? "128", 10);
const BASE_URL = process.env.RUNLOOP_BASE_URL ?? "https://api.runloop.pro";
const API_KEY = process.env.RUNLOOP_API_KEY!;

const body = JSON.stringify({
  blueprint_id: "bp_nonexistent_loadtest_00000",
  name: "loadtest-undici-0",
  environment_variables: { TEST_VAR_1: "value_one", TEST_VAR_2: "value_two" },
  metadata: { test_run: "undici", index: "0" },
  launch_parameters: { resource_size_request: "SMALL", keep_alive_time_seconds: 300 },
});

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function main() {
  const dispatcher = new Agent({
    allowH2: true,
    connections: NUM_CONNECTIONS,
    pipelining: PIPELINING,
    keepAliveTimeout: 600_000,
    keepAliveMaxTimeout: 600_000,
    bodyTimeout: 0,
    headersTimeout: 0,
  });

  console.log(
    `undici direct test: ${REQUEST_COUNT} requests, ${NUM_CONNECTIONS} connections, pipelining=${PIPELINING}`,
  );
  console.log(`Target: ${BASE_URL}`);

  let completed = 0;
  const progressTimer = setInterval(() => {
    console.log(
      `  progress: ${completed}/${REQUEST_COUNT} (${((completed / REQUEST_COUNT) * 100).toFixed(1)}%)`,
    );
  }, 2000);

  const wallStart = performance.now();

  const promises = Array.from({ length: REQUEST_COUNT }, async () => {
    const start = performance.now();
    const res = await fetch(`${BASE_URL}/v1/devboxes`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${API_KEY}`,
      },
      body,
      dispatcher,
    } as any);
    await res.text();
    completed++;
    return { latencyMs: performance.now() - start, status: res.status };
  });

  const results = await Promise.all(promises);
  const wallMs = performance.now() - wallStart;
  clearInterval(progressTimer);

  await dispatcher.close();

  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const statusCounts = new Map<number, number>();
  for (const r of results) {
    statusCounts.set(r.status, (statusCounts.get(r.status) ?? 0) + 1);
  }

  console.log(`\n=== undici Direct Results ===`);
  console.log(`Requests:    ${REQUEST_COUNT}`);
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
