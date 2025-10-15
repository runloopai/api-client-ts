# Object-Oriented API Examples

This directory contains examples demonstrating the new object-oriented API for the Runloop API client.

## Examples

### `quick-start.ts`

A comprehensive example showing the complete workflow:

1. Create a blueprint
2. Create a devbox from the blueprint
3. Execute commands and file operations
4. Create and use storage objects
5. Create snapshots
6. Lifecycle management

### `example-object-usage.ts`

Detailed examples for each object type:

- **Blueprint**: Creation, information retrieval, build logs
- **Devbox**: Command execution, file operations, lifecycle management
- **StorageObject**: File upload/download workflow
- **Snapshot**: Creation, restoration, metadata management

## API Changes Summary

```typescript
// New way - ID-only storage with getInfo()
const devbox = await Devbox.create({ name: 'test' });
const info = await devbox.getInfo(); // Fetch fresh data
console.log(info.status); // Access via getInfo()
await devbox.cmd.exec({ command: 'ls' }); // Organized under cmd object
await devbox.net.createTunnel({ port: 3000 }); // Organized under net object

// Create object by ID without API call
const existingDevbox = Devbox.fromId('devbox-123');
const devboxInfo = await existingDevbox.getInfo(); // Fetch when needed
```

## Running Examples

```bash
# Install dependencies
npm install

# Run quick start example
npx ts-node examples/quick-start.ts

# Run comprehensive example
npx ts-node examples/example-object-usage.ts
```

Make sure to set your `export RUNLOOP_API_KEY` API key in the examples before running them.
