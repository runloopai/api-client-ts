import http2 from 'node:http2';
import net from 'node:net';
import { ensureCerts } from './certs';

export type StreamHandler = (
  stream: http2.ServerHttp2Stream,
  headers: http2.IncomingHttpHeaders,
) => void;

export interface TestServer {
  port: number;
  origin: string;
  /** Active HTTP/2 server sessions — useful to forcibly GOAWAY/close them mid-test. */
  sessions: Set<http2.ServerHttp2Session>;
  close: () => Promise<void>;
  /** Send GOAWAY to every connected session and wait for them to close. */
  goawayAll: () => Promise<void>;
}

export interface ServerOptions {
  settings?: http2.Settings;
}

/**
 * Boot an in-process TLS HTTP/2 server with a self-signed cert.
 *
 * The handler receives every stream. Stream errors are swallowed so the test
 * isn't littered with "Error: " from intentional aborts/resets.
 */
export function startTestServer(handler: StreamHandler, opts: ServerOptions = {}): Promise<TestServer> {
  return new Promise((resolve) => {
    const { key, cert } = ensureCerts();
    const sessions = new Set<http2.ServerHttp2Session>();
    const server = http2.createSecureServer({ key, cert, settings: opts.settings });

    server.on('stream', (stream, headers) => {
      stream.on('error', () => {});
      handler(stream, headers);
    });
    server.on('session', (session) => {
      sessions.add(session);
      session.on('error', () => {});
      session.on('close', () => sessions.delete(session));
    });

    server.listen(0, () => {
      const port = (server.address() as any).port;
      resolve({
        port,
        origin: `https://localhost:${port}`,
        sessions,
        close: () =>
          new Promise<void>((res) => {
            for (const session of sessions) {
              try {
                session.destroy();
              } catch {}
            }
            server.close(() => res());
          }),
        goawayAll: () =>
          new Promise<void>((res) => {
            if (sessions.size === 0) return res();
            const snapshot = [...sessions];
            let remaining = snapshot.length;
            const done = () => {
              if (--remaining <= 0) {
                clearTimeout(fallback);
                res();
              }
            };
            // Fallback: if a peer doesn't close within 1s, destroy sessions.
            // GOAWAY does not obligate the peer to close promptly, so without
            // this the promise could hang indefinitely.
            const fallback = setTimeout(() => {
              for (const s of snapshot) {
                try {
                  s.destroy();
                } catch {}
              }
            }, 1000);
            for (const session of snapshot) {
              session.once('close', done);
              try {
                session.goaway();
              } catch {
                done();
              }
            }
          }),
      });
    });
  });
}

/**
 * A raw TCP listener that accepts connections and never speaks HTTP/2.
 * Used to drive H2Session connect-timeout coverage.
 */
export function startBlackholeServer(): Promise<{ port: number; close: () => Promise<void> }> {
  return new Promise((resolve) => {
    const sockets = new Set<net.Socket>();
    const server = net.createServer((s) => {
      sockets.add(s);
      s.on('close', () => sockets.delete(s));
    });
    server.listen(0, () => {
      const port = (server.address() as any).port;
      resolve({
        port,
        close: () =>
          new Promise<void>((res) => {
            for (const s of sockets) s.destroy();
            server.close(() => res());
          }),
      });
    });
  });
}

/**
 * Generic JSON echo + introspection handler used by most tests.
 *  - POST /echo               → returns {echoed: <body>}
 *  - GET  /sse                → server-sent events stream
 *  - GET  /slow?ms=N          → respond after N ms
 *  - GET  /large?bytes=N      → respond with N bytes of body
 *  - any  /headers            → echo received request headers
 *  - any  /trailers           → respond + send trailer block
 *  - any  *                   → {path, method}
 */
export function defaultHandler(stream: http2.ServerHttp2Stream, headers: http2.IncomingHttpHeaders): void {
  const reqPath = (headers[':path'] as string) ?? '/';
  const method = (headers[':method'] as string) ?? 'GET';

  if (reqPath === '/echo') {
    const chunks: Buffer[] = [];
    stream.on('data', (c: Buffer) => chunks.push(c));
    stream.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf-8');
      stream.respond({ ':status': 200, 'content-type': 'application/json' });
      stream.end(JSON.stringify({ echoed: body }));
    });
    return;
  }

  if (reqPath === '/sse') {
    stream.respond({ ':status': 200, 'content-type': 'text/event-stream', 'cache-control': 'no-cache' });
    const events = ['data: {"id":1,"msg":"hello"}\n\n', 'data: {"id":2,"msg":"world"}\n\n'];
    let i = 0;
    const interval = setInterval(() => {
      if (i < events.length) {
        stream.write(events[i]!);
        i++;
      } else {
        clearInterval(interval);
        stream.end();
      }
    }, 10);
    stream.on('close', () => clearInterval(interval));
    return;
  }

  if (reqPath.startsWith('/slow')) {
    const ms = Number(new URL(`http://x${reqPath}`).searchParams.get('ms') ?? 100);
    const timer = setTimeout(() => {
      if (stream.destroyed) return;
      stream.respond({ ':status': 200, 'content-type': 'text/plain' });
      stream.end('slow');
    }, ms);
    stream.on('close', () => clearTimeout(timer));
    return;
  }

  if (reqPath.startsWith('/large')) {
    const bytes = Number(new URL(`http://x${reqPath}`).searchParams.get('bytes') ?? 1024);
    stream.respond({ ':status': 200, 'content-type': 'application/octet-stream' });
    stream.end(Buffer.alloc(bytes, 0xab));
    return;
  }

  if (reqPath === '/headers') {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) {
      if (k.startsWith(':')) continue;
      out[k] = Array.isArray(v) ? v.join(', ') : (v as string);
    }
    stream.respond({ ':status': 200, 'content-type': 'application/json' });
    stream.end(JSON.stringify(out));
    return;
  }

  if (reqPath === '/trailers') {
    stream.respond({ ':status': 200, 'content-type': 'text/plain' }, { waitForTrailers: true });
    stream.on('wantTrailers', () => {
      stream.sendTrailers({ 'x-trailer': 'value' });
    });
    stream.end('body');
    return;
  }

  if (reqPath === '/204') {
    stream.respond({ ':status': 204 });
    stream.end();
    return;
  }

  stream.respond({ ':status': 200, 'content-type': 'application/json', 'x-custom': 'test-value' });
  stream.end(JSON.stringify({ path: reqPath, method }));
}
