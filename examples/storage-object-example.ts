/**
 * Example: Using the StorageObject object-oriented interface
 *
 * This example demonstrates how to use the StorageObject class to store
 * and retrieve data objects (similar to S3).
 *
 * Run with:
 * npx tsx examples/storage-object-example.ts
 */

import { Runloop, StorageObject } from '@runloop/api-client';

async function textStorageObjectExample() {
  const client = new Runloop({
    bearerToken: process.env.RUNLOOP_API_KEY,
  });

  console.log('=== Text StorageObject Example ===\n');

  // Create a text storage object
  const textObj = await StorageObject.create(client, {
    name: 'example-text.txt',
    content_type: 'text',
    metadata: {
      description: 'Example text file',
      author: 'demo',
    },
  });

  console.log(`✓ StorageObject created: ${textObj.name}`);

  // Upload content
  const content = `# Example Text File

This is a demonstration of the StorageObject API.

Created at: ${new Date().toISOString()}

Features:
- Store text content
- Store binary content
- Metadata support
- Presigned URLs for upload/download
`;

  await textObj.uploadContent(content, 'text/plain');

  // Mark upload as complete
  await textObj.complete();
  await textObj.refresh();
  console.log(`✓ Upload completed. Size: ${textObj.sizeBytes} bytes`);

  // Download the content
  const downloadedContent = await textObj.downloadAsText();
  console.log('✓ Content downloaded and verified\n');

  // Clean up
  await textObj.delete();
}

async function binaryStorageObjectExample() {
  const client = new Runloop({
    bearerToken: process.env.RUNLOOP_API_KEY,
  });

  console.log('=== Binary StorageObject Example ===\n');

  // Create some binary data (a simple PNG pixel)
  const pngData = Buffer.from([
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a, // PNG signature
    // IHDR chunk
    0x00,
    0x00,
    0x00,
    0x0d,
    0x49,
    0x48,
    0x44,
    0x52,
    0x00,
    0x00,
    0x00,
    0x01,
    0x00,
    0x00,
    0x00,
    0x01,
    0x08,
    0x02,
    0x00,
    0x00,
    0x00,
  ]);

  const binaryObj = await StorageObject.create(client, {
    name: 'example-binary.bin',
    content_type: 'binary',
    metadata: {
      format: 'custom',
      size: pngData.length.toString(),
    },
  });

  // Upload binary content
  await binaryObj.uploadContent(pngData, 'application/octet-stream');
  await binaryObj.complete();
  await binaryObj.refresh();

  // Download as buffer
  const downloadedBuffer = await binaryObj.downloadAsBuffer();
  console.log(`✓ Binary object created, uploaded, and downloaded (${downloadedBuffer.length} bytes)\n`);

  // Clean up
  await binaryObj.delete();
}

async function listAndSearchExample() {
  const client = new Runloop({
    bearerToken: process.env.RUNLOOP_API_KEY,
  });

  console.log('=== List and Search Example ===\n');

  // Create a few objects
  const objects: StorageObject[] = [];

  for (let i = 1; i <= 3; i++) {
    const obj = await StorageObject.create(client, {
      name: `demo-file-${i}.txt`,
      content_type: 'text',
      metadata: {
        batch: 'demo',
        index: i.toString(),
      },
    });
    await obj.uploadContent(`This is demo file ${i}`);
    await obj.complete();
    objects.push(obj);
  }

  // List all objects
  const allStorageObjects = await StorageObject.list(client);
  
  // List with filter
  const textStorageObjects = await StorageObject.list(client, { content_type: 'text' });
  
  // Search by name
  const searchResults = await StorageObject.list(client, { search: 'demo-file' });
  console.log(`✓ Created 3 objects, listed ${allStorageObjects.length} total, ${textStorageObjects.length} text objects, ${searchResults.length} matching search\n`);

  // Clean up
  for (const obj of objects) {
    await obj.delete();
  }
}

async function jsonDataExample() {
  const client = new Runloop({
    bearerToken: process.env.RUNLOOP_API_KEY,
  });

  console.log('=== JSON Data Storage Example ===\n');

  // Create a JSON data object
  const data = {
    user: {
      name: 'Alice',
      email: 'alice@example.com',
      preferences: {
        theme: 'dark',
        notifications: true,
      },
    },
    created_at: new Date().toISOString(),
    version: 1,
  };

  const jsonObj = await StorageObject.create(client, {
    name: 'user-data.json',
    content_type: 'text',
    metadata: {
      type: 'json',
      schema_version: '1.0',
    },
  });

  // Store JSON data
  await jsonObj.uploadContent(JSON.stringify(data, null, 2), 'application/json');
  await jsonObj.complete();

  // Retrieve and parse JSON
  const retrievedContent = await jsonObj.downloadAsText();
  const retrievedData = JSON.parse(retrievedContent);

  // Get download URL (for sharing)
  const downloadInfo = await jsonObj.getDownloadUrl(3600); // Valid for 1 hour
  
  console.log(`✓ JSON object created, stored, retrieved, and download URL generated`);
  console.log(`  User: ${retrievedData.user.name} (${retrievedData.user.email})\n`);

  // Clean up
  await jsonObj.delete();
}

async function integrationExample() {
  const client = new Runloop({
    bearerToken: process.env.RUNLOOP_API_KEY,
  });

  console.log('=== Integration: Storing Devbox Logs ===\n');

  // This example doesn't actually create a devbox to keep it fast,
  // but shows how you might store devbox execution logs
  const executionLogs = {
    devbox_id: 'simulated-devbox-123',
    execution_id: 'exec-456',
    command: 'npm test',
    timestamp: new Date().toISOString(),
    stdout: 'Running tests...\nAll tests passed!\n',
    stderr: '',
    exit_code: 0,
    duration_ms: 1234,
  };

  const logsObj = await StorageObject.create(client, {
    name: `execution-logs-${Date.now()}.json`,
    content_type: 'text',
    metadata: {
      devbox_id: executionLogs.devbox_id,
      execution_id: executionLogs.execution_id,
      exit_code: executionLogs.exit_code.toString(),
    },
  });

  await logsObj.uploadContent(JSON.stringify(executionLogs, null, 2));
  await logsObj.complete();

  // Later: retrieve and analyze logs
  const retrievedLogs = JSON.parse(await logsObj.downloadAsText());
  console.log(`✓ Execution logs stored and retrieved: ${retrievedLogs.command} (exit: ${retrievedLogs.exit_code})\n`);

  // Clean up
  await logsObj.delete();
}

// Run examples
if (require.main === module) {
  (async () => {
    try {
      await textStorageObjectExample();
      await binaryStorageObjectExample();
      await listAndSearchExample();
      await jsonDataExample();
      await integrationExample();
      console.log('✓ All examples completed successfully!');
      process.exit(0);
    } catch (error: any) {
      console.error('\n✗ Error:', error.message);
      if (error.status) {
        console.error(`  Status: ${error.status}`);
      }
      if (error.error) {
        console.error(`  Details: ${JSON.stringify(error.error, null, 2)}`);
      }
      process.exit(1);
    }
  })();
}

export {
  textStorageObjectExample,
  binaryStorageObjectExample,
  listAndSearchExample,
  jsonDataExample,
  integrationExample,
};
