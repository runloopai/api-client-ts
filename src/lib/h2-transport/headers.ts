import type http2 from 'node:http2';

/**
 * Minimal Headers implementation satisfying the SDK's usage:
 *   response.headers.get('content-type')
 *   response.headers.entries()
 */
export class H2Headers {
  private readonly map: Map<string, string>;

  constructor(raw: http2.IncomingHttpHeaders) {
    this.map = new Map();
    for (const [key, value] of Object.entries(raw)) {
      if (key.startsWith(':')) continue;
      const normalized = Array.isArray(value) ? value.join(', ') : value;
      if (normalized !== undefined) {
        this.map.set(key.toLowerCase(), normalized);
      }
    }
  }

  get(name: string): string | null {
    return this.map.get(name.toLowerCase()) ?? null;
  }

  entries(): IterableIterator<[string, string]> {
    return this.map.entries();
  }
}
