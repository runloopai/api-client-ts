# Examples

Runnable examples live in the [`examples/`](./examples) directory. Each script is self-contained and can be run with:

```sh
yarn tsn -T examples/<example>.ts
```

## Available Examples

### [MCP Hub + Claude Code + GitHub](./examples/mcp-github-tools.ts)

Launches a devbox with GitHub's MCP server attached via **MCP Hub**, installs **Claude Code**, and asks Claude to list repositories — all without the devbox seeing your real GitHub credentials.

**What it does:**

1. Creates an MCP config pointing at `https://api.githubcopilot.com/mcp/`
2. Stores a GitHub PAT as a Runloop secret (credential isolation)
3. Launches a devbox with MCP Hub enabled — the devbox receives `$RL_MCP_URL` and `$RL_MCP_TOKEN`
4. Installs Claude Code (`@anthropic-ai/claude-code`)
5. Registers the MCP Hub endpoint with Claude Code via `claude mcp add`
6. Runs `claude --print` to ask Claude to list repos using the GitHub MCP tools
7. Cleans up all resources

```sh
GITHUB_TOKEN=ghp_xxx ANTHROPIC_API_KEY=sk-ant-xxx \
  yarn tsn -T examples/mcp-github-tools.ts
```

---

**See also:** [MCP Hub documentation](https://docs.runloop.ai/docs/devboxes/mcp-hub) · [Runloop docs](https://docs.runloop.ai)
