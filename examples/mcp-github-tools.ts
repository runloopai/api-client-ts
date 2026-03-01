#!/usr/bin/env -S npm run tsn -T

/**
---
title: MCP Hub + Claude Code + GitHub
slug: mcp-github-tools
use_case: Connect Claude Code running in a devbox to GitHub tools through MCP Hub without exposing raw GitHub credentials to the devbox.
workflow:
  - Create an MCP config for GitHub
  - Store GitHub token as a Runloop secret
  - Launch a devbox with MCP Hub wiring
  - Install Claude Code and register MCP endpoint
  - Run a Claude prompt through MCP tools
  - Shutdown devbox and clean up cloud resources
tags:
  - mcp
  - devbox
  - github
  - commands
  - cleanup
prerequisites:
  - RUNLOOP_API_KEY
  - GITHUB_TOKEN (GitHub PAT with repo scope)
  - ANTHROPIC_API_KEY
run: GITHUB_TOKEN=ghp_xxx ANTHROPIC_API_KEY=sk-ant-xxx yarn tsn -T examples/mcp-github-tools.ts
test: yarn test:examples
---
 */

import { wrapRecipe, runAsCli } from './_harness';
import type { RecipeContext, RecipeOutput, ExampleCheck } from './types';

const GITHUB_MCP_ENDPOINT = 'https://api.githubcopilot.com/mcp/';

export interface McpExampleOptions {
  skipIfMissingCredentials?: boolean;
}

export async function recipe(ctx: RecipeContext, options: McpExampleOptions): Promise<RecipeOutput> {
  const { sdk, cleanup, uniqueName } = ctx;
  const resourcesCreated: string[] = [];
  const checks: ExampleCheck[] = [];

  const githubToken = process.env['GITHUB_TOKEN'];
  const anthropicKey = process.env['ANTHROPIC_API_KEY'];

  if (!githubToken) {
    throw new Error('Set GITHUB_TOKEN to a GitHub PAT with repo scope.');
  }
  if (!anthropicKey) {
    throw new Error('Set ANTHROPIC_API_KEY for Claude Code.');
  }

  // Register GitHub's MCP server with Runloop
  const mcpConfig = await sdk.mcpConfig.create({
    name: uniqueName('github-example'),
    endpoint: GITHUB_MCP_ENDPOINT,
    // whitelist only the tools we need
    allowed_tools: [
      'get_me',
      'search_pull_requests',
      'get_pull_request',
      'get_repository',
      'get_file_contents',
    ],
    description: 'GitHub MCP server - example',
  });
  resourcesCreated.push(`mcp_config:${mcpConfig.id}`);
  cleanup.add(`mcp_config:${mcpConfig.id}`, () => sdk.mcpConfig.fromId(mcpConfig.id).delete());

  // Store the GitHub PAT as a Runloop secret
  // Note: secrets are currently available via sdk.api, not sdk.secret ops
  const secretName = uniqueName('example-github-mcp');
  await sdk.api.secrets.create({
    name: secretName,
    value: githubToken,
  });
  resourcesCreated.push(`secret:${secretName}`);
  cleanup.add(`secret:${secretName}`, () => sdk.api.secrets.delete(secretName));

  // Launch a devbox with MCP Hub wiring
  const devbox = await sdk.devbox.create({
    name: uniqueName('mcp-claude-code'),
    launch_parameters: {
      resource_size_request: 'SMALL',
      keep_alive_time_seconds: 300,
    },
    mcp: {
      MCP_SECRET: {
        mcp_config: mcpConfig.id,
        secret: secretName,
      },
    },
  });
  resourcesCreated.push(`devbox:${devbox.id}`);
  cleanup.add(`devbox:${devbox.id}`, () => sdk.devbox.fromId(devbox.id).shutdown());

  // Install Claude Code
  const installResult = await devbox.cmd.exec('npm install -g @anthropic-ai/claude-code');
  checks.push({
    name: 'install Claude Code',
    passed: installResult.exitCode === 0,
    details: installResult.exitCode === 0 ? 'installed' : await installResult.stderr(),
  });
  if (installResult.exitCode !== 0) {
    return { resourcesCreated, checks };
  }

  // Register MCP Hub endpoint with Claude Code
  // The devbox has RL_MCP_URL and RL_MCP_TOKEN environment variables set automatically
  const addMcpResult = await devbox.cmd.exec(
    'claude mcp add runloop-mcp --transport http "$RL_MCP_URL" --header "Authorization: Bearer $RL_MCP_TOKEN"',
  );
  checks.push({
    name: 'register MCP Hub in Claude',
    passed: addMcpResult.exitCode === 0,
    details: addMcpResult.exitCode === 0 ? 'registered' : await addMcpResult.stderr(),
  });
  if (addMcpResult.exitCode !== 0) {
    return { resourcesCreated, checks };
  }

  // Ask Claude to summarize latest PR via MCP tools
  const prompt =
    'Use the MCP tools to get my last pr and describe what it does in 2-3 sentences. Also detail how you collected this information';
  const claudeResult = await devbox.cmd.exec(
    `ANTHROPIC_API_KEY=${anthropicKey} claude -p "${prompt}" --dangerously-skip-permissions`,
  );
  const claudeStdout = (await claudeResult.stdout()).trim();
  checks.push({
    name: 'Claude prompt through MCP succeeds',
    passed: claudeResult.exitCode === 0 && claudeStdout.length > 0,
    details: claudeResult.exitCode === 0 ? 'non-empty response received' : await claudeResult.stderr(),
  });

  return { resourcesCreated, checks };
}

function validateEnv(options: McpExampleOptions): { skip: boolean; checks: ExampleCheck[] } {
  const checks: ExampleCheck[] = [];
  const skipIfMissing = options?.skipIfMissingCredentials === true;

  const githubToken = process.env['GITHUB_TOKEN'];
  if (!githubToken && skipIfMissing) {
    checks.push({ name: 'GITHUB_TOKEN provided', passed: false, details: 'Skipped: missing GITHUB_TOKEN' });
    return { skip: true, checks };
  }

  const anthropicKey = process.env['ANTHROPIC_API_KEY'];
  if (!anthropicKey && skipIfMissing) {
    checks.push({
      name: 'ANTHROPIC_API_KEY provided',
      passed: false,
      details: 'Skipped: missing ANTHROPIC_API_KEY',
    });
    return { skip: true, checks };
  }

  return { skip: false, checks };
}

export const runMcpGithubToolsExample = wrapRecipe({ recipe, validateEnv });

if (require.main === module) {
  void runAsCli(runMcpGithubToolsExample);
}
