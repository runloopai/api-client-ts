#!/usr/bin/env -S npm run tsn -T

/**
---
title: Devbox Snapshot and Resume
slug: devbox-snapshot-resume
use_case: Create a devbox, snapshot its disk, resume from the snapshot, and demonstrate that changes in the original devbox do not affect the clone.
workflow:
  - Create a devbox
  - Write a file to the devbox
  - Create a disk snapshot
  - Create a new devbox from the snapshot
  - Modify the file on the original devbox
  - Verify the clone has the original content
  - Shutdown both devboxes and delete the snapshot
tags:
  - devbox
  - snapshot
  - resume
  - cleanup
prerequisites:
  - RUNLOOP_API_KEY
run: yarn tsn -T examples/devbox-snapshot-resume.ts
test: yarn test:examples
---
*/

import { RunloopSDK } from '@runloop/api-client';
import { wrapRecipe, runAsCli } from './_harness';
import type { RecipeContext, RecipeOutput } from './types';

const FILE_PATH = '/home/user/welcome.txt';
const ORIGINAL_CONTENT = 'hello world!';
const MODIFIED_CONTENT = 'original devbox has changed the welcome message';

export async function recipe(ctx: RecipeContext): Promise<RecipeOutput> {
  const { cleanup } = ctx;

  const sdk = new RunloopSDK({
    bearerToken: process.env['RUNLOOP_API_KEY'],
  });

  // Create a devbox
  const dbxOriginal = await sdk.devbox.create({
    name: 'dbx_original',
    launch_parameters: {
      resource_size_request: 'X_SMALL',
      keep_alive_time_seconds: 60 * 5,
    },
  });
  cleanup.add(`devbox:${dbxOriginal.id}`, () => sdk.devbox.fromId(dbxOriginal.id).shutdown());

  // Write a file to the original devbox
  await dbxOriginal.file.write({ file_path: FILE_PATH, contents: ORIGINAL_CONTENT });

  // Read and display the file contents
  const catOriginalBefore = await dbxOriginal.cmd.exec(`cat ${FILE_PATH}`);
  const originalContentBefore = await catOriginalBefore.stdout();

  // Create a disk snapshot of the original devbox
  const snapshot = await dbxOriginal.snapshotDisk({
    name: 'my-snapshot',
  });
  cleanup.add(`snapshot:${snapshot.id}`, () => snapshot.delete());

  // Create a new devbox from the snapshot
  const dbxClone = await sdk.devbox.createFromSnapshot(snapshot.id, {
    name: 'dbx_clone',
    launch_parameters: {
      resource_size_request: 'X_SMALL',
      keep_alive_time_seconds: 60 * 5,
    },
  });
  cleanup.add(`devbox:${dbxClone.id}`, () => sdk.devbox.fromId(dbxClone.id).shutdown());

  // Modify the file on the original devbox
  await dbxOriginal.file.write({ file_path: FILE_PATH, contents: MODIFIED_CONTENT });

  // Read the file contents from both devboxes
  const catClone = await dbxClone.cmd.exec(`cat ${FILE_PATH}`);
  const cloneContent = await catClone.stdout();

  const catOriginalAfter = await dbxOriginal.cmd.exec(`cat ${FILE_PATH}`);
  const originalContentAfter = await catOriginalAfter.stdout();

  return {
    resourcesCreated: [`devbox:${dbxOriginal.id}`, `snapshot:${snapshot.id}`, `devbox:${dbxClone.id}`],
    checks: [
      {
        name: 'original devbox file created successfully',
        passed: catOriginalBefore.exitCode === 0 && originalContentBefore.trim() === ORIGINAL_CONTENT,
        details: `content="${originalContentBefore.trim()}"`,
      },
      {
        name: 'snapshot created successfully',
        passed: Boolean(snapshot.id),
        details: `snapshotId=${snapshot.id}`,
      },
      {
        name: 'clone devbox created from snapshot',
        passed: Boolean(dbxClone.id),
        details: `cloneId=${dbxClone.id}`,
      },
      {
        name: 'clone has original file content (before modification)',
        passed: catClone.exitCode === 0 && cloneContent.trim() === ORIGINAL_CONTENT,
        details: `cloneContent="${cloneContent.trim()}"`,
      },
      {
        name: 'original devbox has modified content',
        passed: catOriginalAfter.exitCode === 0 && originalContentAfter.trim() === MODIFIED_CONTENT,
        details: `originalContent="${originalContentAfter.trim()}"`,
      },
      {
        name: 'clone and original have divergent state',
        passed: cloneContent.trim() !== originalContentAfter.trim(),
        details: `clone="${cloneContent.trim()}" vs original="${originalContentAfter.trim()}"`,
      },
    ],
  };
}

export const runDevboxSnapshotResumeExample = wrapRecipe({ recipe });

if (require.main === module) {
  void runAsCli(runDevboxSnapshotResumeExample);
}
