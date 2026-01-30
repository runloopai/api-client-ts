import { Runloop, RunloopSDK } from '@runloop/api-client';
import { NetworkPolicy, GatewayConfig } from '@runloop/api-client/sdk';

export function makeClient(overrides: Partial<ConstructorParameters<typeof Runloop>[0]> = {}) {
  const baseURL = process.env['RUNLOOP_BASE_URL'];
  const bearerToken = process.env['RUNLOOP_API_KEY'];

  return new Runloop({
    baseURL,
    bearerToken,
    timeout: 120_000,
    maxRetries: 1,
    ...overrides,
  });
}

export function makeClientSDK() {
  return new RunloopSDK({
    bearerToken: process.env['RUNLOOP_API_KEY'],
    baseURL: process.env['RUNLOOP_BASE_URL'],
    timeout: 120_000,
    maxRetries: 1,
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
      await policy.getInfo();
      // Policy still exists, delete it
      await policy.delete();
    } catch {
      // Policy already deleted or doesn't exist, ignore
    }
  }
}

/**
 * Helper to clean up a gateway config, ignoring errors if already deleted.
 */
export async function cleanUpGatewayConfig(config: GatewayConfig | undefined): Promise<void> {
  if (config) {
    try {
      await config.getInfo();
      // Config still exists, delete it
      await config.delete();
    } catch {
      // Config already deleted or doesn't exist, ignore
    }
  }
}
