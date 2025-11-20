# Runloop Node API Library

[![NPM version](https://img.shields.io/npm/v/@runloop/api-client.svg)](https://npmjs.org/package/@runloop/api-client) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@runloop/api-client)

This library provides convenient access to the Runloop SDK & REST API from server-side TypeScript or JavaScript.

The additional documentation guides can be found at [docs.runloop.ai](https://docs.runloop.ai). The full API of this library can be found in [api.md](api.md).

The **RunloopSDK** is the recommended, modern way to interact with the Runloop API. It provides high-level object-oriented interfaces for common operations while maintaining full access to the underlying REST API through the `.api` property.

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

// Execute a synchronous command
const result = await devbox.cmd.exec({ command: 'echo "Hello, World!"' });
console.log('Output:', await result.stdout()); // "Hello, World!"
console.log('Exit code:', result.exitCode); // 0

// Start a long-running HTTP server asynchronously
const serverExec = await devbox.cmd.execAsync({
  command: 'npx http-server -p 8080',
});
console.log(`Started server with execution ID: ${serverExec.executionId}`);

// Check server status
const state = await serverExec.getState();
console.log('Server status:', state.status); // "running"

// Later... kill the server when done
await serverExec.kill();

await devbox.shutdown();
```

## Core Concepts

### Runloop SDK

The main SDK class that provides access to all Runloop functionality construct view the [RunloopSDK documentation](https://runloopai.github.io/api-client-ts/stable/classes/RunloopSDK.html) to see specific capabilities.

### Available Resources

The SDK provides object-oriented interfaces for all major Runloop resources:

- **[`runloop.devbox`](https://runloopai.github.io/api-client-ts/stable/classes/DevboxOps.html)** - Devbox management (create, list, execute commands, file operations)
- **[`runloop.blueprint`](https://runloopai.github.io/api-client-ts/stable/classes/BlueprintOps.html)** - Blueprint management (create, list, build blueprints)
- **[`runloop.snapshot`](https://runloopai.github.io/api-client-ts/stable/classes/SnapshotOps.html)** - Snapshot management (list disk snapshots)
- **[`runloop.storageObject`](https://runloopai.github.io/api-client-ts/stable/classes/StorageObjectOps.html)** - Storage object management (upload, download, list objects)
- **[`runloop.api`](https://runloopai.github.io/api-client-ts/stable/classes/Runloop.html)** - Direct access to the REST API client

## TypeScript Support

The SDK is fully typed with comprehensive TypeScript definitions:

```typescript
import { RunloopSDK, type DevboxView } from '@runloop/api-client';

const runloop = new RunloopSDK();
const devbox: DevboxView = await runloop.devbox.create();
```

## Migration from API Client

If you're currently using the legacy API, migration is straightforward:

```typescript
// Before (Legacy API)
import Runloop from '@runloop/api-client';
const runloop = new RunloopSDK();
const secretResult = await runloop.secrets.create({ ... });


// After (SDK)
import { RunloopSDK } from '@runloop/api-client';
const runloop  = new RunloopSDK();
const secretResult = await runloop.api.secrets.create({ ... });
```

## Advanced Configuration

Customize the SDK with your API token, endpoint, timeout, and retry settings:

```typescript
const runloop = new RunloopSDK({
  bearerToken: process.env.RUNLOOP_API_KEY,
  baseURL: 'https://api.runloop.ai',
  timeout: 60000, // 60 second timeout
  maxRetries: 3, // Retry failed requests
});
```

## Error Handling

The SDK provides comprehensive error handling with typed exceptions:

```typescript
try {
  const devbox = await runloop.devbox.create();
  const result = await devbox.cmd.exec({ command: 'invalid-command' });
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
await runloop.devboxes.create({
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

Note that React Native is not supported at this time.

If you are interested in other runtime environments, please open or upvote an issue on GitHub.

## Contributing

See [the contributing documentation](./CONTRIBUTING.md).
