import { Runloop } from '../src/index';
import { Devbox } from '../src/objects/devbox';
import { Blueprint } from '../src/objects/blueprint';
import { Snapshot } from '../src/objects/snapshot';
import { StorageObject } from '../src/objects/storage-object';

async function quickStart() {
  // Set up default client (recommended)
  Runloop.setDefaultClient(new Runloop({ bearerToken: 'your-api-key' }));

  console.log('🚀 Quick Start: Runloop API Client with Object-Oriented API');

  // 1. Create a blueprint (using default client)
  console.log('📦 Creating blueprint...');
  const blueprint = await Blueprint.create({
    name: 'ubuntu-dev',
    dockerfile: 'FROM ubuntu:22.04\nRUN apt-get update && apt-get install -y nodejs npm',
  });
  console.log(`✅ Blueprint created: ${blueprint.id}`);

  // 2. Create a devbox from the blueprint (using default client)
  console.log('🖥️  Creating devbox...');
  const devbox = await Devbox.create({
    name: 'my-devbox',
    blueprint_id: blueprint.id,
  });
  console.log(`✅ Devbox created: ${devbox.id}`);

  // 3. Use the devbox - organized method structure
  console.log('⚡ Using devbox...');

  // Command execution (cmd object)
  await devbox.cmd.exec({ command: 'npm init -y' });
  await devbox.file.write({ file_path: 'app.js', contents: 'console.log("Hello World");' });
  const result = await devbox.cmd.exec({ command: 'node app.js' });
  console.log(`✅ Command output: ${result.stdout}`);

  // Network operations (net object)
  const tunnel = await devbox.net.createTunnel({ port: 3000 });
  console.log(`🌐 Tunnel created: ${tunnel.url}`);
  const sshKey = await devbox.net.createSSHKey();
  console.log(`🔑 SSH access available`);

  // 4. Storage operations
  console.log('💾 Working with storage...');
  const storageObject = await StorageObject.create({
    name: 'data.txt',
    content_type: 'text',
  });
  await storageObject.uploadContent('Hello from storage!');
  await storageObject.complete();
  console.log(`✅ Storage object created: ${storageObject.id}`);

  // 5. Snapshot operations
  console.log('📸 Creating snapshot...');
  const snapshotData = await devbox.snapshotDisk({ name: 'configured-state' });
  const snapshot = Snapshot.fromId(snapshotData.id);
  console.log(`✅ Snapshot created: ${snapshot.id}`);

  // 6. Demonstrate ID-only storage and getInfo()
  console.log('🆔 Demonstrating ID-only storage...');
  const blueprintInfo = await blueprint.getInfo();
  const devboxInfo = await devbox.getInfo();
  console.log(`📊 Blueprint status: ${blueprintInfo.status}`);
  console.log(`📊 Devbox status: ${devboxInfo.status}`);

  // 7. Create new devbox from snapshot
  console.log('🔄 Creating devbox from snapshot...');
  const newDevbox = await snapshot.createDevbox({ name: 'cloned-devbox' });
  console.log(`✅ Cloned devbox created: ${newDevbox.id}`);

  // 8. Lifecycle management
  console.log('♻️  Managing lifecycle...');
  await devbox.suspend();
  console.log('⏸️  Devbox suspended');
  await devbox.resume();
  console.log('▶️  Devbox resumed');
  await devbox.shutdown();
  await newDevbox.shutdown();
  console.log('🛑 All devboxes shut down');

  console.log('🎉 Quick start completed successfully!');
}

quickStart().catch(console.error);
