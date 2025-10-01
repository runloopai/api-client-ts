# Runloop API Examples

This directory contains example programs demonstrating how to use the Runloop API client.

## Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set your Runloop API key:
   ```bash
   export RUNLOOP_API_KEY="your-api-key-here"
   ```

## Examples

### Object-Oriented Devbox Interface

**File:** `devbox-object-example.ts`

This example demonstrates the new object-oriented `Devbox` class, which provides a cleaner, more intuitive API for working with devboxes.

**Features demonstrated:**
- Creating a devbox with `Devbox.create()`
- Executing commands with `devbox.exec()`
- Reading and writing files with `devbox.file.read()` and `devbox.file.write()`
- Using persistent shells for maintaining state
- Async command execution
- Creating snapshots
- Shutting down devboxes

**Run the example:**
```bash
npx tsx examples/devbox-object-example.ts
```

### Blueprint and Snapshot Interface

**File:** `blueprint-snapshot-example.ts`

This example demonstrates the Blueprint and Snapshot classes for creating reusable devbox configurations and saving/restoring devbox state.

**Features demonstrated:**
- Creating blueprints with custom configurations using `Blueprint.create()`
- Previewing blueprint Dockerfiles with `Blueprint.preview()`
- Viewing build logs with `blueprint.logs()`
- Creating devboxes from blueprints
- Taking snapshots with `devbox.snapshotDisk()`
- Working with snapshots using the `Snapshot` class
- Restoring devboxes from snapshots
- Full workflow: Blueprint → Devbox → Snapshot → New Devbox

**Run the example:**
```bash
npx tsx examples/blueprint-snapshot-example.ts
```

**Example workflow:**
```typescript
// Create a reusable blueprint
const blueprint = await Blueprint.create(client, {
  name: 'nodejs-dev',
  system_setup_commands: [
    'apt-get update',
    'apt-get install -y nodejs npm'
  ]
});

// Create devbox from blueprint
const devbox = await Devbox.create(client, {
  blueprint_id: blueprint.id
});

// Do some work
await devbox.exec('npm install express');

// Save state as snapshot
const snapshotView = await devbox.snapshotDisk('my-snapshot');
const snapshot = new Snapshot(client, snapshotView);

// Create new devbox from snapshot
const newDevbox = await Devbox.create(client, {
  snapshot_id: snapshot.id
});
```

### Storage Objects Interface

**File:** `storage-object-example.ts`

This example demonstrates the StorageObject class for storing and retrieving data objects (similar to S3).

**Features demonstrated:**
- Creating storage objects with `StorageObject.create()`
- Uploading content with `uploadContent()`
- Marking uploads complete with `complete()`
- Downloading content as text or binary with `downloadAsText()` / `downloadAsBuffer()`
- Listing and searching objects with `StorageObject.list()`
- Getting presigned download URLs with `getDownloadUrl()`
- Storing JSON data
- Integration example with devbox logs

**Run the example:**
```bash
npx tsx examples/storage-object-example.ts
```

**Example workflow:**
```typescript
// Create and upload a text file
const obj = await StorageObject.create(client, {
  name: 'data.txt',
  content_type: 'text',
  metadata: { project: 'demo' }
});

// Upload content
await obj.uploadContent('Hello, World!');
await obj.complete();

// Later: download the content
const content = await obj.downloadAsText();

// Or get a shareable download URL
const { download_url } = await obj.getDownloadUrl(3600); // Valid for 1 hour

// Clean up
await obj.delete();
```

## Key advantages of the object-oriented approach:

```typescript
// Object-oriented (new way)
const devbox = await Devbox.create(client, { name: 'my-devbox' });
await devbox.exec('echo "Hello"');
await devbox.file.write('test.txt', 'content');
const contents = await devbox.file.read('test.txt');
await devbox.shutdown();

// Traditional API (still supported)
const devboxData = await client.devboxes.createAndAwaitRunning({ name: 'my-devbox' });
await client.devboxes.executeAndAwaitCompletion(devboxData.id, { command: 'echo "Hello"' });
await client.devboxes.writeFileContents(devboxData.id, { file_path: 'test.txt', contents: 'content' });
const contents = await client.devboxes.readFileContents(devboxData.id, { file_path: 'test.txt' });
await client.devboxes.shutdown(devboxData.id);
```

## Common Patterns

### Creating and Using a Devbox

```typescript
import { Runloop, Devbox } from '@runloop/api-client';

const client = new Runloop();

// Create devbox (automatically waits for running state)
const devbox = await Devbox.create(client, {
  name: 'my-devbox',
  metadata: { project: 'example' }
});

// Execute commands
const result = await devbox.exec('npm install');
console.log(result.stdout);

// Work with files
await devbox.file.write('config.json', JSON.stringify({ foo: 'bar' }));
const config = await devbox.file.read('config.json');

// Clean up
await devbox.shutdown();
```

### Loading an Existing Devbox

```typescript
// Load by ID
const devbox = await Devbox.get(client, 'devbox-id');

// Check status
console.log(devbox.status); // 'running', 'suspended', etc.

// Use it
await devbox.exec('ls -la');
```

### Using Persistent Shells

```typescript
// Commands in the same shell maintain state
await devbox.exec('cd /tmp', 'my-shell');
await devbox.exec('export FOO=bar', 'my-shell');
const result = await devbox.exec('echo $FOO && pwd', 'my-shell');
// Output: bar\n/tmp
```

### Working with Blueprints

```typescript
import { Runloop, Blueprint, Devbox } from '@runloop/api-client';

const client = new Runloop();

// Create a blueprint
const blueprint = await Blueprint.create(client, {
  name: 'python-ml',
  system_setup_commands: [
    'apt-get update',
    'apt-get install -y python3-pip',
    'pip3 install numpy pandas scikit-learn'
  ]
});

// Create devbox from blueprint (much faster than installing each time!)
const devbox = await Devbox.create(client, {
  blueprint_id: blueprint.id
});

// Get build logs if needed
const logs = await blueprint.logs();
```

### Working with Snapshots

```typescript
import { Runloop, Devbox, Snapshot } from '@runloop/api-client';

const client = new Runloop();

// Create and configure a devbox
const devbox = await Devbox.create(client, { name: 'my-project' });
await devbox.exec('git clone https://github.com/user/repo.git');
await devbox.exec('cd repo && npm install');

// Save the state
const snapshotView = await devbox.snapshotDisk('configured-env');
const snapshot = new Snapshot(client, snapshotView);

// Later: restore from snapshot
const restoredDevbox = await Devbox.create(client, {
  snapshot_id: snapshot.id
});
// All your files and setup are already there!

// Update snapshot metadata
await snapshot.update({
  metadata: { version: '2.0', updated: new Date().toISOString() }
});

// List snapshots for a devbox
const snapshots = await Snapshot.list(client, { devboxId: devbox.id });
```

### Working with Storage Objects

```typescript
import { Runloop, StorageObject } from '@runloop/api-client';

const client = new Runloop();

// Store text data
const textObj = await StorageObject.create(client, {
  name: 'config.json',
  content_type: 'text',
  metadata: { version: '1.0' }
});

await textObj.uploadContent(JSON.stringify({ foo: 'bar' }));
await textObj.complete();

// Later: retrieve the data
const content = await textObj.downloadAsText();
const config = JSON.parse(content);

// Store binary data
const binaryObj = await StorageObject.create(client, {
  name: 'data.bin',
  content_type: 'binary'
});

const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
await binaryObj.uploadContent(buffer);
await binaryObj.complete();

// Download as buffer
const downloaded = await binaryObj.downloadAsBuffer();

// List objects
const allObjects = await StorageObject.list(client);
const textObjects = await StorageObject.list(client, { content_type: 'text' });

// Search objects
const results = await StorageObject.list(client, { search: 'config' });
```

## Need Help?

- [API Documentation](https://docs.runloop.ai)
- [GitHub Repository](https://github.com/runloopai/api-client-ts)
