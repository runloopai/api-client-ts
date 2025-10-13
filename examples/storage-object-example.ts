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
  console.log('Creating text storage object...');
  const textObj = await StorageObject.create(client, {
    name: 'example-text.txt',
    content_type: 'text',
    metadata: {
      description: 'Example text file',
      author: 'demo',
    },
  });

  console.log(`✓ StorageObject created: ${textObj.id}`);
  console.log(`  Name: ${textObj.name}`);
  console.log(`  State: ${textObj.state}`);
  console.log(`  Upload URL available: ${textObj.uploadUrl ? 'Yes' : 'No'}`);

  // Upload content
  console.log('\nUploading content...');
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
  console.log('✓ Content uploaded');

  // Mark upload as complete
  console.log('\nMarking upload as complete...');
  await textObj.complete();
  await textObj.refresh();
  console.log(`✓ Upload completed. State: ${textObj.state}`);
  console.log(`  Size: ${textObj.sizeBytes} bytes`);

  // Download the content
  console.log('\nDownloading content...');
  const downloadedContent = await textObj.downloadAsText();
  console.log('✓ Content downloaded:');
  console.log(downloadedContent.split('\n').slice(0, 5).join('\n') + '...\n');

  // Clean up
  await textObj.delete();
  console.log('✓ StorageObject deleted\n');
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

  console.log('Creating binary storage object...');
  const binaryObj = await StorageObject.create(client, {
    name: 'example-binary.bin',
    content_type: 'binary',
    metadata: {
      format: 'custom',
      size: pngData.length.toString(),
    },
  });

  console.log(`✓ StorageObject created: ${binaryObj.id}`);

  // Upload binary content
  console.log('\nUploading binary content...');
  await binaryObj.uploadContent(pngData, 'application/octet-stream');
  await binaryObj.complete();
  await binaryObj.refresh();

  console.log(`✓ Binary data uploaded and completed`);
  console.log(`  Size: ${binaryObj.sizeBytes} bytes`);

  // Download as buffer
  console.log('\nDownloading as buffer...');
  const downloadedBuffer = await binaryObj.downloadAsBuffer();
  console.log(`✓ Downloaded ${downloadedBuffer.length} bytes`);
  console.log(
    `  First 10 bytes: ${Array.from(downloadedBuffer.slice(0, 10))
      .map((b) => `0x${b.toString(16).padStart(2, '0')}`)
      .join(', ')}`,
  );

  // Clean up
  await binaryObj.delete();
  console.log('✓ StorageObject deleted\n');
}

async function listAndSearchExample() {
  const client = new Runloop({
    bearerToken: process.env.RUNLOOP_API_KEY,
  });

  console.log('=== List and Search Example ===\n');

  // Create a few objects
  console.log('Creating multiple objects...');
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
    console.log(`✓ Created: ${obj.name}`);
  }

  // List all objects
  console.log('\nListing all objects...');
  const allStorageObjects = await StorageObject.list(client);
  console.log(`✓ Found ${allStorageObjects.length} object(s) in total`);

  // List with filter
  console.log('\nListing text objects only...');
  const textStorageObjects = await StorageObject.list(client, { content_type: 'text' });
  console.log(`✓ Found ${textStorageObjects.length} text object(s)`);

  // Search by name
  console.log('\nSearching for "demo-file"...');
  const searchResults = await StorageObject.list(client, { search: 'demo-file' });
  console.log(`✓ Found ${searchResults.length} matching object(s):`);
  for (const obj of searchResults.slice(0, 5)) {
    console.log(`  - ${obj.name} (${obj.sizeBytes} bytes)`);
  }

  // Clean up
  console.log('\nCleaning up...');
  for (const obj of objects) {
    await obj.delete();
  }
  console.log('✓ All demo objects deleted\n');
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

  console.log('Creating JSON storage object...');
  const jsonObj = await StorageObject.create(client, {
    name: 'user-data.json',
    content_type: 'text',
    metadata: {
      type: 'json',
      schema_version: '1.0',
    },
  });

  console.log(`✓ StorageObject created: ${jsonObj.id}`);

  // Store JSON data
  console.log('\nStoring JSON data...');
  await jsonObj.uploadContent(JSON.stringify(data, null, 2), 'application/json');
  await jsonObj.complete();

  console.log('✓ JSON data stored');

  // Retrieve and parse JSON
  console.log('\nRetrieving JSON data...');
  const retrievedContent = await jsonObj.downloadAsText();
  const retrievedData = JSON.parse(retrievedContent);

  console.log('✓ JSON data retrieved:');
  console.log(`  User: ${retrievedData.user.name} (${retrievedData.user.email})`);
  console.log(`  Theme: ${retrievedData.user.preferences.theme}`);
  console.log(`  Version: ${retrievedData.version}`);

  // Get download URL (for sharing)
  console.log('\nGenerating download URL...');
  const downloadInfo = await jsonObj.getDownloadUrl(3600); // Valid for 1 hour
  console.log('✓ Download URL generated (valid for 1 hour):');
  console.log(`  ${downloadInfo.download_url.substring(0, 80)}...`);

  // Clean up
  await jsonObj.delete();
  console.log('✓ StorageObject deleted\n');
}

async function integrationExample() {
  const client = new Runloop({
    bearerToken: process.env.RUNLOOP_API_KEY,
  });

  console.log('=== Integration: Storing Devbox Logs ===\n');

  // This example doesn't actually create a devbox to keep it fast,
  // but shows how you might store devbox execution logs

  console.log('Simulating devbox execution logs...');
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

  console.log('Storing execution logs...');
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

  console.log(`✓ Execution logs stored: ${logsObj.id}`);
  console.log(`  Name: ${logsObj.name}`);
  console.log(`  Size: ${logsObj.sizeBytes} bytes`);

  // Later: retrieve and analyze logs
  console.log('\nRetrieving logs for analysis...');
  const retrievedLogs = JSON.parse(await logsObj.downloadAsText());
  console.log('✓ Logs retrieved:');
  console.log(`  Command: ${retrievedLogs.command}`);
  console.log(`  Exit code: ${retrievedLogs.exit_code}`);
  console.log(`  Duration: ${retrievedLogs.duration_ms}ms`);

  // Clean up
  await logsObj.delete();
  console.log('✓ Logs deleted\n');
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
