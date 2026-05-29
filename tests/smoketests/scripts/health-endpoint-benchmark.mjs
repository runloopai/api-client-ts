/**
 * Health endpoint benchmark for comparing the SDK HTTP/1.1 and HTTP/2 transports.
 *
 * Runs OUTSIDE the normal smoke suite. Build first, then run explicitly:
 *
 *   RUNLOOP_API_KEY=... [RUNLOOP_BASE_URL=...] [RUNLOOP_E2E_HEALTH_REQUEST_COUNT=10000] yarn test:e2e:health
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import diagnostics_channel from 'node:diagnostics_channel';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';

const require = createRequire(import.meta.url);
const distPath = new URL('../../../dist/index.js', import.meta.url).pathname;

let Runloop;
try {
  ({ Runloop } = require(distPath));
} catch (error) {
  console.error(`Failed to load built SDK from ${distPath}. Run \`yarn build\` first.`);
  console.error(`${error?.constructor?.name ?? 'Error'}: ${error?.message ?? error}`);
  process.exit(2);
}

const DEFAULT_REQUEST_COUNT = 10_000;

const apiKey = process.env.RUNLOOP_API_KEY_DEV;
const baseURL = process.env.RUNLOOP_BASE_URL ?? 'https://api.runloop.pro';
const requestCount = parsePositiveInteger(
  process.env.RUNLOOP_E2E_HEALTH_REQUEST_COUNT ?? process.env.RUNLOOP_E2E_DEVBOX_COUNT,
  DEFAULT_REQUEST_COUNT,
);
const resultsPath = process.env.RUNLOOP_E2E_RESULTS_PATH ?? defaultResultsPath();

if (!apiKey) {
  console.error('RUNLOOP_API_KEY is required');
  process.exit(2);
}

if (requestCount === undefined) {
  console.error('RUNLOOP_E2E_HEALTH_REQUEST_COUNT must be a positive integer');
  process.exit(2);
}

const transports = [
  { name: 'http1', http2: false },
  { name: 'http2', http2: true },
];

const startedAt = new Date().toISOString();
const passResults = [];

for (const transport of transports) {
  passResults.push(await runTransportPass(transport));
}

const endedAt = new Date().toISOString();
const artifact = {
  benchmark: 'health-endpoint-http1-vs-http2',
  startedAt,
  endedAt,
  config: {
    requestCount,
    baseURL,
    endpoint: '/health',
  },
  summary: passResults.map(({ records, summary, ...pass }) => pass),
  passes: passResults,
};

await fs.mkdir(path.dirname(resultsPath), { recursive: true });
await fs.writeFile(resultsPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');

printComparison(passResults);
console.log(`\nWrote results artifact: ${resultsPath}`);

const hasFailures = passResults.some((pass) => pass.failureCount > 0);
process.exit(hasFailures ? 1 : 0);

async function runTransportPass(transport) {
  const diagnostics = createUndiciConnectionDiagnostics();
  const client = new Runloop({
    bearerToken: apiKey,
    baseURL,
    timeout: 30_000,
    maxRetries: 0,
    http2: transport.http2,
  });

  console.log(`\nStarting ${transport.name} pass with ${requestCount} concurrent health checks`);
  const wallStart = performance.now();
  diagnostics.start();
  let settled;
  let wallTimeMs;
  try {
    settled = await Promise.allSettled(
      Array.from({ length: requestCount }, (_, index) => pingHealthEndpoint(client, transport.name, index)),
    );
    wallTimeMs = performance.now() - wallStart;
  } finally {
    diagnostics.stop();
  }

  const records = settled.map((result, index) => {
    if (result.status === 'fulfilled') return result.value;
    return {
      transport: transport.name,
      index,
      healthDurationMs: null,
      status: null,
      contentType: null,
      bodySample: null,
      error: serializeError(result.reason),
    };
  });

  const failureCount = records.filter((record) => record.error).length;
  const healthStats = summarizeDurations(records.map((record) => record.healthDurationMs));
  const connectionDiagnostics = diagnostics.summary();
  const summary = {
    transport: transport.name,
    requested: requestCount,
    successCount: records.length - failureCount,
    failureCount,
    health: healthStats,
    wallTimeMs,
    connectionDiagnostics,
  };

  printPassSummary(summary);

  return {
    transport: transport.name,
    http2: transport.http2,
    requested: requestCount,
    successCount: summary.successCount,
    failureCount,
    healthStats,
    wallTimeMs,
    connectionDiagnostics,
    summary,
    records,
  };
}

async function pingHealthEndpoint(client, transport, index) {
  const healthStart = performance.now();
  const record = {
    transport,
    index,
    healthDurationMs: null,
    status: null,
    contentType: null,
    bodySample: null,
    error: null,
  };

  try {
    const response = await client.get('/health').asResponse();
    record.healthDurationMs = performance.now() - healthStart;
    record.status = response.status;
    record.contentType = response.headers.get('content-type');

    const body = await response.text();
    record.bodySample = body.length > 200 ? `${body.slice(0, 200)}...` : body;
  } catch (error) {
    record.healthDurationMs = performance.now() - healthStart;
    record.error = serializeError(error);
  }

  return record;
}

function printPassSummary(summary) {
  console.log(`\n${summary.transport} summary`);
  console.table([
    {
      transport: summary.transport,
      requested: summary.requested,
      successes: summary.successCount,
      failures: summary.failureCount,
      minMs: round(summary.health.min),
      p50Ms: round(summary.health.p50),
      p90Ms: round(summary.health.p90),
      p95Ms: round(summary.health.p95),
      p99Ms: round(summary.health.p99),
      maxMs: round(summary.health.max),
      avgMs: round(summary.health.avg),
      wallTimeMs: round(summary.wallTimeMs),
      undiciConnections: summary.connectionDiagnostics.connectionCount,
      alpnH2: summary.connectionDiagnostics.alpnCounts.h2 ?? 0,
      alpnHttp1: summary.connectionDiagnostics.alpnCounts['http/1.1'] ?? 0,
      h2Fallbacks: summary.connectionDiagnostics.h2FallbackCount,
      uniqueLocalPorts: summary.connectionDiagnostics.uniqueLocalPorts.length,
    },
  ]);

  if (summary.connectionDiagnostics.connectionCount > 0) {
    console.log(`${summary.transport} undici connection diagnostics`);
    console.table([
      {
        connections: summary.connectionDiagnostics.connectionCount,
        alpn: JSON.stringify(summary.connectionDiagnostics.alpnCounts),
        h2: summary.connectionDiagnostics.h2ConnectionCount,
        h1Fallbacks: summary.connectionDiagnostics.h2FallbackCount,
        uniqueLocalPorts: summary.connectionDiagnostics.uniqueLocalPorts.length,
        localPorts: summary.connectionDiagnostics.uniqueLocalPorts.join(', '),
      },
    ]);
  }
}

function printComparison(results) {
  const [http1, http2] = results;
  const metrics = [
    ['health p50 ms', http1.healthStats.p50, http2.healthStats.p50],
    ['health p90 ms', http1.healthStats.p90, http2.healthStats.p90],
    ['health p95 ms', http1.healthStats.p95, http2.healthStats.p95],
    ['health p99 ms', http1.healthStats.p99, http2.healthStats.p99],
    ['wall time ms', http1.wallTimeMs, http2.wallTimeMs],
  ];

  console.log('\nHTTP/1.1 vs HTTP/2 comparison');
  console.table(
    metrics.map(([metric, http1Value, http2Value]) => ({
      metric,
      http1: round(http1Value),
      http2: round(http2Value),
      deltaHttp2MinusHttp1: http1Value == null || http2Value == null ? null : round(http2Value - http1Value),
    })),
  );
}

function summarizeDurations(values) {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (sorted.length === 0) {
    return {
      count: 0,
      min: null,
      p50: null,
      p90: null,
      p95: null,
      p99: null,
      max: null,
      avg: null,
    };
  }

  const sum = sorted.reduce((total, value) => total + value, 0);
  return {
    count: sorted.length,
    min: sorted[0],
    p50: percentile(sorted, 50),
    p90: percentile(sorted, 90),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    max: sorted[sorted.length - 1],
    avg: sum / sorted.length,
  };
}

function percentile(sortedValues, percentileValue) {
  if (sortedValues.length === 0) return null;
  const index = Math.ceil((percentileValue / 100) * sortedValues.length) - 1;
  return sortedValues[Math.min(sortedValues.length - 1, Math.max(0, index))];
}

function parsePositiveInteger(value, fallback) {
  if (value === undefined || value === '') return fallback;
  if (!/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return parsed > 0 && Number.isSafeInteger(parsed) ? parsed : undefined;
}

function defaultResultsPath() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join('tmp', `health-endpoint-benchmark-${timestamp}.json`);
}

function createUndiciConnectionDiagnostics() {
  const events = [];
  const onConnected = (message) => {
    const socket = message?.socket;
    const rawAlpn = socket?.alpnProtocol;
    const alpnProtocol =
      typeof rawAlpn === 'string' && rawAlpn.length > 0 ? rawAlpn
      : rawAlpn === false ? 'http/1.1'
      : 'unknown';

    events.push({
      alpnProtocol,
      localPort: socket?.localPort ?? null,
      remoteAddress: socket?.remoteAddress ?? null,
      remotePort: socket?.remotePort ?? null,
      encrypted: Boolean(socket?.encrypted),
    });
  };

  return {
    start() {
      diagnostics_channel.subscribe('undici:client:connected', onConnected);
    },
    stop() {
      diagnostics_channel.unsubscribe('undici:client:connected', onConnected);
    },
    summary() {
      const alpnCounts = {};
      const localPorts = new Set();
      for (const event of events) {
        alpnCounts[event.alpnProtocol] = (alpnCounts[event.alpnProtocol] ?? 0) + 1;
        if (event.localPort != null) localPorts.add(event.localPort);
      }

      const h2ConnectionCount = alpnCounts.h2 ?? 0;
      const http1ConnectionCount = alpnCounts['http/1.1'] ?? 0;

      return {
        connectionCount: events.length,
        alpnCounts,
        h2ConnectionCount,
        http1ConnectionCount,
        h2FallbackCount: events.length - h2ConnectionCount,
        uniqueLocalPorts: [...localPorts].sort((a, b) => a - b),
        events,
      };
    },
  };
}

function serializeError(error) {
  if (!error) return null;
  return {
    name: error.name ?? error.constructor?.name ?? 'Error',
    message: error.message ?? String(error),
    status: error.status ?? null,
    stack: error.stack ?? null,
  };
}

function round(value) {
  return value == null ? null : Math.round(value);
}
