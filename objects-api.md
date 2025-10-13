# Objects API Reference

The Runloop Objects API provides a high-level, object-oriented interface for working with Runloop resources. This API offers a more intuitive and convenient way to interact with devboxes, blueprints, snapshots, and storage objects compared to the traditional resource-based API.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Devbox](#devbox)
- [Blueprint](#blueprint)
- [Snapshot](#snapshot)
- [StorageObject](#storageobject)
- [Advanced Patterns](#advanced-patterns)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)
- [Troubleshooting](#troubleshooting)

## Overview

The Objects API provides four main classes:

- **`Devbox`** - Manage cloud development environments
- **`Blueprint`** - Create reusable environment templates
- **`Snapshot`** - Save and restore environment state
- **`StorageObject`** - Store and retrieve arbitrary data

Each object class encapsulates the underlying API calls and provides a clean, stateful interface for working with resources.

### Key Benefits

- **Stateful**: Objects maintain their state and can be refreshed from the API
- **Intuitive**: Method names and patterns follow common object-oriented conventions
- **Convenient**: Complex operations are simplified into single method calls
- **Type-safe**: Full TypeScript support with comprehensive type definitions
- **Consistent**: All objects follow the same patterns for creation, retrieval, and manipulation

## Getting Started

```typescript
import { Runloop, Devbox, Blueprint, Snapshot, StorageObject } from '@runloop/api-client';

const client = new Runloop({
  bearerToken: process.env.RUNLOOP_API_KEY,
});

// Create a devbox using the object-oriented API
const devbox = await Devbox.create(client, {
  name: 'my-development-environment',
});

// Execute commands
const result = await devbox.exec('echo "Hello, World!"');
console.log(result.stdout); // "Hello, World!"

// Clean up
await devbox.shutdown();
```

## Devbox

The `Devbox` class provides a complete interface for managing cloud development environments.

### Creation and Retrieval

```typescript
// Create a new devbox (waits for running state)
const devbox = await Devbox.create(client, {
  name: 'my-devbox',
  metadata: { project: 'example' },
});

// Load an existing devbox
const existingDevbox = await Devbox.get(client, 'devbox-id');

// Create with custom configuration
const customDevbox = await Devbox.create(client, {
  name: 'custom-env',
  blueprint_id: 'blueprint-123',
  launch_parameters: {
    resource_size_request: 'LARGE',
  },
});
```

### Command Execution

```typescript
// Execute a command and wait for completion
const result = await devbox.exec('npm install');
console.log(`Exit code: ${result.exit_status}`);
console.log(`Output: ${result.stdout}`);

// Use persistent shells to maintain state
await devbox.exec('cd /project', 'main-shell');
await devbox.exec('export NODE_ENV=production', 'main-shell');
const env = await devbox.exec('echo $NODE_ENV && pwd', 'main-shell');
// Output: production\n/project

// Execute asynchronously (don't wait for completion)
const asyncExecution = await devbox.execAsync('sleep 60');
console.log(`Execution ID: ${asyncExecution.execution_id}`);
```

### File Operations

```typescript
// Write text files
await devbox.file.write(
  'config.json',
  JSON.stringify({
    database: { host: 'localhost', port: 5432 },
  }),
);

// Read text files
const config = await devbox.file.read('config.json');
const parsedConfig = JSON.parse(config);

// Upload binary files
const imageBuffer = await fs.readFile('logo.png');
await devbox.file.upload('assets/logo.png', imageBuffer);

// Download files (supports binary)
const response = await devbox.file.download('assets/logo.png');
const downloadedBuffer = await response.arrayBuffer();
```

### Lifecycle Management

```typescript
// Suspend devbox (saves state and stops billing)
await devbox.suspend();

// Resume from suspended state
await devbox.resume();

// Keep devbox alive (prevent idle shutdown)
await devbox.keepAlive();

// Shutdown permanently
await devbox.shutdown();
```

### Snapshots and Networking

```typescript
// Create a disk snapshot
const snapshotView = await devbox.snapshotDisk('backup-v1', {
  version: '1.0',
  description: 'Pre-deployment backup',
});

// Create SSH access
const sshKey = await devbox.createSSHKey();
console.log(`SSH to: ${sshKey.url}`);

// Create port tunnels
const tunnel = await devbox.createTunnel(8080);
console.log(`Access app at: ${tunnel.url}`);

// Remove tunnel when done
await devbox.removeTunnel(8080);
```

### Properties and State

```typescript
console.log(`Devbox ID: ${devbox.id}`);
console.log(`Status: ${devbox.status}`); // 'running', 'suspended', etc.

// Refresh state from API
await devbox.refresh();

// Access complete data
console.log(devbox.data);

// Access underlying API for advanced operations
await devbox.api.executeSync(devbox.id, { command: 'whoami' });
```

## Blueprint

The `Blueprint` class manages reusable environment templates that can significantly speed up devbox creation.

### Creation and Management

```typescript
// Create a blueprint with system setup
const blueprint = await Blueprint.create(client, {
  name: 'nodejs-development',
  system_setup_commands: [
    'curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -',
    'sudo apt-get install -y nodejs',
    'npm install -g typescript ts-node',
  ],
  metadata: {
    language: 'nodejs',
    version: '18',
  },
});

// Create from Dockerfile
const dockerBlueprint = await Blueprint.create(client, {
  name: 'custom-environment',
  dockerfile: `
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y python3 python3-pip
RUN pip3 install numpy pandas matplotlib
WORKDIR /workspace
  `.trim(),
});

// Load existing blueprint
const existingBlueprint = await Blueprint.get(client, 'blueprint-id');
```

### Preview and Validation

```typescript
// Preview the generated Dockerfile before building
const preview = await Blueprint.preview(client, {
  name: 'preview-test',
  system_setup_commands: ['apt-get update', 'apt-get install -y git curl'],
});

console.log('Generated Dockerfile:');
console.log(preview.dockerfile);
```

### Build Monitoring

```typescript
// Get build logs
const logs = await blueprint.logs();
logs.logs.forEach((log) => {
  console.log(`[${log.level}] ${log.message}`);
});

// Check build status
console.log(`Build status: ${blueprint.status}`); // 'build_complete', 'build_failed', etc.
console.log(`Blueprint state: ${blueprint.state}`); // 'created', 'deleted'
```

### Using Blueprints

```typescript
// Create devbox from blueprint (much faster than installing packages each time)
const devbox = await Devbox.create(client, {
  name: 'from-blueprint',
  blueprint_id: blueprint.id,
});

// Blueprint is ready to use immediately
await devbox.exec('node --version'); // Already installed via blueprint
```

### Blueprint Cleanup

```typescript
// Delete blueprint when no longer needed
await blueprint.delete();
console.log(blueprint.state); // 'deleted'
```

## Snapshot

The `Snapshot` class manages disk snapshots for saving and restoring devbox state.

### Creating Snapshots

```typescript
// Create snapshot from devbox
const devbox = await Devbox.create(client, { name: 'work-env' });

// Do some work
await devbox.exec('git clone https://github.com/user/project.git');
await devbox.exec('cd project && npm install');

// Save state as snapshot
const snapshotView = await devbox.snapshotDisk('project-setup', {
  version: '1.0',
  project: 'my-project',
});

const snapshot = new Snapshot(client, snapshotView);
```

### Loading and Listing

```typescript
// Load existing snapshot
const snapshot = await Snapshot.get(client, 'snapshot-id');

// List all snapshots
const allSnapshots = await Snapshot.list(client);

// List snapshots for specific devbox
const devboxSnapshots = await Snapshot.list(client, {
  devboxId: 'devbox-123',
});

// Filter by metadata (if supported by API)
const v1Snapshots = await Snapshot.list(client, {
  metadata: { version: '1.0' },
});
```

### Snapshot Properties

```typescript
console.log(`Snapshot ID: ${snapshot.id}`);
console.log(`Name: ${snapshot.name}`);
console.log(`Source devbox: ${snapshot.sourceDevboxId}`);
console.log(`Created: ${new Date(snapshot.createTimeMs)}`);
console.log(`Metadata:`, snapshot.metadata);
```

### Restoring from Snapshots

```typescript
// Create new devbox from snapshot
const restoredDevbox = await Devbox.create(client, {
  name: 'restored-environment',
  snapshot_id: snapshot.id,
});

// All files and state from snapshot are immediately available
const files = await restoredDevbox.exec('ls -la project/');
```

### Updating and Cleanup

```typescript
// Update snapshot metadata
await snapshot.update({
  name: 'updated-snapshot-name',
  metadata: {
    version: '2.0',
    updated: new Date().toISOString(),
  },
});

// Delete snapshot
await snapshot.delete();
```

### Async Operations

```typescript
// Query status of async snapshot operations
const status = await snapshot.queryStatus();
console.log(`Snapshot status: ${status.status}`);
```

## StorageObject

The `StorageObject` class provides S3-like object storage for arbitrary data.

### Creating and Uploading

```typescript
// Create storage object
const textObj = await StorageObject.create(client, {
  name: 'config.json',
  content_type: 'text',
  metadata: {
    project: 'my-app',
    version: '1.0',
  },
});

// Upload text content
await textObj.uploadContent(
  JSON.stringify({
    database: { host: 'localhost', port: 5432 },
    redis: { host: 'localhost', port: 6379 },
  }),
);

// Mark upload complete (transitions to read-only)
await textObj.complete();
```

### Binary Data

```typescript
// Create binary object
const binaryObj = await StorageObject.create(client, {
  name: 'image.png',
  content_type: 'binary',
});

// Upload binary data
const imageBuffer = await fs.readFile('local-image.png');
await binaryObj.uploadContent(imageBuffer, 'image/png');
await binaryObj.complete();
```

### Downloading

```typescript
// Download as text
const configText = await textObj.downloadAsText();
const config = JSON.parse(configText);

// Download as buffer (for binary data)
const imageBuffer = await binaryObj.downloadAsBuffer();
await fs.writeFile('downloaded-image.png', imageBuffer);

// Get presigned download URL (for sharing)
const { download_url } = await textObj.getDownloadUrl(3600); // Valid for 1 hour
console.log(`Share this URL: ${download_url}`);
```

### Listing and Management

```typescript
// List all objects
const allObjects = await StorageObject.list(client);

// Filter by content type
const textObjects = await StorageObject.list(client, {
  content_type: 'text',
});

// Search by name
const configObjects = await StorageObject.list(client, {
  search: 'config',
});

// Load existing object
const existingObj = await StorageObject.get(client, 'object-id');
```

### Object Properties

```typescript
console.log(`Object ID: ${obj.id}`);
console.log(`Name: ${obj.name}`);
console.log(`Content type: ${obj.contentType}`);
console.log(`State: ${obj.state}`); // 'UPLOADING', 'READ_ONLY', 'DELETED'
console.log(`Size: ${obj.sizeBytes} bytes`);
console.log(`Upload URL: ${obj.uploadUrl}`); // Only available during upload
```

### Advanced Upload Patterns

```typescript
// Large file upload with custom logic
const largeObj = await StorageObject.create(client, {
  name: 'large-dataset.csv',
  content_type: 'text',
});

// Use the presigned URL directly for custom upload logic
const uploadUrl = largeObj.uploadUrl!;
const response = await fetch(uploadUrl, {
  method: 'PUT',
  body: largeFileStream,
  headers: {
    'Content-Type': 'text/csv',
    'Content-Length': fileSize.toString(),
  },
});

if (response.ok) {
  await largeObj.complete();
}
```

### Object Cleanup

```typescript
// Delete object (irreversible)
await obj.delete();
console.log(obj.state); // 'DELETED'
```

## Advanced Patterns

### Devbox + Blueprint Workflow

```typescript
// Create a reusable development environment
const blueprint = await Blueprint.create(client, {
  name: 'fullstack-dev',
  system_setup_commands: [
    'curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -',
    'sudo apt-get install -y nodejs postgresql-client',
    'npm install -g @nestjs/cli @angular/cli',
  ],
});

// Create multiple devboxes from the same blueprint
const frontendDevbox = await Devbox.create(client, {
  name: 'frontend-dev',
  blueprint_id: blueprint.id,
});

const backendDevbox = await Devbox.create(client, {
  name: 'backend-dev',
  blueprint_id: blueprint.id,
});

// Both devboxes have the same base setup, ready to use
await frontendDevbox.exec('ng new my-app');
await backendDevbox.exec('nest new my-api');
```

### Snapshot-Based Development

```typescript
// Set up base environment
const devbox = await Devbox.create(client, { name: 'project-base' });
await devbox.exec('git clone https://github.com/user/project.git');
await devbox.exec('cd project && npm install && npm run build');

// Create snapshot of configured environment
const baseSnapshot = new Snapshot(client, await devbox.snapshotDisk('project-base-v1'));

// Create feature branch environments from snapshot
const featureDevbox1 = await Devbox.create(client, {
  name: 'feature-auth',
  snapshot_id: baseSnapshot.id,
});

const featureDevbox2 = await Devbox.create(client, {
  name: 'feature-ui',
  snapshot_id: baseSnapshot.id,
});

// Each starts with the same base setup
await featureDevbox1.exec('cd project && git checkout -b feature/auth');
await featureDevbox2.exec('cd project && git checkout -b feature/new-ui');
```

### Data Pipeline with Storage Objects

```typescript
// Store configuration
const configObj = await StorageObject.create(client, {
  name: 'pipeline-config.json',
  content_type: 'text',
});

await configObj.uploadContent(
  JSON.stringify({
    input_bucket: 'raw-data',
    output_bucket: 'processed-data',
    batch_size: 1000,
  }),
);
await configObj.complete();

// Create processing environment
const processingDevbox = await Devbox.create(client, {
  name: 'data-processor',
});

// Download config in devbox
await processingDevbox.exec(`
  curl -o config.json "${(await configObj.getDownloadUrl()).download_url}"
`);

// Process data and store results
await processingDevbox.exec('python process_data.py --config config.json');

// Upload results
const resultsObj = await StorageObject.create(client, {
  name: 'processing-results.json',
  content_type: 'text',
});

const results = await processingDevbox.file.read('results.json');
await resultsObj.uploadContent(results);
await resultsObj.complete();
```

### Multi-Environment Testing

```typescript
// Create test environments for different Node.js versions
const nodeVersions = ['16', '18', '20'];
const testResults = [];

for (const version of nodeVersions) {
  const blueprint = await Blueprint.create(client, {
    name: `node-${version}-test`,
    system_setup_commands: [
      `curl -fsSL https://deb.nodesource.com/setup_${version}.x | sudo -E bash -`,
      'sudo apt-get install -y nodejs',
    ],
  });

  const testDevbox = await Devbox.create(client, {
    name: `test-node-${version}`,
    blueprint_id: blueprint.id,
  });

  // Run tests
  await testDevbox.exec('git clone https://github.com/user/project.git');
  const testResult = await testDevbox.exec('cd project && npm test');

  testResults.push({
    version,
    success: testResult.exit_status === 0,
    output: testResult.stdout,
  });

  // Cleanup
  await testDevbox.shutdown();
  await blueprint.delete();
}

console.log('Test Results:', testResults);
```

## Best Practices

### Resource Management

```typescript
// Always clean up resources
try {
  const devbox = await Devbox.create(client, { name: 'temp-work' });

  // Do work...
  await devbox.exec('some-command');
} finally {
  // Ensure cleanup happens even if errors occur
  if (devbox) {
    await devbox.shutdown();
  }
}

// Use try-with-resources pattern for multiple resources
async function withDevbox<T>(
  client: Runloop,
  params: DevboxCreateParams,
  fn: (devbox: Devbox) => Promise<T>,
): Promise<T> {
  const devbox = await Devbox.create(client, params);
  try {
    return await fn(devbox);
  } finally {
    await devbox.shutdown();
  }
}

// Usage
const result = await withDevbox(client, { name: 'temp' }, async (devbox) => {
  return await devbox.exec('echo "Hello World"');
});
```

### Exception Handling

```typescript
// Handle specific error types
try {
  const devbox = await Devbox.create(client, { name: 'test' });
} catch (error) {
  if (error instanceof Runloop.APIError) {
    console.log(`API Error: ${error.status} - ${error.message}`);
  } else if (error instanceof Runloop.APIConnectionError) {
    console.log('Network connection failed');
  } else {
    console.log('Unexpected error:', error);
  }
}

// Retry patterns
async function createDevboxWithRetry(
  client: Runloop,
  params: DevboxCreateParams,
  maxRetries = 3,
): Promise<Devbox> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await Devbox.create(client, params);
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      console.log(`Attempt ${i + 1} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Performance Optimization

```typescript
// Use blueprints for repeated setups
const blueprint = await Blueprint.create(client, {
  name: 'common-setup',
  system_setup_commands: [
    // Common setup commands
  ],
});

// Create multiple devboxes quickly
const devboxes = await Promise.all([
  Devbox.create(client, { name: 'worker-1', blueprint_id: blueprint.id }),
  Devbox.create(client, { name: 'worker-2', blueprint_id: blueprint.id }),
  Devbox.create(client, { name: 'worker-3', blueprint_id: blueprint.id }),
]);

// Use persistent shells for related commands
await devbox.exec('cd /project', 'build-shell');
await devbox.exec('export NODE_ENV=production', 'build-shell');
await devbox.exec('npm run build', 'build-shell');

// Batch file operations
const files = ['config.json', 'package.json', 'README.md'];
const contents = await Promise.all(files.map((file) => devbox.file.read(file)));
```

### State Management

```typescript
// Refresh object state when needed
const devbox = await Devbox.get(client, 'existing-id');

// Check if refresh is needed
if (Date.now() - lastRefresh > 30000) {
  // 30 seconds
  await devbox.refresh();
  lastRefresh = Date.now();
}

// Use snapshots for checkpoints
const devbox = await Devbox.create(client, { name: 'development' });

// Checkpoint 1: Base setup
await devbox.exec('git clone repo && cd repo && npm install');
const checkpoint1 = new Snapshot(client, await devbox.snapshotDisk('checkpoint-1'));

// Checkpoint 2: After feature work
await devbox.exec('cd repo && git checkout -b feature && npm run build');
const checkpoint2 = new Snapshot(client, await devbox.snapshotDisk('checkpoint-2'));

// Can restore to any checkpoint if needed
const restoredDevbox = await Devbox.create(client, {
  name: 'restored',
  snapshot_id: checkpoint1.id,
});
```

## Error Handling

### Common Error Scenarios

```typescript
// Handle devbox creation failures
try {
  const devbox = await Devbox.create(client, {
    name: 'test-devbox',
    blueprint_id: 'invalid-blueprint-id',
  });
} catch (error) {
  if (error instanceof Runloop.NotFoundError) {
    console.log('Blueprint not found, creating without blueprint');
    const devbox = await Devbox.create(client, { name: 'test-devbox' });
  }
}

// Handle command execution failures
const result = await devbox.exec('some-command-that-might-fail');
if (result.exit_status !== 0) {
  console.log('Command failed:');
  console.log('STDOUT:', result.stdout);
  console.log('STDERR:', result.stderr);

  // Take corrective action
  await devbox.exec('cleanup-command');
}

// Handle file operation errors
try {
  const content = await devbox.file.read('nonexistent-file.txt');
} catch (error) {
  console.log('File not found, creating default');
  await devbox.file.write('nonexistent-file.txt', 'default content');
}

// Handle storage object upload failures
const obj = await StorageObject.create(client, {
  name: 'test-file.txt',
  content_type: 'text',
});

try {
  await obj.uploadContent('test content');
  await obj.complete();
} catch (error) {
  console.log('Upload failed, cleaning up object');
  await obj.delete();
  throw error;
}
```

### Timeout and Polling Configuration

```typescript
// Configure polling for long-running operations
const devbox = await Devbox.create(
  client,
  {
    name: 'slow-setup',
  },
  {
    polling: {
      maxAttempts: 20, // Try up to 20 times
      intervalMs: 5000, // Wait 5 seconds between attempts
      timeoutMs: 300000, // Total timeout of 5 minutes
    },
  },
);

// Configure timeouts for individual requests
const result = await devbox.exec('long-running-command', undefined, {
  timeout: 60000, // 60 second timeout
});
```

## Troubleshooting

### Common Issues

#### Devbox Creation Hangs

```typescript
// Issue: Devbox.create() never resolves
// Solution: Check polling configuration and add timeout

const devbox = await Devbox.create(
  client,
  {
    name: 'test-devbox',
  },
  {
    polling: {
      maxAttempts: 10,
      intervalMs: 3000,
      timeoutMs: 120000, // 2 minute timeout
    },
  },
);
```

#### Command Execution Fails

```typescript
// Issue: Commands fail with permission errors
// Solution: Check user context and use sudo if needed

// Wrong: Assuming root access
await devbox.exec('apt-get install package');

// Right: Use sudo for system operations
await devbox.exec('sudo apt-get install package');

// Or: Switch to root shell
await devbox.exec('sudo su -', 'root-shell');
await devbox.exec('apt-get install package', 'root-shell');
```

#### File Operations Fail

```typescript
// Issue: File paths not found
// Solution: Use absolute paths or check working directory

// Check current directory
const pwd = await devbox.exec('pwd');
console.log('Current directory:', pwd.stdout.trim());

// Use absolute paths
await devbox.file.write('/home/user/config.json', content);

// Or change directory first
await devbox.exec('cd /project', 'main-shell');
await devbox.file.write('config.json', content); // Relative to /project
```

#### Storage Object Upload Issues

```typescript
// Issue: Upload fails silently
// Solution: Check object state and handle errors properly

const obj = await StorageObject.create(client, {
  name: 'test.txt',
  content_type: 'text',
});

// Check if upload URL is available
if (!obj.uploadUrl) {
  throw new Error('No upload URL available');
}

try {
  await obj.uploadContent('content');

  // Verify upload succeeded before completing
  await obj.refresh();
  if (obj.state !== 'UPLOADING') {
    throw new Error(`Unexpected state: ${obj.state}`);
  }

  await obj.complete();
} catch (error) {
  console.log('Upload failed:', error);
  await obj.delete(); // Clean up failed object
  throw error;
}
```

### Debugging Tips

```typescript
// Enable debug logging
process.env.DEBUG = 'true';

// Check object state
console.log('Devbox status:', devbox.status);
console.log('Devbox data:', JSON.stringify(devbox.data, null, 2));

// Use the underlying API for debugging
const rawResult = await devbox.api.retrieve(devbox.id);
console.log('Raw API response:', rawResult);

// Test connectivity
try {
  const devboxes = await client.devboxes.list();
  console.log('API connection OK, found', devboxes.length, 'devboxes');
} catch (error) {
  console.log('API connection failed:', error);
}
```

### Performance Monitoring

```typescript
// Monitor operation timing
const startTime = Date.now();
const devbox = await Devbox.create(client, { name: 'perf-test' });
console.log(`Devbox creation took ${Date.now() - startTime}ms`);

// Monitor command execution time
const execStart = Date.now();
const result = await devbox.exec('npm install');
console.log(`Command took ${Date.now() - execStart}ms`);
console.log(`Exit code: ${result.exit_status}`);

// Monitor resource usage
const stats = await devbox.exec('top -bn1 | head -5');
console.log('System stats:', stats.stdout);
```

---

For more examples and detailed API documentation, see:

- [Examples Directory](./examples/)
- [Main API Documentation](./api.md)
- [Contributing Guide](./CONTRIBUTING.md)
