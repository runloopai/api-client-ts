import type { RunloopSDK } from '@runloop/api-client';

export interface ExampleCheck {
  name: string;
  passed: boolean;
  details?: string;
}

export interface ExampleCleanupFailure {
  resource: string;
  reason: string;
}

export interface ExampleCleanupStatus {
  attempted: string[];
  succeeded: string[];
  failed: ExampleCleanupFailure[];
}

export interface ExampleResult {
  resourcesCreated: string[];
  checks: ExampleCheck[];
  cleanupStatus: ExampleCleanupStatus;
  skipped?: boolean;
}

export interface CleanupTracker {
  add(resource: string, action: () => Promise<unknown>): void;
}

export interface RecipeContext {
  sdk: RunloopSDK;
  cleanup: CleanupTracker;
  uniqueName: (prefix: string) => string;
}

export interface RecipeOutput {
  resources: string[];
  checks: ExampleCheck[];
}

export function emptyCleanupStatus(): ExampleCleanupStatus {
  return {
    attempted: [],
    succeeded: [],
    failed: [],
  };
}

export async function trackCleanup(
  cleanupStatus: ExampleCleanupStatus,
  resource: string,
  action: () => Promise<unknown>,
): Promise<void> {
  cleanupStatus.attempted.push(resource);
  try {
    await action();
    cleanupStatus.succeeded.push(resource);
  } catch (error) {
    cleanupStatus.failed.push({
      resource,
      reason: error instanceof Error ? error.message : String(error),
    });
  }
}
