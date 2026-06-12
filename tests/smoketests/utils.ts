import { Runloop, RunloopSDK } from '@runloop/api-client';
import { Blueprint, NetworkPolicy, GatewayConfig, McpConfig } from '@runloop/api-client/sdk';
import type { CreateParams as BlueprintCreateParams } from '@runloop/api-client/sdk/blueprint';
import type { BlueprintView } from '@runloop/api-client/resources/blueprints';
import type { LongPollRequestOptions } from '@runloop/api-client/lib/polling';

/**
 * Run the smoke tests over HTTP/2 (the undici adapter) instead of the default
 * node-fetch (HTTP/1.1) transport. Toggled by the SMOKE_HTTP2 env var so CI can
 * run the same suite over both transports.
 */
export const useHttp2 = ['1', 'true'].includes((process.env['SMOKE_HTTP2'] ?? '').toLowerCase());

export function makeClient(overrides: Partial<ConstructorParameters<typeof Runloop>[0]> = {}) {
  const baseURL = process.env['RUNLOOP_BASE_URL'];
  const bearerToken = process.env['RUNLOOP_API_KEY'];

  return new Runloop({
    baseURL,
    bearerToken,
    timeout: 120_000,
    maxRetries: 3,
    http2: useHttp2,
    ...overrides,
  });
}

export function makeClientSDK() {
  return new RunloopSDK({
    bearerToken: process.env['RUNLOOP_API_KEY'],
    baseURL: process.env['RUNLOOP_BASE_URL'],
    timeout: 120_000,
    maxRetries: 3,
    http2: useHttp2,
  });
}

export const uniqueName = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const SHORT_TIMEOUT = 120_000;
export const MEDIUM_TIMEOUT = 300_000;
export const LONG_TIMEOUT = 600_000;

/**
 * Create a blueprint and retry on terminal-failed builds.
 *
 * Dev-cluster blueprint builds intermittently fail with infra-side errors —
 * registry-mirror i/o timeouts when BuildKit resolves base images, S3 transit
 * errors when the stage-context container downloads the build-context object.
 * The SDK surfaces these as a RunloopError ("in non-complete state failed"),
 * and a single flake otherwise cascades through `beforeAll` fixtures into many
 * unrelated test failures.
 *
 * Retries on that exact error shape. A genuinely-broken Dockerfile reaches the
 * same shape but fails every attempt, so determinstic failures still fail the
 * test — only flakes are masked.
 */
export async function createBlueprintWithRetry(
  sdk: RunloopSDK,
  params: BlueprintCreateParams,
  options?: LongPollRequestOptions<BlueprintView> & { attempts?: number; retryDelayMs?: number },
): Promise<Blueprint> {
  const { attempts = 3, retryDelayMs = 5_000, ...createOptions } = options ?? {};
  let lastErr: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await sdk.blueprint.create(params, createOptions);
    } catch (err) {
      lastErr = err;
      if (!isTransientBlueprintBuildFailure(err) || attempt === attempts) throw err;
      const failedId = extractBlueprintIdFromError(err);
      if (failedId) {
        await sdk.blueprint
          .fromId(failedId)
          .delete()
          .catch(() => {});
      }
      // eslint-disable-next-line no-console
      console.warn(
        `[smoketest] blueprint create attempt ${attempt}/${attempts} failed (likely infra flake), retrying in ${retryDelayMs}ms: ${(err as Error).message}`,
      );
      await new Promise((r) => setTimeout(r, retryDelayMs));
    }
  }
  throw lastErr;
}

const BLUEPRINT_FAILED_MSG_RE = /Blueprint (bpt_\S+) is in non-complete state failed/;

function isTransientBlueprintBuildFailure(err: unknown): boolean {
  return err instanceof Error && BLUEPRINT_FAILED_MSG_RE.test(err.message);
}

function extractBlueprintIdFromError(err: unknown): string | undefined {
  if (!(err instanceof Error)) return undefined;
  return err.message.match(BLUEPRINT_FAILED_MSG_RE)?.[1];
}

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
