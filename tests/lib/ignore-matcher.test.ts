import { DockerIgnoreMatcher, createIgnoreMatcher } from '../../src/lib/ignore-matcher';

describe('DockerIgnoreMatcher', () => {
  const check = (patterns: string[], path: string, expected: boolean) => {
    const matcher = new DockerIgnoreMatcher(patterns);
    expect(matcher.matches(path)).toBe(expected);
  };

  it('matches simple file patterns', () => {
    check(['foo.txt'], 'foo.txt', true);
    check(['foo.txt'], 'bar.txt', false);
  });

  it('supports wildcards and double-star', () => {
    check(['*.log'], 'app.log', true);
    check(['*.log'], 'logs/app.log', false);
    check(['**/*.log'], 'logs/app.log', true);
  });

  it('handles directory patterns via parent matches', () => {
    check(['node_modules'], 'node_modules', true);
    check(['node_modules'], 'node_modules/foo.js', true);
  });

  it('handles leading-slash patterns and directory slash quirk', () => {
    const matcher = new DockerIgnoreMatcher(['/foo', '/foo/bar', '/foo/bar/']);

    // Our context paths are relative, so the file is seen as "foo/bar"
    expect(matcher.matches('foo/bar')).toBe(true);
    // Some tar implementations may surface directory entries with a trailing slash
    expect(matcher.matches('foo/bar/')).toBe(true);
  });

  it('supports exclusions with !', () => {
    check(['*.log', '!keep.log'], 'keep.log', false);
    check(['*.log', '!keep.log'], 'other.log', true);
  });

  it('handles exclusions with leading slash', () => {
    // !/keep.log should behave like !keep.log relative to root
    check(['*.log', '!/keep.log'], 'keep.log', false);
  });

  it('implicitly ignores .dockerignore', () => {
    // this is an edge case in docker's behavior (.dockerignore is always implicitly ignored)
    const matcher = new DockerIgnoreMatcher([]);
    expect(matcher.matches('.dockerignore')).toBe(true);
  });

  it('normalizes patterns in constructor', () => {
    // constructor should handle normalization just like createIgnoreMatcher might be expected to
    // (though current createIgnoreMatcher implementation might also be flawed for exclusions)
    const matcher = new DockerIgnoreMatcher(['/foo']);
    expect(matcher.matches('foo')).toBe(true);
  });
});
