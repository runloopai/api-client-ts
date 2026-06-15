import http2 from 'node:http2';
import type tls from 'node:tls';
import { ReadableStream } from 'node:stream/web';
import { H2Headers } from './headers';
import { H2Response } from './response';

export const enum SessionState {
  CONNECTING,
  READY,
  DRAINING,
  CLOSED,
}

export interface H2SessionOptions {
  connectTimeout?: number;
  maxConcurrentStreams?: number;
  tlsOptions?: tls.ConnectionOptions;
}

const DEFAULT_CONNECT_TIMEOUT = 30_000;

export class H2Session {
  readonly origin: string;

  private _state = SessionState.CONNECTING;
  private _activeStreams = 0;
  private _maxConcurrentStreams: number;
  private _session: http2.ClientHttp2Session | null = null;
  private _connectPromise: Promise<void> | null = null;
  private readonly _opts: H2SessionOptions;

  /** Called by the pool when a stream slot frees up. */
  onAvailable: (() => void) | null = null;
  /** Called when this session closes (goaway completed, error, etc). */
  onClose: ((session: H2Session) => void) | null = null;

  constructor(origin: string, opts: H2SessionOptions = {}) {
    this.origin = origin;
    this._opts = opts;
    this._maxConcurrentStreams = opts.maxConcurrentStreams ?? 100;
  }

  get state(): SessionState {
    return this._state;
  }
  get activeStreams(): number {
    return this._activeStreams;
  }
  get available(): boolean {
    return this._state === SessionState.READY && this._activeStreams < this._maxConcurrentStreams;
  }

  connect(): Promise<void> {
    if (this._connectPromise) return this._connectPromise;

    this._connectPromise = new Promise<void>((resolve, reject) => {
      const session = http2.connect(this.origin, this._opts.tlsOptions);
      this._session = session;

      const timeout = setTimeout(() => {
        session.destroy(
          new Error(`H2 connect timeout after ${this._opts.connectTimeout ?? DEFAULT_CONNECT_TIMEOUT}ms`),
        );
      }, this._opts.connectTimeout ?? DEFAULT_CONNECT_TIMEOUT);

      session.on('connect', () => {
        clearTimeout(timeout);
        const serverMax = session.remoteSettings?.maxConcurrentStreams;
        if (serverMax != null && !this._opts.maxConcurrentStreams) {
          this._maxConcurrentStreams = serverMax;
        }
        this._state = SessionState.READY;
        resolve();
      });

      session.on('error', (err) => {
        clearTimeout(timeout);
        if (this._state === SessionState.CONNECTING) {
          this._state = SessionState.CLOSED;
          reject(err);
        } else {
          this._state = SessionState.CLOSED;
          this.onClose?.(this);
        }
      });

      session.on('goaway', () => {
        this._state = SessionState.DRAINING;
        if (this._activeStreams === 0) {
          this._close();
        }
      });

      session.on('close', () => {
        if (this._state !== SessionState.CLOSED) {
          this._state = SessionState.CLOSED;
          this.onClose?.(this);
        }
      });
    });

    return this._connectPromise;
  }

  request(
    path: string,
    method: string,
    headers: Record<string, string>,
    body: string | Buffer | null,
    signal?: AbortSignal | null,
  ): Promise<H2Response> {
    if (!this._session || this._state === SessionState.CLOSED) {
      return Promise.reject(new Error('H2 session is closed'));
    }
    if (this._state === SessionState.DRAINING) {
      return Promise.reject(new Error('H2 session is draining'));
    }

    return new Promise<H2Response>((resolve, reject) => {
      const h2Headers: http2.OutgoingHttpHeaders = {
        ':method': method,
        ':path': path,
        ...headers,
      };

      const stream = this._session!.request(h2Headers);
      this._activeStreams++;

      let settled = false;

      const onAbort = () => {
        if (!settled) {
          stream.destroy(new Error('Request aborted'));
        }
      };

      if (signal) {
        if (signal.aborted) {
          stream.on('error', () => {});
          stream.destroy();
          this._activeStreams--;
          reject(new Error('Request aborted'));
          return;
        }
        signal.addEventListener('abort', onAbort, { once: true });
      }

      const cleanup = () => {
        this._activeStreams--;
        if (signal) signal.removeEventListener('abort', onAbort);
        if (this._state === SessionState.DRAINING && this._activeStreams === 0) {
          this._close();
        }
        if (this.available) {
          this.onAvailable?.();
        }
      };

      stream.on('error', (err) => {
        if (!settled) {
          settled = true;
          cleanup();
          reject(err);
        }
      });

      stream.on('response', (responseHeaders) => {
        settled = true;
        const status = responseHeaders[':status'] as number;
        const h2headers = new H2Headers(responseHeaders);

        const responseBody = new ReadableStream<Uint8Array>({
          start(controller) {
            stream.on('data', (chunk: Buffer) => {
              controller.enqueue(chunk);
            });
            stream.on('end', () => {
              controller.close();
              cleanup();
            });
            stream.on('error', (err) => {
              try {
                controller.error(err);
              } catch {
                // controller may already be closed
              }
              cleanup();
            });
          },
          cancel() {
            stream.destroy();
            cleanup();
          },
        });

        const url = `${this.origin}${path}`;
        resolve(new H2Response(status, h2headers, responseBody, url));
      });

      // Send the request body
      if (body != null) {
        stream.end(body);
      } else {
        stream.end();
      }
    });
  }

  close(): void {
    this._close();
  }

  private _close(): void {
    this._state = SessionState.CLOSED;
    if (this._session && !this._session.destroyed) {
      this._session.close();
    }
    this.onClose?.(this);
  }
}
