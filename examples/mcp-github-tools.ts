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

import { Runloop } from '@runloop/api-client';
import { ExampleResult, emptyCleanupStatus, trackCleanup } from './types';

const GITHUB_MCP_ENDPOINT = 'https://api.githubcopilot.com/mcp/';

interface McpExampleOptions {
  skipIfMissingCredentials?: boolean;
}

export async function runMcpGithubToolsExample(options: McpExampleOptions = {}): Promise<ExampleResult> {
  const githubToken = process.env['GITHUB_TOKEN'];
  const anthropicKey = process.env['ANTHROPIC_API_KEY'];
  const resourcesCreated: string[] = [];
  const checks: ExampleResult['checks'] = [];
  const cleanupStatus = emptyCleanupStatus();

  if (!githubToken) {
    if (options.skipIfMissingCredentials) {
      checks.push({
        name: 'GITHUB_TOKEN provided',
        passed: false,
        details: 'Skipped: missing GITHUB_TOKEN',
      });
      return { resourcesCreated, checks, cleanupStatus, skipped: true };
    }
    throw new Error('Set GITHUB_TOKEN to a GitHub PAT with repo scope.');
  }

  if (!anthropicKey) {
    if (options.skipIfMissingCredentials) {
      checks.push({
        name: 'ANTHROPIC_API_KEY provided',
        passed: false,
        details: 'Skipped: missing ANTHROPIC_API_KEY',
      });
      return { resourcesCreated, checks, cleanupStatus, skipped: true };
    }
    throw new Error('Set ANTHROPIC_API_KEY for Claude Code.');
  }

  const secretName = `example-github-mcp-${Date.now()}`;
  const api = new Runloop();
  let mcpConfigId: string | undefined;
  let devboxId: string | undefined;
  let secretCreated = false;

  try {
    // 1) Register GitHub's MCP server with Runloop.
    console.log('[1/6] Creating MCP config...');
    const mcpConfig = await api.mcpConfigs.create({
      name: `github-example-${Date.now()}`,
      endpoint: GITHUB_MCP_ENDPOINT,
      allowed_tools: [
        'get_me',
        'search_pull_requests',
        'get_pull_request',
        'get_repository',
        'get_file_contents',
      ],
      description: 'GitHub MCP server - example',
    });
    mcpConfigId = mcpConfig.id;
    resourcesCreated.push(`mcp_config:${mcpConfig.id}`);
    console.log(`      MCP config: ${mcpConfig.id}`);

    // 2) Store the GitHub PAT as a Runloop secret.
    console.log('[2/6] Creating secret...');
    await api.secrets.create({
      name: secretName,
      value: githubToken,
    });
    secretCreated = true;
    resourcesCreated.push(`secret:${secretName}`);
    console.log(`      Secret: ${secretName}`);

    // 3) Launch a devbox with MCP Hub.
    console.log('[3/6] Creating devbox...');
    const devbox = await api.devboxes.createAndAwaitRunning({
      name: `mcp-claude-code-${Date.now()}`,
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
    devboxId = devbox.id;
    resourcesCreated.push(`devbox:${devbox.id}`);
    console.log(`      Devbox: ${devbox.id}`);

    // 4) Install Claude Code.
    console.log('[4/6] Installing Claude Code...');
    const installResult = await api.devboxes.executeAndAwaitCompletion(devbox.id, {
      command: 'npm install -g @anthropic-ai/claude-code',
      last_n: '1000',
    });
    checks.push({
      name: 'install Claude Code',
      passed: installResult.exit_status === 0,
      details: installResult.exit_status === 0 ? 'installed' : (installResult.stderr ?? 'no stderr'),
    });
    if (installResult.exit_status !== 0) {
      return { resourcesCreated, checks, cleanupStatus };
    }
    console.log('      Installed.');

    // 5) Register MCP Hub with Claude Code.
    console.log('[5/6] Registering MCP endpoint with Claude Code...');
    const addMcpResult = await api.devboxes.executeAndAwaitCompletion(devbox.id, {
      command:
        'claude mcp add runloop-mcp --transport http "$RL_MCP_URL" --header "Authorization: Bearer $RL_MCP_TOKEN"',
      last_n: '1000',
    });
    checks.push({
      name: 'register MCP Hub in Claude',
      passed: addMcpResult.exit_status === 0,
      details: addMcpResult.exit_status === 0 ? 'registered' : (addMcpResult.stderr ?? 'no stderr'),
    });
    if (addMcpResult.exit_status !== 0) {
      return { resourcesCreated, checks, cleanupStatus };
    }
    console.log('      Registered.');

    // 6) Ask Claude to summarize latest PR via MCP tools.
    const prompt =
      'Use the MCP tools to get my last pr and describe what it does in 2-3 sentences. Also detail how you collected this information';
    console.log(`[6/6] Running Claude prompt...\n      ${prompt}`);
    const claudeResult = await api.devboxes.executeAndAwaitCompletion(devbox.id, {
      command: `ANTHROPIC_API_KEY=${anthropicKey} claude -p "${prompt}" --dangerously-skip-permissions`,
      last_n: '1000',
    });
    const claudeStdout = (claudeResult.stdout ?? '').trim();
    const claudeCheckDetails =
      claudeResult.exit_status === 0 ? 'non-empty response received' : (claudeResult.stderr ?? 'no stderr');
    checks.push({
      name: 'Claude prompt through MCP succeeds',
      passed: claudeResult.exit_status === 0 && claudeStdout.length > 0,
      details: claudeCheckDetails,
    });
    if (claudeStdout.length > 0) {
      console.log(claudeStdout);
    }

    return {
      resourcesCreated,
      checks,
      cleanupStatus,
    };
  } finally {
    if (devboxId) {
      const id = devboxId;
      await trackCleanup(cleanupStatus, `devbox:${id}`, async () => {
        await api.devboxes.shutdown(id);
      });
    }

    if (mcpConfigId) {
      const id = mcpConfigId;
      await trackCleanup(cleanupStatus, `mcp_config:${id}`, async () => {
        await api.mcpConfigs.delete(id);
      });
    }

    if (secretCreated) {
      await trackCleanup(cleanupStatus, `secret:${secretName}`, async () => {
        await api.secrets.delete(secretName);
      });
    }

    if (cleanupStatus.failed.length === 0) {
      console.log('Cleanup completed.');
    } else {
      console.log('Cleanup finished with errors.');
    }
  }
}

if (require.main === module) {
  runMcpGithubToolsExample()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      const failedChecks = result.checks.filter((check) => !check.passed);
      if (result.skipped || failedChecks.length > 0 || result.cleanupStatus.failed.length > 0) {
        process.exitCode = 1;
      }
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
