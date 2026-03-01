import { SHORT_TIMEOUT, LONG_TIMEOUT } from '../utils';
import { runDevboxFromBlueprintLifecycleExample } from '../../../examples/devbox-from-blueprint-lifecycle';
import { runMcpGithubToolsExample } from '../../../examples/mcp-github-tools';

describe('smoketest: examples', () => {
  const hasRunloopEnv =
    process.env['RUN_EXAMPLE_LIVE_TESTS'] === '1' && Boolean(process.env['RUNLOOP_API_KEY']);
  const runIfRunloopEnv = hasRunloopEnv ? test : test.skip;

  runIfRunloopEnv(
    'devbox-from-blueprint-lifecycle example runs with successful checks and cleanup',
    async () => {
      const result = await runDevboxFromBlueprintLifecycleExample();

      expect(result.skipped).toBeUndefined();
      expect(result.resourcesCreated.length).toBeGreaterThanOrEqual(2);
      expect(result.checks.length).toBeGreaterThanOrEqual(2);
      expect(result.checks.every((check) => check.passed)).toBe(true);
      expect(result.cleanupStatus.failed).toHaveLength(0);
      expect(result.cleanupStatus.attempted).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^devbox:/),
          expect.stringMatching(/^blueprint:/),
        ]),
      );
    },
    LONG_TIMEOUT,
  );

  test(
    'mcp-github-tools example supports deterministic skip mode for missing credentials',
    async () => {
      const originalGithubToken = process.env['GITHUB_TOKEN'];
      const originalAnthropicApiKey = process.env['ANTHROPIC_API_KEY'];

      delete process.env['GITHUB_TOKEN'];
      delete process.env['ANTHROPIC_API_KEY'];

      try {
        const result = await runMcpGithubToolsExample({ skipIfMissingCredentials: true });

        expect(result.skipped).toBe(true);
        expect(result.resourcesCreated).toHaveLength(0);
        expect(result.cleanupStatus.attempted).toHaveLength(0);
      } finally {
        process.env['GITHUB_TOKEN'] = originalGithubToken;
        process.env['ANTHROPIC_API_KEY'] = originalAnthropicApiKey;
      }
    },
    SHORT_TIMEOUT,
  );
});
