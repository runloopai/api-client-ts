import { Readable } from 'node:stream';
import { normalizeBody } from '../../src/lib/undici-fetch';
import { MultipartBody } from '../../src/_shims/MultipartBody';

// The adapter's only non-trivial logic: mapping the body shapes core.ts produces onto a valid
// undici BodyInit. End-to-end behavior over both transports is covered by the smoke matrix
// (http1/http2) and verify-http2.mjs; this just pins the shape-conversion rules.
describe('undici-fetch / normalizeBody', () => {
  test('passes string / Buffer / typed array through unchanged (non-stream)', () => {
    expect(normalizeBody('hi')).toEqual({ body: 'hi', isStream: false });
    const buf = Buffer.from('b');
    expect(normalizeBody(buf)).toEqual({ body: buf, isStream: false });
    const u8 = new Uint8Array([1, 2]);
    expect(normalizeBody(u8)).toEqual({ body: u8, isStream: false });
  });

  test('wraps an ArrayBuffer in a Buffer', () => {
    const out = normalizeBody(new Uint8Array([1, 2, 3]).buffer);
    expect(out.isStream).toBe(false);
    expect(Buffer.isBuffer(out.body)).toBe(true);
  });

  test('returns an undefined body for null / undefined', () => {
    expect(normalizeBody(null)).toEqual({ body: undefined, isStream: false });
    expect(normalizeBody(undefined)).toEqual({ body: undefined, isStream: false });
  });

  test('converts a Node Readable to a web ReadableStream and flags isStream', () => {
    const out = normalizeBody(Readable.from(['x']));
    expect(out.isStream).toBe(true);
    expect(typeof out.body.getReader).toBe('function'); // WHATWG ReadableStream
  });

  test('unwraps MultipartBody to its inner stream', () => {
    const out = normalizeBody(new MultipartBody(Readable.from(['x'])));
    expect(out.isStream).toBe(true);
    expect(typeof out.body.getReader).toBe('function');
  });
});
