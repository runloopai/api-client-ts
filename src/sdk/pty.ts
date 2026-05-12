import { Runloop } from '../index';
import { RunloopError } from '../error';
import type * as Core from '../core';
import type { PtyControlParams } from '../resources/pty';
import { uuidv7 } from 'uuidv7';

const RAGE_REST_PORT = 13;
const PTY_NORMAL_CLOSE_CODE = 4000;
const WS_READY_STATE_OPEN = 1;
const CONNECT_RETRIES = readPositiveIntegerEnv('RUNLOOP_PTY_CONNECT_RETRIES', 3);
const WS_RETRIES = readPositiveIntegerEnv('RUNLOOP_PTY_WS_RETRIES', 3);
const WS_CONNECT_TIMEOUT_MS = readPositiveIntegerEnv('RUNLOOP_PTY_WS_CONNECT_TIMEOUT_MS', 15_000);
const PTY_ACCEPTABLE_CLOSE_CODES = new Set<number>([PTY_NORMAL_CLOSE_CODE, 1000, 1006]);

type WebSocketLike = {
  readyState: number;
  binaryType?: string;
  send(data: string | Uint8Array | ArrayBuffer | Buffer): void;
  close(code?: number, reason?: string): void;
  terminate?: () => void;
  on?: (type: string, listener: (...args: unknown[]) => void) => void;
  once?: (type: string, listener: (...args: unknown[]) => void) => void;
  off?: (type: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (type: string, listener: (...args: unknown[]) => void) => void;
  addEventListener?: (type: string, listener: (event: unknown) => void) => void;
  removeEventListener?: (type: string, listener: (event: unknown) => void) => void;
};

type WebSocketConstructor = new (
  url: string,
  protocolsOrOptions?: string[] | { headers?: Record<string, string> },
  options?: { headers?: Record<string, string> },
) => WebSocketLike;

export interface DevboxPtyOpenOptions {
  sessionName?: string;
  cols?: number;
  rows?: number;
  onOutput?: (chunk: string) => void;
  requestOptions?: Core.RequestOptions;
}

export interface DevboxPtyExecOptions extends DevboxPtyOpenOptions {
  timeoutMs?: number;
}

export interface DevboxPtyWaitResult {
  exitCode: number | null;
  output: string;
}

export class PtyOutput<T = string> implements AsyncIterable<T> {
  private chunks: T[] = [];
  private waiters: Array<(value: IteratorResult<T>) => void> = [];
  private closed = false;

  push(chunk: T): void {
    if (!chunk || this.closed) return;
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter({ value: chunk, done: false });
      return;
    }
    this.chunks.push(chunk);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    for (const waiter of this.waiters.splice(0)) {
      waiter({ value: undefined, done: true });
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: () => {
        const chunk = this.chunks.shift();
        if (chunk !== undefined) {
          return Promise.resolve({ value: chunk, done: false });
        }
        if (this.closed) {
          return Promise.resolve({ value: undefined, done: true });
        }
        return new Promise<IteratorResult<T>>((resolve) => this.waiters.push(resolve));
      },
    };
  }
}

export class DevboxPtySession {
  public readonly output = new PtyOutput<string>();
  public readonly rawOutput = new PtyOutput<Uint8Array>();
  private readonly outputListeners = new Set<(chunk: string) => void>();
  private readonly rawOutputListeners = new Set<(chunk: Uint8Array) => void>();
  private readonly textDecoder = new TextDecoder();
  private closed = false;
  private closeCode: number | null = null;
  private closeResolve!: (code: number | null) => void;
  private closeReject!: (error: Error) => void;
  private readonly closedPromise = new Promise<number | null>((resolve, reject) => {
    this.closeResolve = resolve;
    this.closeReject = reject;
  });

  constructor(
    public readonly sessionName: string,
    private readonly controlClient: Runloop,
    private readonly ws: WebSocketLike,
  ) {
    this.ws.binaryType = 'arraybuffer';
    addSocketListener(ws, 'message', (event) => {
      const bytes = decodeWebSocketBytes(readEventData(event));
      this.rawOutput.push(bytes);
      for (const listener of this.rawOutputListeners) listener(bytes);

      const chunk = this.textDecoder.decode(bytes, { stream: true });
      if (chunk) {
        this.output.push(chunk);
        for (const listener of this.outputListeners) listener(chunk);
      }
    });
    addSocketListener(ws, 'close', (event) => {
      this.finish(readCloseCode(event));
    });
    addSocketListener(ws, 'error', (event) => {
      const error = event instanceof Error ? event : new Error(String(event));
      this.closeReject(error);
    });
  }

  onOutput(listener: (chunk: string) => void): () => void {
    this.outputListeners.add(listener);
    return () => this.outputListeners.delete(listener);
  }

  onData(listener: (chunk: Uint8Array) => void): () => void {
    this.rawOutputListeners.add(listener);
    return () => this.rawOutputListeners.delete(listener);
  }

  send(data: string | Uint8Array | ArrayBuffer | Buffer): void {
    if (this.ws.readyState !== WS_READY_STATE_OPEN) {
      throw new RunloopError('PTY WebSocket is not open.');
    }
    this.ws.send(data);
  }

  async resize(cols: number, rows: number, options?: Core.RequestOptions): Promise<void> {
    await this.control({ action: 'resize', cols, rows }, options);
  }

  async signal(signal: string, options?: Core.RequestOptions): Promise<void> {
    await this.control({ action: 'signal', signal }, options);
  }

  async detach(): Promise<void> {
    if (this.ws.readyState === WS_READY_STATE_OPEN) {
      this.ws.close();
    }
    this.finish(this.closeCode);
  }

  async terminate(options?: Core.RequestOptions): Promise<void> {
    if (!this.closed) {
      await this.control({ action: 'close' }, options).catch(() => {});
    }
    if (this.ws.readyState === WS_READY_STATE_OPEN) {
      this.ws.close();
    }
    this.finish(this.closeCode);
  }

  async close(): Promise<void> {
    await this.detach();
  }

  async waitForClose(): Promise<number | null> {
    return await this.closedPromise;
  }

  private async control(body: PtyControlParams, options?: Core.RequestOptions): Promise<void> {
    await this.controlClient.pty.control(this.sessionName, body, options);
  }

  private finish(code: number | null): void {
    if (this.closed) return;
    this.closed = true;
    this.closeCode = code;
    const tail = this.textDecoder.decode();
    if (tail) {
      this.output.push(tail);
      for (const listener of this.outputListeners) listener(tail);
    }
    this.output.close();
    this.rawOutput.close();
    this.closeResolve(code);
  }
}

export class DevboxPtyProcess {
  public readonly output = new PtyOutput();
  private readonly waitPromise: Promise<DevboxPtyWaitResult>;
  private readonly removeOutputListener: () => void;
  private readonly chunks: string[] = [];
  private pending = '';
  private exitCode: number | null = null;

  constructor(
    private readonly session: DevboxPtySession,
    private readonly marker: string,
    private readonly onOutput?: (chunk: string) => void,
    timeoutMs?: number,
  ) {
    this.removeOutputListener = session.onOutput((chunk) => this.handleChunk(chunk));
    this.waitPromise = this.watch(timeoutMs);
  }

  write(chars: string): void {
    this.session.send(chars);
  }

  async resize(cols: number, rows: number, options?: Core.RequestOptions): Promise<void> {
    await this.session.resize(cols, rows, options);
  }

  async interrupt(options?: Core.RequestOptions): Promise<void> {
    await this.session.signal('SIGINT', options);
  }

  async close(options?: Core.RequestOptions): Promise<void> {
    await this.session.terminate(options);
  }

  async wait(): Promise<DevboxPtyWaitResult> {
    return await this.waitPromise;
  }

  private emit(chunk: string): void {
    if (!chunk) return;
    this.chunks.push(chunk);
    this.output.push(chunk);
    this.onOutput?.(chunk);
  }

  private handleChunk(chunk: string): void {
    this.pending += chunk;
    const markerIndex = this.pending.indexOf(this.marker);
    if (markerIndex >= 0) {
      this.emit(this.pending.slice(0, markerIndex));
      const afterMarker = this.pending.slice(markerIndex + this.marker.length);
      const match = afterMarker.match(/^:(\d+)/);
      if (match?.[1]) {
        this.exitCode = Number.parseInt(match[1], 10);
      }
      this.pending = '';
      return;
    }

    const suffixLength = longestMarkerPrefixSuffix(this.pending, this.marker);
    const emitLength = this.pending.length - suffixLength;
    if (emitLength > 0) {
      this.emit(this.pending.slice(0, emitLength));
      this.pending = this.pending.slice(emitLength);
    }
  }

  private async watch(timeoutMs?: number): Promise<DevboxPtyWaitResult> {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (timeoutMs && timeoutMs > 0) {
      timeout = setTimeout(() => {
        void this.close().catch(() => {});
      }, timeoutMs);
    }

    try {
      const closeCode = await this.session.waitForClose();
      if (this.pending) {
        this.emit(this.pending);
        this.pending = '';
      }
      const exitCode =
        this.exitCode ?? (closeCode !== null && PTY_ACCEPTABLE_CLOSE_CODES.has(closeCode) ? 0 : null);
      return { exitCode, output: this.chunks.join('') };
    } finally {
      if (timeout) clearTimeout(timeout);
      this.removeOutputListener();
      this.output.close();
    }
  }
}

export class DevboxPtyOps {
  constructor(
    private readonly client: Runloop,
    private readonly devboxId: string,
  ) {}

  async open(options: DevboxPtyOpenOptions = {}): Promise<DevboxPtySession> {
    const sessionName = options.sessionName?.trim() || this.devboxId;
    const cols = options.cols ?? 80;
    const rows = options.rows ?? 24;
    const tunnel = await this.createControlClient();
    const connectView = await retryOnTunnelWarmup(() =>
      tunnel.client.pty.connect(sessionName, { cols, rows }, options.requestOptions),
    );
    const connectUrl = connectView.connect_url;
    if (!connectUrl) {
      throw new RunloopError('PTY connect response did not include connect_url.');
    }
    const wsUrl = buildWebSocketUrl(tunnel.baseURL, connectUrl);
    const ws = await openPtyWebSocket(wsUrl, tunnel.authToken);
    const session = new DevboxPtySession(sessionName, tunnel.client, ws);
    if (options.onOutput) session.onOutput(options.onOutput);
    await session.resize(cols, rows, options.requestOptions).catch(() => {});
    return session;
  }

  async exec(command: string, options: DevboxPtyExecOptions = {}): Promise<DevboxPtyProcess> {
    const session = await this.open({
      ...options,
      sessionName: options.sessionName?.trim() || `${this.devboxId}-${uuidv7()}`,
    });
    const marker = `__RUNLOOP_PTY_EXIT_${uuidv7().replace(/-/g, '')}__`;
    const process = new DevboxPtyProcess(session, marker, options.onOutput, options.timeoutMs);
    session.send(wrapCommandForExitCode(command, marker));
    return process;
  }

  private async createControlClient(): Promise<{ client: Runloop; baseURL: string; authToken?: string }> {
    const localBaseURL = readEnv('RUNLOOP_PTY_URL')?.trim();
    if (localBaseURL) {
      return {
        client: new Runloop({ bearerToken: this.client.bearerToken, baseURL: localBaseURL }),
        baseURL: localBaseURL,
      };
    }

    const tunnel = await this.client.devboxes.createPtyTunnel(this.devboxId);
    const baseURL = ptyTunnelBaseURL(this.client.baseURL, tunnel.tunnel_key);
    return {
      client: new Runloop({ bearerToken: tunnel.auth_token, baseURL }),
      baseURL,
      authToken: tunnel.auth_token,
    };
  }
}

function wrapCommandForExitCode(command: string, marker: string): string {
  return [
    command,
    '__runloop_pty_status=$?',
    `printf '\\n${marker}:%s\\n' "$__runloop_pty_status"`,
    'exit "$__runloop_pty_status"',
    '',
  ].join('\n');
}

function ptyTunnelBaseURL(apiBaseURL: string, tunnelKey: string): string {
  const apiHost = new URL(apiBaseURL).hostname;
  const baseDomain = apiHost.startsWith('api.') ? apiHost.slice(4) : apiHost;
  return `https://${RAGE_REST_PORT}-${tunnelKey}.tunnel.${baseDomain}`;
}

function buildWebSocketUrl(baseURL: string, connectURL: string): string {
  const parsed = new URL(baseURL);
  const protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${parsed.host}${connectURL}`;
}

async function retryOnTunnelWarmup<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= CONNECT_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isTunnelWarmupError(error) || attempt === CONNECT_RETRIES) throw error;
      await delay(Math.min(10_000, 400 * 2 ** (attempt - 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function openPtyWebSocket(wsUrl: string, authToken?: string): Promise<WebSocketLike> {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= WS_RETRIES; attempt++) {
    try {
      return await openPtyWebSocketOnce(wsUrl, authToken);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (!/HTTP\s+(502|503)\b/.test(lastError.message) || attempt === WS_RETRIES) {
        throw lastError;
      }
      await delay(Math.min(10_000, 400 * 2 ** (attempt - 1)));
    }
  }
  throw lastError ?? new Error('PTY WebSocket connect failed.');
}

async function openPtyWebSocketOnce(wsUrl: string, authToken?: string): Promise<WebSocketLike> {
  const { WebSocketImpl, supportsHeaders } = await resolveWebSocket();
  return await new Promise<WebSocketLike>((resolve, reject) => {
    const ws =
      supportsHeaders ?
        new WebSocketImpl(
          wsUrl,
          undefined,
          authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : undefined,
        )
      : new WebSocketImpl(wsUrl, authToken ? [authToken] : undefined);
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      ws.terminate?.();
      reject(new Error('PTY WebSocket connection timed out.'));
    }, WS_CONNECT_TIMEOUT_MS);

    const settle = (callback: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback();
    };

    addSocketListener(ws, 'open', () => settle(() => resolve(ws)), true);
    addSocketListener(
      ws,
      'unexpected-response',
      (event) => {
        const response = Array.isArray(event) ? event[1] : event;
        const code = readResponseStatusCode(response);
        settle(() => reject(new Error(`WebSocket upgrade failed: HTTP ${code}`)));
      },
      true,
    );
    addSocketListener(
      ws,
      'error',
      (event) => settle(() => reject(event instanceof Error ? event : new Error(String(event)))),
      true,
    );
  });
}

async function resolveWebSocket(): Promise<{
  WebSocketImpl: WebSocketConstructor;
  supportsHeaders: boolean;
}> {
  const globalWebSocket = (globalThis as { WebSocket?: unknown }).WebSocket;
  if (typeof globalWebSocket === 'function') {
    return { WebSocketImpl: globalWebSocket as unknown as WebSocketConstructor, supportsHeaders: false };
  }

  try {
    const dynamicImport = new Function('specifier', 'return import(specifier)') as (
      specifier: string,
    ) => Promise<Record<string, unknown>>;
    const mod = await dynamicImport('ws');
    const WebSocketImpl = mod['WebSocket'] ?? mod['default'];
    if (typeof WebSocketImpl === 'function') {
      return { WebSocketImpl: WebSocketImpl as WebSocketConstructor, supportsHeaders: true };
    }
  } catch (error) {
    throw new RunloopError(
      `PTY support requires a WebSocket implementation. In Node.js, install the optional "ws" package. ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  throw new RunloopError('PTY support requires a WebSocket implementation.');
}

function addSocketListener(
  ws: WebSocketLike,
  type: string,
  listener: (event: unknown) => void,
  once = false,
): void {
  if (ws.addEventListener) {
    ws.addEventListener(type, listener);
    return;
  }
  const nodeListener = (...args: unknown[]) => listener(args.length > 1 ? args : args[0]);
  if (once && ws.once) ws.once(type, nodeListener);
  else ws.on?.(type, nodeListener);
}

function decodeWebSocketBytes(data: unknown): Uint8Array {
  if (typeof data === 'string') return Buffer.from(data, 'utf8');
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (Array.isArray(data)) return Buffer.concat(data as Buffer[]);
  if (data instanceof Uint8Array) return data;
  return Buffer.from(String(data ?? ''), 'utf8');
}

function readEventData(event: unknown): unknown {
  if (Array.isArray(event) && typeof event[1] === 'boolean') {
    return event[0];
  }
  if (event && typeof event === 'object' && 'data' in event) {
    return (event as { data: unknown }).data;
  }
  return event;
}

function readCloseCode(event: unknown): number | null {
  if (typeof event === 'number') return event;
  if (Array.isArray(event) && typeof event[0] === 'number') return event[0];
  if (event && typeof event === 'object' && 'code' in event && typeof event.code === 'number') {
    return event.code;
  }
  return null;
}

function readResponseStatusCode(response: unknown): number {
  if (response && typeof response === 'object' && 'statusCode' in response) {
    const statusCode = (response as { statusCode?: unknown }).statusCode;
    if (typeof statusCode === 'number') return statusCode;
  }
  return 0;
}

function isTunnelWarmupError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: unknown }).status;
    return status === 502 || status === 503;
  }
  return /\b(502|503)\b/.test(error instanceof Error ? error.message : String(error));
}

function longestMarkerPrefixSuffix(value: string, marker: string): number {
  const max = Math.min(value.length, marker.length - 1);
  for (let length = max; length > 0; length--) {
    if (marker.startsWith(value.slice(-length))) return length;
  }
  return 0;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readPositiveIntegerEnv(name: string, fallback: number): number {
  const parsed = Number.parseInt(readEnv(name) ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readEnv(name: string): string | undefined {
  return typeof process !== 'undefined' ? process.env[name] : undefined;
}
