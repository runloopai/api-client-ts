import { toFile } from '@runloop/api-client';
import { Devbox } from '@runloop/api-client/sdk';
import { makeClientSDK, THIRTY_SECOND_TIMEOUT, uniqueName } from '../utils';
import { uuidv7 } from 'uuidv7';

const sdk = makeClientSDK();

describe('smoketest: object-oriented devbox', () => {
  describe('devbox lifecycle', () => {
    let devbox: Devbox;
    let devboxId: string | undefined;

    afterAll(async () => {
      if (devbox) {
        await devbox.shutdown();
      }
    });

    test(
      'create devbox',
      async () => {
        devbox = await sdk.devbox.create({
          name: uniqueName('sdk-devbox'),
          launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
        });
        expect(devbox).toBeDefined();
        expect(devbox.id).toBeTruthy();
        devboxId = devbox.id;
      },
      THIRTY_SECOND_TIMEOUT,
    );

    test('get devbox info', async () => {
      expect(devbox).toBeDefined();
      const info = await devbox.getInfo();
      expect(info.id).toBe(devboxId);
      expect(info.name).toContain('sdk-devbox');
    });

    test('execute synchronous command', async () => {
      expect(devbox).toBeDefined();
      const result = await devbox.cmd.exec('echo "Hello from SDK!"');
      expect(result).toBeDefined();
      expect(result.exitCode).toBe(0);
      const output = await result.stdout();
      expect(output).toContain('Hello from SDK!');
    });

    test('execute asynchronous command', async () => {
      expect(devbox).toBeDefined();
      const execution = await devbox.cmd.execAsync('sleep 2 && echo "Async command completed"');
      expect(execution).toBeDefined();
      expect(execution.executionId).toBeTruthy();

      // Wait for completion
      const result = await execution.result();
      expect(result.exitCode).toBe(0);
      const output = await result.stdout();
      expect(output).toContain('Async command completed');
    });

    test('file operations', async () => {
      expect(devbox).toBeDefined();

      // Write a file
      await devbox.file.write({
        file_path: '/tmp/test.txt',
        contents: 'Hello from SDK file operations!',
      });

      // Read the file
      const content = await devbox.file.read({ file_path: '/tmp/test.txt' });
      expect(content).toBe('Hello from SDK file operations!');

      // Download the file
      const downloadResponse = await devbox.file.download({ path: '/tmp/test.txt' });
      expect(downloadResponse).toBeDefined();

      // Upload a file
      await devbox.file.upload({
        path: '~/uploaded.txt',
        file: await toFile(Buffer.from('Uploaded content'), 'uploaded.txt'),
      });
      const content2 = await devbox.file.read({ file_path: '~/uploaded.txt' });
      expect(content2).toBe('Uploaded content');
    });

    test('shutdown devbox', async () => {
      expect(devbox).toBeDefined();
      const info = await devbox.getInfo();
      expect(info.status).toBe('running');
      await devbox.shutdown();
      const info2 = await devbox.getInfo();
      expect(info2.status).toBe('shutdown');
    });
  });

  describe('devbox list and retrieval', () => {
    test('list devboxes', async () => {
      const devboxes = await sdk.devbox.list({ limit: 10 });
      expect(Array.isArray(devboxes)).toBe(true);
      expect(devboxes.length).toBeGreaterThan(0);
    });

    test('get devbox by ID', async () => {
      let devbox: Devbox | undefined;
      try {
        devbox = await sdk.devbox.create({
          name: uniqueName('sdk-devbox-retrieve'),
          launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
        });
        expect(devbox.id).toBeTruthy();

        // Retrieve it by ID
        const retrieved = sdk.devbox.fromId(devbox.id);
        expect(retrieved.id).toBe(devbox.id);

        // Clean up
      } finally {
        if (devbox) {
          await devbox.shutdown();
        }
      }
    });
  });

  describe('devbox suspend and resume', () => {
    test('suspend and resume devbox', async () => {
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-suspend'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      });

      // Suspend the devbox
      await devbox.suspend();
      await devbox.awaitSuspended();
      const suspendedInfo = await devbox.getInfo();
      expect(suspendedInfo.status).toBe('suspended');

      // Resume the devbox - resume() automatically waits for running state
      const resumedInfo = await devbox.resume();
      expect(resumedInfo.status).toBe('running');

      // Clean up
      await devbox.shutdown();
    });

    test('resumeAsync - resume without waiting', async () => {
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-resume-async'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      });

      // Suspend the devbox
      await devbox.suspend();
      await devbox.awaitSuspended();
      const suspendedInfo = await devbox.getInfo();
      expect(suspendedInfo.status).toBe('suspended');

      // Resume the devbox asynchronously - doesn't wait automatically
      const resumeResponse = await devbox.resumeAsync();
      expect(resumeResponse).toBeDefined();

      // Now wait for running state explicitly
      const runningInfo = await devbox.awaitRunning();
      expect(runningInfo.status).toBe('running');

      // Clean up
      await devbox.shutdown();
    });

    test('keep alive', async () => {
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-keepalive'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      });

      // Send keep alive signal
      const result = await devbox.keepAlive();
      expect(result).toBeDefined();

      // Clean up
      await devbox.shutdown();
    });
  });

  describe('devbox networking', () => {
    test('create SSH key', async () => {
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-ssh'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      });

      const sshKey = await devbox.net.createSSHKey();
      expect(sshKey).toBeDefined();

      // Clean up
      await devbox.shutdown();
    });

    test('create and remove tunnel', async () => {
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-tunnel'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      });

      // Create tunnel
      const tunnel = await devbox.net.createTunnel({ port: 8080 });
      expect(tunnel).toBeDefined();

      // Remove tunnel
      await devbox.net.removeTunnel({ port: 8080 });

      // Clean up
      await devbox.shutdown();
    });
  });

  describe('devbox creation from blueprint and snapshot', () => {
    test('create devbox from blueprint ID', async () => {
      // First create a blueprint
      const blueprint = await sdk.blueprint.create({
        name: uniqueName('sdk-blueprint-for-devbox'),
        dockerfile: 'FROM ubuntu:20.04\nRUN apt-get update && apt-get install -y curl',
      });
      expect(blueprint).toBeDefined();

      // Create devbox from blueprint using SDK method with blueprint ID
      const devbox = await sdk.devbox.createFromBlueprintId(blueprint.id, {
        name: uniqueName('sdk-devbox-from-blueprint-id'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });
      expect(devbox).toBeDefined();
      expect(devbox.id).toBeTruthy();

      // Verify it's running
      const info = await devbox.getInfo();
      expect(info.status).toBe('running');

      // Clean up
      await devbox.shutdown();
      await blueprint.delete();
    });

    test('create devbox from blueprint name', async () => {
      // First create a blueprint with a specific name
      const blueprintName = uniqueName('sdk-blueprint-name-test');
      const blueprint = await sdk.blueprint.create({
        name: blueprintName,
        dockerfile: 'FROM ubuntu:20.04\nRUN apt-get update && apt-get install -y wget',
      });
      expect(blueprint).toBeDefined();

      // Create devbox from blueprint using SDK method with blueprint name
      const devbox = await sdk.devbox.createFromBlueprintName(blueprintName, {
        name: uniqueName('sdk-devbox-from-blueprint-name'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });
      expect(devbox).toBeDefined();
      expect(devbox.id).toBeTruthy();

      // Verify it's running
      const info = await devbox.getInfo();
      expect(info.status).toBe('running');

      // Clean up
      await devbox.shutdown();
      await blueprint.delete();
    });

    test('create devbox from snapshot', async () => {
      // First create a devbox
      const sourceDevbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-for-snapshot'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });
      expect(sourceDevbox).toBeDefined();

      // Create a snapshot
      const snapshot = await sourceDevbox.snapshotDisk({
        name: uniqueName('sdk-snapshot-for-devbox'),
        commit_message: 'Test snapshot for devbox creation',
      });
      expect(snapshot).toBeDefined();

      // Create devbox from snapshot using SDK method
      const devbox = await sdk.devbox.createFromSnapshot(snapshot.id, {
        name: uniqueName('sdk-devbox-from-snapshot'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });
      expect(devbox).toBeDefined();
      expect(devbox.id).toBeTruthy();

      // Verify it's running
      const info = await devbox.getInfo();
      expect(info.status).toBe('running');

      // Clean up
      await devbox.shutdown();
      await sourceDevbox.shutdown();
      await snapshot.delete();
    });
  });

  describe('command execution with streaming callbacks', () => {
    let devbox: Devbox;

    beforeAll(async () => {
      devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-streaming'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });
    }, THIRTY_SECOND_TIMEOUT);

    afterAll(async () => {
      if (devbox) {
        await devbox.shutdown();
      }
    });

    test('exec with stdout callback', async () => {
      const stdoutLines: string[] = [];

      const result = await devbox.cmd.exec('echo "line1" && echo "line2" && echo "line3"', {
        stdout: (line) => {
          stdoutLines.push(line);
        },
      });

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(stdoutLines.length).toBeGreaterThan(0);
      const stdoutCombined = stdoutLines.join('');
      expect(stdoutCombined).toContain('line1');
      expect(stdoutCombined).toContain('line2');
      expect(stdoutCombined).toContain('line3');
      // Verify streaming captured same data as result
      expect(stdoutCombined).toBe(await result.stdout());
    });

    test('exec with stderr callback', async () => {
      const stderrLines: string[] = [];

      const result = await devbox.cmd.exec('echo "error1" >&2 && echo "error2" >&2', {
        stderr: (line) => {
          stderrLines.push(line);
        },
      });

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(stderrLines.length).toBeGreaterThan(0);
      const stderrCombined = stderrLines.join('');
      expect(stderrCombined).toContain('error1');
      expect(stderrCombined).toContain('error2');
      // Verify streaming captured same data as result
      expect(stderrCombined).toBe(await result.stderr());
    });

    test('exec with output callback (both stdout and stderr)', async () => {
      const allLines: string[] = [];

      const result = await devbox.cmd.exec('echo "stdout1" && echo "stderr1" >&2 && echo "stdout2"', {
        output: (line) => {
          allLines.push(line);
        },
      });

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(allLines.length).toBeGreaterThan(0);
      const combined = allLines.join('');
      expect(combined).toContain('stdout1');
      expect(combined).toContain('stderr1');
      expect(combined).toContain('stdout2');
    });

    test('exec with all three callbacks (stdout, stderr, output)', async () => {
      const stdoutLines: string[] = [];
      const stderrLines: string[] = [];
      const outputLines: string[] = [];

      const result = await devbox.cmd.exec('echo "out1" && echo "err1" >&2 && echo "out2"', {
        stdout: (line) => stdoutLines.push(line),
        stderr: (line) => stderrLines.push(line),
        output: (line) => outputLines.push(line),
      });

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);

      // Verify stdout callback received stdout
      const stdoutCombined = stdoutLines.join('');
      expect(stdoutCombined).toContain('out1');
      expect(stdoutCombined).toContain('out2');

      // Verify stderr callback received stderr
      const stderrCombined = stderrLines.join('');
      expect(stderrCombined).toContain('err1');

      // Verify output callback received both
      expect(outputLines.length).toBeGreaterThan(0);
      const combined = outputLines.join('');
      expect(combined).toContain('out');
      expect(combined).toContain('err1');
    });

    test('exec WITHOUT callbacks (preserve existing behavior)', async () => {
      const result = await devbox.cmd.exec('echo "test output"');

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      const stdout = await result.stdout();
      expect(stdout).toContain('test output');
    });

    test('execAsync with callbacks - real-time streaming', async () => {
      const stdoutLines: string[] = [];
      let receivedBeforeCompletion = false;

      // Start async execution with streaming
      const execution = await devbox.cmd.execAsync('echo "immediate" && sleep 2 && echo "delayed"', {
        stdout: (line) => {
          stdoutLines.push(line);
          if (line.includes('immediate')) {
            receivedBeforeCompletion = true;
          }
        },
      });

      // Give time for first line to stream (verifies real-time behavior)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify we received logs before command completion
      expect(receivedBeforeCompletion).toBe(true);

      // Now wait for completion (waits for both command and streaming)
      const result = await execution.result();
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);

      // Verify all lines received
      const stdoutCombined = stdoutLines.join('');
      expect(stdoutCombined).toContain('immediate');
      expect(stdoutCombined).toContain('delayed');
      // Verify streaming captured same data as result
      expect(stdoutCombined).toBe(await result.stdout());
    });

    test('execAsync with stderr callback', async () => {
      const stderrLines: string[] = [];

      const execution = await devbox.cmd.execAsync('echo "error output" >&2', {
        stderr: (line) => {
          stderrLines.push(line);
        },
      });

      const result = await execution.result();
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(stderrLines.length).toBeGreaterThan(0);
      const stderrCombined = stderrLines.join('');
      expect(stderrCombined).toContain('error output');
      // Verify streaming captured same data as result
      expect(stderrCombined).toBe(await result.stderr());
    });

    test('exec with command producing both stdout and stderr', async () => {
      const stdoutLines: string[] = [];
      const stderrLines: string[] = [];

      const result = await devbox.cmd.exec('echo "to stdout" && echo "to stderr" >&2 && echo "more stdout"', {
        stdout: (line) => stdoutLines.push(line),
        stderr: (line) => stderrLines.push(line),
      });

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);

      // Verify correct separation
      const stdoutCombined = stdoutLines.join('');
      const stderrCombined = stderrLines.join('');

      expect(stdoutCombined).toContain('to stdout');
      expect(stdoutCombined).toContain('more stdout');
      expect(stderrCombined).toContain('to stderr');

      // Verify streaming captured same data as result
      expect(stdoutCombined).toBe(await result.stdout());
      expect(stderrCombined).toBe(await result.stderr());
    });

    test('exec with long output - verify all lines received', async () => {
      const stdoutLines: string[] = [];

      const result = await devbox.cmd.exec('for i in {1..1000}; do echo "line $i"; done', {
        stdout: (line) => stdoutLines.push(line),
      });

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);

      // Verify we received substantial output (may be truncated by API)
      expect(stdoutLines.length).toBeGreaterThan(0);

      const stdoutCombined = stdoutLines.join('');
      // Verify we got a significant amount of output
      expect(stdoutCombined.length).toBeGreaterThan(1000);

      // Verify all 1000 lines are present in the output
      for (let i = 1; i <= 1000; i++) {
        expect(stdoutCombined).toContain(`line ${i}`);
      }

      // Verify streaming captured same data as result
      expect(stdoutCombined).toBe(await result.stdout());
    });

    test('concurrent execAsync - multiple executions streaming simultaneously', async () => {
      const taskALogs: string[] = [];
      const taskBLogs: string[] = [];
      let taskACount = 0;
      let taskBCount = 0;

      // Start both executions at the same time (don't await)
      const executionA = devbox.cmd.execAsync(
        'echo "A1" && sleep 0.5 && echo "A2" && sleep 0.5 && echo "A3"',
        {
          stdout: (line) => {
            taskALogs.push(line);
            taskACount++;
          },
        },
      );

      const executionB = devbox.cmd.execAsync(
        'sleep 0.3 && echo "B1" && sleep 0.5 && echo "B2" && sleep 0.5 && echo "B3"',
        {
          stdout: (line) => {
            taskBLogs.push(line);
            taskBCount++;
          },
        },
      );

      // Wait for both to start
      const [execA, execB] = await Promise.all([executionA, executionB]);

      // Verify both are receiving logs concurrently (wait for some logs to arrive)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // At this point, both should have received at least some logs
      expect(taskACount).toBeGreaterThan(0);
      expect(taskBCount).toBeGreaterThan(0);

      // Wait for both to complete (result() waits for streaming to finish)
      const [resultA, resultB] = await Promise.all([execA.result(), execB.result()]);

      // Verify both completed successfully
      expect(resultA.success).toBe(true);
      expect(resultA.exitCode).toBe(0);
      expect(resultB.success).toBe(true);
      expect(resultB.exitCode).toBe(0);

      // Verify all logs were received from both streams
      const taskACombined = taskALogs.join('');
      expect(taskACombined).toContain('A1');
      expect(taskACombined).toContain('A2');
      expect(taskACombined).toContain('A3');

      const taskBCombined = taskBLogs.join('');
      expect(taskBCombined).toContain('B1');
      expect(taskBCombined).toContain('B2');
      expect(taskBCombined).toContain('B3');

      // Verify we received logs from both (proving concurrent streaming)
      expect(taskACount).toBeGreaterThanOrEqual(3);
      expect(taskBCount).toBeGreaterThanOrEqual(3);

      // Verify streaming captured same data as ExecutionResult
      expect(taskACombined).toBe(await resultA.stdout());
      expect(taskBCombined).toBe(await resultB.stdout());
    });
  });

  describe('named shell - stateful command execution', () => {
    let devbox: Devbox;

    beforeAll(async () => {
      devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-named-shell'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });
    }, THIRTY_SECOND_TIMEOUT);

    afterAll(async () => {
      if (devbox) {
        await devbox.shutdown();
      }
    });

    test('shell.exec - basic execution', async () => {
      expect(devbox).toBeDefined();
      const shell = devbox.shell('test-shell-1');
      const result = await shell.exec('echo "Hello from named shell!"');
      expect(result).toBeDefined();
      expect(result.exitCode).toBe(0);
      const output = await result.stdout();
      expect(output).toContain('Hello from named shell!');
    });

    test('shell.exec - CWD persistence across commands', async () => {
      expect(devbox).toBeDefined();
      const shell = devbox.shell('test-shell-2');

      // Create a directory and change to it
      await shell.exec('mkdir -p /tmp/test-shell-dir');
      await shell.exec('cd /tmp/test-shell-dir');

      // Verify we're in the new directory
      const pwdResult = await shell.exec('pwd');
      const pwd = (await pwdResult.stdout()).trim();
      expect(pwd).toBe('/tmp/test-shell-dir');

      // Create a file in the current directory
      await shell.exec('echo "test content" > testfile.txt');

      // Verify the file exists in the current directory
      const lsResult = await shell.exec('ls testfile.txt');
      expect(lsResult.exitCode).toBe(0);
      const lsOutput = await lsResult.stdout();
      expect(lsOutput).toContain('testfile.txt');
    });

    test('shell.exec - environment variable persistence', async () => {
      expect(devbox).toBeDefined();
      const shell = devbox.shell('test-shell-3');

      // Set an environment variable
      await shell.exec('export TEST_VAR="test-value-123"');

      // Verify the variable persists in the next command
      const echoResult = await shell.exec('echo $TEST_VAR');
      const output = (await echoResult.stdout()).trim();
      expect(output).toBe('test-value-123');

      // Set another variable and verify both persist
      await shell.exec('export ANOTHER_VAR="another-value"');
      const bothResult = await shell.exec('echo "$TEST_VAR:$ANOTHER_VAR"');
      const bothOutput = (await bothResult.stdout()).trim();
      expect(bothOutput).toBe('test-value-123:another-value');
    });

    test('shell.exec - combined CWD and environment persistence', async () => {
      expect(devbox).toBeDefined();
      const shell = devbox.shell('test-shell-4');

      // Set environment and change directory
      await shell.exec('export PROJECT_DIR="/tmp/my-project"');
      await shell.exec('mkdir -p $PROJECT_DIR');
      await shell.exec('cd $PROJECT_DIR');

      // Verify both persist
      const pwdResult = await shell.exec('pwd');
      const pwd = (await pwdResult.stdout()).trim();
      expect(pwd).toBe('/tmp/my-project');

      // Create a file using the environment variable
      await shell.exec('echo "project file" > $PROJECT_DIR/file.txt');

      // Verify file exists
      const lsResult = await shell.exec('ls file.txt');
      expect(lsResult.exitCode).toBe(0);
    });

    test('shell.execAsync - basic async execution', async () => {
      expect(devbox).toBeDefined();
      const shell = devbox.shell('test-shell-5');
      const execution = await shell.execAsync('sleep 1 && echo "Async command completed"');
      expect(execution).toBeDefined();
      expect(execution.executionId).toBeTruthy();

      // Wait for completion
      const result = await execution.result();
      expect(result.exitCode).toBe(0);
      const output = await result.stdout();
      expect(output).toContain('Async command completed');
    });

    test('shell.execAsync - stateful async execution', async () => {
      expect(devbox).toBeDefined();
      const shell = devbox.shell('test-shell-6');

      // Set state in first command
      await shell.exec('export ASYNC_VAR="async-value"');
      await shell.exec('cd /tmp');

      // Start async command that uses the state
      const execution = await shell.execAsync('echo "CWD: $(pwd), VAR: $ASYNC_VAR"');
      const result = await execution.result();

      expect(result.exitCode).toBe(0);
      const output = await result.stdout();
      expect(output).toContain('CWD: /tmp');
      expect(output).toContain('VAR: async-value');
    });

    test('shell.exec - sequential execution (queuing)', async () => {
      expect(devbox).toBeDefined();
      const shell = devbox.shell('test-shell-7');

      // Start multiple commands - they should execute sequentially
      const startTime = Date.now();
      await shell.exec('sleep 1 && echo "first"');
      await shell.exec('sleep 1 && echo "second"');
      await shell.exec('sleep 1 && echo "third"');
      const endTime = Date.now();

      // Verify they took at least 3 seconds (sequential execution)
      const duration = endTime - startTime;
      expect(duration).toBeGreaterThanOrEqual(2900); // Allow some margin for overhead

      // Verify all commands executed in order
      const finalResult = await shell.exec('echo "done"');
      const output = await finalResult.stdout();
      expect(output).toContain('done');
    });

    test('shell.execAsync - sequential execution with queuing', async () => {
      expect(devbox).toBeDefined();
      const shell = devbox.shell('test-shell-8');

      // Start multiple async commands - they should queue and execute sequentially
      const exec1 = shell.execAsync('sleep 1 && echo "async-first"');
      const exec2 = shell.execAsync('sleep 1 && echo "async-second"');
      const exec3 = shell.execAsync('sleep 1 && echo "async-third"');

      // Wait for all to complete
      const [result1, result2, result3] = await Promise.all([
        (await exec1).result(),
        (await exec2).result(),
        (await exec3).result(),
      ]);

      // Verify all completed successfully
      expect(result1.exitCode).toBe(0);
      expect(result2.exitCode).toBe(0);
      expect(result3.exitCode).toBe(0);

      // Verify outputs
      expect(await result1.stdout()).toContain('async-first');
      expect(await result2.stdout()).toContain('async-second');
      expect(await result3.stdout()).toContain('async-third');
    });

    test('shell.exec - with streaming callbacks', async () => {
      expect(devbox).toBeDefined();
      const shell = devbox.shell('test-shell-9');
      const stdoutLines: string[] = [];

      const result = await shell.exec('echo "line1" && echo "line2" && echo "line3"', {
        stdout: (line) => {
          stdoutLines.push(line);
        },
      });

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(stdoutLines.length).toBeGreaterThan(0);
      const stdoutCombined = stdoutLines.join('');
      expect(stdoutCombined).toContain('line1');
      expect(stdoutCombined).toContain('line2');
      expect(stdoutCombined).toContain('line3');
      // Verify streaming captured same data as result
      expect(stdoutCombined).toBe(await result.stdout());
    });

    test('shell.execAsync - with streaming callbacks', async () => {
      expect(devbox).toBeDefined();
      const shell = devbox.shell('test-shell-10');
      const stdoutLines: string[] = [];

      const execution = await shell.execAsync('echo "async-line1" && sleep 0.5 && echo "async-line2"', {
        stdout: (line) => {
          stdoutLines.push(line);
        },
      });

      const result = await execution.result();
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);

      const stdoutCombined = stdoutLines.join('');
      expect(stdoutCombined).toContain('async-line1');
      expect(stdoutCombined).toContain('async-line2');
      // Verify streaming captured same data as result
      expect(stdoutCombined).toBe(await result.stdout());
    });

    test('multiple named shells - independent state', async () => {
      expect(devbox).toBeDefined();
      const shell1 = devbox.shell('independent-shell-1');
      const shell2 = devbox.shell('independent-shell-2');

      // Set different state in each shell
      await shell1.exec('export VAR="shell1-value"');
      await shell1.exec('cd /tmp');
      await shell2.exec('export VAR="shell2-value"');
      await shell2.exec('cd /home');

      // Verify each shell maintains its own state
      const result1 = await shell1.exec('echo "$VAR:$(pwd)"');
      const output1 = (await result1.stdout()).trim();
      expect(output1).toContain('shell1-value');
      expect(output1).toContain('/tmp');

      const result2 = await shell2.exec('echo "$VAR:$(pwd)"');
      const output2 = (await result2.stdout()).trim();
      expect(output2).toContain('shell2-value');
      expect(output2).toContain('/home');
    });

    test('shell.exec - with stderr streaming callback', async () => {
      expect(devbox).toBeDefined();
      const shell = devbox.shell('test-shell-stderr');
      const stderrLines: string[] = [];

      const result = await shell.exec('echo "error output" >&2', {
        stderr: (line) => {
          stderrLines.push(line);
        },
      });

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(stderrLines.length).toBeGreaterThan(0);
      const stderrCombined = stderrLines.join('');
      expect(stderrCombined).toContain('error output');
      // Verify streaming captured same data as result
      expect(stderrCombined).toBe(await result.stderr());
    });

    test('shell.execAsync - with both stdout and stderr streaming callbacks', async () => {
      expect(devbox).toBeDefined();
      const shell = devbox.shell('test-shell-both-streams');
      const stdoutLines: string[] = [];
      const stderrLines: string[] = [];

      const execution = await shell.execAsync('echo "to stdout" && echo "to stderr" >&2', {
        stdout: (line) => stdoutLines.push(line),
        stderr: (line) => stderrLines.push(line),
      });

      const result = await execution.result();
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);

      const stdoutCombined = stdoutLines.join('');
      const stderrCombined = stderrLines.join('');

      expect(stdoutCombined).toContain('to stdout');
      expect(stderrCombined).toContain('to stderr');

      // Verify streaming captured same data as result
      expect(stdoutCombined).toBe(await result.stdout());
      expect(stderrCombined).toBe(await result.stderr());
    });

    test('shell - auto-generated shell name', async () => {
      expect(devbox).toBeDefined();
      // Create shell without providing a name - should auto-generate UUID
      const shell = devbox.shell();
      expect(shell).toBeDefined();

      const result = await shell.exec('echo "test"');
      expect(result.exitCode).toBe(0);
      const output = await result.stdout();
      expect(output).toContain('test');
    });
  });
});
