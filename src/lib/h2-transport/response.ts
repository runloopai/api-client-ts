import { Blob } from 'node:buffer';
import { H2Headers } from './headers';

/**
 * Minimal Response wrapper satisfying the SDK's usage:
 *   .status, .ok, .url, .headers, .body, .json(), .text()
 */
export class H2Response {
  readonly status: number;
  readonly ok: boolean;
  readonly url: string;
  readonly headers: H2Headers;
  readonly body: ReadableStream<Uint8Array>;

  private _bodyPromise: Promise<Buffer> | null = null;

  constructor(status: number, headers: H2Headers, body: ReadableStream<Uint8Array>, url: string) {
    this.status = status;
    this.ok = status >= 200 && status < 300;
    this.url = url;
    this.headers = headers;
    this.body = body;
  }

  private _consumeBody(): Promise<Buffer> {
    if (this._bodyPromise) return this._bodyPromise;
    this._bodyPromise = (async () => {
      const chunks: Buffer[] = [];
      const reader = this.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(Buffer.isBuffer(value) ? value : Buffer.from(value));
        }
      } finally {
        reader.releaseLock();
      }
      return Buffer.concat(chunks);
    })();
    return this._bodyPromise;
  }

  async text(): Promise<string> {
    const buf = await this._consumeBody();
    return buf.toString('utf-8');
  }

  async json(): Promise<any> {
    const text = await this.text();
    return JSON.parse(text);
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const buf = await this._consumeBody();
    // Buffer.concat() always returns a fresh buffer with byteOffset=0 whose
    // backing ArrayBuffer is exactly buf.byteLength bytes — no copy needed.
    if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
      return buf.buffer;
    }
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }

  async blob(): Promise<Blob> {
    const buf = await this._consumeBody();
    return new Blob([buf], { type: this.headers.get('content-type') ?? undefined });
  }
}
