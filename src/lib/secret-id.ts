/** Keep an opaque Secret ID in one URL path segment; the server validates the handle. */
export function secretIdPathSegment(id: string): string {
  if (typeof id !== 'string' || id.length === 0 || /[^A-Za-z0-9_-]/.test(id)) {
    throw new TypeError('Expected a non-empty, URL-safe Secret ID');
  }
  return id;
}
