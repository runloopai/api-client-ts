/**
 * E2E coverage for streaming reconnect helpers against the live API.
 */
import { Axon } from '@runloop/api-client/sdk';
import { makeClient, SHORT_TIMEOUT, uniqueName } from './utils';

const client = makeClient();

(process.env['RUN_SMOKETESTS'] ? describe : describe.skip)(
  'smoketest: polling signal and streaming flows',
  () => {
    test.concurrent(
      'axon subscribeSse receives events after publish (reconnect wrapper)',
      async () => {
        const axon = await Axon.create(client);
        await axon.publish({
          event_type: 'smoke_poll_stream',
          origin: 'USER_EVENT',
          payload: JSON.stringify({ n: 1 }),
          source: 'polling-streaming-flow',
        });

        const stream = await axon.subscribeSse();
        const events = [];
        for await (const ev of stream) {
          events.push(ev);
          break;
        }
        expect(events.length).toBeGreaterThanOrEqual(1);
        expect(events[0]!.axon_id).toBe(axon.id);
      },
      SHORT_TIMEOUT,
    );

    test.concurrent(
      'execution streamStdoutUpdates yields output (SSE reconnect wrapper)',
      async () => {
        const devbox = await client.devboxes.createAndAwaitRunning(
          {
            name: uniqueName('stream-smoke'),
            launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 },
          },
          { longPoll: { timeoutMs: 20 * 60 * 1000 } },
        );
        try {
          const started = await client.devboxes.executions.executeAsync(devbox.id, {
            command: 'echo stream-smoke-ok && sleep 1',
          });
          await client.devboxes.executions.awaitCompleted(devbox.id, started.execution_id, {
            longPoll: { timeoutMs: 10 * 60 * 1000 },
          });

          const stream = await client.devboxes.executions.streamStdoutUpdates(
            devbox.id,
            started.execution_id,
            {},
          );
          let out = '';
          for await (const chunk of stream) {
            out += chunk.output;
            if (out.includes('stream-smoke-ok')) break;
          }
          expect(out).toContain('stream-smoke-ok');
        } finally {
          try {
            await client.devboxes.shutdown(devbox.id);
          } catch {
            // ignore
          }
        }
      },
      SHORT_TIMEOUT,
    );
  },
);
