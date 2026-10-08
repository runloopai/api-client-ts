import { createServer, type Server } from 'node:http';
import { Runloop } from '../../src/index';
import { Execution } from '../../src/sdk/execution';
import { APIUserAbortError, RunloopError } from '../../src/error';
import type { ExecutionSendStdInParams } from '../../src/resources/devboxes/executions';

// Exercise real generated request construction, not a mocked client.post().
describe('execution stdin HTTP contract', () => {
  let server: Server;
  let client: Runloop;
  let execution: Execution;
  let requests: unknown[];
  let success: boolean;
  const path = '/v1/devboxes/devbox-123/executions/exec-456/send_std_in';
  const options = () => ({
    headers: { 'x-probe': 'stdin-options' },
    signal: new AbortController().signal,
    timeout: 1000,
  });

  beforeEach(async () => {
    requests = [];
    success = true;
    server = createServer(async (req, res) => {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      const text = Buffer.concat(chunks).toString();
      requests.push({
        method: req.method,
        path: req.url,
        body: text ? JSON.parse(text) : null,
        probe: req.headers['x-probe'],
      });
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ devbox_id: 'devbox-123', execution_id: 'exec-456', success }));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing test server address');
    client = new Runloop({
      bearerToken: 'synthetic',
      baseURL: `http://127.0.0.1:${address.port}`,
      maxRetries: 0,
      http2: false,
    });
    execution = new Execution(client, 'devbox-123', 'exec-456', {
      devbox_id: 'devbox-123',
      execution_id: 'exec-456',
      status: 'running',
    });
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });

  const bodies: ExecutionSendStdInParams[] = [
    { text: 'hello\n' },
    { signal: 'EOF' },
    { signal: 'INTERRUPT' },
  ];
  test.each(bodies)('regular client keeps %j in JSON with fourth-argument request options', async (body) => {
    const response = await client.devboxes.executions.sendStdIn('devbox-123', 'exec-456', body, options());
    expect(response.success).toBe(true);
    expect(requests).toEqual([{ method: 'POST', path, body, probe: 'stdin-options' }]);
  });

  describe.each([true, false])('API success: %s', (delivered) => {
    test.each(['sendStdIn', 'closeStdIn'] as const)(
      '%s delegates and preserves the delivery contract',
      async (method) => {
        success = delivered;
        const generated = jest.spyOn(client.devboxes.executions, 'sendStdIn');
        const requestOptions = options();
        const body = method === 'sendStdIn' ? { text: 'hello\n' } : { signal: 'EOF' };
        const result =
          method === 'sendStdIn' ?
            execution.sendStdIn('hello\n', requestOptions)
          : execution.closeStdIn(requestOptions);
        if (delivered) await expect(result).resolves.toBeUndefined();
        else await expect(result).rejects.toThrow(RunloopError);
        expect(generated).toHaveBeenCalledTimes(1);
        expect(generated).toHaveBeenCalledWith('devbox-123', 'exec-456', body, requestOptions);
        expect(requests).toEqual([{ method: 'POST', path, body, probe: 'stdin-options' }]);
      },
    );
  });

  test.each(['regular', 'object-oriented'])(
    '%s respects AbortSignal separately from EOF',
    async (surface) => {
      const controller = new AbortController();
      controller.abort();
      const requestOptions = { ...options(), signal: controller.signal };
      const result =
        surface === 'regular' ?
          client.devboxes.executions.sendStdIn('devbox-123', 'exec-456', { signal: 'EOF' }, requestOptions)
        : execution.closeStdIn(requestOptions);
      await expect(result).rejects.toThrow(APIUserAbortError);
      expect(requests).toEqual([]);
    },
  );
});
