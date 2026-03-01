#!/usr/bin/env -S npm run tsn -T

/**
---
title: Devbox From Blueprint (Run Command, Shutdown)
slug: devbox-from-blueprint-lifecycle
use_case: Create a devbox from a blueprint, run a command, validate output, and cleanly tear everything down.
workflow:
  - Create a blueprint
  - Create a devbox from the blueprint
  - Execute a command in the devbox
  - Validate exit code and stdout
  - Shutdown devbox and delete blueprint
tags:
  - devbox
  - blueprint
  - commands
  - cleanup
prerequisites:
  - RUNLOOP_API_KEY
run: yarn tsn -T examples/devbox-from-blueprint-lifecycle.ts
test: yarn test:examples
---
*/

import { wrapRecipe, runAsCli } from './_harness';
import type { RecipeContext, RecipeOutput } from './types';

const BLUEPRINT_POLL_TIMEOUT_MS = 10 * 60 * 1000;

export async function recipe(ctx: RecipeContext): Promise<RecipeOutput> {
  const { sdk, cleanup, uniqueName } = ctx;

  // Create a blueprint with a simple Dockerfile
  const blueprint = await sdk.blueprint.create(
    {
      name: uniqueName('example-blueprint'),
      dockerfile: 'FROM ubuntu:22.04\nRUN echo "Hello from your blueprint"',
    },
    { polling: { timeoutMs: BLUEPRINT_POLL_TIMEOUT_MS } },
  );
  cleanup.add(`blueprint:${blueprint.id}`, () => sdk.blueprint.fromId(blueprint.id).delete());

  // Create a devbox from the blueprint
  // Resource sizes: X_SMALL, SMALL, MEDIUM, LARGE, X_LARGE, XX_LARGE, CUSTOM_SIZE
  const devbox = await sdk.devbox.createFromBlueprintId(blueprint.id, {
    name: uniqueName('example-devbox'),
    launch_parameters: {
      resource_size_request: 'X_SMALL',
      keep_alive_time_seconds: 60 * 5,
    },
  });
  cleanup.add(`devbox:${devbox.id}`, () => sdk.devbox.fromId(devbox.id).shutdown());

  // Execute a command in the devbox
  const result = await devbox.cmd.exec('echo "Hello from your devbox"');
  const stdout = await result.stdout();

  return {
    resources: [`blueprint:${blueprint.id}`, `devbox:${devbox.id}`],
    checks: [
      {
        name: 'command exits successfully',
        passed: result.exitCode === 0,
        details: `exitCode=${result.exitCode}`,
      },
      {
        name: 'command output contains expected text',
        passed: stdout.includes('Hello from your devbox'),
        details: stdout.trim(),
      },
    ],
  };
}

export const runDevboxFromBlueprintLifecycleExample = wrapRecipe({ recipe });

if (require.main === module) {
  void runAsCli(runDevboxFromBlueprintLifecycleExample);
}
