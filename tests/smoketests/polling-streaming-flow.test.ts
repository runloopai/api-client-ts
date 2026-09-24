/**
 * E2E coverage for poll() AbortSignal paths, scenario awaitScored with signal,
 * and streaming reconnect helpers against the live API.
 */
import { LongPollAbortError } from '@runloop/api-client';
import { Axon, ScenarioRun } from '@runloop/api-client/sdk';
import { makeClient, SHORT_TIMEOUT, uniqueName } from './utils';

const client = makeClient();

(process.env['RUN_SMOKETESTS'] ? describe : describe.skip)(
  'smoketest: polling signal and streaming flows',
  () => {
    let scenarioId: string | undefined;

    beforeAll(async () => {
      const scenario = await client.scenarios.create({
        name: uniqueName('sdk-poll-stream-flow'),
        input_context: { problem_statement: 'Signal and stream smoke' },
        scoring_contract: {
          scoring_function_parameters: [
            {
              name: 'smoke-scorer',
              scorer: { type: 'command_scorer', command: 'true' },
              weight: 1,
            },
          ],
        },
      });
      scenarioId = scenario.id;
    }, SHORT_TIMEOUT);

    test.concurrent(
      'awaitScored respects AbortSignal (LongPollAbortError)',
      async () => {
        const runView = await client.scenarios.startRun({
          scenario_id: scenarioId!,
          run_name: uniqueName('sdk-await-scored-abort'),
        });
        const run = new ScenarioRun(client, runView.id, runView.devbox_id);

        await run.awaitEnvReady({
          longPoll: { timeoutMs: 20 * 60 * 1000 },
        });

        await run.score();

        const ac = new AbortController();
        setTimeout(() => ac.abort(), 50);

        await expect(
          run.awaitScored({
            longPoll: { timeoutMs: 30 * 60 * 1000 },
            signal: ac.signal,
          }),
        ).rejects.toThrow(LongPollAbortError);

        try {
          await client.devboxes.shutdown(runView.devbox_id);
        } catch {
          // best-effort cleanup
        }
      },
      SHORT_TIMEOUT,
    );

    test.concurrent(
      'scenarios.runs.awaitScored forwards signal to poll',
      async () => {
        const runView = await client.scenarios.startRun({
          scenario_id: scenarioId!,
          run_name: uniqueName('sdk-runs-await-scored-abort'),
        });

        await client.devboxes.awaitRunning(runView.devbox_id, {
          longPoll: { timeoutMs: 20 * 60 * 1000 },
        });

        await client.scenarios.runs.score(runView.id);

        const ac = new AbortController();
        setTimeout(() => ac.abort(), 50);

        await expect(
          client.scenarios.runs.awaitScored(runView.id, {
            longPoll: { timeoutMs: 30 * 60 * 1000 },
            signal: ac.signal,
          }),
        ).rejects.toThrow(LongPollAbortError);

        try {
          await client.devboxes.shutdown(runView.devbox_id);
        } catch {
          // ignore
        }
      },
      SHORT_TIMEOUT,
    );

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

          const stream = await client.devboxes.executions.streamStdoutUpdates(devbox.id, started.execution_id, {});
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
