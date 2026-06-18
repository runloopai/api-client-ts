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
 * Create a blueprint and probe for infra-side flakes.
 *
 * Dev-cluster blueprint builds intermittently fail with infra-side errors —
 * BuildKit i/o timeouts resolving base images from the in-cluster registry
 * mirror, S3 transit errors when the stage-context container downloads the
 * build-context object. The SDK surfaces those as a RunloopError ("Blueprint
 * <id> is in non-complete state failed"). A single flake in a `beforeAll`
 * fixture otherwise cascades into many unrelated test failures, which buries
 * the actual signal.
 *
 * This helper does NOT mask flakes — infra reliability is a customer-visible
 * problem and the test suite needs to keep surfacing it. Behavior:
 *   - First attempt fails with the terminal-failed shape: retry up to
 *     `probeAttempts` more times to learn whether the failure is transient
 *     (recovers on retry) or persistent (reproduces every time).
 *   - The test ALWAYS fails — but with a diagnostic message that names the
 *     classification and points at where to investigate.
 *   - Other error shapes (auth, validation, etc.) re-throw unchanged.
 */
export async function createBlueprintWithRetry(
  sdk: RunloopSDK,
  params: BlueprintCreateParams,
  options?: LongPollRequestOptions<BlueprintView> & {
    probeAttempts?: number;
    retryDelayMs?: number;
  },
): Promise<Blueprint> {
  const { probeAttempts = 2, retryDelayMs = 5_000, ...createOptions } = options ?? {};
  try {
    return await sdk.blueprint.create(params, createOptions);
  } catch (firstErr) {
    if (!isTransientBlueprintBuildFailure(firstErr)) throw firstErr;

    const firstFailedId = extractBlueprintIdFromError(firstErr);
    if (firstFailedId) {
      await sdk.blueprint
        .fromId(firstFailedId)
        .delete()
        .catch(() => {});
    }

    const attemptOutcomes: string[] = [`attempt 1: failed (${firstFailedId ?? 'no id'})`];
    let probeSucceededOn: number | undefined;
    let probedBlueprint: Blueprint | undefined;

    for (let probe = 1; probe <= probeAttempts; probe++) {
      await new Promise((r) => setTimeout(r, retryDelayMs));
      try {
        probedBlueprint = await sdk.blueprint.create(params, createOptions);
        attemptOutcomes.push(`attempt ${probe + 1}: succeeded (${probedBlueprint.id})`);
        probeSucceededOn = probe + 1;
        break;
      } catch (probeErr) {
        if (!isTransientBlueprintBuildFailure(probeErr)) {
          throw flakeError(firstErr, attemptOutcomes, 'inconclusive (later attempt threw non-build-failed error)', probeErr);
        }
        const probeFailedId = extractBlueprintIdFromError(probeErr);
        attemptOutcomes.push(`attempt ${probe + 1}: failed (${probeFailedId ?? 'no id'})`);
        if (probeFailedId) {
          await sdk.blueprint
            .fromId(probeFailedId)
            .delete()
            .catch(() => {});
        }
      }
    }

    // Clean up the recovered blueprint so an eventual success doesn't leak resources —
    // the test is going to fail, and downstream test steps shouldn't see this blueprint.
    if (probedBlueprint) {
      await probedBlueprint.delete().catch(() => {});
    }

    const classification =
      probeSucceededOn !== undefined ?
        `TRANSIENT infra flake (attempt ${probeSucceededOn} recovered)`
      : `PERSISTENT infra failure (all ${1 + probeAttempts} attempts terminal-failed)`;

    throw flakeError(firstErr, attemptOutcomes, classification);
  }
}

const BLUEPRINT_FAILED_MSG_RE = /Blueprint (bpt_\S+) is in non-complete state failed/;

const INFRA_FLAKE_INVESTIGATION_HINT = [
  'Where to look next:',
  '  - blueprint-operator dataset in Honeycomb (test env), filter blueprint_id=<id above>, look for the blueprint_build span.',
  '  - Loki: {namespace=~"build-.*"} for the build pod logs (container "build" = BuildKit, "stage-context" = build-context fetch).',
  '  - Known recurring infra causes:',
  '      (a) BuildKit -> in-cluster registry mirror i/o timeout resolving base image manifest.',
  '      (b) stage-context S3 download transient transport error (only 2 attempts in the builder today).',
].join('\n');

function flakeError(
  firstErr: unknown,
  attemptOutcomes: string[],
  classification: string,
  retryErr?: unknown,
): Error {
  const lines = [
    `Blueprint build failed during smoketest — surfacing as test failure to keep infra signal visible.`,
    `Classification: ${classification}`,
    `First error: ${(firstErr as Error).message}`,
  ];
  if (retryErr) lines.push(`Probe error: ${(retryErr as Error).message}`);
  lines.push('Probe sequence:');
  for (const o of attemptOutcomes) lines.push(`  - ${o}`);
  lines.push('');
  lines.push(INFRA_FLAKE_INVESTIGATION_HINT);
  return new Error(lines.join('\n'));
}

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
