#!/usr/bin/env -S npm run tsn -T

/**
---
title: Secrets with Devbox (Create, Inject, Verify, Delete)
slug: secrets-with-devbox
use_case: Create a secret, inject it into a devbox as an environment variable, verify access, and clean up.
workflow:
  - Create a secret with a test value
  - Create a devbox with the secret mapped to an env var
  - Execute a command that reads the secret from the environment
  - Verify the value matches
  - Shutdown devbox and delete secret
tags:
  - secrets
  - devbox
  - environment-variables
  - cleanup
prerequisites:
  - RUNLOOP_API_KEY
run: yarn tsn -T examples/secrets-with-devbox.ts
test: yarn test:examples
---
*/

import { RunloopSDK } from '@runloop/api-client';
import { wrapRecipe, runAsCli } from './_harness';
import type { RecipeContext, RecipeOutput } from './types';

export async function recipe(ctx: RecipeContext): Promise<RecipeOutput> {
  const { cleanup } = ctx;

  const sdk = new RunloopSDK({
    bearerToken: process.env['RUNLOOP_API_KEY'],
  });

  const secretName = 'RUNLOOP_SECRET_EXAMPLE';
  const secretValue = 'my-secret-value';

  const secret = await sdk.secret.create({
    name: secretName,
    value: secretValue,
  });
  cleanup.add(`secret:${secretName}`, () => secret.delete());

  const devbox = await sdk.devbox.create({
    name: 'secrets-example-devbox',
    secrets: {
      MY_SECRET_ENV: secret,
    },
    launch_parameters: {
      resource_size_request: 'X_SMALL',
      keep_alive_time_seconds: 60 * 5,
    },
  });
  cleanup.add(`devbox:${devbox.id}`, () => sdk.devbox.fromId(devbox.id).shutdown());

  const result = await devbox.cmd.exec('echo $MY_SECRET_ENV');
  const stdout = await result.stdout();

  const updatedSecret = await sdk.secret.update(secret, {
    value: 'updated-secret-value',
  });

  const secrets = await sdk.secret.list();
  const foundSecret = secrets.find((s) => s.name === secretName);

  const secretInfo = await secret.getInfo();
  const updatedInfo = await updatedSecret.getInfo();

  return {
    resourcesCreated: [`secret:${secretName}`, `devbox:${devbox.id}`],
    checks: [
      {
        name: 'secret created successfully',
        passed: secret.name === secretName && secretInfo.id.startsWith('sec_'),
        details: `name=${secret.name}, id=${secretInfo.id}`,
      },
      {
        name: 'devbox can read secret as env var',
        passed: result.exitCode === 0 && stdout.trim() === secretValue,
        details: `exitCode=${result.exitCode}, stdout="${stdout.trim()}"`,
      },
      {
        name: 'secret updated successfully',
        passed: updatedSecret.name === secretName,
        details: `update_time_ms=${updatedInfo.update_time_ms}`,
      },
      {
        name: 'secret appears in list',
        passed: foundSecret !== undefined && foundSecret.name === secretName,
        details: foundSecret ? `found name=${foundSecret.name}` : 'not found',
      },
    ],
  };
}

export const runSecretsWithDevboxExample = wrapRecipe({ recipe });

if (require.main === module) {
  void runAsCli(runSecretsWithDevboxExample);
}
