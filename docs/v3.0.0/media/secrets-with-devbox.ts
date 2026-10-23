#!/usr/bin/env -S npm run tsn -T

/**
---
title: Secrets with Devbox and Agent Gateway
slug: secrets-with-devbox
use_case: Use a normal secret for sensitive app data in the devbox and agent gateway for upstream API credentials that should never be exposed to the agent.
workflow:
  - Create a secret for application data that should be available inside the devbox
  - Create a separate secret for an upstream API credential
  - Create an agent gateway config for an upstream API
  - Launch a devbox with one secret injected directly and the credential wired through agent gateway
  - Verify the devbox can read MAGIC_NUMBER while the upstream API credential is replaced with gateway values
  - Shutdown the devbox and delete the gateway config and both secrets
tags:
  - secrets
  - devbox
  - agent-gateway
  - credentials
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
  const upstreamCredentialValue = 'example-upstream-api-key';
  const upstreamCredentialName = uniqueName('agent-gateway-secret');
  const magicNumberValue = '42';
  const magicNumberName = uniqueName('magic-number-secret');

  // Note: do NOT hardcode secret values in your code!
  // this is example code only; use environment variables instead!
  const magicNumberSecret = await sdk.secret.create({
    name: magicNumberName,
    value: magicNumberValue,
  });
  resourcesCreated.push(`secret:${magicNumberName}`);
  cleanup.add(`secret:${magicNumberName}`, () => magicNumberSecret.delete());

  const upstreamCredentialSecret = await sdk.secret.create({
    name: upstreamCredentialName,
    value: upstreamCredentialValue,
  });
  resourcesCreated.push(`secret:${upstreamCredentialName}`);
  cleanup.add(`secret:${upstreamCredentialName}`, () => upstreamCredentialSecret.delete());

  // Use direct secret injection when the program inside the devbox legitimately needs
  // the secret value at runtime, such as application config or feature flags.
  // Use agent gateway for upstream credentials that should never be exposed to the agent.
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
    secrets: {
      MAGIC_NUMBER: magicNumberSecret,
    },
    gateways: {
      MY_API: {
        gateway: gatewayConfig.id,
        secret: upstreamCredentialSecret,
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
  const magicNumberResult = await devbox.cmd.exec('echo $MAGIC_NUMBER');
  const magicNumber = (await magicNumberResult.stdout()).trim();
  const urlResult = await devbox.cmd.exec('echo $MY_API_URL');
  const gatewayUrl = (await urlResult.stdout()).trim();
  const tokenResult = await devbox.cmd.exec('echo $MY_API');
  const gatewayToken = (await tokenResult.stdout()).trim();

  const magicNumberInfo = await magicNumberSecret.getInfo();
  const upstreamCredentialInfo = await upstreamCredentialSecret.getInfo();
  const gatewayInfo = await gatewayConfig.getInfo();

  return {
    resourcesCreated,
    checks: [
      {
        name: 'magic number secret created successfully',
        passed: magicNumberSecret.name === magicNumberName && magicNumberInfo.id.startsWith('sec_'),
        details: `name=${magicNumberSecret.name}, id=${magicNumberInfo.id}`,
      },
      {
        name: 'upstream credential secret created successfully',
        passed:
          upstreamCredentialSecret.name === upstreamCredentialName &&
          upstreamCredentialInfo.id.startsWith('sec_'),
        details: `name=${upstreamCredentialSecret.name}, id=${upstreamCredentialInfo.id}`,
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
        name: 'devbox receives plain secret when app needs the value',
        passed: magicNumberResult.exitCode === 0 && magicNumber === magicNumberValue,
        details: `exitCode=${magicNumberResult.exitCode}, MAGIC_NUMBER=${magicNumber}`,
      },
      {
        name: 'devbox receives gateway URL',
        passed: urlResult.exitCode === 0 && gatewayUrl.startsWith('http'),
        details: `exitCode=${urlResult.exitCode}, url=${gatewayUrl}`,
      },
      {
        name: 'devbox receives gateway token instead of raw secret',
        passed:
          tokenResult.exitCode === 0 &&
          gatewayToken.startsWith('gws_') &&
          gatewayToken !== upstreamCredentialValue,
        details: `exitCode=${tokenResult.exitCode}, token_prefix=${gatewayToken.slice(0, 4) || 'missing'}`,
      },
    ],
  };
}

export const runSecretsWithDevboxExample = wrapRecipe({ recipe });

if (require.main === module) {
  void runAsCli(runSecretsWithDevboxExample);
}
