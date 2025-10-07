// Tests for rate limit retry behavior on file write operations

import Runloop from '@runloop/api-client';
import { Response } from 'node-fetch';
import { RateLimitError } from '@runloop/api-client/error';

describe('Rate Limit Retry', () => {
  describe('writeFileContents', () => {
    test('retries on 429 errors', async () => {
      let callCount = 0;
      const mockFetch = jest.fn(async () => {
        callCount++;
        if (callCount <= 2) {
          // First two calls return 429
          return new Response(
            JSON.stringify({
              error: {
                message: 'Write operations for this devbox are currently rate limited.',
              },
            }),
            {
              status: 429,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }
        // Third call succeeds
        return new Response(
          JSON.stringify({
            id: 'exec-123',
            devbox_id: 'test-devbox-id',
            status: 'completed',
            exit_status: 0,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      });

      const client = new Runloop({
        bearerToken: 'test-token',
        baseURL: 'http://127.0.0.1:4010',
        maxRetries: 3,
        fetch: mockFetch as any,
      });

      const startTime = Date.now();
      const result = await client.devboxes.writeFileContents('test-devbox-id', {
        contents: 'test content',
        file_path: '/tmp/test.txt',
      });
      const elapsedTime = Date.now() - startTime;

      expect(result.id).toBe('exec-123');
      expect(result.status).toBe('completed');
      expect(elapsedTime).toBeGreaterThan(100); // Should have some delay from retries
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    test(
      'respects Retry-After header',
      async () => {
      let callCount = 0;
      const mockFetch = jest.fn(async () => {
        callCount++;
        if (callCount === 1) {
          // First call returns 429 with Retry-After
          return new Response(
            JSON.stringify({
              error: {
                message: 'Write operations for this devbox are currently rate limited.',
              },
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': '1',
              },
            },
          );
        }
        // Second call succeeds
        return new Response(
          JSON.stringify({
            id: 'exec-456',
            devbox_id: 'test-devbox-id',
            status: 'completed',
            exit_status: 0,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      });

      const client = new Runloop({
        bearerToken: 'test-token',
        baseURL: 'http://127.0.0.1:4010',
        maxRetries: 2,
        fetch: mockFetch as any,
      });

      const startTime = Date.now();
      const result = await client.devboxes.writeFileContents('test-devbox-id', {
        contents: 'test content',
        file_path: '/tmp/test.txt',
      });
      const elapsedTime = Date.now() - startTime;

      expect(result.id).toBe('exec-456');
      expect(elapsedTime).toBeGreaterThanOrEqual(900); // Should wait at least ~1 second
      expect(elapsedTime).toBeLessThan(2000); // Should not take too long
      expect(mockFetch).toHaveBeenCalledTimes(2);
    }, 10000);

    test('fails after exhausting retries', async () => {
      const mockFetch = jest.fn(async () => {
        // All calls return 429
        return new Response(
          JSON.stringify({
            error: {
              message: 'Write operations for this devbox are currently rate limited.',
            },
          }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      });

      const client = new Runloop({
        bearerToken: 'test-token',
        baseURL: 'http://127.0.0.1:4010',
        maxRetries: 2,
        fetch: mockFetch as any,
      });

      await expect(
        client.devboxes.writeFileContents('test-devbox-id', {
          contents: 'test content',
          file_path: '/tmp/test.txt',
        }),
      ).rejects.toThrow(RateLimitError);

      // Initial + 2 retries = 3 calls
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    test(
      'respects custom max_retries configuration',
      async () => {
      let callCount = 0;
      const mockFetch = jest.fn(async () => {
        callCount++;
        if (callCount <= 4) {
          // First 4 calls return 429
          return new Response(
            JSON.stringify({
              error: { message: 'Rate limited' },
            }),
            {
              status: 429,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }
        // 5th call succeeds
        return new Response(
          JSON.stringify({
            id: 'exec-789',
            devbox_id: 'test-devbox-id',
            status: 'completed',
            exit_status: 0,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      });

      const client = new Runloop({
        bearerToken: 'test-token',
        baseURL: 'http://127.0.0.1:4010',
        maxRetries: 5,
        fetch: mockFetch as any,
      });

      const result = await client.devboxes.writeFileContents('test-devbox-id', {
        contents: 'test content',
        file_path: '/tmp/test.txt',
      });

      expect(result.id).toBe('exec-789');
      // Initial + 4 retries = 5 calls
      expect(mockFetch).toHaveBeenCalledTimes(5);
    }, 30000);

    test('no retry when disabled', async () => {
      const mockFetch = jest.fn(async () => {
        return new Response(
          JSON.stringify({
            error: { message: 'Rate limited' },
          }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      });

      const client = new Runloop({
        bearerToken: 'test-token',
        baseURL: 'http://127.0.0.1:4010',
        maxRetries: 0,
        fetch: mockFetch as any,
      });

      await expect(
        client.devboxes.writeFileContents('test-devbox-id', {
          contents: 'test content',
          file_path: '/tmp/test.txt',
        }),
      ).rejects.toThrow(RateLimitError);

      // Only one call, no retries
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('uploadFile', () => {
    test('retries on 429 errors', async () => {
      let callCount = 0;
      const mockFetch = jest.fn(async () => {
        callCount++;
        if (callCount === 1) {
          // First call returns 429
          return new Response(
            JSON.stringify({
              error: { message: 'Rate limited' },
            }),
            {
              status: 429,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }
        // Second call succeeds
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      const client = new Runloop({
        bearerToken: 'test-token',
        baseURL: 'http://127.0.0.1:4010',
        maxRetries: 3,
        fetch: mockFetch as any,
      });

      const result = await client.devboxes.uploadFile('test-devbox-id', {
        path: '/tmp/test.bin',
        file: Buffer.from('binary content'),
      });

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    test('fails after exhausting retries', async () => {
      const mockFetch = jest.fn(async () => {
        return new Response(
          JSON.stringify({
            error: { message: 'Rate limited' },
          }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      });

      const client = new Runloop({
        bearerToken: 'test-token',
        baseURL: 'http://127.0.0.1:4010',
        maxRetries: 2,
        fetch: mockFetch as any,
      });

      await expect(
        client.devboxes.uploadFile('test-devbox-id', {
          path: '/tmp/test.bin',
          file: Buffer.from('binary content'),
        }),
      ).rejects.toThrow(RateLimitError);

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('per-request maxRetries override', () => {
    test('allows overriding maxRetries per request', async () => {
      let callCount = 0;
      const mockFetch = jest.fn(async () => {
        callCount++;
        if (callCount <= 2) {
          // First 2 calls return 429
          return new Response(
            JSON.stringify({
              error: { message: 'Rate limited' },
            }),
            {
              status: 429,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }
        // 3rd call succeeds
        return new Response(
          JSON.stringify({
            id: 'exec-override',
            devbox_id: 'test-devbox-id',
            status: 'completed',
            exit_status: 0,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      });

      const client = new Runloop({
        bearerToken: 'test-token',
        baseURL: 'http://127.0.0.1:4010',
        maxRetries: 1, // Default
        fetch: mockFetch as any,
      });

      // Override maxRetries for this specific request
      const result = await client.devboxes.writeFileContents(
        'test-devbox-id',
        {
          contents: 'test content',
          file_path: '/tmp/test.txt',
        },
        { maxRetries: 3 },
      );

      expect(result.id).toBe('exec-override');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});
