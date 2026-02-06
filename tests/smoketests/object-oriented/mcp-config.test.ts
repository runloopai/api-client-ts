import { SHORT_TIMEOUT, uniqueName, makeClientSDK, cleanUpMcpConfig } from '../utils';
import { McpConfig } from '@runloop/api-client/sdk';

const sdk = makeClientSDK();

describe('smoketest: object-oriented mcp config', () => {
  describe('mcp config lifecycle', () => {
    let mcpConfig: McpConfig | undefined;
    let mcpConfigId: string | undefined;

    // Create MCP config in beforeAll to avoid test order dependency
    beforeAll(async () => {
      mcpConfig = await sdk.mcpConfig.create({
        name: uniqueName('sdk-mcp-config'),
        endpoint: 'https://mcp.example.com',
        allowed_tools: ['*'],
        description: 'Test MCP config',
      });
      mcpConfigId = mcpConfig.id;
    }, SHORT_TIMEOUT);

    afterAll(async () => {
      await cleanUpMcpConfig(mcpConfig);
    });

    test('create mcp config', async () => {
      // MCP config was created in beforeAll - just verify it exists
      expect(mcpConfig).toBeDefined();
      expect(mcpConfig!.id).toBeTruthy();
      expect(mcpConfigId).toBeTruthy();
    });

    test('get mcp config info', async () => {
      expect(mcpConfig).toBeDefined();
      const info = await mcpConfig!.getInfo();
      expect(info.id).toBe(mcpConfigId);
      expect(info.name).toContain('sdk-mcp-config');
      expect(info.endpoint).toBe('https://mcp.example.com');
      expect(info.allowed_tools).toBeDefined();
      expect(info.allowed_tools).toContain('*');
      expect(info.description).toBe('Test MCP config');
      expect(info.create_time_ms).toBeDefined();
      expect(info.create_time_ms).toBeGreaterThan(0);
    });

    test('update mcp config', async () => {
      expect(mcpConfig).toBeDefined();
      const updated = await mcpConfig!.update({
        name: uniqueName('sdk-mcp-config-updated'),
        description: 'Updated test MCP config',
      });
      expect(updated.name).toContain('sdk-mcp-config-updated');
      expect(updated.description).toBe('Updated test MCP config');

      // Verify the update persisted
      const info = await mcpConfig!.getInfo();
      expect(info.name).toContain('sdk-mcp-config-updated');
      expect(info.description).toBe('Updated test MCP config');
    });

    test('update mcp config - endpoint', async () => {
      expect(mcpConfig).toBeDefined();
      const updated = await mcpConfig!.update({
        endpoint: 'https://mcp.updated-example.com',
      });
      expect(updated.endpoint).toBe('https://mcp.updated-example.com');

      // Verify the update persisted
      const info = await mcpConfig!.getInfo();
      expect(info.endpoint).toBe('https://mcp.updated-example.com');
    });

    test('update mcp config - allowed_tools', async () => {
      expect(mcpConfig).toBeDefined();
      const updated = await mcpConfig!.update({
        allowed_tools: ['github.search_*', 'github.get_*'],
      });
      expect(updated.allowed_tools).toContain('github.search_*');
      expect(updated.allowed_tools).toContain('github.get_*');
      expect(updated.allowed_tools.length).toBe(2);

      // Verify the update persisted
      const info = await mcpConfig!.getInfo();
      expect(info.allowed_tools).toContain('github.search_*');
      expect(info.allowed_tools).toContain('github.get_*');
    });

    test('delete mcp config', async () => {
      expect(mcpConfig).toBeDefined();
      await mcpConfig!.delete();

      // Verify it's deleted by trying to get info (should fail)
      try {
        await mcpConfig!.getInfo();
        fail('Expected MCP config to be deleted');
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Mark as deleted so afterAll doesn't try to delete again
      mcpConfig = undefined;
    });
  });

  describe('mcp config list and retrieval', () => {
    test('list mcp configs', async () => {
      const configs = await sdk.mcpConfig.list({ limit: 10 });
      expect(Array.isArray(configs)).toBe(true);
    });

    test('get mcp config by ID', async () => {
      // First create an MCP config
      let mcpConfig: McpConfig | undefined;
      try {
        mcpConfig = await sdk.mcpConfig.create({
          name: uniqueName('sdk-mcp-config-retrieve'),
          endpoint: 'https://mcp.example.com',
          allowed_tools: ['*'],
        });
        expect(mcpConfig?.id).toBeTruthy();

        // Retrieve it by ID
        const retrieved = sdk.mcpConfig.fromId(mcpConfig.id);
        expect(retrieved.id).toBe(mcpConfig.id);

        // Verify we can get info
        const info = await retrieved.getInfo();
        expect(info.id).toBe(mcpConfig.id);
        expect(info.name).toContain('sdk-mcp-config-retrieve');
      } finally {
        await cleanUpMcpConfig(mcpConfig);
      }
    });
  });

  describe('mcp config allowed_tools configurations', () => {
    test('create config with wildcard all tools', async () => {
      let mcpConfig: McpConfig | undefined;
      try {
        mcpConfig = await sdk.mcpConfig.create({
          name: uniqueName('sdk-mcp-wildcard-all'),
          endpoint: 'https://mcp.example.com',
          allowed_tools: ['*'],
        });
        const info = await mcpConfig.getInfo();
        expect(info.allowed_tools).toContain('*');
        expect(info.allowed_tools.length).toBe(1);
      } finally {
        await cleanUpMcpConfig(mcpConfig);
      }
    });

    test('create config with specific tool patterns', async () => {
      let mcpConfig: McpConfig | undefined;
      try {
        const tools = ['github.search_*', 'github.get_*', 'slack.post_message'];
        mcpConfig = await sdk.mcpConfig.create({
          name: uniqueName('sdk-mcp-specific-tools'),
          endpoint: 'https://mcp.example.com',
          allowed_tools: tools,
        });
        const info = await mcpConfig.getInfo();
        expect(info.allowed_tools.length).toBe(tools.length);
        for (const tool of tools) {
          expect(info.allowed_tools).toContain(tool);
        }
      } finally {
        await cleanUpMcpConfig(mcpConfig);
      }
    });

    test('create config with description', async () => {
      let mcpConfig: McpConfig | undefined;
      try {
        mcpConfig = await sdk.mcpConfig.create({
          name: uniqueName('sdk-mcp-with-desc'),
          endpoint: 'https://mcp.example.com',
          allowed_tools: ['*'],
          description: 'An MCP config with a description',
        });
        const info = await mcpConfig.getInfo();
        expect(info.description).toBe('An MCP config with a description');
      } finally {
        await cleanUpMcpConfig(mcpConfig);
      }
    });

    test('create config without description', async () => {
      let mcpConfig: McpConfig | undefined;
      try {
        mcpConfig = await sdk.mcpConfig.create({
          name: uniqueName('sdk-mcp-no-desc'),
          endpoint: 'https://mcp.example.com',
          allowed_tools: ['*'],
        });
        const info = await mcpConfig.getInfo();
        // description should be null or undefined when not provided
        expect(info.description === null || info.description === undefined).toBe(true);
      } finally {
        await cleanUpMcpConfig(mcpConfig);
      }
    });
  });

  describe('mcp config update operations', () => {
    let mcpConfig: McpConfig | undefined;

    beforeEach(async () => {
      mcpConfig = await sdk.mcpConfig.create({
        name: uniqueName('sdk-mcp-update-test'),
        endpoint: 'https://mcp.example.com',
        allowed_tools: ['*'],
      });
    });

    afterEach(async () => {
      await cleanUpMcpConfig(mcpConfig);
      mcpConfig = undefined;
    });

    test('update name only', async () => {
      const newName = uniqueName('sdk-mcp-updated-name');
      const updated = await mcpConfig!.update({ name: newName });
      expect(updated.name).toContain('sdk-mcp-updated-name');

      const info = await mcpConfig!.getInfo();
      expect(info.name).toContain('sdk-mcp-updated-name');
    });

    test('update description only', async () => {
      const updated = await mcpConfig!.update({ description: 'New description' });
      expect(updated.description).toBe('New description');

      const info = await mcpConfig!.getInfo();
      expect(info.description).toBe('New description');
    });

    test('update endpoint only', async () => {
      const updated = await mcpConfig!.update({ endpoint: 'https://mcp.new-example.com' });
      expect(updated.endpoint).toBe('https://mcp.new-example.com');

      const info = await mcpConfig!.getInfo();
      expect(info.endpoint).toBe('https://mcp.new-example.com');
    });

    test('update allowed_tools only', async () => {
      const newTools = ['github.search_*', 'github.get_*'];
      const updated = await mcpConfig!.update({ allowed_tools: newTools });
      expect(updated.allowed_tools.length).toBe(newTools.length);
      for (const tool of newTools) {
        expect(updated.allowed_tools).toContain(tool);
      }

      const info = await mcpConfig!.getInfo();
      expect(info.allowed_tools.length).toBe(newTools.length);
    });

    test('update multiple fields at once', async () => {
      const updated = await mcpConfig!.update({
        name: uniqueName('sdk-mcp-multi-update'),
        description: 'Multi-update description',
        endpoint: 'https://mcp.multi-update.com',
        allowed_tools: ['slack.*', 'github.get_*'],
      });

      expect(updated.name).toContain('sdk-mcp-multi-update');
      expect(updated.description).toBe('Multi-update description');
      expect(updated.endpoint).toBe('https://mcp.multi-update.com');
      expect(updated.allowed_tools.length).toBe(2);
      expect(updated.allowed_tools).toContain('slack.*');
      expect(updated.allowed_tools).toContain('github.get_*');

      const info = await mcpConfig!.getInfo();
      expect(info.name).toContain('sdk-mcp-multi-update');
      expect(info.description).toBe('Multi-update description');
      expect(info.endpoint).toBe('https://mcp.multi-update.com');
    });

    test('update allowed_tools from wildcard to specific', async () => {
      // Start with wildcard
      let info = await mcpConfig!.getInfo();
      expect(info.allowed_tools).toContain('*');

      // Update to specific tools
      const specificTools = ['github.search_repos', 'github.get_repo'];
      const updated = await mcpConfig!.update({ allowed_tools: specificTools });
      expect(updated.allowed_tools.length).toBe(specificTools.length);
      for (const tool of specificTools) {
        expect(updated.allowed_tools).toContain(tool);
      }

      // Verify persisted
      info = await mcpConfig!.getInfo();
      expect(info.allowed_tools.length).toBe(specificTools.length);
    });

    test('update allowed_tools from specific to wildcard', async () => {
      // First set specific tools
      await mcpConfig!.update({ allowed_tools: ['github.search_*'] });
      let info = await mcpConfig!.getInfo();
      expect(info.allowed_tools).toContain('github.search_*');

      // Update back to wildcard
      const updated = await mcpConfig!.update({ allowed_tools: ['*'] });
      expect(updated.allowed_tools).toContain('*');
      expect(updated.allowed_tools.length).toBe(1);

      // Verify persisted
      info = await mcpConfig!.getInfo();
      expect(info.allowed_tools).toContain('*');
      expect(info.allowed_tools.length).toBe(1);
    });
  });
});
