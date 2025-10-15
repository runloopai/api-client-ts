import { Runloop } from '../src/index';
import { Devbox } from '../src/objects/devbox';
import { Blueprint } from '../src/objects/blueprint';
import { Snapshot } from '../src/objects/snapshot';

async function quickStart() {
  // Set up default client (recommended)
  Runloop.setDefaultClient(new Runloop({ bearerToken: 'your-api-key' }));

  // 1. Create a blueprint (using default client)
  const blueprint = await Blueprint.create({
    name: 'ubuntu-dev',
    dockerfile: 'FROM ubuntu:22.04\nRUN apt-get update && apt-get install -y nodejs npm',
  });

  // 2. Create a devbox from the blueprint (using default client)
  const devbox = await Devbox.create({
    name: 'my-devbox',
    blueprint_id: blueprint.id,
  });

  // 3. Use the devbox
  await devbox.cmd.exec({ command: 'npm init -y' });
  await devbox.file.write({ file_path: 'app.js', contents: 'console.log("Hello World");' });
  const result = await devbox.cmd.exec({ command: 'node app.js' });
  // result.stdout contains "Hello World"

  // 4. Create a snapshot
  const snapshotData = await devbox.snapshotDisk({ name: 'configured-state' });
  const snapshot = new Snapshot(Runloop.getDefaultClient(), snapshotData.id);

  // 5. Create new devbox from snapshot
  const newDevbox = await snapshot.createDevbox({ name: 'cloned-devbox' });

  // 6. Lifecycle management (returns devbox instance for chaining)
  await devbox
    .suspend()
    .then((d) => d.resume())
    .then((d) => d.shutdown());
  await newDevbox.shutdown();
}

quickStart().catch(console.error);
