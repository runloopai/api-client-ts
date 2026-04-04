import { makeClientSDK, MEDIUM_TIMEOUT, SHORT_TIMEOUT } from '../utils';
import { Axon } from '@runloop/api-client/sdk';

const sdk = makeClientSDK();

// Note: The axon API does not currently expose a delete endpoint, so axons created
// by these tests persist. We minimize creation to a single axon per run.
(process.env['RUN_SMOKETESTS'] ? describe : describe.skip)('smoketest: object-oriented axons', () => {
  describe('axon lifecycle', () => {
    let axon: Axon;
    let axonId: string;

    beforeAll(async () => {
      axon = await sdk.axon.create();
      expect(axon).toBeDefined();
      expect(axon.id).toBeTruthy();
      axonId = axon.id;
    }, SHORT_TIMEOUT);

    test.concurrent('create axon', () => {
      expect(axon).toBeDefined();
      expect(axonId).toBeTruthy();
    });

    test.concurrent('get axon info', async () => {
      const info = await axon.getInfo();
      expect(info.id).toBe(axonId);
      expect(info.created_at_ms).toBeGreaterThan(0);
    });

    test.concurrent('get axon by ID via fromId', async () => {
      const retrieved = sdk.axon.fromId(axonId);
      expect(retrieved.id).toBe(axonId);

      const info = await retrieved.getInfo();
      expect(info.id).toBe(axonId);
    });

    test.concurrent('Axon.create (static) returns same shape', async () => {
      const staticAxon = Axon.fromId(sdk.api, axonId);
      expect(staticAxon).toBeDefined();
      expect(staticAxon.id).toBe(axonId);

      const info = await staticAxon.getInfo();
      expect(info.id).toBe(axonId);
    });

    test.concurrent('publish event to axon', async () => {
      const result = await axon.publish({
        event_type: 'test_event',
        origin: 'USER_EVENT',
        payload: JSON.stringify({ message: 'hello from smoke test' }),
        source: 'sdk-smoke-test',
      });

      expect(result).toBeDefined();
      expect(result.sequence).toBeGreaterThanOrEqual(0);
      expect(result.timestamp_ms).toBeGreaterThan(0);
    });

    test.concurrent('publish multiple events and verify sequence increases', async () => {
      const result1 = await axon.publish({
        event_type: 'seq_test',
        origin: 'USER_EVENT',
        payload: JSON.stringify({ seq: 1 }),
        source: 'sdk-smoke-test',
      });

      const result2 = await axon.publish({
        event_type: 'seq_test',
        origin: 'USER_EVENT',
        payload: JSON.stringify({ seq: 2 }),
        source: 'sdk-smoke-test',
      });

      expect(result2.sequence).toBeGreaterThan(result1.sequence);
    });

    test.concurrent(
      'SSE subscribe reconnects after idle (408) and resumes without duplicate sequences',
      async () => {
        const tag = 'reconnect-smoke';
        for (let n = 1; n <= 5; n += 1) {
          await axon.publish({
            event_type: 'reconnect_smoke',
            origin: 'USER_EVENT',
            payload: JSON.stringify({ tag, n }),
            source: 'sdk-smoke-test',
          });
        }

        const stream = await axon.subscribeSse();
        const sequences: number[] = [];
        const markers: number[] = [];

        const failIfNoReconnect = setTimeout(() => {
          stream.controller.abort();
        }, 4 * 60 * 1000);

        const publishAfterIdle = (async () => {
          // Hold the line open with no server traffic so the backend can return 408;
          // then publish fresh events that must arrive after reconnect with after_sequence.
          await new Promise((r) => setTimeout(r, 70_000));
          await axon.publish({
            event_type: 'reconnect_smoke',
            origin: 'USER_EVENT',
            payload: JSON.stringify({ tag, n: 6 }),
            source: 'sdk-smoke-test',
          });
          await axon.publish({
            event_type: 'reconnect_smoke',
            origin: 'USER_EVENT',
            payload: JSON.stringify({ tag, n: 7 }),
            source: 'sdk-smoke-test',
          });
        })();

        try {
          for await (const ev of stream) {
            let p: { tag?: string; n?: number };
            try {
              p = JSON.parse(ev.payload) as { tag?: string; n?: number };
            } catch {
              continue;
            }
            if (p.tag !== tag || typeof p.n !== 'number') continue;
            markers.push(p.n);
            sequences.push(ev.sequence);

            for (let i = 1; i < sequences.length; i += 1) {
              expect(sequences[i]).toBeGreaterThan(sequences[i - 1]!);
            }

            const uniq = new Set(sequences);
            expect(uniq.size).toBe(sequences.length);

            if (markers.includes(6) && markers.includes(7)) {
              expect(markers).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6, 7]));
              break;
            }
            if (sequences.length > 150) {
              throw new Error('Too many SSE events without completing reconnect-smoke scenario');
            }
          }
        } finally {
          clearTimeout(failIfNoReconnect);
          stream.controller.abort();
          await publishAfterIdle.catch(() => {});
        }

        expect(markers).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6, 7]));
      },
      MEDIUM_TIMEOUT,
    );

    test.concurrent('subscribe to SSE stream and receive events', async () => {
      // Ensure at least one event exists so the stream has something to replay
      await axon.publish({
        event_type: 'sse_test',
        origin: 'USER_EVENT',
        payload: JSON.stringify({ sse: true }),
        source: 'sdk-smoke-test',
      });

      const stream = await axon.subscribeSse();
      const events = [];
      for await (const event of stream) {
        events.push(event);
        break;
      }

      expect(events.length).toBeGreaterThanOrEqual(1);
      const first = events[0]!;
      expect(first.axon_id).toBe(axonId);
      expect(first.event_type).toBeDefined();
      expect(first.payload).toBeDefined();
      expect(first.sequence).toBeGreaterThanOrEqual(0);
    });

    test.concurrent('sql.query: create table and insert row', async () => {
      await axon.sql.query({
        sql: 'CREATE TABLE IF NOT EXISTS smoke_test (id INTEGER PRIMARY KEY, value TEXT)',
      });

      await axon.sql.query({
        sql: 'INSERT INTO smoke_test (id, value) VALUES (?, ?)',
        params: [1, 'hello'],
      });

      const result = await axon.sql.query({
        sql: 'SELECT * FROM smoke_test WHERE id = ?',
        params: [1],
      });

      expect(result.columns).toBeDefined();
      expect(result.columns.length).toBeGreaterThan(0);
      expect(result.rows.length).toBe(1);
      expect(result.meta.duration_ms).toBeGreaterThanOrEqual(0);
    });

    test.concurrent('sql.batch: execute multiple statements atomically', async () => {
      const result = await axon.sql.batch({
        statements: [
          { sql: 'CREATE TABLE IF NOT EXISTS batch_test (id INTEGER PRIMARY KEY, name TEXT)' },
          { sql: 'INSERT INTO batch_test (id, name) VALUES (?, ?)', params: [1, 'alice'] },
          { sql: 'INSERT INTO batch_test (id, name) VALUES (?, ?)', params: [2, 'bob'] },
          { sql: 'SELECT * FROM batch_test ORDER BY id' },
        ],
      });

      expect(result.results).toBeDefined();
      expect(result.results.length).toBe(4);
      const selectResult = result.results[3]!;
      expect(selectResult.success).toBeDefined();
      expect(selectResult.success!.rows.length).toBe(2);
    });
  });

  describe('axon list', () => {
    test.concurrent('list axons (AxonOps.list)', async () => {
      const axons = await sdk.axon.list();
      expect(Array.isArray(axons)).toBe(true);
    });
  });
});
