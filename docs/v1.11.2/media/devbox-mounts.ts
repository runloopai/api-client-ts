#!/usr/bin/env -S npm run tsn -T

/**
---
title: Devbox Mounts (Agent, Code, Object)
slug: devbox-mounts
use_case: Launch a devbox that combines an agent mount for Claude Code, a code mount for the Runloop CLI repo, and an object mount for startup files.
workflow:
  - Create or reuse an agent by name
  - Create a secret for an agent and route it through agent gateway
  - Upload a temporary directory as a storage object with a TTL
  - Launch a devbox with agent, code, and object mounts together
  - Run Claude Code on Opus 4.5 through the Anthropic agent gateway
  - Verify the rl-cli repo and extracted object files are present on the devbox
  - Shutdown the devbox and delete the temporary secret and object
tags:
  - devbox
  - mounts
  - agent
  - code
  - object
  - claude-code
  - agent-gateway
  - ttl
prerequisites:
  - RUNLOOP_API_KEY
  - ANTHROPIC_API_KEY
run: ANTHROPIC_API_KEY=sk-ant-xxx yarn tsn -T examples/devbox-mounts.ts
test: yarn test:examples
---
*/

import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { RunloopSDK } from '@runloop/api-client';
import { wrapRecipe, runAsCli } from './_harness';
import type { RecipeContext, RecipeOutput } from './types';

const CLAUDE_CODE_AGENT_NAME = 'example-claude-code-agent';
const CLAUDE_CODE_AGENT_VERSION = '1.0.0';
const CLAUDE_CODE_PACKAGE = '@anthropic-ai/claude-code';
const CLAUDE_MODEL = 'claude-opus-4-5';
const OBJECT_TTL_MS = 60 * 60 * 1000;
const OBJECT_MOUNT_DIR = '/home/user/bootstrap-assets';
const COPIED_EXAMPLE_FILE_NAME = 'devbox-mounts-source.ts';
const GATEWAY_ENV_PREFIX = 'ANTHROPIC';

function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// example setup: get or create an agent so we can mount it
async function ensureClaudeCodeAgent(sdk: RunloopSDK): Promise<{ agentId: string; reused: boolean }> {
  const existingAgentsList = await sdk.agent.list({ name: CLAUDE_CODE_AGENT_NAME, limit: 20 });
  const existingAgentDetails = await Promise.all(existingAgentsList.map((candidate) => candidate.getInfo()));

  const matchingAgent = existingAgentDetails
    .filter(
      (info) =>
        info.name === CLAUDE_CODE_AGENT_NAME &&
        info.version === CLAUDE_CODE_AGENT_VERSION &&
        info.source?.type === 'npm' &&
        info.source?.npm?.package_name === CLAUDE_CODE_PACKAGE,
    )
    .sort((left, right) => right.create_time_ms - left.create_time_ms)[0];

  if (matchingAgent) {
    return { agentId: matchingAgent.id, reused: true };
  }

  const createdAgent = await sdk.agent.createFromNpm({
    name: CLAUDE_CODE_AGENT_NAME,
    version: CLAUDE_CODE_AGENT_VERSION,
    package_name: CLAUDE_CODE_PACKAGE,
  });

  return { agentId: createdAgent.id, reused: false };
}

export async function recipe(ctx: RecipeContext): Promise<RecipeOutput> {
  const { cleanup } = ctx;
  const anthropicApiKey = process.env['ANTHROPIC_API_KEY'];

  if (!anthropicApiKey) {
    throw new Error('Set ANTHROPIC_API_KEY to run the Claude Code mount example.');
  }

  const sdk = new RunloopSDK({
    bearerToken: process.env['RUNLOOP_API_KEY'],
  });

  const resourcesCreated: string[] = [];

  const { agentId, reused } = await ensureClaudeCodeAgent(sdk);
  resourcesCreated.push(reused ? `agent:${agentId}:reused` : `agent:${agentId}`);

  // best practice: create a secret for the agent's credentials and use agent gateway to route it through
  // so that credentials are not exposed to the agent.
  const anthropicSecret = await sdk.secret.create({
    name: uniqueName('anthropic-mount-example'),
    value: anthropicApiKey,
  });
  resourcesCreated.push(`secret:${anthropicSecret.name}`);
  cleanup.add(`secret:${anthropicSecret.name}`, () => anthropicSecret.delete());

  // now create some example files to mount onto the devbox via object mount.
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'runloop-mounts-'));
  cleanup.add(`tempDir:${tempDir}`, () => fs.rm(tempDir, { recursive: true, force: true }));

  await fs.copyFile(__filename, path.join(tempDir, COPIED_EXAMPLE_FILE_NAME));
  await fs.writeFile(
    path.join(tempDir, 'README.txt'),
    'This directory was uploaded with uploadFromDir(), stored as a tgz object, and extracted onto the devbox via object_mount.\n',
  );

  // Object mounts are a good fit for blobs or archives that should simply appear on the devbox at startup.
  // uploadFromDir() compresses the directory as a .tgz, and mounting that archive to a directory path extracts it.
  const archive = await sdk.storageObject.uploadFromDir(tempDir, {
    name: uniqueName('mount-bootstrap'),
    ttl_ms: OBJECT_TTL_MS, // best practice: set a TTL so the object is deleted after a certain time.
    metadata: { example: 'devbox-mounts' },
  });
  resourcesCreated.push(`storageObject:${archive.id}`);
  cleanup.add(`storageObject:${archive.id}`, () => archive.delete());

  const archiveInfo = await archive.getInfo();

  const devbox = await sdk.devbox.create({
    name: uniqueName('mounts-example-devbox'),
    // Use agent mounts for reusable tools or agents that should be installed onto the devbox.
    // For npm-based agents like Claude Code, mounting by name makes it easy to reuse the latest matching agent.
    mounts: [
      {
        type: 'agent_mount',
        agent_id: null,
        agent_name: CLAUDE_CODE_AGENT_NAME,
      },
      // Use code mounts for Git projects that should be cloned onto the devbox.
      {
        type: 'code_mount',
        repo_owner: 'runloopai',
        repo_name: 'rl-cli',
      },
      {
        type: 'object_mount',
        object_id: archive.id,
        object_path: OBJECT_MOUNT_DIR,
      },
    ],
    // Route Anthropic access through agent gateway so Claude Code sees only a gateway token and URL.
    gateways: {
      [GATEWAY_ENV_PREFIX]: {
        gateway: 'anthropic',
        secret: anthropicSecret,
      },
    },
    launch_parameters: {
      resource_size_request: 'SMALL',
      keep_alive_time_seconds: 60 * 5,
    },
  });
  resourcesCreated.push(`devbox:${devbox.id}`);
  cleanup.add(`devbox:${devbox.id}`, () => sdk.devbox.fromId(devbox.id).shutdown());

  const devboxInfo = await devbox.getInfo();

  const gatewayUrlResult = await devbox.cmd.exec(`echo $${GATEWAY_ENV_PREFIX}_URL`);
  const gatewayUrl = (await gatewayUrlResult.stdout()).trim();

  const gatewayTokenResult = await devbox.cmd.exec(`echo $${GATEWAY_ENV_PREFIX}`);
  const gatewayToken = (await gatewayTokenResult.stdout()).trim();

  const claudeVersionResult = await devbox.cmd.exec('claude --version');
  const claudeVersion = (await claudeVersionResult.stdout()).trim();

  const claudePromptResult = await devbox.cmd.exec(
    `ANTHROPIC_BASE_URL="$${GATEWAY_ENV_PREFIX}_URL" ANTHROPIC_API_KEY="$${GATEWAY_ENV_PREFIX}" claude --model ${CLAUDE_MODEL} -p "Reply with the exact text mounted-through-agent-gateway and nothing else." --dangerously-skip-permissions`,
  );
  const claudeStdout = (await claudePromptResult.stdout()).trim();

  const repoPathResult = await devbox.cmd.exec(
    'if [ -d /home/user/rl-cli ]; then printf /home/user/rl-cli; elif [ -d /home/user/rl-clis ]; then printf /home/user/rl-clis; else exit 1; fi',
  );
  const repoMountPath = (await repoPathResult.stdout()).trim();
  const repoPackageJson =
    repoMountPath ? await devbox.file.read({ file_path: `${repoMountPath}/package.json` }) : '';

  const mountedExamplePath = path.posix.join(OBJECT_MOUNT_DIR, COPIED_EXAMPLE_FILE_NAME);
  const mountedExampleContents = await devbox.file.read({ file_path: mountedExamplePath });

  return {
    resourcesCreated,
    checks: [
      {
        name: 'Claude Code agent exists and is callable on the devbox',
        passed: claudeVersionResult.exitCode === 0 && claudeVersion.length > 0,
        details: claudeVersion || `exitCode=${claudeVersionResult.exitCode}`,
      },
      {
        name: 'Anthropic access is routed through agent gateway',
        passed:
          devboxInfo.gateway_specs?.[GATEWAY_ENV_PREFIX] !== undefined &&
          gatewayUrlResult.exitCode === 0 &&
          gatewayUrl.startsWith('http') &&
          gatewayTokenResult.exitCode === 0 &&
          gatewayToken.startsWith('gws_') &&
          gatewayToken !== anthropicApiKey,
        details: `gateway_url=${gatewayUrl}, token_prefix=${gatewayToken.slice(0, 4) || 'missing'}`,
      },
      {
        name: 'Claude Code runs on Opus 4.5 through the gateway',
        passed: claudePromptResult.exitCode === 0 && claudeStdout === 'mounted-through-agent-gateway',
        details: claudeStdout || `exitCode=${claudePromptResult.exitCode}`,
      },
      {
        name: 'rl-cli repository is available through code mount',
        passed:
          repoPathResult.exitCode === 0 &&
          repoMountPath.length > 0 &&
          repoPackageJson.includes('"name": "@runloop/rl-cli"'),
        details: repoMountPath || `exitCode=${repoPathResult.exitCode}`,
      },
      {
        name: 'object mount extracted the uploaded example file onto the devbox',
        passed:
          mountedExampleContents.includes('title: Devbox Mounts (Agent, Code, Object)') &&
          mountedExampleContents.startsWith('#!/usr/bin/env -S npm run tsn -T'),
        details: mountedExamplePath,
      },
      {
        name: 'uploaded object shows TTL and compression details',
        passed:
          archiveInfo.content_type === 'tgz' &&
          archiveInfo.delete_after_time_ms !== null &&
          archiveInfo.delete_after_time_ms !== undefined &&
          archiveInfo.delete_after_time_ms > archiveInfo.create_time_ms,
        details: `content_type=${archiveInfo.content_type}, delete_after_time_ms=${archiveInfo.delete_after_time_ms ?? 'missing'}`,
      },
    ],
  };
}

export const runDevboxMountsExample = wrapRecipe({ recipe });

if (require.main === module) {
  void runAsCli(runDevboxMountsExample);
}
