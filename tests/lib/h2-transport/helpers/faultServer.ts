import http2 from 'node:http2';
import { ensureCerts } from './certs';

export interface FaultPlan {
  /** Send GOAWAY to the session as soon as the Nth stream opens. */
  goawayOnStream?: number;
  /** RST_STREAM with the given code for the first N streams. */
  rstFirstNStreams?: { count: number; code: number };
  /** Delay headers by this many ms. */
  delayHeadersMs?: number;
  /** Destroy the TCP socket after the Nth stream opens. */
  destroySocketOnStream?: number;
}

export interface FaultServer {
  port: number;
  origin: string;
  setPlan: (plan: FaultPlan) => void;
  streamCount: () => number;
  close: () => Promise<void>;
}

/**
 * A fault-injection HTTP/2 server. Each test configures a FaultPlan describing
 * exactly which streams should misbehave (GOAWAY mid-flight, RST_STREAM, slow
 * headers, raw socket drop). The server otherwise behaves like defaultHandler.
 */
export function startFaultServer(): Promise<FaultServer> {
  return new Promise((resolve) => {
    const { key, cert } = ensureCerts();
    const sessions = new Set<http2.ServerHttp2Session>();
    const server = http2.createSecureServer({ key, cert });

    let plan: FaultPlan = {};
    let streamN = 0;

    server.on('stream', (stream, headers) => {
      streamN++;
      const n = streamN;
      stream.on('error', () => {});

      if (plan.rstFirstNStreams && n <= plan.rstFirstNStreams.count) {
        stream.close(plan.rstFirstNStreams.code);
        return;
      }

      if (plan.destroySocketOnStream === n) {
        stream.session?.socket?.destroy();
        return;
      }

      if (plan.goawayOnStream === n) {
        // GOAWAY this session after responding; the client should see the response
        // *and* notice the session is no longer usable for new streams.
        stream.respond({ ':status': 200, 'content-type': 'text/plain' });
        stream.end('ok-then-goaway');
        stream.session?.goaway();
        return;
      }

      const respond = () => {
        const reqPath = (headers[':path'] as string) ?? '/';
        const method = (headers[':method'] as string) ?? 'GET';
        stream.respond({ ':status': 200, 'content-type': 'application/json' });
        stream.end(JSON.stringify({ path: reqPath, method, streamN: n }));
      };

      if (plan.delayHeadersMs) {
        const t = setTimeout(respond, plan.delayHeadersMs);
        stream.on('close', () => clearTimeout(t));
      } else {
        respond();
      }
    });

    server.on('session', (s) => {
      sessions.add(s);
      s.on('error', () => {});
      s.on('close', () => sessions.delete(s));
    });

    server.listen(0, () => {
      const port = (server.address() as any).port;
      resolve({
        port,
        origin: `https://localhost:${port}`,
        setPlan: (p) => {
          plan = p;
          streamN = 0;
        },
        streamCount: () => streamN,
        close: () =>
          new Promise<void>((res) => {
            for (const s of sessions) {
              try {
                s.destroy();
              } catch {}
            }
            server.close(() => res());
          }),
      });
    });
  });
}
