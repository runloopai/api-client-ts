import { makeClient, THIRTY_SECOND_TIMEOUT, uniqueName } from './utils';

const client = makeClient();

describe('smoketest: executions', () => {
  let devboxId: string | undefined;
  let execId: string | undefined;

  afterAll(async () => {
    if (devboxId) {
      await client.devboxes.shutdown(devboxId);
    }
  });

  test(
    'launch devbox',
    async () => {
      const created = await client.devboxes.createAndAwaitRunning(
        {
          name: uniqueName('exec-devbox'),
          launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
        },
        {
          polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: 20 * 60 * 1000 },
        },
      );
      devboxId = created.id;
    },
    THIRTY_SECOND_TIMEOUT,
  );

  test('execute async and await completion', async () => {
    const started = await client.devboxes.executions.executeAsync(devboxId!, {
      command: 'echo hello && sleep 1',
    });
    execId = started.execution_id;
    const completed = await client.devboxes.executions.awaitCompleted(devboxId!, execId!, {
      polling: { maxAttempts: 120, pollingIntervalMs: 2_000, timeoutMs: 10 * 60 * 1000 },
    });
    expect(completed.status).toBe('completed');
  });

  test('tail stdout logs', async () => {
    const stream = await client.devboxes.executions.streamStdoutUpdates(devboxId!, execId!, {});
    let received = '';
    for await (const chunk of stream) {
      received += chunk.output;
      if (received.length > 0) break; // stop early to avoid long loops in CI
    }
    expect(typeof received).toBe('string');
  });

  test('tail stderr logs', async () => {
    // Create a new execution that produces stderr output
    const stderrExec = await client.devboxes.executions.executeAsync(devboxId!, {
      command: 'echo "error output" >&2 && sleep 1',
    });
    const stderrExecId = stderrExec.execution_id;
    await client.devboxes.executions.awaitCompleted(devboxId!, stderrExecId, {
      polling: { maxAttempts: 120, pollingIntervalMs: 2_000, timeoutMs: 10 * 60 * 1000 },
    });

    const stream = await client.devboxes.executions.streamStderrUpdates(devboxId!, stderrExecId, {});
    let received = '';
    for await (const chunk of stream) {
      received += chunk.output;
      if (received.length > 0) break; // stop early to avoid long loops in CI
    }
    expect(typeof received).toBe('string');
    expect(received).toContain('error output');
  });

  test('executeAndAwaitCompletion', async () => {
    const completed = await client.devboxes.executeAndAwaitCompletion(devboxId!, {
      command: 'echo hello && sleep 1',
    });
    expect(completed.status).toBe('completed');
  });

  test(
    'executeAndAwaitCompletion long running command',
    async () => {
      const completed = await client.devboxes.executeAndAwaitCompletion(devboxId!, {
        command: 'sleep 70',
      });
      expect(completed.status).toBe('completed');
    },
    THIRTY_SECOND_TIMEOUT * 3,
  );

  test(
    'executeAndAwaitCompletion timeout',
    async () => {
      // Use polling options
      await expect(
        client.devboxes.executeAndAwaitCompletion(
          devboxId!,
          {
            command: 'sleep 30',
          },
          {
            polling: { pollingIntervalMs: 100, maxAttempts: 1, timeoutMs: 3000 },
          },
        ),
      ).rejects.toThrow();

      // Use timeout option
      await expect(
        client.devboxes.executeAndAwaitCompletion(
          devboxId!,
          {
            command: 'sleep 30',
          },
          {
            timeout: 3000,
          },
        ),
      ).rejects.toThrow();
    },
    THIRTY_SECOND_TIMEOUT,
  );

  test('executeAndAwaitCompletion with last_n parameter', async () => {
    // This test verifies that the last_n parameter correctly limits output to the last N lines
    // Execute a command that produces multiple lines of output
    const completed = await client.devboxes.executeAndAwaitCompletion(devboxId!, {
      command: 'echo "line 1" && echo "line 2" && echo "line 3" && echo "line 4" && echo "line 5"',
      last_n: '3', // Only get the last 3 lines
    });

    expect(completed.status).toBe('completed');
    expect(completed.stdout).toBeDefined();

    // The output should contain only the last 3 lines (lines 3, 4, 5)
    const outputLines = completed.stdout?.trim().split('\n') || [];
    expect(outputLines).toHaveLength(3);
    expect(outputLines[0]).toBe('line 3');
    expect(outputLines[1]).toBe('line 4');
    expect(outputLines[2]).toBe('line 5');
  });

  test('executeAndAwaitCompletion without last_n parameter', async () => {
    // This test verifies that without last_n, all output is returned
    // Execute the same command without last_n to compare
    const completed = await client.devboxes.executeAndAwaitCompletion(devboxId!, {
      command: 'echo "line 1" && echo "line 2" && echo "line 3" && echo "line 4" && echo "line 5"',
      // No last_n parameter - should return all output
    });

    expect(completed.status).toBe('completed');
    expect(completed.stdout).toBeDefined();

    // The output should contain all 5 lines
    const outputLines = completed.stdout?.trim().split('\n') || [];
    expect(outputLines).toHaveLength(5);
    expect(outputLines[0]).toBe('line 1');
    expect(outputLines[1]).toBe('line 2');
    expect(outputLines[2]).toBe('line 3');
    expect(outputLines[3]).toBe('line 4');
    expect(outputLines[4]).toBe('line 5');
  });

  test('executeAndAwaitCompletion with stderr output', async () => {
    // This test verifies that stderr output is captured
    const completed = await client.devboxes.executeAndAwaitCompletion(devboxId!, {
      command: 'echo "Error message" >&2',
    });

    expect(completed.status).toBe('completed');
    expect(completed.stderr).toBeDefined();
    expect(completed.stderr).toContain('Error message');
  });

  test('executeAndAwaitCompletion with multiple stderr lines', async () => {
    // This test verifies that multiple lines of stderr are captured
    const completed = await client.devboxes.executeAndAwaitCompletion(devboxId!, {
      command: 'echo "error 1" >&2 && echo "error 2" >&2 && echo "error 3" >&2',
    });

    expect(completed.status).toBe('completed');
    expect(completed.stderr).toBeDefined();

    const errorLines = completed.stderr?.trim().split('\n') || [];
    expect(errorLines.length).toBeGreaterThanOrEqual(3);
    expect(completed.stderr).toContain('error 1');
    expect(completed.stderr).toContain('error 2');
    expect(completed.stderr).toContain('error 3');
  });

  test('executeAndAwaitCompletion with both stdout and stderr', async () => {
    // This test verifies that both stdout and stderr are captured separately
    const completed = await client.devboxes.executeAndAwaitCompletion(devboxId!, {
      command: 'echo "stdout message" && echo "stderr message" >&2',
    });

    expect(completed.status).toBe('completed');
    expect(completed.stdout).toBeDefined();
    expect(completed.stderr).toBeDefined();
    expect(completed.stdout).toContain('stdout message');
    expect(completed.stderr).toContain('stderr message');
    // Verify they are separate
    expect(completed.stdout).not.toContain('stderr message');
    expect(completed.stderr).not.toContain('stdout message');
  });
});
