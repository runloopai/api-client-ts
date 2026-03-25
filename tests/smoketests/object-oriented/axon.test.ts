import { makeClientSDK, SHORT_TIMEOUT } from '../utils';
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

    test('create axon', () => {
      expect(axon).toBeDefined();
      expect(axonId).toBeTruthy();
    });

    test('get axon info', async () => {
      const info = await axon.getInfo();
      expect(info.id).toBe(axonId);
      expect(info.created_at_ms).toBeGreaterThan(0);
    });

    test('get axon by ID via fromId', async () => {
      const retrieved = sdk.axon.fromId(axonId);
      expect(retrieved.id).toBe(axonId);

      const info = await retrieved.getInfo();
      expect(info.id).toBe(axonId);
    });

    test('Axon.create (static) returns same shape', async () => {
      const staticAxon = Axon.fromId(sdk.api, axonId);
      expect(staticAxon).toBeDefined();
      expect(staticAxon.id).toBe(axonId);

      const info = await staticAxon.getInfo();
      expect(info.id).toBe(axonId);
    });

    test('publish event to axon', async () => {
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

    test('publish multiple events and verify sequence increases', async () => {
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

    test('subscribe to SSE stream and receive events', async () => {
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

    test('sql.query: create table and insert row', async () => {
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

    test('sql.batch: execute multiple statements atomically', async () => {
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
    test('list axons (AxonOps.list)', async () => {
      const axons = await sdk.axon.list();
      expect(Array.isArray(axons)).toBe(true);
    });
  });
});
