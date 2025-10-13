/**
 * Example: Using the Devbox object-oriented interface
 *
 * This example demonstrates how to use the Devbox class for a more
 * intuitive, object-oriented approach to working with devboxes.
 *
 * Run with:
 * npx tsx examples/devbox-object-example.ts
 */

import { Runloop, Devbox } from '@runloop/api-client';

async function main() {
  // Initialize the Runloop client
  const client = new Runloop({
    bearerToken: process.env.RUNLOOP_API_KEY,
  });

  // Create a devbox (automatically waits for it to be running)
  const devbox = await Devbox.create(client, {
    name: 'example-devbox',
    metadata: {
      purpose: 'demo',
      example: 'devbox-object',
    },
  });

  console.log(`✓ Devbox created: ${devbox.id}`);

  try {
    // Execute a command and wait for completion
    const result = await devbox.exec('echo "Hello from Devbox!"');
    console.log(`✓ Command executed: ${result.stdout?.trim()}`);

    // Write a file to the devbox
    await devbox.file.write('greeting.txt', 'Hello, World!\nThis is a test file.\n');

    // Read the file back
    const contents = await devbox.file.read('greeting.txt');
    console.log(`✓ File written and read back successfully`);

    // Execute a more complex command using the persistent shell
    await devbox.exec('cd /tmp', 'my-shell');
    const pwdResult = await devbox.exec('pwd', 'my-shell');
    console.log(`✓ Persistent shell working directory: ${pwdResult.stdout?.trim()}`);

    // Create a Python script and execute it
    const pythonScript = `
import sys
import json

data = {
    "message": "Hello from Python!",
    "python_version": sys.version.split()[0]
}

print(json.dumps(data, indent=2))
`;
    await devbox.file.write('script.py', pythonScript);
    const pythonResult = await devbox.exec('python3 script.py');
    console.log(`✓ Python script created and executed`);

    // List files in the home directory
    const lsResult = await devbox.exec('ls -la');
    console.log(`✓ Listed ${lsResult.stdout?.split('\n').length} files in home directory`);

    // Demonstrate async execution (fire and forget, then check status)
    const asyncExec = await devbox.execAsync('sleep 2 && echo "Async completed"');
    console.log(`✓ Async command started: ${asyncExec.execution_id}`);

    // You can retrieve the execution status later using the devboxes API
    // For demonstration, we'll wait a bit and check
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log('✓ Async command completed');

    // Create a snapshot of the devbox
    const snapshot = await devbox.snapshotDisk('example-snapshot', {
      created_by: 'example-script',
      timestamp: new Date().toISOString(),
    });
    console.log(`✓ Snapshot created: ${snapshot.id}`);

    // Refresh devbox data from API
    await devbox.refresh();
    console.log(`✓ Devbox data refreshed`);

    // Access the underlying data
    console.log(`✓ Devbox details: ${devbox.data.name}, created ${new Date(devbox.data.create_time_ms).toISOString()}`);
  } finally {
    // Always shutdown the devbox to avoid charges
    await devbox.shutdown();
    console.log(`✓ Devbox shutdown complete`);
  }

  // You can also load an existing devbox by ID
  const existingDevbox = await Devbox.get(client, devbox.id);
  console.log(`✓ Loaded existing devbox by ID: ${existingDevbox.status}`);
}

// Alternative example: Using the traditional API approach
async function traditionalApiExample() {
  const client = new Runloop({
    bearerToken: process.env.RUNLOOP_API_KEY,
  });

  console.log('\n=== Traditional API Approach (for comparison) ===\n');

  // Traditional approach requires passing the devbox ID to each method
  const devboxData = await client.devboxes.createAndAwaitRunning({
    name: 'traditional-example',
  });

  // Each operation requires the devbox ID
  const execResult = await client.devboxes.executeAndAwaitCompletion(devboxData.id, {
    command: 'echo "Hello"',
  });

  await client.devboxes.writeFileContents(devboxData.id, {
    file_path: 'test.txt',
    contents: 'Hello',
  });

  const contents = await client.devboxes.readFileContents(devboxData.id, {
    file_path: 'test.txt',
  });

  await client.devboxes.shutdown(devboxData.id);
  
  console.log('✓ Traditional API approach completed');
  console.log('✓ See how the object-oriented approach is cleaner and more intuitive!');
}

// Run the examples
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✓ Example completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Error:', error.message);
      if (error.status) {
        console.error(`  Status: ${error.status}`);
      }
      if (error.error) {
        console.error(`  Details: ${JSON.stringify(error.error, null, 2)}`);
      }
      process.exit(1);
    });
}

export { main, traditionalApiExample };
