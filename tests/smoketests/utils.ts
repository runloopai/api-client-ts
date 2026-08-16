import { Runloop, RunloopSDK } from '@runloop/api-client';
import { NetworkPolicy, GatewayConfig, McpConfig } from '@runloop/api-client/sdk';
import KeepAliveAgent from 'agentkeepalive';
import type { Agent } from 'node:http';
import type { Socket } from 'node:net';
import nodeFetch from 'node-fetch';

/**
 * Run the smoke tests over HTTP/2 (the undici adapter) instead of the default
 * node-fetch (HTTP/1.1) transport. Toggled by the SMOKE_HTTP2 env var so CI can
 * run the same suite over both transports.
 */
export const useHttp2 = ['1', 'true'].includes((process.env['SMOKE_HTTP2'] ?? '').toLowerCase());

const testAgents = new Set<Agent>();
const originalGlobalFetch = globalThis.fetch;

// Storage-object helpers intentionally use the platform fetch for presigned
// uploads. Node's built-in fetch keeps its process-wide Undici dispatcher alive
// beyond a Jest suite, so use the SDK's non-pooling node-fetch implementation in
// smoke workers and restore the platform function during teardown.
globalThis.fetch = nodeFetch as unknown as typeof globalThis.fetch;

function makeTestAgent(baseURL: string | undefined, http2: boolean | object): Agent | undefined {
  if (http2) return undefined;
  const options = { keepAlive: true, freeSocketTimeout: 4_000 };
  const agent =
    (baseURL ?? 'https://api.runloop.ai').startsWith('https:') ?
      new KeepAliveAgent.HttpsAgent(options)
    : new KeepAliveAgent(options);
  testAgents.add(agent);
  return agent;
}

// Object coverage runs files in parallel Jest workers. Give each worker owned
// HTTP/1.1 agents so teardown does not wait for the SDK's process-wide 30s
// keep-alive pool (which previously forced Jest to kill a worker).
afterAll(async () => {
  const sockets = new Set<Socket>();
  for (const agent of testAgents) {
    for (const group of [...Object.values(agent.sockets), ...Object.values(agent.freeSockets)]) {
      for (const socket of group ?? []) sockets.add(socket);
    }
  }
  const closed = [...sockets]
    .filter((socket) => !socket.destroyed)
    .map(
      (socket) =>
        new Promise<void>((resolve) => {
          socket.once('close', resolve);
        }),
    );
  for (const agent of testAgents) agent.destroy();
  testAgents.clear();
  await Promise.all(closed);
  globalThis.fetch = originalGlobalFetch;
  if (process.env['CI']) {
    const handles = (process as any)
      ._getActiveHandles()
      .map((handle: object) => handle.constructor?.name ?? 'unknown');
    console.warn(
      `[smoke teardown] ${expect.getState().testPath}: handles=${handles.join(',')} resources=${(
        process as any
      )
        .getActiveResourcesInfo()
        .join(',')}`,
    );
  }
});

export function makeClient(overrides: Partial<ConstructorParameters<typeof Runloop>[0]> = {}) {
  const baseURL = process.env['RUNLOOP_BASE_URL'];
  const bearerToken = process.env['RUNLOOP_API_KEY'];
  const http2 = overrides.http2 ?? useHttp2;

  return new Runloop({
    baseURL,
    bearerToken,
    timeout: 120_000,
    maxRetries: 3,
    http2,
    ...overrides,
    httpAgent: overrides.httpAgent ?? makeTestAgent(baseURL, http2),
  });
}

export function makeClientSDK() {
  return new RunloopSDK({
    bearerToken: process.env['RUNLOOP_API_KEY'],
    baseURL: process.env['RUNLOOP_BASE_URL'],
    timeout: 120_000,
    maxRetries: 3,
    http2: useHttp2,
    httpAgent: makeTestAgent(process.env['RUNLOOP_BASE_URL'], useHttp2),
  });
}

export const uniqueName = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const SHORT_TIMEOUT = 120_000;
export const MEDIUM_TIMEOUT = 300_000;
export const LONG_TIMEOUT = 600_000;

/**
 * Helper to clean up a network policy, ignoring errors if already deleted.
 */
export async function cleanUpPolicy(policy: NetworkPolicy | undefined): Promise<void> {
  if (policy) {
    try {
      await policy.delete();
    } catch {
      // Already deleted or doesn't exist, ignore
    }
  }
}

/**
 * Helper to clean up a gateway config, ignoring errors if already deleted.
 */
export async function cleanUpGatewayConfig(config: GatewayConfig | undefined): Promise<void> {
  if (config) {
    try {
      await config.delete();
    } catch {
      // Already deleted or doesn't exist, ignore
    }
  }
}

/**
 * Helper to clean up an MCP config, ignoring errors if already deleted.
 */
export async function cleanUpMcpConfig(config: McpConfig | undefined): Promise<void> {
  if (config) {
    try {
      await config.delete();
    } catch {
      // Already deleted or doesn't exist, ignore
    }
  }
}
