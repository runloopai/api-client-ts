# Runloop Node API Library

[![NPM version](https://img.shields.io/npm/v/@runloop/api-client.svg)](https://npmjs.org/package/@runloop/api-client) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@runloop/api-client)

This library provides convenient access to the Runloop SDK & REST API from server-side TypeScript or JavaScript.

The **RunloopSDK** is the recommended, modern way to interact with the Runloop API. It provides high-level object-oriented interfaces for common operations while maintaining full access to the underlying REST API through the `.api` property.

## MCP Server

Use the Runloop MCP Server to enable AI assistants to interact with this API, allowing them to explore endpoints, make test requests, and use documentation to help integrate this SDK into your application.

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=%40runloop%2Fapi-client-mcp&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBydW5sb29wL2FwaS1jbGllbnQtbWNwIl0sImVudiI6eyJSVU5MT09QX0FQSV9LRVkiOiJNeSBCZWFyZXIgVG9rZW4ifX0)
[![Install in VS Code](https://img.shields.io/badge/_-Add_to_VS_Code-blue?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZmlsbD0iI0VFRSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMzAuMjM1IDM5Ljg4NGEyLjQ5MSAyLjQ5MSAwIDAgMS0xLjc4MS0uNzNMMTIuNyAyNC43OGwtMy40NiAyLjYyNC0zLjQwNiAyLjU4MmExLjY2NSAxLjY2NSAwIDAgMS0xLjA4Mi4zMzggMS42NjQgMS42NjQgMCAwIDEtMS4wNDYtLjQzMWwtMi4yLTJhMS42NjYgMS42NjYgMCAwIDEgMC0yLjQ2M0w3LjQ1OCAyMCA0LjY3IDE3LjQ1MyAxLjUwNyAxNC41N2ExLjY2NSAxLjY2NSAwIDAgMSAwLTIuNDYzbDIuMi0yYTEuNjY1IDEuNjY1IDAgMCAxIDIuMTMtLjA5N2w2Ljg2MyA1LjIwOUwyOC40NTIuODQ0YTIuNDg4IDIuNDg4IDAgMCAxIDEuODQxLS43MjljLjM1MS4wMDkuNjk5LjA5MSAxLjAxOS4yNDVsOC4yMzYgMy45NjFhMi41IDIuNSAwIDAgMSAxLjQxNSAyLjI1M3YuMDk5LS4wNDVWMzMuMzd2LS4wNDUuMDk1YTIuNTAxIDIuNTAxIDAgMCAxLTEuNDE2IDIuMjU3bC04LjIzNSAzLjk2MWEyLjQ5MiAyLjQ5MiAwIDAgMS0xLjA3Ny4yNDZabS43MTYtMjguOTQ3LTExLjk0OCA5LjA2MiAxMS45NTIgOS4wNjUtLjAwNC0xOC4xMjdaIi8+PC9zdmc+)](https://vscode.stainless.com/mcp/%7B%22name%22%3A%22%40runloop%2Fapi-client-mcp%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40runloop%2Fapi-client-mcp%22%5D%2C%22env%22%3A%7B%22RUNLOOP_API_KEY%22%3A%22My%20Bearer%20Token%22%7D%7D)

> Note: You may need to set environment variables in your MCP client.

## Installation

```sh
npm install @runloop/api-client
```

## Quickstart

Here's a complete example that demonstrates the core SDK functionality:

```typescript
import { RunloopSDK } from '@runloop/api-client';

const sdk = new RunloopSDK({
  bearerToken: process.env.RUNLOOP_API_KEY, // This is the default and can be omitted
});

// Create a new devbox and wait for it to be ready
const devbox = await sdk.devbox.create();

// Execute a command that returns immediately - exec blocks until completion
const result = await devbox.cmd.exec('echo "Hello, World!"');
console.log('Output:', await result.stdout()); // "Hello, World!"
console.log('Exit code:', result.exitCode); // 0

// Start a long-running HTTP server - execAsync returns immediately
const serverExec = await devbox.cmd.execAsync('npx http-server -p 8080');
console.log(`Started server with execution ID: ${serverExec.executionId}`);

// Check server status
const state = await serverExec.getState();
console.log('Server status:', state.status); // "running"

// Later... kill the server when done
await serverExec.kill();

// Retrieve devbox logs
const logs = await devbox.logs();
console.log('Devbox logs:', logs.logs);

await devbox.shutdown();
```

## Examples

Workflow-oriented runnable examples are documented in [`EXAMPLES.md`](./EXAMPLES.md).

`EXAMPLES.md` is generated from metadata in `examples/*.ts` and should not be edited manually.
Regenerate it with:

```sh
yarn generate:examples-md
```

Use direct `secrets` injection when code inside the devbox legitimately needs the secret value. For third-party API credentials that should stay off the devbox, prefer wiring a Runloop secret through agent gateway instead. See [`examples/secrets-with-devbox.ts`](./examples/secrets-with-devbox.ts) for both patterns side by side using `devbox.create({ secrets: ... })` and `devbox.create({ gateways: ... })`.

## Agent Guidance

Detailed agent-specific instructions live in [`llms.txt`](./llms.txt). Consolidated recipes for frequent tasks are in [`EXAMPLES.md`](./EXAMPLES.md).

After completing any modifications to this project, ensure `llms.txt` and `README.md` are kept in sync.

## Core Concepts

### Runloop SDK

The main SDK class that provides access to all Runloop functionality. View the [RunloopSDK documentation](https://runloopai.github.io/api-client-ts/stable/) to see specific capabilities.

### Available Resources

The SDK provides object-oriented interfaces for all major Runloop resources:

- **[`runloop.devbox`](https://runloopai.github.io/api-client-ts/stable/classes/sdk.DevboxOps.html)** - Devbox management (create, list, execute commands, file operations)
- **[`runloop.blueprint`](https://runloopai.github.io/api-client-ts/stable/classes/sdk.BlueprintOps.html)** - Blueprint management (create, list, build blueprints)
- **[`runloop.snapshot`](https://runloopai.github.io/api-client-ts/stable/classes/sdk.SnapshotOps.html)** - Snapshot management (list disk snapshots)
- **[`runloop.storageObject`](https://runloopai.github.io/api-client-ts/stable/classes/sdk.StorageObjectOps.html)** - Storage object management (upload, download, list objects)
- **[`runloop.agent`](https://runloopai.github.io/api-client-ts/stable/classes/sdk.AgentOps.html)** - Agent management (create, list agents from npm/pip/git)
- **[`runloop.scenario`](https://runloopai.github.io/api-client-ts/stable/classes/sdk.ScenarioOps.html)** - Scenario management (list scenarios, start runs)
- **[`runloop.scorer`](https://runloopai.github.io/api-client-ts/stable/classes/sdk.ScorerOps.html)** - Scorer management (create, list, update)
- **[`runloop.secret`](https://runloopai.github.io/api-client-ts/stable/classes/sdk.SecretOps.html)** - Secret management (create, update, list, delete encrypted key-value pairs)
- **[`runloop.api`](https://runloopai.github.io/api-client-ts/stable/modules/types.html)** - Direct access to the REST API client

## TypeScript Support

The SDK is fully typed with comprehensive TypeScript definitions:

### Devbox Logs

Retrieve logs from a devbox, optionally filtered by execution ID or shell name:

```typescript
const devbox = await runloop.devbox.create();

// Get all devbox logs
const logs = await devbox.logs();
console.log(logs.logs);

// Filter logs by execution ID
const result = await devbox.cmd.exec('echo "hello"');
const execLogs = await devbox.logs({ execution_id: result.executionId });

// Filter logs by shell name
const shellLogs = await devbox.logs({ shell_name: 'my-shell' });
```

### Blueprints

Blueprints define reusable devbox configurations. Create blueprints via `runloop.blueprint.create()` and access build logs with `blueprint.logs()`:

```typescript
const blueprint = await runloop.blueprint.create({
  name: 'my-blueprint',
  dockerfile: 'FROM ubuntu:22.04\nRUN apt-get update',
});

// Get build logs
const logs = await blueprint.logs();
console.log(logs.logs);

// Create a devbox from the blueprint
const devbox = await blueprint.createDevbox({ name: 'my-devbox' });
```

### Scorers

Scorers are custom scoring functions used to evaluate scenario outputs. Create scorers via `runloop.scorer.create()`, then update them with the returned `Scorer` instance:

```typescript
import { RunloopSDK } from '@runloop/api-client';

const runloop = new RunloopSDK();

const scorer = await runloop.scorer.create({
  type: 'my_scorer',
  bash_script: 'echo "1.0"',
});

await scorer.update({ bash_script: 'echo "0.5"' });
```

### Scenarios

Scenarios define tasks with a well defined starting environment, task evaluation scorer and an optional reference solution. Use `runloop.scenario.fromId()` to get a scenario, then `scenario.run()` to start a run with your agent mounted:

```typescript
const scenario = runloop.scenario.fromId('scn_123');
const run = await scenario.run({
  run_name: 'my-run',
  runProfile: {
    mounts: [
      {
        type: 'agent_mount',
        agent_id: 'agt_123',
        agent_path: '/home/user/agent',
      },
    ],
  },
});
await run.devbox.cmd.exec('python /home/user/agent/main.py');
await run.scoreAndComplete();
```

### Benchmarks

Benchmarks are collections of scenarios for evaluating AI agents. Access via `runloop.api.benchmarks`:

```typescript
const benchmarks = await runloop.api.benchmarks.listPublic();
const definitions = await runloop.api.benchmarks.definitions('benchmark_id');
```

## Migration from API Client

If you're currently using the legacy API, migration is straightforward:

All of the runloop client methods `runloop.secrets` has moved to `runloopSDK.api.secrets`. Updating all references to this will move to the new sdk client.

```typescript
// Before (Legacy api client)
import Runloop from '@runloop/api-client';
const runloop = new Runloop();
const secretResult = await runloop.secrets.create({ ... });


// After (SDK)
import { RunloopSDK } from '@runloop/api-client';
const runloop  = new RunloopSDK();
const secretResult = await runloop.api.secrets.create({ ... });
```

Once you've migrated your existing code to the new SDK client you can optionally go through and move from the API paradigm to the object oriented SDK.

```ts
// Before (Legacy api client)
import Runloop from '@runloop/api-client';
const runloop = new Runloop()

const devboxResult = await runloop.devboxes.createAndAwaitRunning()

await runloop.devboxes.executeAndAwaitCompletion(devboxResult.id, { command: "touch example.txt" })

const snapshotResult = await runloop.devbox.snapshotDisk()
await runloop.devboxes.snapshotDisk(devboxResult.id)
await runloop.snapshots.awaitCompleted(snapshotResult.id)
runloop.devbox.create({ snapshot_id: snapshotResult.id})
...
await runloop.devbox.shutdown(devboxResult.id)

// After (SDK)
import { RunloopSDK } from '@runloop/api-client';
const runloop  = new RunloopSDK();

const devbox = await runloop.devbox.create();
await devbox.cmd.exec("touch example.txt");
const snapshot = await devbox.snapshotDisk();
await snapshot.createDevbox();
...
await devbox.shutdown();

```

## File write

```ts
// You can also pass a `fetch` `Response`:
await client.devboxes.uploadFile('id', {
  path: 'path',
  file: await fetch('https://somesite/file'),
});

// Finally, if none of the above are convenient, you can use our `toFile` helper:
await client.devboxes.uploadFile('id', {
  path: 'path',
  file: await toFile(Buffer.from('my bytes'), 'file'),
});
await client.devboxes.uploadFile('id', {
  path: 'path',
  file: await toFile(new Uint8Array([0, 1, 2]), 'file'),
});
```

## Handling errors

When the library is unable to connect to the API,
or if the API returns a non-success status code (i.e., 4xx or 5xx response),
a subclass of `APIError` will be thrown:

<!-- prettier-ignore -->
```ts
const devboxView = await client.devboxes.create().catch(async (err) => {
  if (err instanceof Runloop.APIError) {
    console.log(err.status); // 400
    console.log(err.name); // BadRequestError
    console.log(err.headers); // {server: 'nginx', ...}
  } else {
    throw err;
  }
});
```

## Advanced Configuration

Customize the SDK with your API token, endpoint, timeout, and retry settings:

```typescript
const runloop = new RunloopSDK({
  bearerToken: process.env.RUNLOOP_API_KEY,
  timeout: 60000, // 60 second timeout
  maxRetries: 3, // Retry failed requests
});
```

## Error Handling

The SDK provides comprehensive error handling with typed exceptions:

```typescript
try {
  const devbox = await runloop.devbox.create();
  const result = await devbox.cmd.exec('invalid-command');
} catch (error) {
  if (error instanceof RunloopSDK.APIError) {
    console.log('API Error:', error.status, error.message);
  } else if (error instanceof RunloopSDK.APIConnectionError) {
    console.log('Connection Error:', error.message);
  } else {
    console.log('Unexpected Error:', error);
  }
}
```

### Logging and middleware

You may also provide a custom `fetch` function when instantiating the client,
which can be used to inspect or alter the `Request` or `Response` before/after each request:

```ts
import { fetch } from 'undici'; // as one example
import { RunloopSDK } from '@runloop/api-client';

const runloop = new RunloopSDK({
  fetch: async (url: RequestInfo, init?: RequestInit): Promise<Response> => {
    console.log('About to make a request', url, init);
    const response = await fetch(url, init);
    console.log('Got response', response);
    return response;
  },
});
```

Note that if given a `DEBUG=true` environment variable, this library will log all requests and responses automatically.
This is intended for debugging purposes only and may change in the future without notice.

### Configuring an HTTP(S) Agent (e.g., for proxies)

By default, this library uses a stable agent for all http/https requests to reuse TCP connections, eliminating many TCP & TLS handshakes and shaving around 100ms off most requests.

If you would like to disable or customize this behavior, for example to use the API behind a proxy, you can pass an `httpAgent` which is used for all requests (be they http or https), for example:

<!-- prettier-ignore -->
```ts
// Configure the default for all requests:
const runloop = new RunloopSDK({
  httpAgent: new HttpsProxyAgent(process.env.PROXY_URL),
});

// Override per-request:
await runloop.devboxes.create({...}, {
  httpAgent: new http.Agent({ keepAlive: false }),
});
```

## Semantic versioning

This package generally follows [SemVer](https://semver.org/spec/v2.0.0.html) conventions, though certain backwards-incompatible changes may be released as minor versions:

1. Changes that only affect static types, without breaking runtime behavior.
2. Changes to library internals which are technically public but not intended or documented for external use. _(Please open a GitHub issue to let us know if you are relying on such internals.)_
3. Changes that we do not expect to impact the vast majority of users in practice.

We take backwards-compatibility seriously and work hard to ensure you can rely on a smooth upgrade experience.

We are keen for your feedback; please open an [issue](https://www.github.com/runloopai/api-client-ts/issues) with questions, bugs, or suggestions.

## Requirements

TypeScript >= 4.5 is supported.

The following runtimes are supported:

- Web browsers (Up-to-date Chrome, Firefox, Safari, Edge, and more)
- Node.js 18 LTS or later ([non-EOL](https://endoflife.date/nodejs)) versions.
- Deno v1.28.0 or higher.
- Bun 1.0 or later.
- Cloudflare Workers.
- Vercel Edge Runtime.
- Jest 28 or greater with the `"node"` environment (`"jsdom"` is not supported at this time).
- Nitro v2.6 or greater.

If you are interested in other runtime environments, please open or upvote an issue on GitHub.

## Development

After cloning the repository, run the bootstrap script and install git hooks:

```sh
./scripts/bootstrap
./scripts/install-hooks
```

This installs pre-push hooks that run linting and verify generated files are up to date.

## Contributing

See [the contributing documentation](./CONTRIBUTING.md).
