import { toFile } from '@runloop/api-client';
import { Devbox, NetworkPolicy } from '@runloop/api-client/sdk';
import { makeClientSDK, SHORT_TIMEOUT, uniqueName, cleanUpPolicy } from '../utils';
import { uuidv7 } from 'uuidv7';

const sdk = makeClientSDK();

describe('smoketest: object-oriented devbox', () => {
  describe('devbox lifecycle', () => {
    let devbox: Devbox;
    let devboxId: string | undefined;

    // Create devbox in beforeAll to avoid test order dependency
    beforeAll(async () => {
      devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      });
      devboxId = devbox.id;
    }, SHORT_TIMEOUT);

    afterAll(async () => {
      if (devbox) {
        await devbox.shutdown();
      }
    });

    test('create devbox', async () => {
      // Devbox was created in beforeAll - just verify it exists
      expect(devbox).toBeDefined();
      expect(devbox.id).toBeTruthy();
      expect(devboxId).toBeTruthy();
    });

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

  describe('devbox creation edge cases', () => {
    test.concurrent(
      'create devbox with empty mounts array',
      async () => {
        // This tests the transformSDKDevboxCreateParams branch for empty mounts
        let devbox: Devbox | undefined;
        try {
          devbox = await sdk.devbox.create({
            name: uniqueName('sdk-devbox-empty-mounts'),
            launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
            mounts: [],
          });
          expect(devbox).toBeDefined();
          expect(devbox.id).toBeTruthy();
        } finally {
          if (devbox) {
            await devbox.shutdown();
          }
        }
      },
      SHORT_TIMEOUT,
    );

    test.concurrent(
      'create devbox with network policy',
      async () => {
        let policy: NetworkPolicy | undefined;
        let devbox: Devbox | undefined;
        try {
          // Create a network policy
          policy = await sdk.networkPolicy.create({
            name: uniqueName('sdk-policy-for-devbox'),
            allow_all: false,
            allowed_hostnames: ['github.com'],
          });
          expect(policy.id).toBeTruthy();

          // Create a devbox with the network policy
          devbox = await sdk.devbox.create({
            name: uniqueName('sdk-devbox-with-policy'),
            launch_parameters: {
              resource_size_request: 'X_SMALL',
              keep_alive_time_seconds: 60 * 5,
              network_policy_id: policy.id,
            },
          });
          expect(devbox).toBeDefined();
          expect(devbox.id).toBeTruthy();

          // Verify devbox was created successfully
          const info = await devbox.getInfo();
          expect(info.status).toBeDefined();
        } finally {
          if (devbox) {
            await devbox.shutdown();
          }
          await cleanUpPolicy(policy);
        }
      },
      SHORT_TIMEOUT,
    );
  });

  describe('devbox list and retrieval', () => {
    test.concurrent('list devboxes', async () => {
      const devboxes = await sdk.devbox.list({ limit: 10 });
      expect(Array.isArray(devboxes)).toBe(true);
      expect(devboxes.length).toBeGreaterThan(0);
    });

    test.concurrent('get devbox by ID', async () => {
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
    test.concurrent('suspend and resume devbox', async () => {
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

    test.concurrent('resumeAsync - resume without waiting', async () => {
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

    test.concurrent('keep alive', async () => {
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
    test.concurrent('create SSH key', async () => {
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-ssh'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
      });

      const sshKey = await devbox.net.createSSHKey();
      expect(sshKey).toBeDefined();

      // Clean up
      await devbox.shutdown();
    });

    test.concurrent('enable V2 tunnel (open)', async () => {
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-enable-tunnel'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });

      try {
        // Enable V2 tunnel with open auth mode
        const tunnel = await devbox.net.enableTunnel({ auth_mode: 'open' });

        expect(tunnel).toBeDefined();
        expect(tunnel.tunnel_key).toBeTruthy();
        expect(tunnel.auth_mode).toBe('open');
        expect(tunnel.create_time_ms).toBeTruthy();

        // Verify tunnel is present on devbox info
        const info = await devbox.getInfo();
        expect(info.tunnel).toBeDefined();
        expect(info.tunnel?.tunnel_key).toBe(tunnel.tunnel_key);

        await devbox.net.removeTunnel();

        const tunnelAfterRemoval = await devbox.getTunnel();
        expect(tunnelAfterRemoval).toBeNull();
      } finally {
        await devbox.shutdown();
      }
    });

    test.concurrent('enable V2 tunnel (authenticated)', async () => {
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-enable-auth-tunnel'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });

      try {
        // Enable V2 tunnel with authenticated mode
        const tunnel = await devbox.net.enableTunnel({ auth_mode: 'authenticated' });

        expect(tunnel).toBeDefined();
        expect(tunnel.tunnel_key).toBeTruthy();
        expect(tunnel.auth_mode).toBe('authenticated');
        // Authenticated tunnels should have an auth token
        expect(tunnel.auth_token).toBeTruthy();
      } finally {
        await devbox.shutdown();
      }
    });

    test.concurrent('enable V2 tunnel with default params', async () => {
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-enable-tunnel-default'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });

      try {
        // Enable V2 tunnel without specifying params (should default to open/public)
        const tunnel = await devbox.net.enableTunnel();

        expect(tunnel).toBeDefined();
        expect(tunnel.tunnel_key).toBeTruthy();
        expect(tunnel.create_time_ms).toBeTruthy();
      } finally {
        await devbox.shutdown();
      }
    });

    test.concurrent('create devbox with tunnel in create params', async () => {
      // Create devbox with tunnel configured at launch time
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-tunnel-create'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
        tunnel: { auth_mode: 'open' },
      });

      try {
        // Verify tunnel was created at launch time
        const info = await devbox.getInfo();
        expect(info.tunnel).toBeDefined();
        expect(info.tunnel?.tunnel_key).toBeTruthy();
        expect(info.tunnel?.auth_mode).toBe('open');
      } finally {
        await devbox.shutdown();
      }
    });

    test.concurrent('create devbox with authenticated tunnel in create params', async () => {
      // Create devbox with authenticated tunnel at launch time
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-tunnel-auth-create'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
        tunnel: { auth_mode: 'authenticated' },
      });

      try {
        // Verify authenticated tunnel was created
        const info = await devbox.getInfo();
        expect(info.tunnel).toBeDefined();
        expect(info.tunnel?.tunnel_key).toBeTruthy();
        expect(info.tunnel?.auth_mode).toBe('authenticated');
        expect(info.tunnel?.auth_token).toBeTruthy();
      } finally {
        await devbox.shutdown();
      }
    });

    test.concurrent('getTunnel returns null when no tunnel enabled', async () => {
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-get-tunnel-null'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });

      try {
        const tunnel = await devbox.getTunnel();
        expect(tunnel).toBeNull();
      } finally {
        await devbox.shutdown();
      }
    });

    test.concurrent('getTunnel returns tunnel info after enabling', async () => {
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-get-tunnel'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });

      try {
        const enabledTunnel = await devbox.net.enableTunnel({ auth_mode: 'open' });
        expect(enabledTunnel.tunnel_key).toBeTruthy();

        const tunnel = await devbox.getTunnel();
        expect(tunnel).not.toBeNull();
        expect(tunnel?.tunnel_key).toBe(enabledTunnel.tunnel_key);
        expect(tunnel?.auth_mode).toBe('open');
      } finally {
        await devbox.shutdown();
      }
    });

    test.concurrent('getTunnelUrl constructs correct URL', async () => {
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-get-tunnel-url'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });

      try {
        const tunnel = await devbox.net.enableTunnel({ auth_mode: 'open' });
        expect(tunnel.tunnel_key).toBeTruthy();

        const url = await devbox.getTunnelUrl(8080);
        expect(url).toContain(`https://8080-${tunnel.tunnel_key}.tunnel.runloop.`);

        const url3000 = await devbox.getTunnelUrl(3000);
        expect(url3000).toContain(`https://3000-${tunnel.tunnel_key}.tunnel.runloop.`);
      } finally {
        await devbox.shutdown();
      }
    });

    test.concurrent('getTunnelUrl throws RunloopError when no tunnel enabled', async () => {
      const devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-get-tunnel-url-error'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });

      try {
        // Verify getTunnelUrl throws RunloopError when no tunnel is enabled
        await expect(devbox.getTunnelUrl(8080)).rejects.toThrow('No tunnel has been enabled');
      } finally {
        await devbox.shutdown();
      }
    });
  });

  describe('command execution with streaming callbacks', () => {
    let devbox: Devbox;

    beforeAll(async () => {
      devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-streaming'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });
    }, SHORT_TIMEOUT);

    afterAll(async () => {
      if (devbox) {
        await devbox.shutdown();
      }
    });

    test.concurrent('exec with stdout callback', async () => {
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

    test.concurrent('exec with stderr callback', async () => {
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

    test.concurrent('exec with output callback (both stdout and stderr)', async () => {
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

    test.concurrent('exec with all three callbacks (stdout, stderr, output)', async () => {
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

    test.concurrent('exec WITHOUT callbacks (preserve existing behavior)', async () => {
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

    test.concurrent('execAsync with stderr callback', async () => {
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

    test.concurrent('exec with command producing both stdout and stderr', async () => {
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

    test.concurrent('exec with long output - verify all lines received', async () => {
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

  describe('devbox logs', () => {
    let devbox: Devbox;

    beforeAll(async () => {
      devbox = await sdk.devbox.create({
        name: uniqueName('sdk-devbox-logs'),
        launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
      });
    }, SHORT_TIMEOUT);

    afterAll(async () => {
      if (devbox) {
        await devbox.shutdown();
      }
    });

    test.concurrent('logs - basic retrieval', async () => {
      expect(devbox).toBeDefined();

      // Fetch logs - verifies API returns valid response structure
      // Logs may be empty depending on timing
      const logs = await devbox.logs();

      expect(logs).toBeDefined();
      expect(logs.logs).toBeDefined();
      expect(Array.isArray(logs.logs)).toBe(true);
    });

    test.concurrent('logs - with execution_id filter', async () => {
      expect(devbox).toBeDefined();

      // Run a command and get its execution ID
      const execution = await devbox.cmd.execAsync('echo "filtered log test"');
      const result = await execution.result();
      expect(result.exitCode).toBe(0);

      // Fetch logs filtered by execution ID - verifies API accepts the filter
      const logs = await devbox.logs({ execution_id: execution.executionId });

      expect(logs).toBeDefined();
      expect(Array.isArray(logs.logs)).toBe(true);
    });
  });
});
