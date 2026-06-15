import { H2Session, SessionState, type H2SessionOptions } from './session';
import type { H2Response } from './response';

export interface H2PoolOptions extends H2SessionOptions {
  minConnections?: number;
  maxConnections?: number;
}

const DEFAULT_MIN_CONNECTIONS = 4;
const DEFAULT_MAX_CONNECTIONS = 20;
const RETRYABLE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE']);

interface QueuedRequest {
  path: string;
  method: string;
  headers: Record<string, string>;
  body: string | Buffer | null;
  signal: AbortSignal | null | undefined;
  resolve: (response: H2Response) => void;
  reject: (error: Error) => void;
}

export class H2Pool {
  private readonly _origin: string;
  private readonly _opts: H2PoolOptions;
  private readonly _sessions: H2Session[] = [];
  private readonly _queue: QueuedRequest[] = [];
  private _initialized = false;
  private _initPromise: Promise<void> | null = null;
  private _growing = false;
  private _closed = false;

  constructor(origin: string, opts: H2PoolOptions = {}) {
    this._origin = origin;
    this._opts = opts;
  }

  private get _minConnections(): number {
    return this._opts.minConnections ?? DEFAULT_MIN_CONNECTIONS;
  }

  private get _maxConnections(): number {
    return this._opts.maxConnections ?? DEFAULT_MAX_CONNECTIONS;
  }

  private _initialize(): Promise<void> {
    if (this._initialized) return Promise.resolve();
    if (this._initPromise) return this._initPromise;

    this._initPromise = this._createInitialSessions()
      .then(() => {
        this._initialized = true;
      })
      .catch((err) => {
        this._initPromise = null;
        throw err;
      });
    return this._initPromise;
  }

  private async _createInitialSessions(): Promise<void> {
    const tasks: Promise<unknown>[] = [];
    for (let i = 0; i < this._minConnections; i++) {
      tasks.push(this._addSession());
    }
    const results = await Promise.allSettled(tasks);
    const anyOk = results.some((r) => r.status === 'fulfilled');
    if (!anyOk) {
      const first = results[0] as PromiseRejectedResult;
      throw first.reason;
    }
  }

  private async _addSession(): Promise<H2Session> {
    const session = new H2Session(this._origin, this._opts);

    session.onAvailable = () => this._drainQueue();

    session.onClose = (s) => {
      const idx = this._sessions.indexOf(s);
      if (idx !== -1) this._sessions.splice(idx, 1);

      if (!this._closed && this._sessions.length < this._minConnections) {
        this._addSession().catch(() => {});
      }
    };

    await session.connect();
    this._sessions.push(session);
    return session;
  }

  /**
   * Dispatch queued requests to available sessions.
   *
   * Each dispatch calls session.request() whose Promise executor runs
   * synchronously, incrementing activeStreams before yielding. This prevents
   * the thundering herd where all callers see 0 active streams.
   */
  private _drainQueue(): void {
    while (this._queue.length > 0) {
      const session = this._findAvailable();
      if (!session) break;
      const req = this._queue.shift()!;
      this._dispatchToSession(session, req.path, req.method, req.headers, req.body, req.signal).then(
        req.resolve,
        req.reject,
      );
    }

    if (this._queue.length > 0 && !this._growing) {
      this._growPool();
    }
  }

  private _findAvailable(): H2Session | null {
    let best: H2Session | null = null;
    for (const s of this._sessions) {
      if (!s.available) continue;
      if (!best || s.activeStreams < best.activeStreams) {
        best = s;
      }
    }
    return best;
  }

  /**
   * Dispatch a request to a session, retrying once on GOAWAY race.
   *
   * session.request()'s Promise executor increments activeStreams
   * synchronously, so the caller's stream slot is reserved before any yield.
   */
  private async _dispatchToSession(
    session: H2Session,
    path: string,
    method: string,
    headers: Record<string, string>,
    body: string | Buffer | null,
    signal?: AbortSignal | null,
  ): Promise<H2Response> {
    try {
      return await session.request(path, method, headers, body, signal);
    } catch (err: any) {
      if (session.state !== SessionState.READY && RETRYABLE_METHODS.has(method)) {
        // Session went away (GOAWAY, etc). Re-enter the pool for a retry.
        return this._enqueueRequest(path, method, headers, body, signal);
      }
      throw err;
    }
  }

  /**
   * Grow the pool one session at a time until the queue is drained or max is hit.
   * Serialized so we don't thundering-herd connect attempts.
   */
  private async _growPool(): Promise<void> {
    if (this._growing) return;
    this._growing = true;
    try {
      while (this._queue.length > 0 && this._sessions.length < this._maxConnections) {
        await this._addSession();
        this._drainQueue();
      }
    } catch {
      // Connection failed; remaining requests stay queued for existing sessions
    } finally {
      this._growing = false;
    }
  }

  /**
   * Send a request through the pool.
   *
   * NOT async: when the pool is initialized and a session is available,
   * session.request() is called synchronously. Its Promise executor
   * increments activeStreams before yielding, which prevents the microtask
   * scheduling bug where all concurrent callers see 0 active streams and
   * all get routed to the same sessions.
   */
  request(
    path: string,
    method: string,
    headers: Record<string, string>,
    body: string | Buffer | null,
    signal?: AbortSignal | null,
  ): Promise<H2Response> {
    if (this._closed) return Promise.reject(new Error('Pool is closed'));

    // Fast path: pool initialized, session available — dispatch synchronously
    if (this._initialized) {
      const session = this._findAvailable();
      if (session) {
        return this._dispatchToSession(session, path, method, headers, body, signal);
      }
    }

    // Slow path: need to initialize or wait for capacity
    return this._enqueueRequest(path, method, headers, body, signal);
  }

  /**
   * Establish the pool's minimum sessions before request traffic arrives.
   *
   * This performs the same initial connection work that the first request would
   * trigger, without creating any request streams on the server. It is safe to
   * call more than once.
   */
  warmUp(): Promise<void> {
    if (this._closed) return Promise.reject(new Error('Pool is closed'));
    return this._initialize();
  }

  private async _enqueueRequest(
    path: string,
    method: string,
    headers: Record<string, string>,
    body: string | Buffer | null,
    signal?: AbortSignal | null,
  ): Promise<H2Response> {
    await this._initialize();

    // After init, try the fast path before queuing
    const session = this._findAvailable();
    if (session) {
      return this._dispatchToSession(session, path, method, headers, body, signal);
    }

    return new Promise<H2Response>((resolve, reject) => {
      this._queue.push({ path, method, headers, body, signal, resolve, reject });

      if (!this._growing && this._sessions.length < this._maxConnections) {
        this._growPool();
      }
    });
  }

  async close(): Promise<void> {
    this._closed = true;
    const sessions = [...this._sessions];
    this._sessions.length = 0;

    for (const req of this._queue) {
      req.reject(new Error('Pool is closed'));
    }
    this._queue.length = 0;

    await Promise.all(sessions.map((s) => s.close()));
  }
}
