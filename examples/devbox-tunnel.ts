#!/usr/bin/env -S npm run tsn -T

/**
---
title: Devbox Tunnel (HTTP Server Access)
slug: devbox-tunnel
use_case: Create a devbox with a tunnel, start an HTTP server, and access the server from the local machine through the tunnel.
workflow:
  - Create a devbox with a tunnel
  - Start an HTTP server inside the devbox
  - Read the tunnel details from the devbox
  - Make an HTTP request from the local machine through the tunnel
  - Validate the response
  - Shutdown the devbox
tags:
  - devbox
  - tunnel
  - networking
  - http
prerequisites:
  - RUNLOOP_API_KEY
run: yarn tsn -T examples/devbox-tunnel.ts
test: yarn test:examples
---
*/

import { RunloopSDK } from '@runloop/api-client';
import { wrapRecipe, runAsCli } from './_harness';
import type { RecipeContext, RecipeOutput } from './types';

const HTTP_SERVER_PORT = 8080;
const SERVER_STARTUP_DELAY_MS = 2000;

export async function recipe(ctx: RecipeContext): Promise<RecipeOutput> {
  const { cleanup } = ctx;

  const sdk = new RunloopSDK({
    bearerToken: process.env['RUNLOOP_API_KEY'],
  });

  const devbox = await sdk.devbox.create({
    name: 'devbox-tunnel-example',
    launch_parameters: {
      resource_size_request: 'X_SMALL',
    },
    tunnel: {
      auth_mode: 'open',
    },
  });
  cleanup.add(`devbox:${devbox.id}`, () => sdk.devbox.fromId(devbox.id).shutdown());

  // Start a simple HTTP server inside the devbox using Python's built-in http.server
  // We use execAsync because the server runs indefinitely until stopped
  const serverExecution = await devbox.cmd.execAsync(
    `python3 -m http.server ${HTTP_SERVER_PORT} --directory /tmp`,
  );

  // Give the server a moment to start
  await new Promise((resolve) => setTimeout(resolve, SERVER_STARTUP_DELAY_MS));

  // The tunnel was created with the devbox. For authenticated tunnels, set
  // tunnel: { auth_mode: 'authenticated' } on create and include the auth_token
  // in your requests via the Authorization header: `Authorization: Bearer ${tunnel.auth_token}`
  const tunnel = await devbox.getTunnel();
  if (!tunnel) {
    throw new Error('Failed to create tunnel at devbox launch time');
  }

  // Get the tunnel URL for the server port
  const tunnelUrl = await devbox.getTunnelUrl(HTTP_SERVER_PORT);

  // Make an HTTP request from the LOCAL MACHINE through the tunnel to the devbox
  // This demonstrates that the tunnel allows external access to the devbox service
  const response = await fetch(tunnelUrl);
  const responseText = await response.text();

  // Stop the HTTP server
  await serverExecution.kill();

  return {
    resourcesCreated: [`devbox:${devbox.id}`],
    checks: [
      {
        name: 'tunnel was created successfully',
        passed: !!tunnel.tunnel_key,
        details: `tunnel_key=${tunnel.tunnel_key}`,
      },
      {
        name: 'tunnel URL was constructed correctly',
        passed: tunnelUrl.includes(tunnel.tunnel_key) && tunnelUrl.includes(`${HTTP_SERVER_PORT}`),
        details: tunnelUrl,
      },
      {
        name: 'HTTP request through tunnel succeeded',
        passed: response.ok,
        details: `status=${response.status}`,
      },
      {
        name: 'response contains directory listing',
        passed: responseText.includes('Directory listing'),
        details: responseText.slice(0, 200),
      },
    ],
  };
}

export const runDevboxTunnelExample = wrapRecipe({ recipe });

if (require.main === module) {
  void runAsCli(runDevboxTunnelExample);
}
