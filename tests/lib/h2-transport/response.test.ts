import { ReadableStream } from 'node:stream/web';
import { H2Headers } from '../../../src/lib/h2-transport/headers';
import { H2Response } from '../../../src/lib/h2-transport/response';

function makeResponse(data: string | Buffer, status = 200, contentType = 'application/json'): H2Response {
  const buf = typeof data === 'string' ? Buffer.from(data) : data;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(buf));
      controller.close();
    },
  });
  return new H2Response(
    status,
    new H2Headers({ 'content-type': contentType }),
    body,
    'https://test/path?q=1',
  );
}

describe('H2Response', () => {
  test('.status and .ok', () => {
    expect(makeResponse('', 200).ok).toBe(true);
    expect(makeResponse('', 201).ok).toBe(true);
    expect(makeResponse('', 299).ok).toBe(true);
    expect(makeResponse('', 300).ok).toBe(false);
    expect(makeResponse('', 400).ok).toBe(false);
    expect(makeResponse('', 500).ok).toBe(false);
    expect(makeResponse('', 204).status).toBe(204);
  });

  test('.url echoes constructor input verbatim including query string', () => {
    expect(makeResponse('').url).toBe('https://test/path?q=1');
  });

  test('.text() returns UTF-8 string', async () => {
    expect(await makeResponse('hello world').text()).toBe('hello world');
    expect(await makeResponse('héllo 世界').text()).toBe('héllo 世界');
  });

  test('.json() parses body', async () => {
    expect(await makeResponse('{"key":"value","n":1}').json()).toEqual({ key: 'value', n: 1 });
  });

  test('.text() then .json() returns the same parsed value (cached buffer)', async () => {
    const r = makeResponse('{"a":1}');
    expect(await r.text()).toBe('{"a":1}');
    expect(await r.json()).toEqual({ a: 1 });
  });

  test('.text() twice returns the same string', async () => {
    const r = makeResponse('repeatable');
    expect(await r.text()).toBe('repeatable');
    expect(await r.text()).toBe('repeatable');
  });

  test('.arrayBuffer() returns a tight ArrayBuffer', async () => {
    const r = makeResponse(Buffer.from([1, 2, 3, 4]));
    const ab = await r.arrayBuffer();
    expect(ab.byteLength).toBe(4);
    expect(new Uint8Array(ab)).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  test('.blob() carries the content-type', async () => {
    const r = makeResponse('hello', 200, 'text/plain');
    const blob = await r.blob();
    expect(blob.type).toBe('text/plain');
    expect(await blob.text()).toBe('hello');
  });

  test('.json() on empty body throws SyntaxError', async () => {
    await expect(makeResponse('').json()).rejects.toThrow(SyntaxError);
  });

  // Note: reading .body directly bypasses _bodyConsumed tracking, so a
  // subsequent .text()/.json() call sees an empty stream and returns "" rather
  // than throwing. This is documented current behavior — fixing it would
  // require wrapping .body in a tracking ReadableStream. See testing.md §9.
  test('reading .body directly then calling .text() returns empty (current behavior)', async () => {
    const r = makeResponse('payload');
    const reader = r.body.getReader();
    while (!(await reader.read()).done) {
      /* drain */
    }
    reader.releaseLock();
    expect(await r.text()).toBe('');
  });
});
