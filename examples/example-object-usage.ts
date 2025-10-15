import { Runloop } from '../src/index';
import { Devbox } from '../src/objects/devbox';
import { Blueprint } from '../src/objects/blueprint';
import { Snapshot } from '../src/objects/snapshot';

async function main() {
  // Set up default client (recommended approach)
  Runloop.setDefaultClient(new Runloop());

  // === Blueprint Example ===
  // Create a blueprint with a Node.js Dockerfile (using default client)
  const blueprint = await Blueprint.create({
    name: 'my-nodejs-app',
    dockerfile: `
      FROM node:18
      WORKDIR /app
      COPY package*.json ./
      RUN npm install
      COPY . .
    `,
  });

  // Blueprint is now created with ID and status available
  // blueprint.id, blueprint.status, blueprint.name

  // Get build logs to check the build process
  const logs = await blueprint.logs();

  // === Devbox Example ===
  // Create a devbox from the blueprint (using default client)
  const devbox = await Devbox.create({
    name: 'my-dev-environment',
    blueprint_id: blueprint.id,
    metadata: { project: 'demo', environment: 'development' },
  });

  // Alternative: Create devbox with custom client and polling options
  const customClient = new Runloop({ bearerToken: 'custom-token' });
  const devboxWithCustomClient = await Devbox.create(
    { name: 'custom-devbox' },
    { client: customClient, polling: { maxAttempts: 10 } },
  );

  // Devbox is now running and ready to use
  // devbox.id, devbox.status, devbox.data

  // Execute commands on the devbox
  const result = await devbox.exec({ command: 'node --version' });
  // result.stdout contains the command output

  // File operations - write a file to the devbox
  await devbox.file.write({
    file_path: 'hello.js',
    contents: 'console.log("Hello from devbox!");',
  });

  // Read the file back
  const fileContent = await devbox.file.read({ file_path: 'hello.js' });
  // fileContent contains the file contents as a string

  // Execute the JavaScript file
  const output = await devbox.exec({ command: 'node hello.js' });
  // output.stdout contains "Hello from devbox!"

  // Create a tunnel to expose port 3000
  const tunnel = await devbox.createTunnel({ port: 3000 });
  // tunnel.url provides the public URL to access the service

  // === Snapshot Example ===
  // Create a snapshot of the current devbox state
  const snapshotData = await devbox.snapshotDisk({
    name: 'dev-checkpoint',
    metadata: { version: '1.0', stage: 'configured' },
  });

  // Create a Snapshot object to work with the snapshot
  const snapshot = new Snapshot(client, snapshotData);
  // snapshot.id, snapshot.name, snapshot.metadata are now available

  // Lifecycle management - suspend the devbox to save resources
  await devbox.suspend();
  // Devbox is now suspended and can be resumed later

  // Create a new devbox from the snapshot
  const restoredDevbox = await snapshot.createDevbox({
    name: 'restored-environment',
    metadata: { restored_from: snapshot.id, purpose: 'testing' },
  });

  // New devbox is created with the same state as when snapshot was taken

  // Verify the restored devbox has the same files
  const restoredContent = await restoredDevbox.file.read({ file_path: 'hello.js' });
  // restoredContent should contain the same file we created earlier

  // Cleanup resources using method chaining
  await restoredDevbox.shutdown();
  await devbox.resume().then((d) => d.shutdown());

  // All devboxes are now shut down and resources are cleaned up
}

// Run the example
main().catch(console.error);
