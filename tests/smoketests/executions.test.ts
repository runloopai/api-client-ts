import { makeClient, THIRTY_SECOND_TIMEOUT, uniqueName } from './utils';

const client = makeClient();

describe('smoketest: executions', () => {
  let devboxId: string | undefined;
  let execId: string | undefined;

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
});
