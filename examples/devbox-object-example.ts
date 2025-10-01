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

  console.log('Creating a new devbox...');

  // Create a devbox (automatically waits for it to be running)
  const devbox = await Devbox.create(client, {
    name: 'example-devbox',
    metadata: {
      purpose: 'demo',
      example: 'devbox-object',
    },
  });

  console.log(`✓ Devbox created with ID: ${devbox.id}`);
  console.log(`  Status: ${devbox.status}`);

  try {
    // Execute a command and wait for completion
    console.log('\nExecuting command: echo "Hello from Devbox!"');
    const result = await devbox.exec('echo "Hello from Devbox!"');
    console.log(`✓ Command completed with exit status: ${result.exit_status}`);
    console.log(`  Output: ${result.stdout?.trim()}`);

    // Write a file to the devbox
    console.log('\nWriting a file...');
    await devbox.file.write('greeting.txt', 'Hello, World!\nThis is a test file.\n');
    console.log('✓ File written: greeting.txt');

    // Read the file back
    console.log('\nReading the file back...');
    const contents = await devbox.file.read('greeting.txt');
    console.log(`✓ File contents:\n${contents}`);

    // Execute a more complex command using the persistent shell
    console.log('\nExecuting commands in a persistent shell...');
    await devbox.exec('cd /tmp', 'my-shell');
    const pwdResult = await devbox.exec('pwd', 'my-shell');
    console.log(`✓ Working directory: ${pwdResult.stdout?.trim()}`);

    // Create a Python script and execute it
    console.log('\nCreating and executing a Python script...');
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
    console.log(`✓ Python script output:\n${pythonResult.stdout}`);

    // List files in the home directory
    console.log('\nListing files in home directory...');
    const lsResult = await devbox.exec('ls -la');
    console.log(`✓ Files:\n${lsResult.stdout}`);

    // Demonstrate async execution (fire and forget, then check status)
    console.log('\nDemonstrating async execution...');
    const asyncExec = await devbox.execAsync('sleep 2 && echo "Async completed"');
    console.log(`✓ Async command started with execution_id: ${asyncExec.execution_id}`);
    console.log(`  Initial status: ${asyncExec.status}`);

    // You can retrieve the execution status later using the devboxes API
    // For demonstration, we'll wait a bit and check
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log('✓ Async command should be completed now');

    // Create a snapshot of the devbox
    console.log('\nCreating a disk snapshot...');
    const snapshot = await devbox.snapshotDisk('example-snapshot', {
      created_by: 'example-script',
      timestamp: new Date().toISOString(),
    });
    console.log(`✓ Snapshot created with ID: ${snapshot.id}`);

    // Refresh devbox data from API
    console.log('\nRefreshing devbox data...');
    await devbox.refresh();
    console.log(`✓ Devbox data refreshed. Current status: ${devbox.status}`);

    // Access the underlying data
    console.log('\nDevbox details:');
    console.log(`  Name: ${devbox.data.name}`);
    console.log(`  Created: ${new Date(devbox.data.create_time_ms).toISOString()}`);
    console.log(`  Capabilities: ${devbox.data.capabilities.join(', ')}`);
  } finally {
    // Always shutdown the devbox to avoid charges
    console.log('\nShutting down devbox...');
    await devbox.shutdown();
    console.log(`✓ Devbox shutdown complete. Final status: ${devbox.status}`);
  }

  // You can also load an existing devbox by ID
  console.log('\n--- Loading existing devbox by ID ---');
  const existingDevbox = await Devbox.get(client, devbox.id);
  console.log(`✓ Loaded devbox: ${existingDevbox.id}`);
  console.log(`  Status: ${existingDevbox.status}`);
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

  console.log(`Created devbox: ${devboxData.id}`);

  // Each operation requires the devbox ID
  const execResult = await client.devboxes.executeAndAwaitCompletion(devboxData.id, {
    command: 'echo "Hello"',
  });
  console.log(`Output: ${execResult.stdout}`);

  await client.devboxes.writeFileContents(devboxData.id, {
    file_path: 'test.txt',
    contents: 'Hello',
  });

  const contents = await client.devboxes.readFileContents(devboxData.id, {
    file_path: 'test.txt',
  });
  console.log(`File contents: ${contents}`);

  await client.devboxes.shutdown(devboxData.id);
  console.log('Devbox shutdown');

  console.log('\n✓ See how the object-oriented approach is cleaner and more intuitive!');
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
