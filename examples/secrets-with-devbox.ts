#!/usr/bin/env -S npm run tsn -T

/**
---
title: Secrets with Devbox via Agent Gateway
slug: secrets-with-devbox
use_case: Create a secret, proxy it into a devbox through agent gateway, verify the devbox only gets gateway credentials, and clean up.
workflow:
  - Create a secret with a test credential
  - Create an agent gateway config for an upstream API
  - Launch a devbox with the gateway wired to the secret
  - Verify the devbox receives a gateway URL and token instead of the raw secret
  - Shutdown the devbox and delete the gateway config and secret
tags:
  - secrets
  - devbox
  - agent-gateway
  - credentials
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

function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const EXAMPLE_GATEWAY_ENDPOINT = 'https://api.example.com';

export async function recipe(ctx: RecipeContext): Promise<RecipeOutput> {
  const { cleanup } = ctx;

  const sdk = new RunloopSDK({
    bearerToken: process.env['RUNLOOP_API_KEY'],
  });
  const resourcesCreated: string[] = [];
  const secretValue = 'example-upstream-api-key';
  const secretName = uniqueName('agent-gateway-secret');

  // Note: do NOT hardcode secret values in your code!
  // this is example code only; use environment variables instead!
  const secret = await sdk.secret.create({
    name: secretName,
    value: secretValue,
  });
  resourcesCreated.push(`secret:${secretName}`);
  cleanup.add(`secret:${secretName}`, () => secret.delete());

  // Note: Here we hide credentials from the devbox by using an agent gateway config.
  // This is optional but strongly recommended since it prevents secret exfiltration.
  const gatewayConfig = await sdk.gatewayConfig.create({
    name: uniqueName('agent-gateway-config'),
    endpoint: EXAMPLE_GATEWAY_ENDPOINT,
    auth_mechanism: { type: 'bearer' },
    description: 'Example gateway that keeps upstream credentials off the devbox',
  });
  resourcesCreated.push(`gateway_config:${gatewayConfig.id}`);
  cleanup.add(`gateway_config:${gatewayConfig.id}`, () =>
    sdk.gatewayConfig.fromId(gatewayConfig.id).delete(),
  );

  const devbox = await sdk.devbox.create({
    name: uniqueName('agent-gateway-devbox'),
    gateways: {
      MY_API: {
        gateway: gatewayConfig.id,
        secret,
      },
    },
    launch_parameters: {
      resource_size_request: 'X_SMALL',
      keep_alive_time_seconds: 60 * 5,
    },
  });
  resourcesCreated.push(`devbox:${devbox.id}`);
  cleanup.add(`devbox:${devbox.id}`, () => sdk.devbox.fromId(devbox.id).shutdown());

  const devboxInfo = await devbox.getInfo();
  const urlResult = await devbox.cmd.exec('echo $MY_API_URL');
  const gatewayUrl = (await urlResult.stdout()).trim();
  const tokenResult = await devbox.cmd.exec('echo $MY_API');
  const gatewayToken = (await tokenResult.stdout()).trim();

  const secretInfo = await secret.getInfo();
  const gatewayInfo = await gatewayConfig.getInfo();

  return {
    resourcesCreated,
    checks: [
      {
        name: 'secret created successfully',
        passed: secret.name === secretName && secretInfo.id.startsWith('sec_'),
        details: `name=${secret.name}, id=${secretInfo.id}`,
      },
      {
        name: 'gateway config created successfully',
        passed: gatewayInfo.id.startsWith('gwc_') && gatewayInfo.endpoint === EXAMPLE_GATEWAY_ENDPOINT,
        details: `id=${gatewayInfo.id}, endpoint=${gatewayInfo.endpoint}`,
      },
      {
        name: 'devbox records gateway wiring',
        passed:
          devboxInfo.gateway_specs?.['MY_API']?.gateway_config_id === gatewayConfig.id &&
          devboxInfo.gateway_specs?.['MY_API'] !== undefined,
        details: `gateway_config_id=${devboxInfo.gateway_specs?.['MY_API']?.gateway_config_id ?? 'missing'}`,
      },
      {
        name: 'devbox receives gateway URL',
        passed: urlResult.exitCode === 0 && gatewayUrl.startsWith('http'),
        details: `exitCode=${urlResult.exitCode}, url=${gatewayUrl}`,
      },
      {
        name: 'devbox receives gateway token instead of raw secret',
        passed: tokenResult.exitCode === 0 && gatewayToken.startsWith('gws_') && gatewayToken !== secretValue,
        details: `exitCode=${tokenResult.exitCode}, token_prefix=${gatewayToken.slice(0, 4) || 'missing'}`,
      },
    ],
  };
}

export const runSecretsWithDevboxExample = wrapRecipe({ recipe });

if (require.main === module) {
  void runAsCli(runSecretsWithDevboxExample);
}
