# SDK Client Refactoring Plan v2

## Overview

Create a new `RunloopSDK` client that lives alongside the existing `Runloop` client in `src/index.ts`, without modifying the existing client. The new SDK provides object-oriented interfaces that use the existing object classes' static methods.

## Key Changes

### 1. Create New `RunloopSDK` Client Class

**File: `src/sdk.ts`** (new file)

- Create new `RunloopSDK` class that:
  - Accepts same `ClientOptions` as current `Runloop`
  - Contains `.api` property that holds the current `Runloop` client
  - Provides lowercase properties: `.devbox`, `.blueprint`, `.snapshot`, `.storageObject`
  - Each object property provides methods: `create()`, `get()`, `list()`
  - These methods call the static methods on the existing object classes

### 2. Keep Existing `Runloop` Client Untouched

**File: `src/index.ts`**

- Leave the existing `Runloop` class completely unchanged
- Only add export for the new `RunloopSDK` from `./sdk`
- Keep all existing functionality intact for auto-generation compatibility

### 3. Update Object Classes (Minimal Changes)

**Files: `src/objects/*.ts`**

- Keep existing object classes mostly unchanged
- Only update static methods to accept `Runloop` client as first parameter
- Remove default client pattern:
  - Delete `setDefaultClient()`, `getDefaultClient()`, `hasDefaultClient()` static methods
  - Remove `_defaultClient` static property
  - Update static method signatures to require client as first parameter
- Keep all existing functionality intact

### 4. Create Object Interface Classes

**Files: `src/objects/*.ts`**

Add new interface classes that are instantiated on `RunloopSDK`:
- `Devboxes` with methods: `create()`, `get()`, `list()`
- `Blueprints` with methods: `create()`, `get()`, `list()`
- `Snapshots` with methods: `get()`, `list()`
- `StorageObjects` with methods: `create()`, `get()`, `list()`

Each interface class holds reference to the `Runloop` client and calls the static methods on the object classes.

### 5. Export Structure

**File: `src/index.ts`**

- Keep existing `Runloop` class and all exports unchanged
- Add: `export { RunloopSDK } from './sdk';`
- Add: `export default RunloopSDK;` (make SDK the default export)

**File: `src/sdk.ts`**

- Import `Runloop` from `./index`
- Import object classes from `./objects/*`
- Create `RunloopSDK` class with `.api` and object properties

### 6. Update Object Exports

**File: `src/objects/index.ts`**

- Add exports for new interface classes: `Devboxes`, `Blueprints`, `Snapshots`, `StorageObjects`

## Implementation Notes

- The existing `Runloop` class remains completely untouched for auto-generation compatibility
- The new `RunloopSDK` wraps the existing `Runloop` client
- Object classes are updated minimally - only to require client parameter
- Interface classes are thin wrappers that call existing static methods
- Maintains full backward compatibility

## Files to Modify

- `src/sdk.ts` - NEW FILE: Create RunloopSDK class with .api and object properties
- `src/index.ts` - Add export for RunloopSDK, make it default export
- `src/objects/devbox.ts` - Remove default client pattern, add Devboxes interface class
- `src/objects/blueprint.ts` - Remove default client pattern, add Blueprints interface class
- `src/objects/snapshot.ts` - Remove default client pattern, add Snapshots interface class
- `src/objects/storage-object.ts` - Remove default client pattern, add StorageObjects interface class
- `src/objects/index.ts` - Export new interface classes

## Usage Examples

```typescript
// NEW: Recommended approach
import { RunloopSDK } from '@runloop/api-client';

const sdk = new RunloopSDK({ bearerToken: 'your-token' });

// Object-oriented interface
const devbox = await sdk.devbox.create({ name: 'my-devbox' });
await devbox.exec({ command: 'echo "Hello"' });

// Direct API access when needed
const blueprintView = await sdk.api.blueprints.retrieve('blueprint-id');

// ============================================

// OLD: Still works unchanged
import { Runloop } from '@runloop/api-client';

const client = new Runloop({ bearerToken: 'your-token' });
const devboxView = await client.devboxes.create({ name: 'my-devbox' });

// ============================================

// OBJECT CLASSES: Still work with explicit client
import { Devbox } from '@runloop/api-client';

const client = new Runloop({ bearerToken: 'your-token' });
const devbox = await Devbox.create(client, { name: 'my-devbox' });
```

## To-dos

- [ ] Create `src/sdk.ts` with RunloopSDK class
- [ ] Update `src/index.ts` to export RunloopSDK as default
- [ ] Remove default client pattern from object classes (minimal changes)
- [ ] Add interface classes to object files
- [ ] Update object exports
- [ ] Test that existing Runloop client still works unchanged

