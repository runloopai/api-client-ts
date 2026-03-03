#!/usr/bin/env -S npm run tsn -T

/**
---
title: Blueprint with Build Context
slug: blueprint-with-build-context
use_case: Create a blueprint using the object store to provide docker build context files, then verify files are copied into the image.
workflow:
  - Create a temporary directory with sample application files
  - Upload the directory to object storage as build context
  - Create a blueprint with a Dockerfile that copies the context files
  - Create a devbox from the blueprint
  - Verify the files were copied into the image
  - Shutdown devbox and delete blueprint and storage object
tags:
  - blueprint
  - object-store
  - build-context
  - devbox
  - cleanup
prerequisites:
  - RUNLOOP_API_KEY
run: yarn tsn -T examples/blueprint-with-build-context.ts
test: yarn test:examples
---
*/

import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { RunloopSDK } from '@runloop/api-client';
import { wrapRecipe, runAsCli } from './_harness';
import type { RecipeContext, RecipeOutput } from './types';

function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// building can take time: make sure to set a long blueprint build timeout
const BLUEPRINT_POLL_TIMEOUT_MS = 10 * 60 * 1000;
// set the TTL to one day for build context files
const BUILD_CTXT_TTL_MS = 24 * 60 * 60 * 1000;

export async function recipe(ctx: RecipeContext): Promise<RecipeOutput> {
  const { cleanup } = ctx;

  const sdk = new RunloopSDK({
    bearerToken: process.env['RUNLOOP_API_KEY'],
  });

  const contextDir = await fs.mkdtemp(path.join(os.tmpdir(), 'runloop-example-'));
  cleanup.add(`tempDir:${contextDir}`, async () => {
    await fs.rm(contextDir, { recursive: true, force: true });
  });
  // setup: create a temporary directory with sample application files to use as build context
  await fs.writeFile(path.join(contextDir, 'app.py'), 'print("Hello from app")');
  await fs.writeFile(path.join(contextDir, 'config.txt'), 'key=value');

  // upload the build context to object storage
  const storageObject = await sdk.storageObject.uploadFromDir(contextDir, {
    name: uniqueName('example-build-context'),
    ttl_ms: BUILD_CTXT_TTL_MS,
  });
  cleanup.add(`storageObject:${storageObject.id}`, () => storageObject.delete());

  // create a blueprint with the build context
  const blueprint = await sdk.blueprint.create(
    {
      name: uniqueName('example-blueprint-context'),
      dockerfile: 'FROM ubuntu:22.04\nWORKDIR /app\nCOPY . .',
      build_context: storageObject,
    },
    { polling: { timeoutMs: BLUEPRINT_POLL_TIMEOUT_MS } },
  );
  cleanup.add(`blueprint:${blueprint.id}`, () => sdk.blueprint.fromId(blueprint.id).delete());

  const devbox = await sdk.devbox.createFromBlueprintId(blueprint.id, {
    name: uniqueName('example-devbox'),
    launch_parameters: {
      resource_size_request: 'X_SMALL',
      keep_alive_time_seconds: 60 * 5,
    },
  });
  cleanup.add(`devbox:${devbox.id}`, () => sdk.devbox.fromId(devbox.id).shutdown());

  const appResult = await devbox.cmd.exec('cat /app/app.py');
  const appStdout = await appResult.stdout();

  const configResult = await devbox.cmd.exec('cat /app/config.txt');
  const configStdout = await configResult.stdout();

  return {
    resourcesCreated: [
      `storageObject:${storageObject.id}`,
      `blueprint:${blueprint.id}`,
      `devbox:${devbox.id}`,
    ],
    checks: [
      {
        name: 'app.py exists and readable',
        passed: appResult.exitCode === 0,
        details: `exitCode=${appResult.exitCode}`,
      },
      {
        name: 'app.py contains expected content',
        passed: appStdout.includes('print("Hello from app")'),
        details: appStdout.trim(),
      },
      {
        name: 'config.txt exists and readable',
        passed: configResult.exitCode === 0,
        details: `exitCode=${configResult.exitCode}`,
      },
      {
        name: 'config.txt contains expected content',
        passed: configStdout.includes('key=value'),
        details: configStdout.trim(),
      },
    ],
  };
}

export const runBlueprintWithBuildContextExample = wrapRecipe({ recipe });

if (require.main === module) {
  void runAsCli(runBlueprintWithBuildContextExample);
}
