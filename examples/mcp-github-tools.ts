#!/usr/bin/env -S npm run tsn -T

/**
 * MCP Hub + Claude Code + GitHub
 *
 * Launches a devbox with GitHub's MCP server attached via MCP Hub,
 * installs Claude Code, registers the MCP endpoint, and asks Claude
 * to list repositories in a GitHub org — all without the devbox ever
 * seeing your real GitHub credentials.
 *
 * Prerequisites:
 *   - RUNLOOP_API_KEY  — your Runloop API key
 *   - GITHUB_TOKEN     — a GitHub PAT with repo scope
 *   - ANTHROPIC_API_KEY — your Anthropic API key (for Claude Code)
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_xxx ANTHROPIC_API_KEY=sk-ant-xxx \
 *     yarn tsn -T examples/mcp-github-tools.ts
 */

import { RunloopSDK } from '@runloop/api-client';

const GITHUB_MCP_ENDPOINT = 'https://api.githubcopilot.com/mcp/';
const SECRET_NAME = `example-github-mcp-${Date.now()}`;

async function main() {
  const githubToken = process.env['GITHUB_TOKEN'];
  const anthropicKey = process.env['ANTHROPIC_API_KEY'];

  if (!githubToken) {
    console.error('Set GITHUB_TOKEN to a GitHub PAT with repo scope.');
    process.exit(1);
  }
  if (!anthropicKey) {
    console.error('Set ANTHROPIC_API_KEY for Claude Code.');
    process.exit(1);
  }

  const sdk = new RunloopSDK();

  // ── 1. Register GitHub's MCP server with Runloop ───────────────────
  console.log('[1/6] Creating MCP config…');
  const mcpConfig = await sdk.mcpConfig.create({
    name: `github-example-${Date.now()}`,
    endpoint: GITHUB_MCP_ENDPOINT,
    allowed_tools: [
      'get_me',
      'search_pull_requests',
      'get_pull_request',
      'get_repository',
      'get_file_contents',
    ],
    description: 'GitHub MCP server — example',
  });
  console.log(`      Config: ${mcpConfig.id}`);

  // ── 2. Store the GitHub PAT as a Runloop secret ────────────────────
  //    Runloop holds the token server-side; the devbox never sees it.
  console.log('[2/6] Storing GitHub token as secret…');
  await sdk.api.secrets.create({
    name: SECRET_NAME,
    value: githubToken,
  });
  console.log(`      Secret: ${SECRET_NAME}`);

  let devbox;

  // ── 3. Launch a devbox with MCP Hub ──────────────────────────────
  //    The devbox gets $RL_MCP_URL and $RL_MCP_TOKEN — a proxy
  //    endpoint, not the raw GitHub token.
  console.log('[3/6] Creating devbox…');
  devbox = await sdk.devbox.create({
    name: `mcp-claude-code-${Date.now()}`,
    launch_parameters: {
      resource_size_request: 'SMALL',
      keep_alive_time_seconds: 300,
    },
    mcp: {
      MCP_SECRET: {
        mcp_config: mcpConfig.id,
        secret: SECRET_NAME,
      },
    },
  });
  console.log(`      Devbox: ${devbox.id}`);

  // ── 4. Install Claude Code ───────────────────────────────────────
  console.log('[4/6] Installing Claude Code…');
  const installResult = await devbox.cmd.exec('npm install -g @anthropic-ai/claude-code');
  if (installResult.exitCode !== 0) {
    console.error('Failed to install Claude Code:', await installResult.stderr());
    return;
  }
  console.log('      Installed.');

  // ── 5. Point Claude Code at MCP Hub ──────────────────────────────
  //    Claude Code  ──>  MCP Hub (Runloop)  ──>  GitHub MCP Server
  //                      injects secret
  console.log('[5/6] Registering MCP Hub with Claude Code…');
  const addMcpResult = await devbox.cmd.exec(
    'claude mcp add runloop-mcp --transport http "$RL_MCP_URL" --header "Authorization: Bearer $RL_MCP_TOKEN"',
  );
  if (addMcpResult.exitCode !== 0) {
    console.error('Failed to add MCP server:', await addMcpResult.stderr());
    return;
  }
  console.log('      Registered.');

  const prompt = `Use the MCP tools to get my last pr and describe what it does in 2-3 sentences. Also detail how you collected this information`;
  // ── 6. Ask Claude Code to list repos via MCP ─────────────────────
  console.log(`[6/6] Asking Claude Code to: \n${prompt}\n`);
  const claudeResult = await devbox.cmd.exec(
    `ANTHROPIC_API_KEY=${anthropicKey} claude -p "${prompt}" --dangerously-skip-permissions`,
  );
  console.log((await claudeResult.stdout()).trim());

  await devbox?.shutdown();
  await mcpConfig.delete();

  await sdk.api.secrets.delete(SECRET_NAME);

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
