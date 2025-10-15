import { Devbox } from '../src/objects/devbox';
import { Snapshot } from '../src/objects/snapshot';
import { StorageObject } from '../src/objects/storage-object';

async function quickStart() {
  // Set the environment RUNLOOP_API_KEY variable with your API key
  console.log('🚀 Quick Start: Runloop API Client with Object-Oriented API');

  // 2. Create a devbox from the blueprint (using default client)
  console.log('🖥️  Creating devbox...');
  const devbox = await Devbox.create({
    name: 'my-devbox',
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
  const snapshot = await devbox.snapshotDisk({ name: 'configured-state' });
  console.log(`✅ Snapshot created: ${snapshot.id}`);

  // 6. Demonstrate ID-only storage and getInfo()
  console.log('🆔 Demonstrating ID-only storage...');
  const devboxInfo = await devbox.getInfo();
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
