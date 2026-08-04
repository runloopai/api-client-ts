/**
 * Runs all h2-transport load tests and pushes results to Loki as structured
 * log entries. One log line per test per run, labelled {job="h2-loadtest",
 * test="<name>"}. Grafana reads these via LogQL unwrap to chart trends.
 *
 * Usage:
 *   LOKI_URL=https://dev-loki npx tsx loadtest/push-to-loki.ts
 *
 * LOKI_URL must be the Loki gateway base URL (no trailing slash, no path).
 * Optionally set LOKI_USER and LOKI_PASSWORD for basic auth.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LOKI_URL = process.env['LOKI_URL'];
if (!LOKI_URL) {
  console.error('LOKI_URL is required');
  process.exit(1);
}

const LOKI_USER = process.env['LOKI_USER'] ?? '';
const LOKI_PASSWORD = process.env['LOKI_PASSWORD'] ?? '';

interface Test {
  name: string;
  script: string;
  args?: string[];
}

const TESTS: Test[] = [
  { name: 'multiplex', script: 'h2-multiplex.ts', args: ['1000'] },
  { name: 'pool-growth', script: 'h2-pool-growth.ts' },
  { name: 'chaos', script: 'h2-chaos.ts', args: ['30'] },
  { name: 'leak', script: 'h2-leak.ts', args: ['120'] },
];

function runTest(test: Test): unknown {
  const scriptPath = path.join(__dirname, test.script);
  const args = ['tsx', scriptPath, ...(test.args ?? [])];
  console.log(`running ${test.name}...`);
  const stdout = execFileSync('npx', args, {
    encoding: 'utf8',
    timeout: 300_000,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  // Scripts may print progress lines before the final JSON object; extract it.
  const match = stdout.match(/\{[\s\S]*\}(?=[^{}]*$)/);
  if (!match) throw new Error(`no JSON in output of ${test.name}`);
  return JSON.parse(match[0]);
}

async function pushToLoki(test: string, result: unknown): Promise<void> {
  const nowNs = String(BigInt(Date.now()) * 1_000_000n);
  const body = JSON.stringify({
    streams: [
      {
        stream: { job: 'h2-loadtest', test },
        values: [[nowNs, JSON.stringify(result)]],
      },
    ],
  });

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (LOKI_USER && LOKI_PASSWORD) {
    headers['Authorization'] = 'Basic ' + Buffer.from(`${LOKI_USER}:${LOKI_PASSWORD}`).toString('base64');
  }

  const res = await fetch(`${LOKI_URL}/loki/api/v1/push`, {
    method: 'POST',
    headers,
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Loki push failed for ${test}: ${res.status} ${text}`);
  }
  console.log(`pushed ${test} → Loki (${res.status})`);
}

async function main() {
  const results: Array<{ test: string; result: unknown }> = [];

  for (const test of TESTS) {
    try {
      const result = runTest(test);
      results.push({ test: test.name, result });
    } catch (err) {
      console.error(`${test.name} failed:`, err);
      process.exitCode = 1;
    }
  }

  for (const { test, result } of results) {
    try {
      await pushToLoki(test, result);
    } catch (err) {
      console.error(`push failed for ${test}:`, err);
      process.exitCode = 1;
    }
  }

  console.log('\nsummary:');
  for (const { test, result } of results) {
    console.log(`  ${test}:`, JSON.stringify(result));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
