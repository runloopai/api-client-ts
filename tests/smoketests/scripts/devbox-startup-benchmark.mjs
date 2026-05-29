/**
 * Devbox startup benchmark for comparing the SDK HTTP/1.1 and HTTP/2 transports.
 *
 * Runs OUTSIDE the normal smoke suite because the default configuration creates
 * 100 devboxes per transport. Build first, then run explicitly:
 *
 *   RUNLOOP_API_KEY=... [RUNLOOP_BASE_URL=...] [RUNLOOP_E2E_DEVBOX_COUNT=100] yarn test:e2e:devbox-startup
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

const DEFAULT_DEVBOX_COUNT = 100;
const AWAIT_RUNNING_TIMEOUT_MS = 20 * 60 * 1000;
const COMMAND_TIMEOUT_MS = 2 * 60 * 1000;
const SHUTDOWN_TIMEOUT_MS = 2 * 60 * 1000;

const apiKey = process.env.RUNLOOP_API_KEY;
const baseURL = "https://api.runloop.ai";
const devboxCount = parsePositiveInteger(process.env.RUNLOOP_E2E_DEVBOX_COUNT, DEFAULT_DEVBOX_COUNT);
const resultsPath = process.env.RUNLOOP_E2E_RESULTS_PATH ?? defaultResultsPath();

if (!apiKey) {
  console.error('RUNLOOP_API_KEY is required');
  process.exit(2);
}

if (devboxCount === undefined) {
  console.error('RUNLOOP_E2E_DEVBOX_COUNT must be a positive integer');
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
  benchmark: 'devbox-startup-http1-vs-http2',
  startedAt,
  endedAt,
  config: {
    devboxCount,
    baseURL: baseURL ?? null,
    awaitRunningTimeoutMs: AWAIT_RUNNING_TIMEOUT_MS,
    commandTimeoutMs: COMMAND_TIMEOUT_MS,
    shutdownTimeoutMs: SHUTDOWN_TIMEOUT_MS,
  },
  summary: passResults.map(({ records, summary, ...pass }) => pass),
  passes: passResults,
};

await fs.mkdir(path.dirname(resultsPath), { recursive: true });
await fs.writeFile(resultsPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');

printComparison(passResults);
console.log(`\nWrote results artifact: ${resultsPath}`);

const hasWorkflowFailures = passResults.some((pass) => pass.workflowFailureCount > 0);
process.exit(hasWorkflowFailures ? 1 : 0);

async function runTransportPass(transport) {
  const diagnostics = createUndiciConnectionDiagnostics();
  const client = new Runloop({
    bearerToken: apiKey,
    baseURL,
    timeout: 120_000,
    maxRetries: 0,
    http2: transport.http2,
  });

  console.log(`\nStarting ${transport.name} pass with ${devboxCount} concurrent devboxes`);
  const wallStart = performance.now();
  diagnostics.start();
  let settled;
  let wallTimeMs;
  try {
    settled = await Promise.allSettled(
      Array.from({ length: devboxCount }, (_, index) => runDevboxWorkflow(client, transport.name, index)),
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
      devboxId: null,
      startupDurationMs: null,
      commandDurationMs: null,
      lifecycleDurationMs: null,
      command: null,
      shutdownStatus: 'skipped',
      shutdownError: null,
      error: serializeError(result.reason),
    };
  });

  const workflowFailureCount = records.filter((record) => record.error).length;
  const shutdownFailureCount = records.filter((record) => record.shutdownStatus === 'failed').length;
  const startupStats = summarizeDurations(records.map((record) => record.startupDurationMs));
  const connectionDiagnostics = diagnostics.summary();
  const summary = {
    transport: transport.name,
    requested: devboxCount,
    successCount: records.length - workflowFailureCount,
    failureCount: workflowFailureCount,
    shutdownFailureCount,
    startup: startupStats,
    wallTimeMs,
    connectionDiagnostics,
  };

  printPassSummary(summary);

  return {
    transport: transport.name,
    http2: transport.http2,
    requested: devboxCount,
    successCount: summary.successCount,
    workflowFailureCount,
    shutdownFailureCount,
    startupStats,
    wallTimeMs,
    connectionDiagnostics,
    summary,
    records,
  };
}

async function runDevboxWorkflow(client, transport, index) {
  const lifecycleStart = performance.now();
  const record = {
    transport,
    index,
    devboxId: null,
    startupDurationMs: null,
    commandDurationMs: null,
    lifecycleDurationMs: null,
    command: null,
    shutdownStatus: 'skipped',
    shutdownError: null,
    error: null,
  };

  let commandStart;

  try {
    const startupStart = performance.now();
    const devbox = await client.devboxes.create({
      name: uniqueName(`e2e-startup-${transport}-${index}`),
      launch_parameters: {
        resource_size_request: 'X_SMALL',
        keep_alive_time_seconds: 60 * 5,
      },
    });

    record.devboxId = devbox.id;

    await client.devboxes.awaitRunning(devbox.id, {
      longPoll: { timeoutMs: AWAIT_RUNNING_TIMEOUT_MS },
    });
    record.startupDurationMs = performance.now() - startupStart;

    commandStart = performance.now();
    const execution = await client.devboxes.executeAndAwaitCompletion(
      devbox.id,
      { command: 'node -v' },
      { longPoll: { timeoutMs: COMMAND_TIMEOUT_MS } },
    );
    record.commandDurationMs = performance.now() - commandStart;
    record.command = {
      executionId: execution.execution_id,
      status: execution.status,
      exitStatus: execution.exit_status ?? null,
      stdout: execution.stdout ?? null,
      stderr: execution.stderr ?? null,
      stdoutTruncated: execution.stdout_truncated ?? null,
      stderrTruncated: execution.stderr_truncated ?? null,
    };

    if (execution.status !== 'completed') {
      throw new Error(`node -v did not complete; status=${execution.status}`);
    }
    if (execution.exit_status !== 0) {
      throw new Error(`node -v exited with status ${execution.exit_status}`);
    }
  } catch (error) {
    if (commandStart !== undefined && record.commandDurationMs === null) {
      record.commandDurationMs = performance.now() - commandStart;
    }
    record.error = serializeError(error);
  } finally {
    if (record.devboxId) {
      const shutdownStart = performance.now();
      try {
        const shutdown = await client.devboxes.shutdown(
          record.devboxId,
          { force: true },
          { timeout: SHUTDOWN_TIMEOUT_MS },
        );
        record.shutdownStatus = shutdown.status ?? 'success';
        record.shutdownDurationMs = performance.now() - shutdownStart;
      } catch (shutdownError) {
        record.shutdownStatus = 'failed';
        record.shutdownDurationMs = performance.now() - shutdownStart;
        record.shutdownError = serializeError(shutdownError);
      }
    }

    record.lifecycleDurationMs = performance.now() - lifecycleStart;
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
      shutdownFailures: summary.shutdownFailureCount,
      minMs: round(summary.startup.min),
      p50Ms: round(summary.startup.p50),
      p90Ms: round(summary.startup.p90),
      p95Ms: round(summary.startup.p95),
      p99Ms: round(summary.startup.p99),
      maxMs: round(summary.startup.max),
      avgMs: round(summary.startup.avg),
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
    ['startup p50 ms', http1.startupStats.p50, http2.startupStats.p50],
    ['startup p90 ms', http1.startupStats.p90, http2.startupStats.p90],
    ['startup p95 ms', http1.startupStats.p95, http2.startupStats.p95],
    ['startup p99 ms', http1.startupStats.p99, http2.startupStats.p99],
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

function uniqueName(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultResultsPath() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join('tmp', `devbox-startup-benchmark-${timestamp}.json`);
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
