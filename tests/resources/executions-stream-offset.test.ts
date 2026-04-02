import { APIPromise, type APIResponseProps } from '../../src/core';
import { APIError } from '../../src/error';
import { Executions, type ExecutionUpdateChunk } from '../../src/resources/devboxes/executions';
import { Stream } from '../../src/streaming';
import type { Runloop } from '../../src/index';

function sseChunkStreamPromise(
  sseBody: string,
  path: string,
): APIPromise<Stream<ExecutionUpdateChunk>> {
  const controller = new AbortController();
  const stream = Stream.fromSSEResponse(
    new Response(sseBody, { headers: { 'content-type': 'text/event-stream' } }) as any,
    controller,
  ) as Stream<ExecutionUpdateChunk>;
  const props = {
    response: new Response(null, { status: 200 }),
    options: { method: 'get', path, stream: true } as any,
    controller: stream.controller,
  } as unknown as APIResponseProps;
  return new APIPromise(Promise.resolve(props), () => stream);
}

describe('Executions stream offset with reconnect', () => {
  let mockGet: jest.Mock;
  let executions: Executions;

  beforeEach(() => {
    mockGet = jest.fn();
    const client = { get: mockGet } as unknown as Runloop;
    executions = new Executions(client);
  });

  test('first request uses query.offset when provided', async () => {
    const data = JSON.stringify({ output: 'x', offset: 100 });
    mockGet.mockReturnValue(sseChunkStreamPromise(`data: ${data}\n\n`, '/s'));

    const stream = await executions.streamStdoutUpdates('dbx', 'exe', { offset: '100' });
    for await (const _ of stream) {
      break;
    }

    expect(mockGet.mock.calls[0]![1].query.offset).toBe('100');
  });

  test('reconnect uses last chunk offset after 408', async () => {
    const timeout = new APIError(408, { code: '408' }, 't', undefined);
    const encoder = new TextEncoder();
    mockGet
      .mockImplementationOnce((_path: string, opts: { query: { offset?: string } }) => {
        expect(opts.query.offset).toBe('50');
        let pullCount = 0;
        const body = new ReadableStream<Uint8Array>({
          pull(c) {
            pullCount += 1;
            if (pullCount === 1) {
              c.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ output: 'a', offset: 60 })}\n\n`,
                ),
              );
            } else {
              c.error(timeout);
            }
          },
        });
        const controller = new AbortController();
        const stream = Stream.fromSSEResponse(
          new Response(body, { headers: { 'content-type': 'text/event-stream' } }) as any,
          controller,
        ) as Stream<ExecutionUpdateChunk>;
        const props = {
          response: new Response(null, { status: 200 }),
          options: { method: 'get', path: '/s', stream: true } as any,
          controller: stream.controller,
        } as unknown as APIResponseProps;
        return new APIPromise(Promise.resolve(props), () => stream);
      })
      .mockImplementationOnce((_path: string, opts: { query: { offset?: string } }) => {
        expect(opts.query.offset).toBe('60');
        const data = JSON.stringify({ output: 'b', offset: 70 });
        return sseChunkStreamPromise(`data: ${data}\n\n`, '/s');
      });

    const stream = await executions.streamStdoutUpdates('dbx', 'exe', { offset: '50' });
    const parts: string[] = [];
    for await (const ch of stream) {
      parts.push(ch.output);
    }
    expect(parts.join('')).toContain('a');
    expect(parts.join('')).toContain('b');
  });
});
