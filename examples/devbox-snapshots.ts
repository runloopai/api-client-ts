#!/usr/bin/env -S npm run tsn -T

/**
---
title: Devbox Snapshots (Suspend, Resume, Restore, Delete)
slug: devbox-snapshots
use_case: Upload a file to a devbox, preserve it across suspend and resume, create a disk snapshot, restore multiple devboxes from that snapshot, mutate each copy independently, and delete the snapshot when finished.
workflow:
  - Create a source devbox
  - Upload a file and mutate it into a shared baseline
  - Suspend and resume the source devbox
  - Create a disk snapshot from the resumed devbox
  - Restore two additional devboxes from the same snapshot baseline
  - Mutate the same file differently in each devbox to prove isolation
  - Shutdown the devboxes and delete the snapshot
tags:
  - devbox
  - snapshot
  - suspend
  - resume
  - files
  - cleanup
prerequisites:
  - RUNLOOP_API_KEY
run: yarn tsn -T examples/devbox-snapshots.ts
test: yarn test:examples
---
*/

import { RunloopSDK, toFile } from '@runloop/api-client';
import { wrapRecipe, runAsCli } from './_harness';
import type { Devbox, Snapshot } from '@runloop/api-client';
import type { RecipeContext, RecipeOutput } from './types';

function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const FILE_PATH = '/tmp/snapshot-demo.txt';

type FileReadableDevbox = {
  file: {
    read(params: { file_path: string }): Promise<string>;
  };
};

async function readFileContents(devbox: FileReadableDevbox): Promise<string> {
  return devbox.file.read({ file_path: FILE_PATH });
}

export async function recipe(ctx: RecipeContext): Promise<RecipeOutput> {
  const { cleanup } = ctx;

  const sdk = new RunloopSDK({
    bearerToken: process.env['RUNLOOP_API_KEY'],
  });

  const resourcesCreated: string[] = [];

  let sourceDevbox: Devbox | undefined;
  let cloneA: Devbox | undefined;
  let cloneB: Devbox | undefined;
  let snapshot: Snapshot | undefined;

  let sourceNeedsCleanup = false;
  let cloneANeedsCleanup = false;
  let cloneBNeedsCleanup = false;
  let snapshotNeedsCleanup = false;

  cleanup.add('devbox:source', async () => {
    if (sourceNeedsCleanup && sourceDevbox) {
      await sourceDevbox.shutdown();
    }
  });
  cleanup.add('devbox:clone-a', async () => {
    if (cloneANeedsCleanup && cloneA) {
      await cloneA.shutdown();
    }
  });
  cleanup.add('devbox:clone-b', async () => {
    if (cloneBNeedsCleanup && cloneB) {
      await cloneB.shutdown();
    }
  });
  cleanup.add('snapshot:baseline', async () => {
    if (snapshotNeedsCleanup && snapshot) {
      await snapshot.delete();
    }
  });

  // Start from a single source devbox.
  sourceDevbox = await sdk.devbox.create({
    name: uniqueName('snapshot-source'),
    launch_parameters: {
      resource_size_request: 'X_SMALL',
      keep_alive_time_seconds: 60 * 5,
    },
  });
  sourceNeedsCleanup = true;
  resourcesCreated.push(`devbox:${sourceDevbox.id}`);

  const uploadedContents = 'uploaded-from-local-file';
  const baselineContents = 'baseline-after-upload-and-mutation';
  const sourceContents = 'source-devbox-after-isolated-mutation';
  const cloneAContents = 'clone-a-after-isolated-mutation';
  const cloneBContents = 'clone-b-after-isolated-mutation';

  await sourceDevbox.file.upload({
    path: FILE_PATH,
    file: await toFile(Buffer.from(uploadedContents, 'utf8'), 'snapshot-demo.txt'),
  });
  const uploadedReadback = await readFileContents(sourceDevbox);

  await sourceDevbox.file.write({
    file_path: FILE_PATH,
    contents: baselineContents,
  });

  // suspend & resume:
  await sourceDevbox.suspend();
  const suspendedInfo = await sourceDevbox.awaitSuspended();
  const resumedInfo = await sourceDevbox.resume();
  const resumedReadback = await readFileContents(sourceDevbox);

  snapshot = await sourceDevbox.snapshotDisk({
    name: uniqueName('snapshot-baseline'),
    commit_message: 'Capture the shared baseline after suspend and resume.',
  });
  snapshotNeedsCleanup = true;
  resourcesCreated.push(`snapshot:${snapshot.id}`);

  // Restore two separate devboxes from the same baseline snapshot.
  cloneA = await snapshot.createDevbox({
    name: uniqueName('snapshot-clone-a'),
    launch_parameters: {
      resource_size_request: 'X_SMALL',
      keep_alive_time_seconds: 60 * 5,
    },
  });
  cloneANeedsCleanup = true;
  resourcesCreated.push(`devbox:${cloneA.id}`);

  cloneB = await sdk.devbox.createFromSnapshot(snapshot.id, {
    name: uniqueName('snapshot-clone-b'),
    launch_parameters: {
      resource_size_request: 'X_SMALL',
      keep_alive_time_seconds: 60 * 5,
    },
  });
  cloneBNeedsCleanup = true;
  resourcesCreated.push(`devbox:${cloneB.id}`);

  const cloneABaselineReadback = await readFileContents(cloneA);
  const cloneBBaselineReadback = await readFileContents(cloneB);

  await sourceDevbox.file.write({ file_path: FILE_PATH, contents: sourceContents });
  await cloneA.file.write({ file_path: FILE_PATH, contents: cloneAContents });
  await cloneB.file.write({ file_path: FILE_PATH, contents: cloneBContents });

  const sourceIsolatedReadback = await readFileContents(sourceDevbox);
  const cloneAIsolatedReadback = await readFileContents(cloneA);
  const cloneBIsolatedReadback = await readFileContents(cloneB);

  await cloneB.shutdown();
  cloneBNeedsCleanup = false;
  await cloneA.shutdown();
  cloneANeedsCleanup = false;
  await sourceDevbox.shutdown();
  sourceNeedsCleanup = false;
  await snapshot.delete();
  snapshotNeedsCleanup = false;

  return {
    resourcesCreated,
    checks: [
      {
        name: 'uploaded file is readable on the source devbox',
        passed: uploadedReadback === uploadedContents,
        details: uploadedReadback,
      },
      {
        name: 'suspend reaches the suspended state',
        passed: suspendedInfo.status === 'suspended',
        details: `status=${suspendedInfo.status}`,
      },
      {
        name: 'resume preserves the baseline file contents',
        passed: resumedInfo.status === 'running' && resumedReadback === baselineContents,
        details: `status=${resumedInfo.status}, contents=${resumedReadback}`,
      },
      {
        name: 'multiple devboxes can use the same snapshot baseline',
        passed: cloneABaselineReadback === baselineContents && cloneBBaselineReadback === baselineContents,
        details: `cloneA=${cloneABaselineReadback}, cloneB=${cloneBBaselineReadback}`,
      },
      {
        name: 'devboxes diverge after isolated mutations',
        passed:
          sourceIsolatedReadback === sourceContents &&
          cloneAIsolatedReadback === cloneAContents &&
          cloneBIsolatedReadback === cloneBContents,
        details: `source=${sourceIsolatedReadback}, cloneA=${cloneAIsolatedReadback}, cloneB=${cloneBIsolatedReadback}`,
      },
      {
        name: 'snapshot-backed devboxes stay isolated from one another',
        passed: new Set([sourceIsolatedReadback, cloneAIsolatedReadback, cloneBIsolatedReadback]).size === 3,
        details: `values=${JSON.stringify([sourceIsolatedReadback, cloneAIsolatedReadback, cloneBIsolatedReadback])}`,
      },
      {
        name: 'snapshot can be deleted after the demo finishes',
        passed: !snapshotNeedsCleanup,
        details: `deleted=${String(!snapshotNeedsCleanup)}`,
      },
    ],
  };
}

export const runDevboxSnapshotsExample = wrapRecipe({ recipe });

if (require.main === module) {
  void runAsCli(runDevboxSnapshotsExample);
}
