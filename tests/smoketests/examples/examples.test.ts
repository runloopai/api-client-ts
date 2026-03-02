import { SHORT_TIMEOUT, LONG_TIMEOUT } from '../utils';
import { exampleRegistry } from '../../../examples/registry';

describe('smoketest: examples', () => {
  const hasLiveFlag = process.env['RUN_EXAMPLE_LIVE_TESTS'] === '1';

  for (const entry of exampleRegistry) {
    const hasRequiredEnv = entry.requiredEnv.every((name) => Boolean(process.env[name]));
    const runLiveExample = hasLiveFlag && hasRequiredEnv;
    const itLive = runLiveExample ? test : test.skip;

    itLive(
      `${entry.slug} example runs with successful checks and cleanup`,
      async () => {
        const result = await entry.run();

        expect(result.skipped).toBeUndefined();
        expect(result.resourcesCreated.length).toBeGreaterThan(0);
        expect(result.checks.length).toBeGreaterThan(0);
        expect(result.checks.every((check) => check.passed)).toBe(true);
        expect(result.cleanupStatus.failed).toHaveLength(0);
      },
      LONG_TIMEOUT,
    );
  }

  test(
    'mcp-github-tools example supports deterministic skip mode for missing credentials',
    async () => {
      const mcpExampleEntry = exampleRegistry.find((entry) => entry.slug === 'mcp-github-tools');
      if (!mcpExampleEntry) {
        throw new Error('Example registry is missing mcp-github-tools.');
      }

      const originalGithubToken = process.env['GITHUB_TOKEN'];
      const originalAnthropicApiKey = process.env['ANTHROPIC_API_KEY'];

      delete process.env['GITHUB_TOKEN'];
      delete process.env['ANTHROPIC_API_KEY'];

      try {
        const result = await mcpExampleEntry.run({ skipIfMissingCredentials: true });

        expect(result.skipped).toBe(true);
        expect(result.resourcesCreated).toHaveLength(0);
        expect(result.cleanupStatus.attempted).toHaveLength(0);
      } finally {
        if (originalGithubToken === undefined) {
          delete process.env['GITHUB_TOKEN'];
        } else {
          process.env['GITHUB_TOKEN'] = originalGithubToken;
        }
        if (originalAnthropicApiKey === undefined) {
          delete process.env['ANTHROPIC_API_KEY'];
        } else {
          process.env['ANTHROPIC_API_KEY'] = originalAnthropicApiKey;
        }
      }
    },
    SHORT_TIMEOUT,
  );
});
