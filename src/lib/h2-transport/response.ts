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

  private _bodyConsumed = false;
  private _bodyBytes: Buffer | null = null;

  constructor(
    status: number,
    headers: H2Headers,
    body: ReadableStream<Uint8Array>,
    url: string,
  ) {
    this.status = status;
    this.ok = status >= 200 && status < 300;
    this.url = url;
    this.headers = headers;
    this.body = body;
  }

  private async _consumeBody(): Promise<Buffer> {
    if (this._bodyBytes !== null) return this._bodyBytes;
    if (this._bodyConsumed) throw new Error('Body already consumed');
    this._bodyConsumed = true;

    const chunks: Buffer[] = [];
    const reader = this.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(Buffer.isBuffer(value) ? value : Buffer.from(value));
    }
    reader.releaseLock();
    this._bodyBytes = Buffer.concat(chunks);
    return this._bodyBytes;
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
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  }
}
