import { RunloopSDK } from '@runloop/api-client';
import { Response, type RequestInfo } from 'node-fetch';

(process.env['RUN_SMOKETESTS'] ? describe : describe.skip)('object-oriented agent coverage', () => {
  test('covers public listing, deletion, and devbox counts without external I/O', async () => {
    const fetch = jest.fn((request: RequestInfo) => {
      const url = request.toString();
      if (url.endsWith('/v1/agents/list_public?limit=1')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              agents: [
                {
                  id: 'agt_public',
                  create_time_ms: 1,
                  is_public: true,
                  name: 'public-agent',
                },
              ],
              has_more: false,
              total_count: 1,
            }),
            { headers: { 'content-type': 'application/json' } },
          ),
        );
      }
      if (url.endsWith('/v1/agents/devbox_counts')) {
        return Promise.resolve(
          new Response(JSON.stringify({ counts: { 'public-agent': 2 }, total_count: 2 }), {
            headers: { 'content-type': 'application/json' },
          }),
        );
      }
      if (url.endsWith('/v1/agents/agt_public/delete')) {
        return Promise.resolve(new Response(undefined, { status: 204 }));
      }
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });
    const sdk = new RunloopSDK({
      bearerToken: 'test',
      baseURL: 'https://example.invalid',
      maxRetries: 0,
      fetch: fetch as any,
    });

    const agents = await sdk.agent.listPublic({ limit: 1 });
    expect(agents.map((agent) => agent.id)).toEqual(['agt_public']);
    await expect(sdk.agent.delete(agents[0]!)).resolves.toBeUndefined();
    await expect(sdk.agent.getDevboxCounts()).resolves.toEqual({
      counts: { 'public-agent': 2 },
      total_count: 2,
    });
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
