# Object-Oriented API Examples

This directory contains examples demonstrating the new object-oriented API for the Runloop API client.

## New API Features

The object-oriented API has been completely refactored with the following key features:

### 1. ID-Only Storage
- Objects store only their ID and client reference
- No direct property access (e.g., `devbox.status` is removed)
- Use `getInfo()` method to fetch fresh data from the API

### 2. Client-in-Options Pattern
- All methods use `options.client` instead of client as first parameter
- Consistent API across all object classes
- Default client support with `Runloop.getDefaultClient()`

### 3. fromId() Method for Object Creation
- Use `Object.fromId(id)` to create object instances without API calls
- No network requests until `getInfo()` is called
- Lazy loading pattern for better performance

### 4. Organized Method Structure
- **Command execution**: `devbox.cmd.exec()` and `devbox.cmd.execAsync()`
- **File operations**: `devbox.file.read()`, `devbox.file.write()`, etc.
- **Network operations**: `devbox.net.createTunnel()`, `devbox.net.createSSHKey()`, etc.
- **Lifecycle management**: `devbox.suspend()`, `devbox.resume()`, `devbox.shutdown()`

### 5. Property-Based ID Access
- Use `obj.id` instead of `obj.getId()`
- More intuitive and consistent with JavaScript patterns

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

### Before (Old API)
```typescript
// Old way - direct property access
const devbox = await Devbox.create(client, { name: 'test' });
console.log(devbox.status); // Direct property access
await devbox.exec({ command: 'ls' }); // Direct method call
```

### After (New API)
```typescript
// New way - ID-only storage with getInfo()
const devbox = await Devbox.create({ name: 'test' }, { client });
const info = await devbox.getInfo(); // Fetch fresh data
console.log(info.status); // Access via getInfo()
await devbox.cmd.exec({ command: 'ls' }); // Organized under cmd object
await devbox.net.createTunnel({ port: 3000 }); // Organized under net object

// Create object by ID without API call
const existingDevbox = Devbox.fromId('devbox-123', { client });
const devboxInfo = await existingDevbox.getInfo(); // Fetch when needed
```

## Key Benefits

1. **Better Performance**: Only store IDs, fetch data on demand
2. **Consistent API**: All methods follow the same pattern
3. **Organized Structure**: Related methods grouped together
4. **Type Safety**: Full TypeScript support with proper typing
5. **Intuitive Usage**: Property-based ID access and clear method organization

## Migration Guide

If you're migrating from the old API:

1. **Replace direct property access** with `getInfo()` calls
2. **Update method signatures** to use client-in-options pattern
3. **Use organized method structure** (`cmd.exec()` instead of `exec()`)
4. **Replace `getId()` calls** with `id` property access
5. **Use `byId()` method** instead of `get()` for object creation

## Running Examples

```bash
# Install dependencies
npm install

# Run quick start example
npx ts-node examples/quick-start.ts

# Run comprehensive example
npx ts-node examples/example-object-usage.ts
```

Make sure to set your API key in the examples before running them.