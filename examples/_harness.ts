import { RunloopSDK } from '@runloop/api-client';
import {
  ExampleResult,
  ExampleCheck,
  RecipeContext,
  RecipeOutput,
  CleanupTracker,
  emptyCleanupStatus,
  trackCleanup,
} from './types';

type CleanupAction = {
  resource: string;
  action: () => Promise<unknown>;
};

function shouldFailProcess(result: ExampleResult): boolean {
  const hasFailedChecks = result.checks.some((check) => !check.passed);
  return Boolean(result.skipped) || hasFailedChecks || result.cleanupStatus.failed.length > 0;
}

export function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createCleanupTracker(cleanupStatus: ExampleResult['cleanupStatus']): CleanupTracker & { run(): Promise<void> } {
  const cleanupActions: CleanupAction[] = [];

  return {
    add(resource: string, action: () => Promise<unknown>): void {
      cleanupActions.push({ resource, action });
    },
    async run(): Promise<void> {
      while (cleanupActions.length > 0) {
        const item = cleanupActions.pop();
        if (!item) {
          continue;
        }
        await trackCleanup(cleanupStatus, item.resource, item.action);
      }

      if (cleanupStatus.attempted.length > 0) {
        if (cleanupStatus.failed.length === 0) {
          console.log('Cleanup completed.');
        } else {
          console.log('Cleanup finished with errors.');
        }
      }
    },
  };
}

export interface WrapRecipeOptions<TOptions> {
  recipe: (ctx: RecipeContext, options: TOptions) => Promise<RecipeOutput>;
  validateEnv?: (options: TOptions) => { skip: boolean; checks: ExampleCheck[] };
}

export function wrapRecipe<TOptions = Record<string, never>>(
  opts: WrapRecipeOptions<TOptions>,
): (options?: TOptions) => Promise<ExampleResult> {
  return async (options?: TOptions): Promise<ExampleResult> => {
    const cleanupStatus = emptyCleanupStatus();
    const cleanup = createCleanupTracker(cleanupStatus);

    if (opts.validateEnv) {
      const validation = opts.validateEnv(options as TOptions);
      if (validation.skip) {
        return {
          resourcesCreated: [],
          checks: validation.checks,
          cleanupStatus,
          skipped: true,
        };
      }
    }

    const sdk = new RunloopSDK({
      bearerToken: process.env['RUNLOOP_API_KEY'],
    });

    const ctx: RecipeContext = {
      sdk,
      cleanup,
      uniqueName,
    };

    try {
      const output = await opts.recipe(ctx, options as TOptions);
      return {
        resourcesCreated: output.resources,
        checks: output.checks,
        cleanupStatus,
      };
    } finally {
      await cleanup.run();
    }
  };
}

export async function runAsCli(run: () => Promise<ExampleResult>): Promise<void> {
  try {
    const result = await run();
    console.log(JSON.stringify(result, null, 2));
    if (shouldFailProcess(result)) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
