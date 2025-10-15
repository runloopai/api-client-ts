import { Devbox } from '../src/objects/devbox';
import { Blueprint } from '../src/objects/blueprint';
import { StorageObject } from '../src/objects/storage-object';

async function main() {
  // Set the environment RUNLOOP_API_KEY variable with your API key
  // export RUNLOOP_API_KEY=apk_

  // === Blueprint Example ===
  // Create a blueprint with a Node.js Dockerfile (using default client)
  const blueprint = await Blueprint.create({
    name: 'my-nodejs-app',
    dockerfile: `
      FROM node:18
      RUN apt-get update && apt-get install -y ffmpeg
    `,
  });
  blueprint.createDevbox({});
  // Blueprint is now created and ready to use
  // Get blueprint information using getInfo()
  const blueprintInfo = await blueprint.getInfo();
  console.log(`Blueprint ${blueprintInfo.name} status: ${blueprintInfo.status}`);

  // Get build logs to check the build process
  const logs = await blueprint.logs();

  // === Devbox Example ===
  // Create a devbox from the blueprint (using default client)
  const devbox = await Devbox.create({
    name: 'my-dev-environment',
    blueprint_id: blueprint.id,
    metadata: { project: 'demo', environment: 'development' },
  });

  // Devbox is now running and ready to use
  // Get devbox information using getInfo()
  const devboxInfo = await devbox.getInfo();
  console.log(
    `Devbox ${devboxInfo.name} status: ${devboxInfo.status} metadata: ${JSON.stringify(devboxInfo.metadata)}`,
  );

  // Execute commands on the devbox
  const result = await devbox.cmd.exec({ command: 'node --version' });
  // result.stdout contains the command output

  // File operations - write a file to the devbox
  await devbox.file.write({
    file_path: 'hello.js',
    contents: 'console.log("Hello from devbox!");',
  });

  // Read the file back
  const helloFileContent = await devbox.file.read({ file_path: 'hello.js' });
  // helloFileContent contains the file contents as a string

  // Execute the JavaScript file
  const output = await devbox.cmd.exec({ command: 'node hello.js' });
  // output.stdout contains "Hello from devbox!"

  // Network operations - create a tunnel to expose port 3000
  const tunnel = await devbox.net.createTunnel({ port: 3000 });
  // tunnel.url provides the public URL to access the service
  console.log(`Tunnel created: ${tunnel.url}`);

  // Create SSH key for remote access
  const sshKey = await devbox.net.createSSHKey();
  console.log(`SSH key created: ${sshKey.url} ${sshKey.ssh_private_key} `);

  // Remove the tunnel when done
  await devbox.net.removeTunnel({ port: tunnel.port });

  // === StorageObject Example ===
  // Create a storage object for file upload
  const storageObject = await StorageObject.create({
    name: 'my-upload.txt',
    content_type: 'text',
    metadata: { project: 'demo' },
  });

  // Upload content to the object
  await storageObject.uploadContent('Hello, World!', 'text/plain');

  // Mark upload as complete
  await storageObject.complete();

  // Get download URL and download content
  const downloadUrl = await storageObject.getDownloadUrl();
  const content = await storageObject.downloadAsText();
  console.log('Downloaded content:', content);

  // === Storage Object - File Upload Example ===
  // Upload a file directly from filesystem (Node.js only)
  const fileStorageObject = await StorageObject.uploadFromFile('./package.json', 'uploaded-package.json', {
    metadata: { source: 'filesystem' },
  });
  console.log(`Uploaded file: ${fileStorageObject.id}`);

  // Upload from buffer with explicit content type
  const bufferData = Buffer.from('Binary data here', 'utf-8');
  const bufferStorageObject = await StorageObject.uploadFromBuffer(bufferData, 'buffer-data.bin', 'binary', {
    metadata: { source: 'buffer' },
  });
  console.log(`Uploaded buffer: ${bufferStorageObject.id}`);

  // Upload archive files (auto-detects content type)
  const archiveStorageObject = await StorageObject.uploadFromFile(
    './files/test-archive.tar.gz',
    'test-archive.tar.gz',
  );
  console.log(`Uploaded archive: ${archiveStorageObject.id}`);

  // === Snapshot Example ===
  // Create a snapshot of the current devbox state (returns Snapshot object directly)
  const snapshot = await devbox.snapshotDisk({
    name: 'dev-checkpoint',
    metadata: { version: '1.0', stage: 'configured' },
  });

  // Get snapshot information using getInfo()
  const snapshotInfo = await snapshot.getInfo();
  console.log(`Snapshot ${snapshotInfo.snapshot?.name} created at: ${snapshotInfo.snapshot?.create_time_ms}`);

  // === ID-Only Storage Example ===
  // Demonstrate how objects only store IDs and fetch data on demand
  console.log('=== ID-Only Storage Demo ===');

  // Create objects by ID without API calls (no network requests)
  const blueprintFromId = Blueprint.fromId(blueprint.id);
  const devboxFromId = Devbox.fromId(devbox.id);
  const storageFromId = StorageObject.fromId(storageObject.id);

  // Access IDs immediately (no API calls)
  console.log(`Blueprint ID: ${blueprintFromId.id}`);
  console.log(`Devbox ID: ${devboxFromId.id}`);
  console.log(`Storage ID: ${storageFromId.id}`);

  // Fetch full data only when needed
  const blueprintDetails = await blueprintFromId.getInfo();
  const devboxDetails = await devboxFromId.getInfo();
  console.log(`Blueprint status: ${blueprintDetails.status}`);
  console.log(`Devbox status: ${devboxDetails.status}`);

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

  // === Organized Method Structure Demo ===
  console.log('=== Organized Method Structure Demo ===');

  // Command execution (organized under cmd object)
  const cmdResult = await devbox.cmd.exec({ command: 'echo "Commands work!"' });
  console.log('Command output:', cmdResult.stdout);

  // File operations (organized under file object)
  await devbox.file.write({ file_path: 'demo.txt', contents: 'File operations work!' });
  const demoFileContent = await devbox.file.read({ file_path: 'demo.txt' });
  console.log('File content:', demoFileContent);

  // Network operations (organized under net object)
  const networkTunnel = await devbox.net.createTunnel({ port: 8080 });
  console.log('Network tunnel created:', networkTunnel.url);

  // Lifecycle management (direct methods)
  console.log('Devbox lifecycle operations available');

  // Cleanup resources
  await restoredDevbox.shutdown();
  await devbox.resume();
  await devbox.shutdown();

  // All devboxes are now shut down and resources are cleaned up
}

// Run the example
main().catch(console.error);
