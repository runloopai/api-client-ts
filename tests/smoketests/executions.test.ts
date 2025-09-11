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
        { name: uniqueName('exec-devbox') },
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
});
