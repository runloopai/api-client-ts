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

import { RunloopSDK } from '@runloop/api-client';
import { ExampleResult, emptyCleanupStatus, trackCleanup } from './types';

const BLUEPRINT_POLL_TIMEOUT_MS = 10 * 60 * 1000;

function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function runDevboxFromBlueprintLifecycleExample(): Promise<ExampleResult> {
  const sdk = new RunloopSDK({
    bearerToken: process.env['RUNLOOP_API_KEY'],
  });

  const resourcesCreated: string[] = [];
  const checks: ExampleResult['checks'] = [];
  const cleanupStatus = emptyCleanupStatus();

  let blueprintId: string | undefined;
  let devboxId: string | undefined;

  try {
    console.log('[1/4] Creating blueprint...');
    const blueprint = await sdk.blueprint.create(
      {
        name: uniqueName('example-blueprint'),
        dockerfile: 'FROM ubuntu:22.04\nRUN echo "Hello from your blueprint"',
      },
      { polling: { timeoutMs: BLUEPRINT_POLL_TIMEOUT_MS } },
    );
    blueprintId = blueprint.id;
    resourcesCreated.push(`blueprint:${blueprint.id}`);
    console.log(`      Blueprint: ${blueprint.id}`);

    console.log('[2/4] Creating devbox from blueprint...');
    const devbox = await sdk.devbox.createFromBlueprintId(blueprint.id, {
      name: uniqueName('example-devbox'),
      launch_parameters: {
        resource_size_request: 'X_SMALL',
        keep_alive_time_seconds: 60 * 5,
      },
    });
    devboxId = devbox.id;
    resourcesCreated.push(`devbox:${devbox.id}`);
    console.log(`      Devbox: ${devbox.id}`);

    console.log('[3/4] Running command...');
    const result = await devbox.cmd.exec('echo "Hello from your devbox"');
    const stdout = await result.stdout();

    checks.push({
      name: 'command exits successfully',
      passed: result.exitCode === 0,
      details: `exitCode=${result.exitCode}`,
    });
    checks.push({
      name: 'command output contains expected text',
      passed: stdout.includes('Hello from blueprint lifecycle example'),
      details: stdout.trim(),
    });
    console.log('      Command completed.');
    console.log('[4/4] Preparing cleanup...');

    return {
      resourcesCreated,
      checks,
      cleanupStatus,
    };
  } finally {
    if (devboxId) {
      const id = devboxId;
      await trackCleanup(cleanupStatus, `devbox:${id}`, async () => {
        await sdk.devbox.fromId(id).shutdown();
      });
    }

    if (blueprintId) {
      const id = blueprintId;
      await trackCleanup(cleanupStatus, `blueprint:${id}`, async () => {
        await sdk.blueprint.fromId(id).delete();
      });
    }

    if (cleanupStatus.failed.length === 0) {
      console.log('      Cleanup completed.');
    } else {
      console.log('      Cleanup finished with errors.');
    }
  }
}

if (require.main === module) {
  runDevboxFromBlueprintLifecycleExample()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      const failedChecks = result.checks.filter((check) => !check.passed);
      if (failedChecks.length > 0 || result.cleanupStatus.failed.length > 0) {
        process.exitCode = 1;
      }
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
