#!/usr/bin/env -S npm run tsn -T

/**
---
title: Devbox From Blueprint (Run Command, Shutdown)
slug: devbox-from-blueprint-lifecycle
use_case: Create a devbox from a blueprint, run a command, fetch logs, validate output, and cleanly tear everything down.
workflow:
  - Create a blueprint
  - Fetch blueprint build logs
  - Create a devbox from the blueprint
  - Execute a command in the devbox
  - Fetch devbox logs
  - Validate exit code, stdout, and logs
  - Shutdown devbox and delete blueprint
tags:
  - devbox
  - blueprint
  - commands
  - logs
  - cleanup
prerequisites:
  - RUNLOOP_API_KEY
run: yarn tsn -T examples/devbox-from-blueprint-lifecycle.ts
test: yarn test:examples
---
*/

import { RunloopSDK } from '@runloop/api-client';
import { wrapRecipe, runAsCli } from './_harness';
import type { RecipeContext, RecipeOutput } from './types';

function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const BLUEPRINT_POLL_TIMEOUT_MS = 10 * 60 * 1000;

export async function recipe(ctx: RecipeContext): Promise<RecipeOutput> {
  const { cleanup } = ctx;

  const sdk = new RunloopSDK({
    bearerToken: process.env['RUNLOOP_API_KEY'],
  });

  // Create a blueprint with a simple Dockerfile
  const blueprint = await sdk.blueprint.create(
    {
      name: uniqueName('example-blueprint'),
      dockerfile: 'FROM ubuntu:22.04\nRUN echo "Hello from your blueprint"',
    },
    { polling: { timeoutMs: BLUEPRINT_POLL_TIMEOUT_MS } },
  );
  cleanup.add(`blueprint:${blueprint.id}`, () => sdk.blueprint.fromId(blueprint.id).delete());

  // Fetch blueprint build logs
  const blueprintLogs = await blueprint.logs();

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

  // Fetch devbox logs
  const devboxLogs = await devbox.logs();

  return {
    resourcesCreated: [`blueprint:${blueprint.id}`, `devbox:${devbox.id}`],
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
      {
        name: 'blueprint build logs are retrievable',
        passed: blueprintLogs !== null && Array.isArray(blueprintLogs.logs),
        details: `blueprintLogCount=${blueprintLogs.logs.length}`,
      },
      {
        name: 'devbox logs are retrievable',
        passed: devboxLogs !== null && Array.isArray(devboxLogs.logs),
        details: `devboxLogCount=${devboxLogs.logs.length}`,
      },
    ],
  };
}

export const runDevboxFromBlueprintLifecycleExample = wrapRecipe({ recipe });

if (require.main === module) {
  void runAsCli(runDevboxFromBlueprintLifecycleExample);
}
