# Objects API Reference

The Runloop SDK provides a high-level, object-oriented interface for working with Runloop resources. This SDK offers a more intuitive and convenient way to interact with devboxes, blueprints, snapshots, and storage objects compared to the traditional resource-based API.

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

The Runloop SDK provides four main interfaces:

- **`sdk.devbox`** - Manage cloud development environments
- **`sdk.blueprint`** - Create reusable environment templates
- **`sdk.snapshot`** - Save and restore environment state
- **`sdk.storageObject`** - Store and retrieve arbitrary data

Each interface encapsulates the underlying API calls and provides a clean, stateful interface for working with resources.

### Key Benefits

- **Stateful**: Objects maintain their state and can be refreshed from the API
- **Intuitive**: Method names and patterns follow common object-oriented conventions
- **Convenient**: Complex operations are simplified into single method calls
- **Type-safe**: Full TypeScript support with comprehensive type definitions
- **Consistent**: All interfaces follow the same patterns for creation, retrieval, and manipulation

## Getting Started

```typescript
import { RunloopSDK } from '@runloop/api-client';

const sdk = new RunloopSDK({
  bearerToken: process.env.RUNLOOP_API_KEY,
});

// Create a devbox using the SDK
const devbox = await sdk.devbox.create({
  name: 'my-development-environment',
});

// Work with the devbox
await devbox.cmd.exec({ command: 'echo "Hello, World!"' });
await devbox.file.write({ file_path: 'test.txt', contents: 'Hello from Runloop!' });
const content = await devbox.file.read({ file_path: 'test.txt' });

// Clean up
await devbox.shutdown();
```

### SDK vs Traditional API

```typescript
// SDK approach (recommended)
const sdk = new RunloopSDK();
const devbox = await sdk.devbox.create({ name: 'my-devbox' });
await devbox.cmd.exec({ command: 'npm install' });

// Traditional API approach
const client = new Runloop();
const devboxView = await client.devboxes.create({ name: 'my-devbox' });
await client.devboxes.executeAndAwaitCompletion(devboxView.id, { command: 'npm install' });
```

## Devbox

The `sdk.devbox` interface provides methods for managing cloud development environments.

### Creating Devboxes

```typescript
// Basic devbox creation
const devbox = await sdk.devbox.create({
  name: 'my-devbox',
});

// Create from blueprint (faster startup)
const devbox = await sdk.devbox.create({
  name: 'my-devbox',
  blueprint_id: 'blueprint-123',
});

// Create with custom configuration
const devbox = await sdk.devbox.create({
  name: 'my-devbox',
  blueprint_id: 'blueprint-123',
  region: 'us-west-2',
  instance_type: 'gpu-1x-a10',
});
```

### Working with Devboxes

```typescript
// Get devbox by ID
const devbox = await sdk.devbox.fromId('devbox-123');

// Execute commands
const result = await devbox.cmd.exec({ command: 'ls -la' });
console.log(result.stdout);

// File operations
await devbox.file.write({ file_path: 'app.js', contents: 'console.log("Hello");' });
const content = await devbox.file.read({ file_path: 'app.js' });
await devbox.file.delete({ file_path: 'temp.txt' });

// Network operations
const tunnel = await devbox.net.createTunnel({ port: 3000 });
const sshKey = await devbox.net.createSSHKey();

// Lifecycle management
await devbox.suspend();
await devbox.awaitSuspended();
await devbox.resume();
await devbox.shutdown();
```

### Devbox State Management

```typescript
// Get current information
const info = await devbox.getInfo();
console.log(`Status: ${info.status}, ID: ${info.id}`);

// Refresh state
await devbox.refresh();

// Check if devbox is running
if (info.status === 'running') {
  await devbox.cmd.exec({ command: 'npm start' });
}
```

## Blueprint

The `sdk.blueprint` interface provides methods for creating and managing reusable environment templates.

### Creating Blueprints

```typescript
// Basic blueprint creation
const blueprint = await sdk.blueprint.create({
  name: 'nodejs-development',
  system_setup_commands: [
    'curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -',
    'sudo apt-get install -y nodejs',
  ],
});

// Dockerfile-based blueprint
const blueprint = await sdk.blueprint.create({
  name: 'docker-app',
  dockerfile: `
    FROM node:18
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    CMD ["npm", "start"]
  `,
});

// Blueprint with custom configuration
const blueprint = await sdk.blueprint.create({
  name: 'ml-environment',
  system_setup_commands: [
    'pip install torch tensorflow scikit-learn',
    'pip install jupyter notebook',
  ],
  instance_type: 'gpu-1x-a10',
  region: 'us-west-2',
});
```

### Working with Blueprints

```typescript
// Get blueprint by ID
const blueprint = await sdk.blueprint.fromId('blueprint-123');

// Get blueprint information
const info = await blueprint.getInfo();
console.log(`Name: ${info.name}, Status: ${info.status}`);

// Get build logs
const logs = await blueprint.logs();
console.log(logs);

// Create devbox from blueprint
const devbox = await blueprint.createDevbox({
  name: 'my-devbox',
});
```

### Blueprint Preview

```typescript
// Preview blueprint without creating
const preview = await sdk.blueprint.preview({
  name: 'preview-blueprint',
  system_setup_commands: ['apt-get update'],
});

console.log(`Preview ID: ${preview.id}`);
```

## Snapshot

The `sdk.snapshot` interface provides methods for saving and restoring environment state.

### Creating Snapshots

```typescript
// Create snapshot from devbox
const devbox = await sdk.devbox.fromId('devbox-123');
const snapshot = await devbox.snapshotDisk({ name: 'configured-state' });

// Create snapshot with description
const snapshot = await devbox.snapshotDisk({
  name: 'production-ready',
  description: 'Environment with all dependencies installed',
});
```

### Working with Snapshots

```typescript
// Get snapshot by ID
const snapshot = await sdk.snapshot.fromId('snapshot-123');

// Get snapshot information
const info = await snapshot.getInfo();
console.log(`Name: ${info.name}, Size: ${info.size}`);

// Create devbox from snapshot
const devbox = await snapshot.createDevbox({
  name: 'restored-devbox',
});

// List snapshots
const snapshots = await sdk.snapshot.list({
  devbox_id: 'devbox-123',
});
```

### Snapshot Management

```typescript
// Update snapshot metadata
await snapshot.update({
  name: 'updated-name',
  description: 'Updated description',
});

// Delete snapshot
await snapshot.delete();
```

## StorageObject

The `sdk.storageObject` interface provides methods for storing and retrieving arbitrary data.

### Creating Storage Objects

```typescript
// Create text object
const textObj = await sdk.storageObject.create({
  name: 'config.json',
  content_type: 'application/json',
  metadata: { type: 'configuration' },
});

// Create binary object
const binaryObj = await sdk.storageObject.create({
  name: 'data.bin',
  content_type: 'application/octet-stream',
  metadata: { type: 'binary-data' },
});
```

### Working with Storage Objects

```typescript
// Get object by ID
const obj = await sdk.storageObject.fromId('object-123');

// Get object information
const info = await obj.getInfo();
console.log(`Name: ${info.name}, Size: ${info.size}`);

// Upload data
await obj.upload('Hello, World!');

// Download data
const data = await obj.download();
console.log(data);

// List objects
const objects = await sdk.storageObject.list({
  limit: 10,
});
```

### File Upload/Download

```typescript
// Upload from file
const obj = await StorageObject.uploadFromFile(
  sdk.api,
  './package.json',
  'my-package.json',
  { metadata: { type: 'package-file' } }
);

// Upload from buffer
const buffer = Buffer.from('Hello, World!');
const obj = await StorageObject.uploadFromBuffer(
  sdk.api,
  buffer,
  'hello.txt',
  { content_type: 'text/plain' }
);

// Download to file
await obj.downloadToFile('./downloaded-file.txt');
```

## Advanced Patterns

### Parallel Operations

```typescript
// Create multiple devboxes in parallel
const [devbox1, devbox2, devbox3] = await Promise.all([
  sdk.devbox.create({ name: 'worker-1' }),
  sdk.devbox.create({ name: 'worker-2' }),
  sdk.devbox.create({ name: 'worker-3' }),
]);

// Execute commands in parallel
const [result1, result2] = await Promise.all([
  devbox1.cmd.exec({ command: 'npm install' }),
  devbox2.cmd.exec({ command: 'pip install -r requirements.txt' }),
]);
```

### Workflow Management

```typescript
// Complete development workflow
async function developmentWorkflow() {
  // 1. Create blueprint
  const blueprint = await sdk.blueprint.create({
    name: 'nodejs-app',
    system_setup_commands: ['npm install -g nodemon'],
  });

  // 2. Create devbox from blueprint
  const devbox = await sdk.devbox.create({
    name: 'my-app',
    blueprint_id: blueprint.id,
  });

  // 3. Set up project
  await devbox.file.write({
    file_path: 'package.json',
    contents: JSON.stringify({ name: 'my-app', version: '1.0.0' }),
  });
  await devbox.cmd.exec({ command: 'npm install express' });

  // 4. Create snapshot
  const snapshot = await devbox.snapshotDisk({ name: 'initial-setup' });

  // 5. Clean up
  await devbox.shutdown();

  return { blueprint, snapshot };
}
```

### Error Handling

The SDK automatically handles retries for transient failures, so you don't need to implement manual retry logic:

```typescript
// SDK automatically retries on transient failures
const devbox = await sdk.devbox.create({ name: 'my-devbox' });
// No need for manual retry logic - the SDK handles this automatically
```

## Best Practices

### Resource Management

```typescript
// Always clean up resources
async function useDevbox() {
  const devbox = await sdk.devbox.create({ name: 'temp-work' });
  try {
    // Do work
    await devbox.cmd.exec({ command: 'npm test' });
  } finally {
    // Always clean up
    await devbox.shutdown();
  }
}
```

### Blueprint Reuse

```typescript
// Create reusable blueprints for common setups
const nodeBlueprint = await sdk.blueprint.create({
  name: 'nodejs-base',
  system_setup_commands: [
    'curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -',
    'sudo apt-get install -y nodejs',
  ],
});

// Use blueprint for multiple devboxes
const devbox1 = await sdk.devbox.create({
  name: 'frontend',
  blueprint_id: nodeBlueprint.id,
});

const devbox2 = await sdk.devbox.create({
  name: 'backend',
  blueprint_id: nodeBlueprint.id,
});
```

### Snapshot Strategy

```typescript
// Create snapshots at key points
const devbox = await sdk.devbox.create({ name: 'project' });

// Initial setup
await devbox.cmd.exec({ command: 'npm install' });
const initialSnapshot = await devbox.snapshotDisk({ name: 'dependencies-installed' });

// After configuration
await devbox.file.write({ file_path: 'config.json', contents: '{}' });
const configuredSnapshot = await devbox.snapshotDisk({ name: 'configured' });

// After development
await devbox.cmd.exec({ command: 'npm run build' });
const productionSnapshot = await devbox.snapshotDisk({ name: 'production-ready' });
```

## Error Handling

### Common Error Patterns

```typescript
try {
  const devbox = await sdk.devbox.create({ name: 'my-devbox' });
} catch (error) {
  if (error.status === 400) {
    console.error('Invalid request:', error.message);
  } else if (error.status === 401) {
    console.error('Authentication failed:', error.message);
  } else if (error.status === 429) {
    console.error('Rate limit exceeded:', error.message);
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

### Automatic Retries

The SDK automatically retries failed requests with exponential backoff, so you don't need to implement manual retry logic:

```typescript
// SDK handles retries automatically
const devbox = await sdk.devbox.create({ name: 'my-devbox' });
// Transient failures are automatically retried with exponential backoff
```

## Troubleshooting

### Common Issues

#### Devbox Creation Fails

```typescript
// Check for common issues
try {
  const devbox = await sdk.devbox.create({ name: 'my-devbox' });
} catch (error) {
  console.error('Devbox creation failed:', error.message);
  
  // Check if name is already in use
  if (error.message.includes('already exists')) {
    console.log('Try a different name');
  }
  
  // Check if region is available
  if (error.message.includes('region')) {
    console.log('Try a different region');
  }
}
```

#### Command Execution Issues

```typescript
// Debug command execution
try {
  const result = await devbox.cmd.exec({ command: 'npm install' });
  console.log('Success:', result.stdout);
} catch (error) {
  console.error('Command failed:', error.message);
  console.error('Exit code:', error.exitCode);
  console.error('Stderr:', error.stderr);
}
```

#### File Operations

```typescript
// Check file operations
try {
  await devbox.file.write({ file_path: 'test.txt', contents: 'Hello' });
  const content = await devbox.file.read({ file_path: 'test.txt' });
  console.log('File content:', content);
} catch (error) {
  console.error('File operation failed:', error.message);
}
```

### Performance Optimization

```typescript
// Use blueprints for faster devbox creation
const blueprint = await sdk.blueprint.create({
  name: 'pre-configured',
  system_setup_commands: ['npm install -g nodemon'],
});

// Create devboxes from blueprint (much faster)
const devbox = await sdk.devbox.create({
  name: 'my-app',
  blueprint_id: blueprint.id,
});
```

### Debugging

```typescript
// Enable verbose logging
const sdk = new RunloopSDK({
  bearerToken: process.env.RUNLOOP_API_KEY,
  // Add debug options if available
});

// Check devbox status
const devbox = await sdk.devbox.fromId('devbox-123');
const info = await devbox.getInfo();
console.log('Devbox status:', info.status);
console.log('Devbox region:', info.region);
console.log('Devbox instance type:', info.instance_type);
```

This comprehensive guide covers all aspects of using the Runloop SDK with the new object-oriented interfaces. The SDK provides a clean, intuitive way to work with Runloop resources while maintaining full TypeScript support and error handling capabilities.