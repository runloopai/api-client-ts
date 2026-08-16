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

// HTTP/2 default flow-control window is 64 KB per stream. At a typical RTT of
// ~60 ms that caps throughput at ~1 MB/s. Set a much larger window so large
// downloads aren't bottlenecked by round-trip-limited WINDOW_UPDATE cycles.
const DEFAULT_INITIAL_WINDOW_SIZE = 16 * 1024 * 1024; // 16 MB

const createAbortError = (): Error => Object.assign(new Error('Request aborted'), { name: 'AbortError' });

/** Cause retained when a peer ends an HTTP/2 session with GOAWAY. */
export class H2GoawayError extends Error {
  readonly code = 'ERR_HTTP2_GOAWAY_SESSION';

  constructor(
    readonly errorCode: number,
    readonly lastStreamID: number,
    readonly opaqueData?: Uint8Array,
    readonly unprocessed = false,
  ) {
    const debug = opaqueData ? Buffer.from(opaqueData).toString('utf8') : '';
    super(`HTTP/2 GOAWAY (error code ${errorCode}, last stream ${lastStreamID})${debug ? `: ${debug}` : ''}`);
    this.name = 'H2GoawayError';
  }
}

export class H2Session {
  readonly origin: string;

  private _state = SessionState.CONNECTING;
  private _activeStreams = 0;
  private _maxConcurrentStreams: number;
  private _session: http2.ClientHttp2Session | null = null;
  private _connectPromise: Promise<void> | null = null;
  private readonly _opts: H2SessionOptions;
  private readonly _goawayHandlers = new Set<
    (errorCode: number, lastStreamID: number, opaqueData?: Buffer) => void
  >();

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
      const session = http2.connect(this.origin, {
        ...this._opts.tlsOptions,
        settings: { initialWindowSize: DEFAULT_INITIAL_WINDOW_SIZE },
      });
      this._session = session;

      const timeout = setTimeout(() => {
        session.destroy(
          Object.assign(
            new Error(`H2 connect timeout after ${this._opts.connectTimeout ?? DEFAULT_CONNECT_TIMEOUT}ms`),
            { code: 'UND_ERR_CONNECT_TIMEOUT' },
          ),
        );
      }, this._opts.connectTimeout ?? DEFAULT_CONNECT_TIMEOUT);

      session.on('connect', () => {
        clearTimeout(timeout);
        this._state = SessionState.READY;
        // Enlarge the session-level flow-control window so the server can push
        // large responses without stalling on WINDOW_UPDATE round trips.
        session.setLocalWindowSize(DEFAULT_INITIAL_WINDOW_SIZE);
        // An idle pooled session must not keep the process alive; each in-flight
        // request re-refs the socket (see `request`) and it is unref'd again once
        // the stream count returns to zero.
        session.unref();
        resolve();
      });

      session.on('remoteSettings', (settings) => {
        if (settings.maxConcurrentStreams != null && !this._opts.maxConcurrentStreams) {
          this._maxConcurrentStreams = settings.maxConcurrentStreams;
        }
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

      session.on('goaway', (errorCode, lastStreamID, opaqueData) => {
        this._state = SessionState.DRAINING;
        if (this._activeStreams === 0) {
          this._close();
          return;
        }
        for (const handler of [...this._goawayHandlers]) {
          handler(errorCode, lastStreamID, opaqueData);
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
      // Keep the process alive while this request is outstanding; idle sessions
      // are unref'd (see `connect` and `cleanup`).
      this._session!.ref();

      let settled = false;
      let cleaned = false;
      let goawayCause: H2GoawayError | undefined;

      const onAbort = () => {
        if (!cleaned) {
          stream.destroy(createAbortError());
        }
      };

      if (signal) {
        if (signal.aborted) {
          stream.on('error', () => {});
          stream.destroy();
          this._activeStreams--;
          if (this._activeStreams === 0) this._session?.unref();
          reject(createAbortError());
          return;
        }
        signal.addEventListener('abort', onAbort, { once: true });
      }

      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        this._activeStreams--;
        if (this._activeStreams === 0) this._session?.unref();
        if (signal) signal.removeEventListener('abort', onAbort);
        this._goawayHandlers.delete(onGoaway);
        if (this._state === SessionState.DRAINING && this._activeStreams === 0) {
          this._close();
        }
        // Always notify the pool so it can route queued work to other sessions
        // (or grow) when this session is draining/closed and can't take more.
        this.onAvailable?.();
      };

      stream.once('close', () => {
        if (!settled) {
          settled = true;
          reject(
            goawayCause ??
              Object.assign(new Error('HTTP/2 stream closed before response headers.'), {
                code: 'ERR_HTTP2_STREAM_ERROR',
              }),
          );
        }
        cleanup();
      });

      const onGoaway = (errorCode: number, lastStreamID: number, opaqueData?: Buffer) => {
        // A stream above lastStreamID was not processed by the peer. Preserve all
        // GOAWAY metadata instead of replacing it with node:http2's generic error.
        const unprocessed = typeof stream.id === 'number' && stream.id > lastStreamID;
        goawayCause = new H2GoawayError(errorCode, lastStreamID, opaqueData, unprocessed);
        if (!settled && unprocessed) {
          settled = true;
          cleanup();
          stream.on('error', () => {});
          stream.destroy();
          reject(goawayCause);
        }
      };
      this._goawayHandlers.add(onGoaway);

      stream.on('error', (err) => {
        if (!settled) {
          settled = true;
          cleanup();
          reject(goawayCause ?? err);
        }
      });

      stream.on('response', (responseHeaders) => {
        settled = true;
        const status = responseHeaders[':status'] as number;
        const h2headers = new H2Headers(responseHeaders);

        const responseBody = new ReadableStream<Uint8Array>({
          start(controller) {
            stream.on('data', (chunk: Buffer) => {
              try {
                controller.enqueue(chunk);
              } catch {
                // ReadableStream was cancelled while data was still in flight
                // (consumer broke out of a for-await loop). Stop the h2 stream.
                stream.destroy();
              }
            });
            stream.on('end', () => {
              try {
                controller.close();
              } catch {
                // Already closed/cancelled — ignore
              }
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

  close(): Promise<void> {
    const session = this._session;
    if (!session || session.destroyed) {
      this._close();
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      session.once('close', resolve);
      this._close();
    });
  }

  private _close(): void {
    this._state = SessionState.CLOSED;
    if (this._session && !this._session.destroyed) {
      this._session.close();
    }
    this.onClose?.(this);
  }
}
