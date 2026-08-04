import { H2Headers } from '../../../src/lib/h2-transport/headers';

describe('H2Headers', () => {
  test('strips pseudo-headers and lowercases keys', () => {
    const h = new H2Headers({
      ':status': '200' as any,
      ':authority': 'example.com' as any,
      'Content-Type': 'application/json',
      'X-Custom': 'val',
    });
    expect(h.get('content-type')).toBe('application/json');
    expect(h.get('x-custom')).toBe('val');
    expect(h.get(':status')).toBeNull();
    expect(h.get(':authority')).toBeNull();
  });

  test('get is case-insensitive', () => {
    const h = new H2Headers({ 'Content-Type': 'text/plain' });
    expect(h.get('CONTENT-TYPE')).toBe('text/plain');
    expect(h.get('content-type')).toBe('text/plain');
    expect(h.get('Content-Type')).toBe('text/plain');
  });

  test('returns null for missing headers', () => {
    expect(new H2Headers({}).get('x-missing')).toBeNull();
  });

  test('joins multi-value (array) headers with ", "', () => {
    const h = new H2Headers({ 'set-cookie': ['a=1', 'b=2', 'c=3'] } as any);
    expect(h.get('set-cookie')).toBe('a=1, b=2, c=3');
  });

  test('drops undefined values', () => {
    const h = new H2Headers({ 'x-defined': 'yes', 'x-undef': undefined as any });
    expect(h.get('x-defined')).toBe('yes');
    expect(h.get('x-undef')).toBeNull();
  });

  test('preserves empty-string values', () => {
    const h = new H2Headers({ 'x-empty': '' });
    expect(h.get('x-empty')).toBe('');
    expect(h.get('x-missing')).toBeNull();
  });

  test('entries() yields lowercased keys in insertion order', () => {
    const h = new H2Headers({ ':status': '200' as any, 'A-First': '1', 'B-Second': '2' });
    expect([...h.entries()]).toEqual([
      ['a-first', '1'],
      ['b-second', '2'],
    ]);
  });
});
