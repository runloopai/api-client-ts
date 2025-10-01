/**
 * Example: Using Blueprint and Snapshot object-oriented interfaces
 *
 * This example demonstrates how to use the Blueprint and Snapshot classes
 * to create reusable devbox configurations and snapshots.
 *
 * Run with:
 * npx tsx examples/blueprint-snapshot-example.ts
 */

import { Runloop, Blueprint, Devbox, Snapshot } from '@runloop/api-client';

async function blueprintExample() {
  const client = new Runloop({
    bearerToken: process.env.RUNLOOP_API_KEY,
  });

  console.log('=== Blueprint Example ===\n');

  // Preview a blueprint before building
  console.log('Previewing blueprint...');
  const preview = await Blueprint.preview(client, {
    name: 'nodejs-dev',
    system_setup_commands: [
      'curl -fsSL https://deb.nodesource.com/setup_20.x | bash -',
      'apt-get install -y nodejs',
      'npm install -g typescript ts-node',
    ],
  });
  console.log('✓ Preview generated Dockerfile:');
  console.log(preview.dockerfile.split('\n').slice(0, 5).join('\n') + '...\n');

  // Create a custom blueprint
  console.log('Creating custom Node.js blueprint...');
  const blueprint = await Blueprint.create(client, {
    name: 'nodejs-dev-example',
    system_setup_commands: [
      'curl -fsSL https://deb.nodesource.com/setup_20.x | bash -',
      'apt-get install -y nodejs',
      'npm install -g typescript ts-node',
    ],
    metadata: {
      purpose: 'nodejs-development',
      version: '1.0',
    },
  });

  console.log(`✓ Blueprint created: ${blueprint.id}`);
  console.log(`  Name: ${blueprint.name}`);
  console.log(`  Status: ${blueprint.status}`);

  // Get build logs
  console.log('\nFetching build logs...');
  const logs = await blueprint.logs();
  console.log(`✓ Build logs: ${logs.logs.length} log entries`);
  if (logs.logs.length > 0) {
    console.log(`  Last log: ${logs.logs[logs.logs.length - 1].message.substring(0, 100)}...`);
  }

  // Create a devbox from the blueprint
  console.log('\nCreating devbox from blueprint...');
  const devbox = await Devbox.create(client, {
    blueprint_id: blueprint.id,
    name: 'nodejs-devbox-from-blueprint',
  });

  console.log(`✓ Devbox created from blueprint: ${devbox.id}`);

  try {
    // Verify Node.js is installed
    const nodeVersion = await devbox.exec('node --version');
    console.log(`✓ Node.js version: ${nodeVersion.stdout?.trim()}`);

    const npmVersion = await devbox.exec('npm --version');
    console.log(`✓ npm version: ${npmVersion.stdout?.trim()}`);
  } finally {
    await devbox.shutdown();
    console.log('✓ Devbox shutdown');
  }

  // Clean up
  await blueprint.delete();
  console.log('✓ Blueprint deleted\n');
}

async function snapshotExample() {
  const client = new Runloop({
    bearerToken: process.env.RUNLOOP_API_KEY,
  });

  console.log('=== Snapshot Example ===\n');

  // Create a devbox and set it up
  console.log('Creating devbox...');
  const devbox = await Devbox.create(client, {
    name: 'snapshot-example-devbox',
  });

  console.log(`✓ Devbox created: ${devbox.id}`);

  try {
    // Set up some state
    console.log('\nSetting up devbox state...');
    await devbox.exec('mkdir -p ~/myproject');
    await devbox.file.write('myproject/README.md', '# My Project\n\nThis is a test project.');
    await devbox.file.write('myproject/config.json', JSON.stringify({ version: '1.0', env: 'dev' }, null, 2));
    await devbox.exec('cd ~/myproject && git init', 'setup-shell');
    console.log('✓ Project files created');

    // Create a snapshot
    console.log('\nCreating snapshot...');
    const snapshotView = await devbox.snapshotDisk('my-project-snapshot', {
      project: 'myproject',
      version: '1.0',
      timestamp: new Date().toISOString(),
    });

    // Wrap in Snapshot object for easier manipulation
    const snapshot = new Snapshot(client, snapshotView);
    console.log(`✓ Snapshot created: ${snapshot.id}`);
    console.log(`  Name: ${snapshot.name}`);
    console.log(`  Source Devbox: ${snapshot.sourceDevboxId}`);

    // Update snapshot metadata
    console.log('\nUpdating snapshot metadata...');
    await snapshot.update({
      metadata: {
        ...snapshot.metadata,
        updated: 'true',
        description: 'Project snapshot with initial setup',
      },
    });
    console.log('✓ Snapshot metadata updated');

    // List all snapshots
    console.log('\nListing all snapshots...');
    const allSnapshots = await Snapshot.list(client);
    console.log(`✓ Found ${allSnapshots.length} snapshot(s)`);

    // Create a new devbox from the snapshot
    console.log('\nCreating new devbox from snapshot...');
    const newDevbox = await Devbox.create(client, {
      snapshot_id: snapshot.id,
      name: 'restored-from-snapshot',
    });

    console.log(`✓ New devbox created from snapshot: ${newDevbox.id}`);

    // Verify the files are there
    const readme = await newDevbox.file.read('myproject/README.md');
    console.log(`✓ README.md restored:\n${readme}`);

    const config = await newDevbox.file.read('myproject/config.json');
    console.log(`✓ config.json restored:\n${config}`);

    // Clean up
    await newDevbox.shutdown();
    console.log('✓ New devbox shutdown');

    await snapshot.delete();
    console.log('✓ Snapshot deleted');
  } finally {
    await devbox.shutdown();
    console.log('✓ Original devbox shutdown\n');
  }
}

async function fullWorkflowExample() {
  const client = new Runloop({
    bearerToken: process.env.RUNLOOP_API_KEY,
  });

  console.log('=== Full Workflow: Blueprint → Devbox → Snapshot → New Devbox ===\n');

  // Step 1: Create a blueprint with Python environment
  console.log('Step 1: Creating Python blueprint...');
  const blueprint = await Blueprint.create(client, {
    name: 'python-ml-env',
    system_setup_commands: [
      'apt-get update',
      'apt-get install -y python3-pip python3-venv',
      'pip3 install numpy pandas scikit-learn jupyter',
    ],
    metadata: {
      purpose: 'machine-learning',
      language: 'python',
    },
  });
  console.log(`✓ Blueprint ready: ${blueprint.name} (${blueprint.id})`);

  // Step 2: Create devbox from blueprint
  console.log('\nStep 2: Creating devbox from blueprint...');
  const devbox = await Devbox.create(client, {
    blueprint_id: blueprint.id,
    name: 'ml-workspace',
  });
  console.log(`✓ Devbox created: ${devbox.id}`);

  try {
    // Step 3: Do some work in the devbox
    console.log('\nStep 3: Setting up ML project...');
    await devbox.file.write(
      'train.py',
      `import numpy as np
from sklearn.linear_model import LinearRegression

X = np.array([[1], [2], [3], [4]])
y = np.array([2, 4, 6, 8])

model = LinearRegression()
model.fit(X, y)

print(f"Coefficient: {model.coef_[0]}")
print(f"Intercept: {model.intercept_}")
`,
    );

    const result = await devbox.exec('python3 train.py');
    console.log(`✓ ML script executed:\n${result.stdout}`);

    // Step 4: Create snapshot of the configured environment
    console.log('\nStep 4: Creating snapshot...');
    const snapshotView = await devbox.snapshotDisk('ml-workspace-snapshot', {
      blueprint_id: blueprint.id,
      ready_for_training: 'true',
    });
    const snapshot = new Snapshot(client, snapshotView);
    console.log(`✓ Snapshot saved: ${snapshot.id}`);

    // Step 5: Create new devbox from snapshot
    console.log('\nStep 5: Creating fresh devbox from snapshot...');
    const newDevbox = await Devbox.create(client, {
      snapshot_id: snapshot.id,
      name: 'ml-workspace-restored',
    });
    console.log(`✓ Fresh devbox created: ${newDevbox.id}`);

    // Verify everything is there
    const verifyResult = await newDevbox.exec('python3 train.py');
    console.log(`✓ Verified ML script runs in restored devbox:\n${verifyResult.stdout}`);

    // Clean up
    await newDevbox.shutdown();
    await snapshot.delete();
    console.log('✓ Cleanup complete');
  } finally {
    await devbox.shutdown();
    await blueprint.delete();
    console.log('✓ All resources cleaned up\n');
  }
}

// Run examples
if (require.main === module) {
  (async () => {
    try {
      await blueprintExample();
      await snapshotExample();
      await fullWorkflowExample();
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

export { blueprintExample, snapshotExample, fullWorkflowExample };
