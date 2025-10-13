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
  const preview = await Blueprint.preview(client, {
    name: 'nodejs-dev',
    system_setup_commands: [
      'curl -fsSL https://deb.nodesource.com/setup_20.x | bash -',
      'apt-get install -y nodejs',
      'npm install -g typescript ts-node',
    ],
  });
  console.log('✓ Blueprint preview generated');

  // Create a custom blueprint
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

  console.log(`✓ Blueprint created: ${blueprint.name}`);

  // Get build logs
  const logs = await blueprint.logs();
  console.log(`✓ Build completed with ${logs.logs.length} log entries`);

  // Create a devbox from the blueprint
  const devbox = await Devbox.create(client, {
    blueprint_id: blueprint.id,
    name: 'nodejs-devbox-from-blueprint',
  });

  try {
    // Verify Node.js is installed
    const nodeVersion = await devbox.exec('node --version');
    const npmVersion = await devbox.exec('npm --version');
    console.log(`✓ Devbox created and verified (Node: ${nodeVersion.stdout?.trim()}, npm: ${npmVersion.stdout?.trim()})`);
  } finally {
    await devbox.shutdown();
  }

  // Clean up
  await blueprint.delete();
  console.log('✓ Blueprint example completed\n');
}

async function snapshotExample() {
  const client = new Runloop({
    bearerToken: process.env.RUNLOOP_API_KEY,
  });

  console.log('=== Snapshot Example ===\n');

  // Create a devbox and set it up
  const devbox = await Devbox.create(client, {
    name: 'snapshot-example-devbox',
  });

  try {
    // Set up some state
    await devbox.exec('mkdir -p ~/myproject');
    await devbox.file.write('myproject/README.md', '# My Project\n\nThis is a test project.');
    await devbox.file.write('myproject/config.json', JSON.stringify({ version: '1.0', env: 'dev' }, null, 2));
    await devbox.exec('cd ~/myproject && git init', 'setup-shell');
    console.log('✓ Devbox created and project files set up');

    // Create a snapshot
    const snapshotView = await devbox.snapshotDisk('my-project-snapshot', {
      project: 'myproject',
      version: '1.0',
      timestamp: new Date().toISOString(),
    });

    // Wrap in Snapshot object for easier manipulation
    const snapshot = new Snapshot(client, snapshotView);
    console.log(`✓ Snapshot created: ${snapshot.name}`);

    // Update snapshot metadata
    await snapshot.update({
      metadata: {
        ...snapshot.metadata,
        updated: 'true',
        description: 'Project snapshot with initial setup',
      },
    });

    // List all snapshots
    const allSnapshots = await Snapshot.list(client);
    console.log(`✓ Snapshot metadata updated, found ${allSnapshots.length} total snapshots`);

    // Create a new devbox from the snapshot
    const newDevbox = await Devbox.create(client, {
      snapshot_id: snapshot.id,
      name: 'restored-from-snapshot',
    });

    // Verify the files are there
    const readme = await newDevbox.file.read('myproject/README.md');
    const config = await newDevbox.file.read('myproject/config.json');
    console.log(`✓ New devbox created from snapshot and files verified`);

    // Clean up
    await newDevbox.shutdown();
    await snapshot.delete();
  } finally {
    await devbox.shutdown();
    console.log('✓ Snapshot example completed\n');
  }
}

async function fullWorkflowExample() {
  const client = new Runloop({
    bearerToken: process.env.RUNLOOP_API_KEY,
  });

  console.log('=== Full Workflow: Blueprint → Devbox → Snapshot → New Devbox ===\n');

  // Step 1: Create a blueprint with Python environment
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
  console.log(`✓ Python ML blueprint created`);

  // Step 2: Create devbox from blueprint
  const devbox = await Devbox.create(client, {
    blueprint_id: blueprint.id,
    name: 'ml-workspace',
  });
  console.log(`✓ Devbox created from blueprint`);

  try {
    // Step 3: Do some work in the devbox
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
    console.log(`✓ ML script created and executed`);

    // Step 4: Create snapshot of the configured environment
    const snapshotView = await devbox.snapshotDisk('ml-workspace-snapshot', {
      blueprint_id: blueprint.id,
      ready_for_training: 'true',
    });
    const snapshot = new Snapshot(client, snapshotView);
    console.log(`✓ Snapshot created`);

    // Step 5: Create new devbox from snapshot
    const newDevbox = await Devbox.create(client, {
      snapshot_id: snapshot.id,
      name: 'ml-workspace-restored',
    });

    // Verify everything is there
    const verifyResult = await newDevbox.exec('python3 train.py');
    console.log(`✓ Fresh devbox created from snapshot and ML script verified`);

    // Clean up
    await newDevbox.shutdown();
    await snapshot.delete();
  } finally {
    await devbox.shutdown();
    await blueprint.delete();
    console.log('✓ Full workflow example completed\n');
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
