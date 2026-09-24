import { APIPromise, type APIResponseProps } from '../../src/core';
import { APIError } from '../../src/error';
import { Axons, type AxonEventView } from '../../src/resources/axons/axons';
import { Stream } from '../../src/streaming';
import type { Runloop } from '../../src/index';

function eventJson(seq: number) {
  return JSON.stringify({
    axon_id: 'axn_test',
    event_type: 'evt',
    origin: 'USER_EVENT',
    payload: '{}',
    sequence: seq,
    source: 'test',
    timestamp_ms: 0,
  });
}

function sseAPIPromiseForResponse(response: Response, path: string): APIPromise<Stream<AxonEventView>> {
  const controller = new AbortController();
  const props = {
    response,
    options: { method: 'get', path, stream: true } as any,
    controller,
  } as unknown as APIResponseProps;
  return new APIPromise(Promise.resolve(props), (p) =>
    Stream.fromSSEResponse(p.response, p.controller),
  ) as APIPromise<Stream<AxonEventView>>;
}

describe('Axons.subscribeSse query (after_sequence)', () => {
  let mockGet: jest.Mock;
  let axons: Axons;

  beforeEach(() => {
    mockGet = jest.fn();
    const client = { get: mockGet } as unknown as Runloop;
    axons = new Axons(client);
  });

  test('first GET omits query (no after_sequence)', async () => {
    const sse = `data: ${eventJson(1)}\n\n`;
    mockGet.mockReturnValue(
      sseAPIPromiseForResponse(
        new Response(sse, { headers: { 'content-type': 'text/event-stream' } }),
        '/v1/axons/axn_first/subscribe/sse',
      ),
    );

    const stream = await axons.subscribeSse('axn_first');
    const received: AxonEventView[] = [];
    for await (const ev of stream) {
      received.push(ev);
    }

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet.mock.calls[0]![0]).toBe('/v1/axons/axn_first/subscribe/sse');
    expect(mockGet.mock.calls[0]![1].query).toBeUndefined();
    expect(mockGet.mock.calls[0]![1].stream).toBe(true);
    expect(mockGet.mock.calls[0]![1].headers.Accept).toBe('text/event-stream');
    expect(received).toHaveLength(1);
    expect(received[0]!.sequence).toBe(1);
  });

  test('reconnect GET after 408 includes after_sequence from last delivered event', async () => {
    const encoder = new TextEncoder();
    const timeout = new APIError(408, { code: '408', message: 'idle' }, 'idle', undefined);
    let pulls = 0;
    const body1 = new ReadableStream<Uint8Array>({
      pull(c) {
        pulls += 1;
        if (pulls === 1) {
          c.enqueue(encoder.encode(`data: ${eventJson(7)}\n\n`));
        } else {
          c.error(timeout);
        }
      },
    });

    mockGet
      .mockReturnValueOnce(
        sseAPIPromiseForResponse(
          new Response(body1, { headers: { 'content-type': 'text/event-stream' } }),
          '/v1/axons/axn_re/subscribe/sse',
        ),
      )
      .mockReturnValueOnce(
        sseAPIPromiseForResponse(
          new Response(`data: ${eventJson(8)}\n\n`, {
            headers: { 'content-type': 'text/event-stream' },
          }),
          '/v1/axons/axn_re/subscribe/sse',
        ),
      );

    const stream = await axons.subscribeSse('axn_re');
    const received: AxonEventView[] = [];
    for await (const ev of stream) {
      received.push(ev);
    }

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(mockGet.mock.calls[0]![1].query).toBeUndefined();
    expect(mockGet.mock.calls[1]![1].query).toEqual({ after_sequence: '7' });
    expect(received.map((e) => e.sequence)).toEqual([7, 8]);
  });

  test('ignores options.query and only sends after_sequence on reconnect', async () => {
    const timeout = new APIError(408, { code: '408', message: 'idle' }, 'idle', undefined);
    const encoder = new TextEncoder();
    let first = true;
    mockGet.mockImplementation((_path: string, opts: { query?: Record<string, string> }) => {
      if (first) {
        first = false;
        let pullCount = 0;
        const body1 = new ReadableStream<Uint8Array>({
          pull(c) {
            pullCount += 1;
            if (pullCount === 1) {
              c.enqueue(encoder.encode(`data: ${eventJson(3)}\n\n`));
            } else {
              c.error(timeout);
            }
          },
        });
        expect(opts.query).toBeUndefined();
        return sseAPIPromiseForResponse(
          new Response(body1, { headers: { 'content-type': 'text/event-stream' } }),
          '/v1/axons/axn_q/subscribe/sse',
        );
      }
      expect(opts.query).toEqual({ after_sequence: '3' });
      return sseAPIPromiseForResponse(
        new Response(`data: ${eventJson(4)}\n\n`, {
          headers: { 'content-type': 'text/event-stream' },
        }),
        '/v1/axons/axn_q/subscribe/sse',
      );
    });

    const stream = await axons.subscribeSse('axn_q', undefined, { query: { filter: 'x' } });
    const received: AxonEventView[] = [];
    for await (const ev of stream) {
      received.push(ev);
    }
    expect(received.map((e) => e.sequence)).toEqual([3, 4]);
  });

  test('merges custom headers with Accept text/event-stream', async () => {
    mockGet.mockReturnValue(
      sseAPIPromiseForResponse(
        new Response(`data: ${eventJson(0)}\n\n`, {
          headers: { 'content-type': 'text/event-stream' },
        }),
        '/v1/axons/axn_h/subscribe/sse',
      ),
    );

    const stream = await axons.subscribeSse('axn_h', undefined, {
      headers: { 'X-Custom': 'yes' },
    });
    for await (const _ of stream) {
      // consume
    }

    const opts = mockGet.mock.calls[0]![1];
    expect(opts.headers.Accept).toBe('text/event-stream');
    expect(opts.headers['X-Custom']).toBe('yes');
  });
});
