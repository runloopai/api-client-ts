# Object-Oriented SDK Smoke Tests

This directory contains comprehensive smoke tests for the object-oriented RunloopSDK API. These tests verify that all the SDK methods work correctly in real environments.

## Test Files

### `sdk.test.ts`

- SDK initialization and basic functionality
- Access to legacy API through `sdk.api`
- Resource availability verification

### `devbox.test.ts`

- Devbox lifecycle (create, get info, shutdown)
- Command execution (synchronous and asynchronous)
- File operations (read, write)
- Devbox listing and retrieval by ID

### `blueprint.test.ts`

- Blueprint lifecycle (create, get info, delete)
- Blueprint logs retrieval
- Creating devboxes from blueprints
- Blueprint listing and retrieval by ID

### `snapshot.test.ts`

- Snapshot creation from devboxes
- Snapshot operations (get info, update, delete)
- Status querying and completion waiting
- Creating devboxes from snapshots
- Snapshot listing and retrieval by ID

### `storage-object.test.ts`

- Storage object lifecycle (create, upload, download, delete)
- Static upload methods (`uploadFromText`, `uploadFromBuffer`)
- Storage object listing and retrieval by ID
- Mounting storage objects to devboxes
- Accessing mounted content in devboxes

### `execution.test.ts`

- Asynchronous command execution
- Execution status checking
- Result retrieval and completion waiting
- Stdin interaction with running processes
- Error handling for failed executions

### `integration.test.ts`

- Complete workflow scenarios
- Blueprint → Devbox → Snapshot → Storage object workflows
- Different content types (text, binary)
- Complex devbox operations with multiple files and commands

## Running the Tests

```bash
# Run all object-oriented smoke tests
npm test -- tests/smoketests/object-oriented/

# Run specific test file
npm test -- tests/smoketests/object-oriented/devbox.test.ts

# Run with verbose output
npm test -- tests/smoketests/object-oriented/ --verbose
```

## Environment Variables

These tests require the following environment variables:

- `RUNLOOP_API_KEY`: Your Runloop API key
- `RUNLOOP_BASE_URL`: The Runloop API base URL (optional, defaults to production)

## Test Structure

Each test file follows this pattern:

1. **Setup**: Create necessary resources (devboxes, blueprints, etc.)
2. **Test Operations**: Execute the SDK methods being tested
3. **Verification**: Assert that operations completed successfully
4. **Cleanup**: Delete created resources to avoid accumulation

## Timeouts

Tests use appropriate timeouts for different operations:

- **30 seconds**: For quick operations (create, read, delete)
- **2+ minutes**: For long-running operations (blueprint builds, devbox creation)

## Dependencies

Tests are designed to be independent where possible, but some integration tests may depend on previous steps to save time and resources.

## Resource Cleanup

All tests include proper cleanup to ensure resources are deleted after testing, preventing accumulation of test resources in your account.
