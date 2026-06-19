/**
 * Reproduce the early-cancel SSE bug with HTTP/2:
 * Break early from a large SSE stream and confirm no uncaught exceptions crash the process.
 */
import { Runloop } from '../src/sdk.ts';

const client = new Runloop({
  bearerToken: process.env['RUNLOOP_API_KEY'] ?? '',
  baseURL: process.env['RUNLOOP_BASE_URL'] ?? 'https://api.runloop.pro',
  timeout: 120_000,
  maxRetries: 0,
  http2: true,
});

const uncaughtErrors: string[] = [];
process.on('uncaughtException', (e) => {
  uncaughtErrors.push(e.message);
  console.error('UNCAUGHT:', e.message);
});
process.on('unhandledRejection', (e) => {
  uncaughtErrors.push(String(e));
  console.error('UNHANDLED REJECTION:', e);
});

async function main() {
  console.log('Creating devbox...');
  const devbox = await client.devboxes.createAndAwaitRunning(
    {
      name: `cancel-test-${Date.now()}`,
      launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 300 },
    },
    { longPoll: { timeoutMs: 5 * 60 * 1000 } },
  );
  console.log('Devbox:', devbox.id);

  try {
    // Produce a large amount of output
    const exec = await client.devboxes.executions.executeAsync(devbox.id, {
      command: 'seq 1 50000',
    });
    await client.devboxes.executions.awaitCompleted(devbox.id, exec.execution_id, {
      longPoll: { timeoutMs: 30_000 },
    });

    // Stream stdout but break immediately after the first event
    const stream = await client.devboxes.executions.streamStdoutUpdates(
      devbox.id,
      exec.execution_id,
      {},
    );
    let count = 0;
    for await (const _chunk of stream) {
      count++;
      break; // Cancel early while lots of data remains
    }
    console.log(`Broke out after ${count} chunk(s)`);

    // Wait for any deferred errors to surface
    await new Promise((r) => setTimeout(r, 1000));
    console.log(`After 1s wait, uncaught errors so far: ${uncaughtErrors.length}`);

    // Confirm the h2 pool is still healthy after the cancel
    const result = await client.devboxes.executeAndAwaitCompletion(devbox.id, {
      command: 'echo still-alive',
    });
    console.log('Pool health check after cancel:', result.stdout?.trim());

    // Wait once more to be sure
    await new Promise((r) => setTimeout(r, 500));

    if (uncaughtErrors.length > 0) {
      console.error('FAIL: got uncaught errors after SSE cancel:', uncaughtErrors);
      process.exitCode = 1;
    } else {
      console.log('PASS: no uncaught errors from early SSE cancel');
    }
  } finally {
    await client.devboxes.shutdown(devbox.id);
  }
}

main().catch((err) => {
  console.error('Unhandled error in main:', err);
  process.exit(1);
});
