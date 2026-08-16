import { Runloop, APIConnectionError } from '@runloop/api-client';
import { createH2Fetch } from '../../../src/lib/h2-transport';
import { H2GoawayError } from '../../../src/lib/h2-transport/session';
import { H2Session } from '../../../src/lib/h2-transport/session';
import { cleanupCerts, testTls } from './helpers/certs';
import { startFaultServer, type FaultServer } from './helpers/faultServer';

describe('HTTP/2 idle timeout GOAWAY', () => {
  let server: FaultServer;

  beforeAll(async () => {
    server = await startFaultServer();
  });

  afterAll(async () => {
    await server.close();
    cleanupCerts();
  });

  test('retains GOAWAY metadata and exposes a normalized final error', async () => {
    server.setPlan({ idleTimeoutGoawayBeforeHeadersOnStream: 1 });
    const h2Fetch = createH2Fetch({ minConnections: 1, maxConnections: 1, tlsOptions: testTls });
    const client = new Runloop({
      bearerToken: 'test',
      baseURL: server.origin,
      maxRetries: 0,
      fetch: h2Fetch,
    });

    try {
      const error: any = await client.get('/idle').catch((value) => value);
      expect(error).toBeInstanceOf(APIConnectionError);
      expect(error).toMatchObject({
        code: 'http2_idle_timeout',
        phase: 'response_read',
        retryable: false,
        attempts: 1,
      });
      expect(error.cause).toBeInstanceOf(H2GoawayError);
      expect(error.cause).toMatchObject({
        code: 'ERR_HTTP2_GOAWAY_SESSION',
        errorCode: 0,
        lastStreamID: 1,
        unprocessed: false,
      });
      expect(Buffer.from(error.cause.opaqueData).toString()).toBe('idle_timeout');
      expect(server.streamCount()).toBe(1);
    } finally {
      await h2Fetch.close();
    }
  });

  test('retains GOAWAY metadata when the response body is interrupted', async () => {
    server.setPlan({ idleTimeoutGoawayDuringBodyOnStream: 1 });
    const h2Fetch = createH2Fetch({ minConnections: 1, maxConnections: 1, tlsOptions: testTls });
    const client = new Runloop({
      bearerToken: 'test',
      baseURL: server.origin,
      maxRetries: 0,
      fetch: h2Fetch,
    });

    try {
      const error: any = await client.get('/idle-body').catch((value) => value);
      expect(error).toBeInstanceOf(APIConnectionError);
      expect(error).toMatchObject({
        code: 'http2_idle_timeout',
        phase: 'response_read',
        retryable: false,
        attempts: 1,
      });
      expect(error.cause).toBeInstanceOf(H2GoawayError);
      expect(error.cause).toMatchObject({
        code: 'ERR_HTTP2_GOAWAY_SESSION',
        unprocessed: false,
      });
      expect(Buffer.from(error.cause.opaqueData).toString()).toBe('idle_timeout');
      expect(server.streamCount()).toBe(1);
    } finally {
      await h2Fetch.close();
    }
  });

  test('closes a draining session exactly once', async () => {
    server.setPlan({ idleTimeoutGoawayBeforeHeadersOnStream: 1 });
    const session = new H2Session(server.origin, { tlsOptions: testTls });
    const onClose = jest.fn();
    session.onClose = onClose;
    await session.connect();

    await expect(session.request('/idle', 'GET', {}, null)).rejects.toBeInstanceOf(H2GoawayError);
    await new Promise((resolve) => setImmediate(resolve));
    expect(onClose).toHaveBeenCalledTimes(1);
    await session.close();
  });
});
