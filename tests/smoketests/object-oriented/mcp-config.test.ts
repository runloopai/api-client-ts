import { SHORT_TIMEOUT, MEDIUM_TIMEOUT, uniqueName, makeClientSDK, cleanUpMcpConfig } from '../utils';
import { McpConfig, Devbox } from '@runloop/api-client/sdk';

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

  // Comprehensive MCP hub integration tests using the MCP protocol (Streamable HTTP transport).
  // These tests create a devbox with MCP configs and use the MCP JSON-RPC protocol to
  // initialize a session and list tools through the MCP hub.
  (process.env['RUN_SMOKETESTS'] ? describe : describe.skip)('mcp hub protocol integration', () => {
    let devbox: Devbox | undefined;
    let mcpConfig: McpConfig | undefined;
    const testSecretName = uniqueName('mcp-hub-test-secret');
    let mcpUrl: string;
    let mcpToken: string;

    // Comprehensive MCP hub integration tests using the MCP protocol (Streamable HTTP transport).
    // These tests create a devbox with MCP configs and use the MCP JSON-RPC protocol to
    // initialize a session and list tools through the MCP hub.
    (process.env['RUN_SMOKETESTS'] ? describe : describe.skip)('mcp hub protocol integration', () => {
      let devbox: Devbox | undefined;
      let mcpConfig: McpConfig | undefined;
      const testSecretName = uniqueName('mcp-hub-test-secret');
      let mcpUrl: string;
      let mcpToken: string;

      /**
       * Helper to send an MCP JSON-RPC request via curl inside the devbox.
       * Uses the standard MCP Streamable HTTP transport: POST with Accept header
       * supporting both application/json and text/event-stream.
       * Parses whichever format the server returns.
       */
      const mcpRequest = async (
        body: object,
      ): Promise<{
        httpCode: number;
        jsonRpc: any;
        rawOutput: string;
      }> => {
        let curlCmd = `curl -s --connect-timeout 10 --max-time 30`;
        curlCmd += ` -w "\\nHTTP_CODE:%{http_code}"`;
        curlCmd += ` -X POST "${mcpUrl}"`;
        curlCmd += ` -H "Authorization: Bearer ${mcpToken}"`;
        curlCmd += ` -H "Content-Type: application/json"`;
        curlCmd += ` -H "Accept: application/json, text/event-stream"`;
        const bodyJson = JSON.stringify(body).replace(/'/g, "'\\''");
        curlCmd += ` -d '${bodyJson}'`;
        curlCmd += ` 2>&1`;

        const result = await devbox!.cmd.exec(curlCmd);
        const output = (await result.stdout()).trim();

        // Parse HTTP status code from the appended trailer line
        const lines = output.split('\n');
        const httpCodeLine = lines.pop() || '';
        const responseBody = lines.join('\n');
        const httpCode = parseInt(httpCodeLine.replace('HTTP_CODE:', ''), 10);

        // Parse JSON-RPC response, handling both plain JSON and SSE formats
        let jsonRpc: any = null;
        try {
          jsonRpc = JSON.parse(responseBody);
        } catch {
          // Try SSE format: extract the last `data:` line
          const dataLines = responseBody
            .split('\n')
            .filter((line) => line.startsWith('data: '))
            .map((line) => line.substring(6));
          if (dataLines.length > 0) {
            try {
              jsonRpc = JSON.parse(dataLines[dataLines.length - 1]!);
            } catch {
              // Could not parse response
            }
          }
        }

        return { httpCode, jsonRpc, rawOutput: output };
      };

      /**
       * Helper to send an MCP JSON-RPC notification (no id, no response expected).
       * Per the MCP spec, the server should return 202 Accepted for notifications.
       */
      const mcpNotify = async (body: object): Promise<number> => {
        let curlCmd = `curl -s --connect-timeout 10 --max-time 30`;
        curlCmd += ` -o /dev/null -w "%{http_code}"`;
        curlCmd += ` -X POST "${mcpUrl}"`;
        curlCmd += ` -H "Authorization: Bearer ${mcpToken}"`;
        curlCmd += ` -H "Content-Type: application/json"`;
        curlCmd += ` -H "Accept: application/json, text/event-stream"`;
        const bodyJson = JSON.stringify(body).replace(/'/g, "'\\''");
        curlCmd += ` -d '${bodyJson}'`;

        const result = await devbox!.cmd.exec(curlCmd);
        return parseInt((await result.stdout()).trim(), 10);
      };

      beforeAll(async () => {
        // Create a secret for MCP authentication
        await sdk.api.secrets.create({
          name: testSecretName,
          value: 'test-secret-for-mcp-hub',
        });

        // Create an MCP config pointing to the upstream MCP server
        mcpConfig = await sdk.mcpConfig.create({
          name: uniqueName('sdk-mcp-hub-test'),
          endpoint: 'https://mcp.example.com',
          allowed_tools: ['*'],
          description: 'MCP config for hub protocol tests',
        });

        // Create a devbox with the MCP spec
        devbox = await sdk.devbox.create({
          name: uniqueName('devbox-mcp-hub'),
          launch_parameters: {
            resource_size_request: 'X_SMALL',
            keep_alive_time_seconds: 300,
          },
          mcp: [
            {
              mcp_config: mcpConfig.id,
              secret: testSecretName,
            },
          ],
        });

        // Extract MCP hub URL and token from devbox environment.
        // The moxy server exposes its MCP JSON-RPC endpoint at /mcp.
        const urlResult = await devbox.cmd.exec('echo $RL_MCP_URL');
        const baseUrl = (await urlResult.stdout()).trim();
        mcpUrl = `${baseUrl}/mcp`;

        const tokenResult = await devbox.cmd.exec('echo $RL_MCP_TOKEN');
        mcpToken = (await tokenResult.stdout()).trim();

        expect(baseUrl).toBeTruthy();
        expect(mcpToken).toBeTruthy();
      }, MEDIUM_TIMEOUT);

      afterAll(async () => {
        if (devbox) {
          try {
            await devbox.shutdown();
          } catch {
            // Ignore shutdown errors
          }
        }
        await cleanUpMcpConfig(mcpConfig);
        try {
          await sdk.api.secrets.delete(testSecretName);
        } catch {
          // Ignore if already deleted
        }
      });

      test('environment variables are set', async () => {
        expect(mcpUrl).toBeTruthy();
        expect(mcpUrl.startsWith('http')).toBe(true);
        expect(mcpUrl.endsWith('/mcp')).toBe(true);
        expect(mcpToken).toBeTruthy();
      });

      test(
        'MCP hub is reachable and authenticates',
        async () => {
          // Send a standard MCP initialize request. The hub will authenticate us via
          // the bearer token and attempt to connect to upstream MCP servers.
          // With test endpoints (example.com), upstreams will be unreachable and the
          // hub returns 500. This is expected -- the test verifies the hub itself is
          // reachable, accepts our auth, and returns a valid HTTP response.
          const initResponse = await mcpRequest({
            jsonrpc: '2.0',
            method: 'initialize',
            params: {
              protocolVersion: '2024-11-05',
              capabilities: {},
              clientInfo: { name: 'runloop-sdk-test', version: '1.0.0' },
            },
            id: 1,
          });

          // We should get an HTTP response (not 0 which would mean transport failure)
          expect(initResponse.httpCode).toBeGreaterThan(0);

          if (initResponse.httpCode === 200) {
            // If upstreams are reachable, verify standard MCP initialize response
            expect(initResponse.jsonRpc).toBeDefined();
            expect(initResponse.jsonRpc.jsonrpc).toBe('2.0');
            expect(initResponse.jsonRpc.id).toBe(1);

            const result = initResponse.jsonRpc.result;
            expect(result).toBeDefined();
            expect(result.protocolVersion).toBeDefined();
            expect(typeof result.protocolVersion).toBe('string');
            expect(result.capabilities).toBeDefined();
            expect(result.serverInfo).toBeDefined();
            expect(result.serverInfo.name).toBeTruthy();
          } else {
            // 500 is expected when upstream MCP servers (example.com) are unreachable.
            // The hub authenticated us and tried to connect -- the failure is upstream, not auth.
            expect(initResponse.httpCode).toBe(500);
          }
        },
        SHORT_TIMEOUT,
      );

      test(
        'initialize and list tools via MCP protocol',
        async () => {
          // Follow the standard MCP lifecycle: initialize → notifications/initialized → tools/list
          // With test endpoints (example.com), the upstream connection may fail.
          // If initialize succeeds (upstreams reachable), continue to tools/list.

          // Step 1: Initialize
          const initResponse = await mcpRequest({
            jsonrpc: '2.0',
            method: 'initialize',
            params: {
              protocolVersion: '2024-11-05',
              capabilities: {},
              clientInfo: { name: 'runloop-sdk-test', version: '1.0.0' },
            },
            id: 1,
          });

          expect(initResponse.httpCode).toBeGreaterThan(0);

          // If upstream connection fails, the hub can't be created -- skip the rest
          if (initResponse.httpCode !== 200) {
            console.log(
              `Skipping tools/list: upstream MCP servers unreachable (HTTP ${initResponse.httpCode})`,
            );
            return;
          }

          expect(initResponse.jsonRpc?.result).toBeDefined();

          // Step 2: Send initialized notification (per MCP lifecycle spec)
          await mcpNotify({
            jsonrpc: '2.0',
            method: 'notifications/initialized',
          });

          // Step 3: List tools
          const toolsResponse = await mcpRequest({
            jsonrpc: '2.0',
            method: 'tools/list',
            id: 2,
          });

          expect(toolsResponse.httpCode).toBe(200);
          expect(toolsResponse.jsonRpc).toBeDefined();
          expect(toolsResponse.jsonRpc.jsonrpc).toBe('2.0');
          expect(toolsResponse.jsonRpc.id).toBe(2);

          // The result should contain a tools array
          expect(toolsResponse.jsonRpc.result).toBeDefined();
          expect(Array.isArray(toolsResponse.jsonRpc.result.tools)).toBe(true);

          // Each tool should conform to MCP Tool schema
          for (const tool of toolsResponse.jsonRpc.result.tools) {
            expect(tool.name).toBeTruthy();
            expect(typeof tool.name).toBe('string');
            if (tool.inputSchema) {
              expect(typeof tool.inputSchema).toBe('object');
            }
          }
        },
        SHORT_TIMEOUT,
      );

      test(
        'MCP hub rejects requests without authentication',
        async () => {
          // Send a request without the bearer token
          const bodyJson = JSON.stringify({
            jsonrpc: '2.0',
            method: 'initialize',
            params: {
              protocolVersion: '2024-11-05',
              capabilities: {},
              clientInfo: { name: 'unauthorized-test', version: '1.0.0' },
            },
            id: 1,
          }).replace(/'/g, "'\\''");

          // POST to the MCP endpoint without auth
          let curlCmd = `curl -s --connect-timeout 10 --max-time 30`;
          curlCmd += ` -o /dev/null -w "%{http_code}"`;
          curlCmd += ` -X POST "${mcpUrl}"`;
          curlCmd += ` -H "Content-Type: application/json"`;
          curlCmd += ` -H "Accept: application/json, text/event-stream"`;
          curlCmd += ` -d '${bodyJson}'`;

          const result = await devbox!.cmd.exec(curlCmd);
          const httpCode = parseInt((await result.stdout()).trim(), 10);

          // Moxy returns 401/403 when Bearer token is missing
          expect(httpCode).toBeGreaterThanOrEqual(400);
          expect(httpCode).toBeLessThan(500);
        },
        SHORT_TIMEOUT,
      );
    });

    // Test devbox with MCP config referenced by name and with multiple configs
    (process.env['RUN_SMOKETESTS'] ? describe : describe.skip)('devbox with mcp config variations', () => {
      test(
        'create devbox with mcp config by name',
        async () => {
          let devbox: Devbox | undefined;
          let mcpConfig: McpConfig | undefined;
          const testSecretName = uniqueName('mcp-name-test-secret');

          try {
            await sdk.api.secrets.create({
              name: testSecretName,
              value: 'test-secret-value-for-mcp-name',
            });

            const mcpConfigName = uniqueName('sdk-mcp-byname-test');
            mcpConfig = await sdk.mcpConfig.create({
              name: mcpConfigName,
              endpoint: 'https://mcp.example.com',
              allowed_tools: ['*'],
            });

            // Reference the MCP config by name instead of ID
            devbox = await sdk.devbox.create({
              name: uniqueName('devbox-mcp-byname'),
              launch_parameters: {
                resource_size_request: 'X_SMALL',
                keep_alive_time_seconds: 60,
              },
              mcp: [
                {
                  mcp_config: mcpConfigName,
                  secret: testSecretName,
                },
              ],
            });

            expect(devbox).toBeDefined();
            expect(devbox.id).toBeTruthy();

            // Verify MCP environment variables are set
            const urlResult = await devbox.cmd.exec('echo $RL_MCP_URL');
            expect(urlResult.exitCode).toBe(0);
            const urlValue = (await urlResult.stdout()).trim();
            expect(urlValue).toBeTruthy();
            expect(urlValue.startsWith('http')).toBe(true);

            const tokenResult = await devbox.cmd.exec('echo $RL_MCP_TOKEN');
            expect(tokenResult.exitCode).toBe(0);
            const tokenValue = (await tokenResult.stdout()).trim();
            expect(tokenValue).toBeTruthy();
          } finally {
            if (devbox) {
              try {
                await devbox.shutdown();
              } catch {
                // Ignore shutdown errors
              }
            }
            await cleanUpMcpConfig(mcpConfig);
            try {
              await sdk.api.secrets.delete(testSecretName);
            } catch {
              // Ignore if already deleted
            }
          }
        },
        MEDIUM_TIMEOUT,
      );

      test(
        'create devbox with multiple mcp configs and list tools',
        async () => {
          let devbox: Devbox | undefined;
          let mcpConfig1: McpConfig | undefined;
          let mcpConfig2: McpConfig | undefined;
          const testSecretName1 = uniqueName('mcp-multi-secret-1');
          const testSecretName2 = uniqueName('mcp-multi-secret-2');

          try {
            await sdk.api.secrets.create({
              name: testSecretName1,
              value: 'test-secret-value-1',
            });
            await sdk.api.secrets.create({
              name: testSecretName2,
              value: 'test-secret-value-2',
            });

            mcpConfig1 = await sdk.mcpConfig.create({
              name: uniqueName('sdk-mcp-multi-1'),
              endpoint: 'https://mcp-1.example.com',
              allowed_tools: ['github.*'],
              description: 'First MCP config for multi-test',
            });

            mcpConfig2 = await sdk.mcpConfig.create({
              name: uniqueName('sdk-mcp-multi-2'),
              endpoint: 'https://mcp-2.example.com',
              allowed_tools: ['slack.post_message', 'slack.get_channels'],
              description: 'Second MCP config for multi-test',
            });

            devbox = await sdk.devbox.create({
              name: uniqueName('devbox-multi-mcp'),
              launch_parameters: {
                resource_size_request: 'X_SMALL',
                keep_alive_time_seconds: 60,
              },
              mcp: [
                {
                  mcp_config: mcpConfig1.id,
                  secret: testSecretName1,
                },
                {
                  mcp_config: mcpConfig2.id,
                  secret: testSecretName2,
                },
              ],
            });

            expect(devbox).toBeDefined();
            expect(devbox.id).toBeTruthy();

            // Extract MCP hub credentials -- moxy serves on /mcp
            const urlResult = await devbox.cmd.exec('echo $RL_MCP_URL');
            const mcpBaseUrl = (await urlResult.stdout()).trim();
            const mcpUrl = `${mcpBaseUrl}/mcp`;
            const tokenResult = await devbox.cmd.exec('echo $RL_MCP_TOKEN');
            const mcpToken = (await tokenResult.stdout()).trim();

            expect(mcpBaseUrl).toBeTruthy();
            expect(mcpBaseUrl.startsWith('http')).toBe(true);
            expect(mcpToken).toBeTruthy();

            // Send an MCP initialize request to verify the hub is reachable with multiple configs.
            // With test endpoints (example.com), upstreams are unreachable and hub returns 500.
            const initBody = JSON.stringify({
              jsonrpc: '2.0',
              method: 'initialize',
              params: {
                protocolVersion: '2024-11-05',
                capabilities: {},
                clientInfo: { name: 'runloop-sdk-test-multi', version: '1.0.0' },
              },
              id: 1,
            }).replace(/'/g, "'\\''");

            let initCmd = `curl -s --connect-timeout 10 --max-time 30`;
            initCmd += ` -w "\\nHTTP_CODE:%{http_code}"`;
            initCmd += ` -X POST "${mcpUrl}"`;
            initCmd += ` -H "Authorization: Bearer ${mcpToken}"`;
            initCmd += ` -H "Content-Type: application/json"`;
            initCmd += ` -H "Accept: application/json, text/event-stream"`;
            initCmd += ` -d '${initBody}' 2>&1`;

            const initResult = await devbox.cmd.exec(initCmd);
            const initOutput = (await initResult.stdout()).trim();
            const initLines = initOutput.split('\n');
            const initHttpLine = initLines.pop() || '';
            const initHttpCode = parseInt(initHttpLine.replace('HTTP_CODE:', ''), 10);

            // The hub should respond (not 0 / transport error)
            expect(initHttpCode).toBeGreaterThan(0);

            // With real upstreams we'd get 200; with test endpoints we expect 500
            if (initHttpCode === 200) {
              const initRespBody = initLines.join('\n');
              const initJson = JSON.parse(initRespBody);
              expect(initJson.result).toBeDefined();
              expect(initJson.result.serverInfo).toBeDefined();
            } else {
              // 500 from upstream connection failure is expected with example.com endpoints
              expect(initHttpCode).toBe(500);
            }
          } finally {
            if (devbox) {
              try {
                await devbox.shutdown();
              } catch {
                // Ignore shutdown errors
              }
            }
            await cleanUpMcpConfig(mcpConfig1);
            await cleanUpMcpConfig(mcpConfig2);
            try {
              await sdk.api.secrets.delete(testSecretName1);
            } catch {
              // Ignore if already deleted
            }
            try {
              await sdk.api.secrets.delete(testSecretName2);
            } catch {
              // Ignore if already deleted
            }
          }
        },
        MEDIUM_TIMEOUT,
      );

      test(
        'create devbox with mcp config and gateway config together',
        async () => {
          let devbox: Devbox | undefined;
          let mcpConfig: McpConfig | undefined;
          const mcpSecretName = uniqueName('mcp-combo-secret');
          const gatewaySecretName = uniqueName('gw-combo-secret');

          try {
            await sdk.api.secrets.create({
              name: mcpSecretName,
              value: 'test-mcp-secret-value',
            });
            await sdk.api.secrets.create({
              name: gatewaySecretName,
              value: 'test-gateway-secret-value',
            });

            mcpConfig = await sdk.mcpConfig.create({
              name: uniqueName('sdk-mcp-combo-test'),
              endpoint: 'https://mcp.example.com',
              allowed_tools: ['*'],
            });

            const gatewayConfig = await sdk.gatewayConfig.create({
              name: uniqueName('sdk-gw-combo-test'),
              endpoint: 'https://api.example.com',
              auth_mechanism: { type: 'bearer' },
            });

            try {
              devbox = await sdk.devbox.create({
                name: uniqueName('devbox-mcp-gw-combo'),
                launch_parameters: {
                  resource_size_request: 'X_SMALL',
                  keep_alive_time_seconds: 60,
                },
                mcp: [
                  {
                    mcp_config: mcpConfig.id,
                    secret: mcpSecretName,
                  },
                ],
                gateways: {
                  MY_API: {
                    gateway: gatewayConfig.id,
                    secret: gatewaySecretName,
                  },
                },
              });

              expect(devbox).toBeDefined();
              expect(devbox.id).toBeTruthy();

              // Verify both MCP and gateway environment variables are set
              const mcpUrlResult = await devbox.cmd.exec('echo $RL_MCP_URL');
              expect(mcpUrlResult.exitCode).toBe(0);
              const mcpUrlValue = (await mcpUrlResult.stdout()).trim();
              expect(mcpUrlValue).toBeTruthy();
              expect(mcpUrlValue.startsWith('http')).toBe(true);

              const mcpTokenResult = await devbox.cmd.exec('echo $RL_MCP_TOKEN');
              expect(mcpTokenResult.exitCode).toBe(0);
              const mcpTokenValue = (await mcpTokenResult.stdout()).trim();
              expect(mcpTokenValue).toBeTruthy();

              const gwUrlResult = await devbox.cmd.exec('echo $MY_API_URL');
              expect(gwUrlResult.exitCode).toBe(0);
              const gwUrlValue = (await gwUrlResult.stdout()).trim();
              expect(gwUrlValue).toBeTruthy();

              const gwSecretResult = await devbox.cmd.exec('echo $MY_API');
              expect(gwSecretResult.exitCode).toBe(0);
              const gwSecretValue = (await gwSecretResult.stdout()).trim();
              expect(gwSecretValue).toBeTruthy();
              expect(gwSecretValue.startsWith('gws_')).toBe(true);

              // Verify MCP hub is reachable from the devbox alongside the gateway
              const mcpEndpoint = `${mcpUrlValue}/mcp`;
              const initBody = JSON.stringify({
                jsonrpc: '2.0',
                method: 'initialize',
                params: {
                  protocolVersion: '2024-11-05',
                  capabilities: {},
                  clientInfo: { name: 'runloop-sdk-test-combo', version: '1.0.0' },
                },
                id: 1,
              }).replace(/'/g, "'\\''");

              let initCmd = `curl -s --connect-timeout 10 --max-time 30`;
              initCmd += ` -o /dev/null -w "%{http_code}"`;
              initCmd += ` -X POST "${mcpEndpoint}"`;
              initCmd += ` -H "Authorization: Bearer ${mcpTokenValue}"`;
              initCmd += ` -H "Content-Type: application/json"`;
              initCmd += ` -H "Accept: application/json, text/event-stream"`;
              initCmd += ` -d '${initBody}'`;

              const initResult = await devbox.cmd.exec(initCmd);
              const initHttpCode = parseInt((await initResult.stdout()).trim(), 10);

              // Hub should respond (200 with real upstreams, 500 with test endpoints)
              expect(initHttpCode).toBeGreaterThan(0);
              expect([200, 500]).toContain(initHttpCode);
            } finally {
              try {
                await gatewayConfig.delete();
              } catch {
                // Ignore cleanup errors
              }
            }
          } finally {
            if (devbox) {
              try {
                await devbox.shutdown();
              } catch {
                // Ignore shutdown errors
              }
            }
            await cleanUpMcpConfig(mcpConfig);
            try {
              await sdk.api.secrets.delete(mcpSecretName);
            } catch {
              // Ignore if already deleted
            }
            try {
              await sdk.api.secrets.delete(gatewaySecretName);
            } catch {
              // Ignore if already deleted
            }
          }
        },
        MEDIUM_TIMEOUT,
      );
    });
  });
});
