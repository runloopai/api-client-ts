# Runloop SDK - Object-Oriented API Client

[![NPM version](https://img.shields.io/npm/v/@runloop/api-client.svg)](https://npmjs.org/package/@runloop/api-client) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@runloop/api-client)

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
console.log(`Created devbox: ${devbox.id}`);

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

### RunloopSDK

The main SDK class that provides access to all Runloop functionality:

```typescript
import { RunloopSDK } from '@runloop/api-client';

const sdk = new RunloopSDK({
  bearerToken: 'your-api-key',
  // ... other options
});
```

### Available Resources

The SDK provides object-oriented interfaces for all major Runloop resources:

- **`sdk.devbox`** - Devbox management (create, list, execute commands, file operations)
- **`sdk.blueprint`** - Blueprint management (create, list, build blueprints)
- **`sdk.snapshot`** - Snapshot management (list disk snapshots)
- **`sdk.storageObject`** - Storage object management (upload, download, list objects)
- **`sdk.api`** - Direct access to the legacy REST API client

### Devbox

Object-oriented interface for working with devboxes. Created via `sdk.devbox.create()`, `sdk.devbox.createFromBlueprint()`, `sdk.devbox.createFromSnapshot()`, or `sdk.devbox.fromId()`:

```typescript
// Create a new devbox
const devbox = await sdk.devbox.create({ name: 'my-devbox' });

// Create a devbox from a blueprint
const devboxFromBlueprint = await sdk.devbox.createFromBlueprint(
  'blueprint-id',
  { name: 'my-devbox-from-blueprint' }
);

// Create a devbox from a snapshot
const devboxFromSnapshot = await sdk.devbox.createFromSnapshot(
  'snapshot-id',
  { name: 'my-devbox-from-snapshot' }
);

// Or get an existing one
const existingDevbox = sdk.devbox.fromId('devbox-id');

// List all devboxes
const devboxes = await sdk.devbox.list({ limit: 10 });

// Get devbox information
const info = await devbox.getInfo();
console.log(`Devbox ${info.name} is ${info.status}`);
```

#### Command Execution

```typescript
// Synchronous command execution
const result = await devbox.cmd.exec({ command: 'ls -la' });
console.log('Output:', await result.stdout());
console.log('Exit code:', result.exitCode);

// Asynchronous command execution
const execution = await devbox.cmd.execAsync({
  command: 'npm run dev',
});

// Check execution status
const state = await execution.getState();
console.log('Status:', state.status);

// Wait for completion and get result
const result = await execution.result();
console.log('Final output:', await result.stdout());

// Kill the process
await execution.kill();
```

#### Execution Management

The `Execution` object provides fine-grained control over asynchronous command execution:

```typescript
// Start a long-running process
const execution = await devbox.cmd.execAsync({
  command: 'python train_model.py',
});

// Get the execution ID
console.log('Execution ID:', execution.executionId);
console.log('Devbox ID:', execution.devboxId);

// Poll for current state
const state = await execution.getState();
console.log('Status:', state.status); // "running", "completed", etc.
console.log('Exit code:', state.exit_code);

// Wait for completion and get results
const result = await execution.result();
console.log('Exit code:', result.exitCode);
console.log('Output:', await result.stdout());
console.log('Errors:', await result.stderr());

// Or kill the process early
await execution.kill();
```

**Key methods:**

- `execution.getState()` - Get current execution state (status, exit_code, etc.)
- `execution.result()` - Wait for completion and return `ExecutionResult`
- `execution.kill()` - Terminate the running process
- `execution.executionId` - Get the execution ID (getter)
- `execution.devboxId` - Get the devbox ID (getter)

#### Execution Results

The `ExecutionResult` object contains the output and exit status of a completed command:

```typescript
// From synchronous execution
const result = await devbox.cmd.exec({ command: 'ls -la /tmp' });

// Or from asynchronous execution
const execution = await devbox.cmd.execAsync({ command: 'echo "test"' });
const result = await execution.result();

// Access execution results
console.log('Exit code:', result.exitCode);
console.log('Success:', result.success); // true if exit code is 0
console.log('Failed:', result.failed); // true if exit code is non-zero

// Get output streams
const stdout = await result.stdout();
const stderr = await result.stderr();
console.log('Standard output:', stdout);
console.log('Standard error:', stderr);

// Access raw result data
const rawResult = result.result;
console.log('Raw result:', rawResult);
```

**Key methods and properties:**

- `result.exitCode` - The process exit code (getter)
- `result.success` - Boolean indicating success (exit code 0) (getter)
- `result.failed` - Boolean indicating failure (non-zero exit code) (getter)
- `result.stdout()` - Get standard output as string
- `result.stderr()` - Get standard error as string
- `result.result` - Get the raw result data (getter)

#### File Operations

```typescript
// Write files
await devbox.file.write({
  file_path: '/home/user/app.js',
  contents: 'console.log("Hello from devbox!");',
});

// Read files
const content = await devbox.file.read({ file_path: '/home/user/app.js' });
console.log(content); // "console.log("Hello from devbox!");"

// Upload files (Node.js only)
await devbox.file.upload({
  path: '/home/user/upload.txt',
  file: new File(['content'], 'upload.txt'),
});

// Download files
const response = await devbox.file.download({ path: '/home/user/download.txt' });
```

#### Network Operations

```typescript
// Create SSH key for remote access
const sshKey = await devbox.net.createSSHKey();
console.log('SSH URL:', sshKey.url);

// Create tunnel to expose port
const tunnel = await devbox.net.createTunnel({ port: 8080 });
console.log('Public URL:', tunnel.url);

// Remove tunnel when done
await devbox.net.removeTunnel({ port: 8080 });
```

#### Snapshot Operations

```typescript
// Create a snapshot
const snapshot = await devbox.snapshotDisk({
  name: 'my-snapshot',
  commit_message: 'Added new features',
});

// Create new devbox from snapshot (using snapshot object)
const newDevbox = await snapshot.createDevbox({
  name: 'devbox-from-snapshot',
});

// Or create new devbox from snapshot (using SDK method)
const anotherDevbox = await sdk.devbox.createFromSnapshot(
  snapshot.id,
  { name: 'another-devbox' }
);
```

#### Devbox Management

```typescript
// Suspend devbox (pause without losing state)
await devbox.suspend();

// Resume suspended devbox
await devbox.resume();

// Keep devbox alive (extend timeout)
await devbox.keepAlive();

// Shutdown devbox
await devbox.shutdown();
```

**Key methods:**

- `devbox.getInfo()` - Get devbox details and status
- `devbox.cmd.exec()` - Execute commands synchronously
- `devbox.cmd.execAsync()` - Execute commands asynchronously
- `devbox.file.read()` - Read file contents
- `devbox.file.write()` - Write file contents
- `devbox.file.upload()` - Upload files (Node.js only)
- `devbox.file.download()` - Download files
- `devbox.net.createSSHKey()` - Create SSH key for remote access
- `devbox.net.createTunnel()` - Create network tunnel
- `devbox.net.removeTunnel()` - Remove network tunnel
- `devbox.snapshotDisk()` - Create disk snapshot
- `devbox.suspend()` - Suspend devbox
- `devbox.resume()` - Resume suspended devbox
- `devbox.keepAlive()` - Extend devbox timeout
- `devbox.shutdown()` - Shutdown the devbox

### Blueprint

Object-oriented interface for working with blueprints. Created via `sdk.blueprint.create()` or `sdk.blueprint.fromId()`:

```typescript
// Create a new blueprint
const blueprint = await sdk.blueprint.create({
  name: 'my-blueprint',
  // ... other parameters
});

// Or get an existing one
const blueprint = await sdk.blueprint.fromId('blueprint-id');

// List all blueprints
const blueprints = await sdk.blueprint.list();

// Get blueprint details and build logs
const info = await blueprint.getInfo();
const logs = await blueprint.logs();

// Create a devbox from this blueprint (using blueprint object)
const devbox = await blueprint.createDevbox({
  name: 'devbox-from-blueprint',
});

// Or create devbox from blueprint (using SDK method)
const anotherDevbox = await sdk.devbox.createFromBlueprint(
  blueprint.id,
  { name: 'another-devbox' }
);

// Delete the blueprint when done
await blueprint.delete();
```

**Key methods:**

- `blueprint.getInfo()` - Get blueprint details
- `blueprint.logs()` - Get build logs for the blueprint
- `blueprint.delete()` - Delete the blueprint
- `blueprint.createDevbox()` - Create a devbox from this blueprint

### Snapshot

Object-oriented interface for working with disk snapshots. Created via `sdk.snapshot.fromId()`:

```typescript
// Get an existing snapshot
const snapshot = await sdk.snapshot.fromId('snapshot-id');

// List all snapshots
const snapshots = await sdk.snapshot.list();

// List snapshots for a specific devbox
const devboxSnapshots = await sdk.snapshot.list({ devbox_id: 'devbox-id' });

// Get snapshot details and check status
const info = await snapshot.getInfo();
const status = await snapshot.queryStatus();

// Update snapshot metadata
await snapshot.update({
  name: 'updated-snapshot-name',
  metadata: { version: 'v2.0' },
});

// Wait for async snapshot to complete
await snapshot.awaitCompleted();

// Create a devbox from this snapshot
const devbox = await snapshot.createDevbox({
  name: 'devbox-from-snapshot',
});

// Delete the snapshot when done
await snapshot.delete();
```

**Key methods:**

- `snapshot.getInfo()` - Get snapshot details
- `snapshot.update()` - Update snapshot name and metadata
- `snapshot.delete()` - Delete the snapshot
- `snapshot.queryStatus()` - Query async snapshot status
- `snapshot.awaitCompleted()` - Wait for snapshot completion
- `snapshot.createDevbox()` - Create a devbox from this snapshot

### StorageObject

Object-oriented interface for working with storage objects. Created via `sdk.storageObject.create()` or `sdk.storageObject.fromId()`:

```typescript
// Create a new storage object
const storageObject = await sdk.storageObject.create({
  name: 'my-file.txt',
  content_type: 'text',
  metadata: { project: 'demo' },
});

// Upload content to the object
await storageObject.uploadContent('Hello, World!');
await storageObject.complete();

// Upload from file (Node.js only)
const uploaded = await sdk.storageObject.uploadFromFile(
  '/path/to/file.txt',
  'my-file.txt',
  { metadata: { source: 'file' } }, //  contentType: 'text',  is assumed based on the filename
);

// Upload text content directly
const uploaded = await sdk.storageObject.uploadFromText('Hello, World!', 'my-text.txt', {
  metadata: { source: 'text' },
});

// Upload from buffer (Node.js only)
const uploaded = await sdk.storageObject.uploadFromBuffer(Buffer.from('content'), 'my-file.txt', 'text', {
  metadata: { source: 'buffer' },
});

// Get object details and download
const info = await storageObject.getInfo();
const downloadUrl = await storageObject.getDownloadUrl(3600); // 1 hour

// Download content
const textContent = await storageObject.downloadAsText();
const binaryContent = await storageObject.downloadAsBuffer();

// List all storage objects
const objects = await sdk.storageObject.list();

// Delete when done
await storageObject.delete();
```

### Mounting Storage Objects to Devboxes

You can mount storage objects to devboxes to access their contents:

```typescript
// Create a devbox and mount a storage object
const devbox = await sdk.devbox.create({
  name: 'my-devbox',
  // Mount the storage object to /home/user/data in the devbox
  mounts: [
    {
      type: 'object_mount',
      object_id: storageObject.id,
      object_path: '/home/user/data',
    },
  ],
});

// The storage object is now accessible at /home/user/data in the devbox
const result = await devbox.cmd.exec({ command: 'ls -la /home/user/data' });
console.log(await result.stdout());

// Mount archived objects (tar, tgz, gzip) - they get extracted to a directory
const archiveObject = await sdk.storageObject.uploadFromFile('./project.tar.gz', 'project.tar.gz');

const devboxWithArchive = await sdk.devbox.create({
  name: 'archive-devbox',
  mounts: [
    {
      type: 'object_mount',
      object_id: archiveObject.id,
      object_path: '/home/user/project', // Archive gets extracted here
    },
  ],
});

// Access extracted archive contents
await devboxWithArchive.cmd.exec({ command: 'ls -la /home/user/project/' });
```

**Key methods:**

- `storageObject.getInfo()` - Get object details
- `storageObject.uploadContent()` - Upload content to the object
- `storageObject.complete()` - Mark upload as complete
- `storageObject.getDownloadUrl()` - Get presigned download URL
- `storageObject.downloadAsText()` - Download content as text
- `storageObject.downloadAsBuffer()` - Download content as Buffer
- `storageObject.delete()` - Delete the object

**Static upload methods:**

- `StorageObject.uploadFromFile()` - Upload from filesystem (Node.js only)
- `StorageObject.uploadFromText()` - Upload text content directly
- `StorageObject.uploadFromBuffer()` - Upload from Buffer (Node.js only)

## Accessing the Legacy API

The SDK provides full access to the traditional REST API through the `.api` property:

```typescript
// New SDK approach (recommended)
const devbox = await sdk.devbox.create();
const result = await devbox.cmd.exec({ command: 'echo hello' });

// Legacy API approach (still available)
const devboxData = await sdk.api.devboxes.create();
const result = await sdk.api.devboxes.execute(devboxData.id, { command: 'echo hello' });
```

**When to use each approach:**

- **SDK methods** (`sdk.devbox.*`) - For most common operations, better error handling, automatic polling
- **Legacy API** (`sdk.api.*`) - For advanced use cases, direct control over request parameters, accessing new endpoints not yet in SDK

## Error Handling

The SDK provides comprehensive error handling with typed exceptions:

```typescript
try {
  const devbox = await sdk.devbox.create();
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

## Advanced Configuration

```typescript
const sdk = new RunloopSDK({
  bearerToken: process.env.RUNLOOP_API_KEY,
  baseURL: 'https://api.runloop.ai', // Custom API endpoint
  timeout: 60000, // 60 second timeout
  maxRetries: 3, // Retry failed requests
  defaultHeaders: {
    'X-Custom-Header': 'value',
  },
});
```

## TypeScript Support

The SDK is fully typed with comprehensive TypeScript definitions:

```typescript
import { RunloopSDK, type DevboxView } from '@runloop/api-client';

const sdk = new RunloopSDK();
const devbox: DevboxView = await sdk.devbox.create();
```

## Migration from Legacy API

If you're currently using the legacy API, migration is straightforward:

```typescript
// Before (Legacy API)
import Runloop from '@runloop/api-client';
const client = new Runloop();
const devbox = await client.devboxes.create();
const result = await client.devboxes.execute(devbox.id, { command: 'echo hello' });

// After (SDK)
import { RunloopSDK } from '@runloop/api-client';
const sdk = new RunloopSDK();
const devbox = await sdk.devbox.create();
const result = await devbox.cmd.exec({ command: 'echo hello' });
```

## Complete API Reference

- **[api.md](api.md)** - Complete REST API documentation
- **[README.md](README.md)** - Advanced topics (retries, timeouts, error handling, pagination)
