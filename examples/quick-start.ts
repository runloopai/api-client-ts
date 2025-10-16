import { RunloopSDK } from '../src/sdk';
import { StorageObject } from '../src/objects/storage-object';

async function quickStart() {
  // Set the environment RUNLOOP_API_KEY variable with your API key
  console.log('🚀 Quick Start: Runloop API Client with Object-Oriented API');

  // Initialize the SDK
  const sdk = new RunloopSDK();

  // 2. Create a devbox from the blueprint (using SDK)
  console.log('🖥️  Creating devbox...');
  const devbox = await sdk.devbox.create({
    name: 'my-devbox',
  });
  console.log(`✅ Devbox created: ${devbox.id}`);

  // Command execution (cmd object)
  console.log('📦 Initializing npm project...');
  await devbox.cmd.exec({ command: 'npm init -y' });
  console.log('📝 Writing app.js file...');
  await devbox.file.write({ file_path: 'app.js', contents: 'console.log("Hello World");' });
  console.log('🚀 Running Node.js application...');
  const result = await devbox.cmd.exec({ command: 'node app.js' });
  console.log(`✅ Command output: ${result.stdout}`);

  // Network operations (net object)
  const tunnel = await devbox.net.createTunnel({ port: 3000 });
  console.log(`🌐 Tunnel created: ${tunnel.url} (port: ${tunnel.port})`);
  const sshKey = await devbox.net.createSSHKey();
  console.log(`🔑 SSH access available (key ID: ${sshKey.id || 'generated'})`);

  // 4. Storage operations - file upload
  console.log('💾 Uploading package.json to storage...');
  const storageObject = await StorageObject.uploadFromFile(sdk.api, './package.json', 'my-package.json');
  console.log(`✅ File uploaded: ${storageObject.id}`);

  // Upload an archive file (auto-detects content type)
  console.log('📦 Uploading test-archive.tar.gz to storage...');
  const archiveObject = await StorageObject.uploadFromFile(
    sdk.api,
    './files/test-archive.tar.gz',
    'project-archive.tar.gz',
    {
      metadata: { type: 'build-artifact' },
    },
  );
  console.log(`✅ Archive uploaded: ${archiveObject.id}`);

  // 5. Snapshot operations
  console.log('📸 Creating snapshot...');
  const snapshot = await devbox.snapshotDisk({ name: 'configured-state' });
  console.log(`✅ Snapshot created: ${snapshot.id}`);

  // 6. Demonstrate ID-only storage and getInfo()
  console.log('🆔 Demonstrating ID-only storage...');
  const devboxInfo = await devbox.getInfo();
  console.log(`📊 Devbox status: ${devboxInfo.status} (ID: ${devboxInfo.id})`);

  // 7. Create new devbox from snapshot
  console.log('🔄 Creating devbox from snapshot...');
  const newDevbox = await snapshot.createDevbox({ name: 'cloned-devbox' });
  console.log(`✅ Cloned devbox created: ${newDevbox.id}`);

  // 8. Lifecycle management
  console.log('♻️  Managing lifecycle...');
  await devbox.suspend();
  console.log(`⏸️  Devbox suspended (ID: ${devbox.id})`);
  await devbox.awaitSuspended();
  await devbox.resume();
  console.log(`▶️  Devbox resumed (ID: ${devbox.id})`);
  await devbox.shutdown();
  await newDevbox.shutdown();
  console.log(`🛑 All devboxes shut down (IDs: ${devbox.id}, ${newDevbox.id})`);

  console.log('🎉 Quick start completed successfully!');
}

quickStart().catch(console.error);
