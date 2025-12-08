import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export type IgnoreKind = 'docker';

/**
 * Interface for ignore pattern matching.
 * `matches(path)` returns true if the path should be ignored.
 */
export interface IgnoreMatcher {
  matches(filePath: string): boolean;
}

/**
 * Create an IgnoreMatcher from raw patterns for a given kind.
 * Currently only supports 'docker' (.dockerignore semantics).
 */
export function createIgnoreMatcher(patterns: string[], kind: IgnoreKind = 'docker'): IgnoreMatcher | null {
  const cleaned = normalizePatterns(patterns);
  if (cleaned.length === 0) return null;

  switch (kind) {
    case 'docker':
    default:
      return new DockerIgnoreMatcher(cleaned);
  }
}

/**
 * Load an ignore matcher from a directory.
 * For 'docker', this looks for `.dockerignore` in `dir`.
 */
export async function loadIgnoreMatcher(
  dir: string,
  kind: IgnoreKind = 'docker',
): Promise<IgnoreMatcher | null> {
  const filename = kind === 'docker' ? '.dockerignore' : null;
  if (!filename) return null;

  const ignorePath = path.join(dir, filename);

  try {
    const stats = await fs.stat(ignorePath);
    if (typeof stats.isFile === 'function' && !stats.isFile()) {
      return null;
    }
  } catch {
    // No .dockerignore file – nothing to ignore
    return null;
  }

  try {
    const content = await fs.readFile(ignorePath, 'utf-8');
    const rawPatterns = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));

    return createIgnoreMatcher(rawPatterns, kind);
  } catch {
    // If we can't read/parse, fail open (no ignores)
    return null;
  }
}

function normalizePatterns(patterns: string[]): string[] {
  return patterns
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      // .dockerignore uses forward slashes
      let pat = p.replace(/\\/g, '/');
      // Leading "/" anchors to context root; since we only ever match
      // paths relative to the context root (no leading slash), we can
      // drop this while preserving Docker semantics.
      if (pat.startsWith('/')) pat = pat.slice(1);
      // Remove redundant leading "./"
      if (pat.startsWith('./')) pat = pat.slice(2);
      // Remove trailing slash except root
      if (pat.endsWith('/') && pat !== '/') pat = pat.slice(0, -1);
      return pat;
    });
}

/**
 * Load an ignore matcher from an explicit ignore file path.
 */
export async function loadIgnoreMatcherFromFile(
  ignoreFilePath: string,
  kind: IgnoreKind = 'docker',
): Promise<IgnoreMatcher | null> {
  try {
    const stats = await fs.stat(ignoreFilePath);
    if (typeof stats.isFile === 'function' && !stats.isFile()) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const content = await fs.readFile(ignoreFilePath, 'utf-8');
    const rawPatterns = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));

    return createIgnoreMatcher(rawPatterns, kind);
  } catch {
    return null;
  }
}

/**
 * Docker-style matcher implementing the core behavior of moby/patternmatcher:
 * - glob patterns with *, **, ?, and character classes
 * - '!' exclusion patterns
 * - parent-directory matches (MatchesOrParentMatches semantics)
 */
export class DockerIgnoreMatcher implements IgnoreMatcher {
  private patterns: CompiledPattern[];

  constructor(patterns: string[]) {
    this.patterns = patterns.map((raw) => {
      // Normalize pattern immediately upon construction
      let cleaned = raw;
      if (cleaned.startsWith('/')) cleaned = cleaned.slice(1);
      if (cleaned.startsWith('./')) cleaned = cleaned.slice(2);
      if (cleaned.endsWith('/') && cleaned !== '/') cleaned = cleaned.slice(0, -1);
      return new CompiledPattern(cleaned, raw);
    });
  }

  matches(filePath: string): boolean {
    // Expect paths relative to context root, forward-slash separated
    let normalized = filePath.replace(/\\/g, '/');

    // Strip leading ./ if present
    if (normalized.startsWith('./')) normalized = normalized.slice(2);

    // Strip trailing slash if present (unless it's just root)
    if (normalized.endsWith('/') && normalized !== '/') normalized = normalized.slice(0, -1);

    if (!normalized) normalized = '.';

    const parts = normalized.split('/');
    const parentPaths: string[] = [];
    for (let i = 0; i < parts.length - 1; i++) {
      parentPaths.push(parts.slice(0, i + 1).join('/'));
    }

    let matched = false;

    for (const pattern of this.patterns) {
      // If we are already ignored (matched=true), we only care about exceptions (exclusion=true).
      // If we are NOT ignored (matched=false), we only care about ignores (exclusion=false).
      if (pattern.exclusion !== matched) {
        continue;
      }

      let isMatch = pattern.match(normalized);

      if (!isMatch && parentPaths.length > 0) {
        for (const parent of parentPaths) {
          if (pattern.match(parent)) {
            isMatch = true;
            break;
          }
        }
      }

      if (isMatch) {
        matched = !pattern.exclusion;
      }
    }

    return matched;
  }
}

class CompiledPattern {
  readonly raw: string;
  readonly exclusion: boolean;
  private readonly cleaned: string;
  private readonly regexp: RegExp;

  constructor(pattern: string, raw?: string) {
    this.raw = raw || pattern;
    if (pattern.startsWith('!')) {
      this.exclusion = true;
      this.cleaned = pattern.slice(1);
    } else {
      this.exclusion = false;
      this.cleaned = pattern;
    }

    this.regexp = globToRegExp(this.cleaned);
  }

  match(target: string): boolean {
    return this.regexp.test(target);
  }
}

/**
 * Convert a Docker-style glob pattern to a RegExp.
 * Roughly mirrors moby/patternmatcher.compile:
 * - '*' => any sequence except '/'
 * - '**' => any sequence including '/'
 * - '?' => any single char except '/'
 * - character classes [] are passed through
 */
function globToRegExp(pattern: string): RegExp {
  let re = '^';
  const len = pattern.length;

  for (let i = 0; i < len; i++) {
    const ch = pattern[i]!;
    const next = i + 1 < len ? pattern[i + 1]! : '';

    if (ch === '*') {
      if (next === '*') {
        // "**"
        i++;
        const afterNext = i + 1 < len ? pattern[i + 1]! : '';

        if (afterNext === '/') {
          // "**/" => any number of directories (including none)
          i++;
          re += '(?:.*/)?';
        } else if (i + 1 === len) {
          // trailing "**"
          re += '.*';
        } else {
          // general "**" in middle
          re += '.*';
        }
      } else {
        // "*" => anything but '/'
        re += '[^/]*';
      }
    } else if (ch === '?') {
      re += '[^/]';
    } else if (ch === '[') {
      // Character class: copy through until closing ']'
      let j = i + 1;
      let cls = '[';
      while (j < len && pattern[j] !== ']') {
        const c = pattern[j]!;
        cls += c === '\\' ? '\\\\' : c;
        j++;
      }
      if (j < len && pattern[j] === ']') {
        cls += ']';
        re += cls;
        i = j;
      } else {
        // Unterminated '[', treat literally
        re += '\\[';
      }
    } else if ('().+|{}^$\\'.includes(ch)) {
      re += '\\' + ch;
    } else {
      re += ch;
    }
  }

  re += '$';
  return new RegExp(re);
}
