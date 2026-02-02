import {
  SHORT_TIMEOUT,
  MEDIUM_TIMEOUT,
  LONG_TIMEOUT,
  uniqueName,
  makeClientSDK,
  cleanUpGatewayConfig,
  cleanUpPolicy,
} from '../utils';
import { GatewayConfig, Devbox, NetworkPolicy } from '@runloop/api-client/sdk';

const sdk = makeClientSDK();

describe('smoketest: object-oriented gateway config', () => {
  describe('gateway config lifecycle', () => {
    let gatewayConfig: GatewayConfig | undefined;
    let gatewayConfigId: string | undefined;

    // Create gateway config in beforeAll to avoid test order dependency
    beforeAll(async () => {
      gatewayConfig = await sdk.gatewayConfig.create({
        name: uniqueName('sdk-gateway-config'),
        endpoint: 'https://api.example.com',
        auth_mechanism: { type: 'bearer' },
        description: 'Test gateway config',
      });
      gatewayConfigId = gatewayConfig.id;
    }, SHORT_TIMEOUT);

    afterAll(async () => {
      await cleanUpGatewayConfig(gatewayConfig);
    });

    test('create gateway config', async () => {
      // Gateway config was created in beforeAll - just verify it exists
      expect(gatewayConfig).toBeDefined();
      expect(gatewayConfig!.id).toBeTruthy();
      expect(gatewayConfigId).toBeTruthy();
    });

    test('get gateway config info', async () => {
      expect(gatewayConfig).toBeDefined();
      const info = await gatewayConfig!.getInfo();
      expect(info.id).toBe(gatewayConfigId);
      expect(info.name).toContain('sdk-gateway-config');
      expect(info.endpoint).toBe('https://api.example.com');
      expect(info.auth_mechanism).toBeDefined();
      expect(info.auth_mechanism.type).toBe('bearer');
      expect(info.description).toBe('Test gateway config');
    });

    test('update gateway config', async () => {
      expect(gatewayConfig).toBeDefined();
      const updated = await gatewayConfig!.update({
        name: uniqueName('sdk-gateway-config-updated'),
        description: 'Updated test gateway config',
      });
      expect(updated.name).toContain('sdk-gateway-config-updated');
      expect(updated.description).toBe('Updated test gateway config');

      // Verify the update persisted
      const info = await gatewayConfig!.getInfo();
      expect(info.name).toContain('sdk-gateway-config-updated');
      expect(info.description).toBe('Updated test gateway config');
    });

    test('update gateway config - endpoint', async () => {
      expect(gatewayConfig).toBeDefined();
      const updated = await gatewayConfig!.update({
        endpoint: 'https://api.updated-example.com',
      });
      expect(updated.endpoint).toBe('https://api.updated-example.com');

      // Verify the update persisted
      const info = await gatewayConfig!.getInfo();
      expect(info.endpoint).toBe('https://api.updated-example.com');
    });

    test('update gateway config - auth_mechanism', async () => {
      expect(gatewayConfig).toBeDefined();
      const updated = await gatewayConfig!.update({
        auth_mechanism: { type: 'header', key: 'x-api-key' },
      });
      expect(updated.auth_mechanism.type).toBe('header');
      expect(updated.auth_mechanism.key).toBe('x-api-key');

      // Verify the update persisted
      const info = await gatewayConfig!.getInfo();
      expect(info.auth_mechanism.type).toBe('header');
      expect(info.auth_mechanism.key).toBe('x-api-key');
    });

    test('delete gateway config', async () => {
      expect(gatewayConfig).toBeDefined();
      await gatewayConfig!.delete();

      // Verify it's deleted by trying to get info (should fail)
      try {
        await gatewayConfig!.getInfo();
        fail('Expected gateway config to be deleted');
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Mark as deleted so afterAll doesn't try to delete again
      gatewayConfig = undefined;
    });
  });

  describe('gateway config list and retrieval', () => {
    test('list gateway configs', async () => {
      const configs = await sdk.gatewayConfig.list({ limit: 10 });
      expect(Array.isArray(configs)).toBe(true);
      // Should include system-provided configs like 'anthropic' and 'openai'
    });

    test('get gateway config by ID', async () => {
      // First create a gateway config
      let gatewayConfig: GatewayConfig | undefined;
      try {
        gatewayConfig = await sdk.gatewayConfig.create({
          name: uniqueName('sdk-gateway-config-retrieve'),
          endpoint: 'https://api.retrieve-test.com',
          auth_mechanism: { type: 'bearer' },
        });
        expect(gatewayConfig?.id).toBeTruthy();

        // Retrieve it by ID
        const retrieved = sdk.gatewayConfig.fromId(gatewayConfig.id);
        expect(retrieved.id).toBe(gatewayConfig.id);

        // Verify we can get info
        const info = await retrieved.getInfo();
        expect(info.id).toBe(gatewayConfig.id);
        expect(info.name).toContain('sdk-gateway-config-retrieve');
      } finally {
        await cleanUpGatewayConfig(gatewayConfig);
      }
    });
  });

  describe('gateway config auth mechanisms', () => {
    test('create gateway config with bearer auth and verify roundtrip', async () => {
      let gatewayConfig: GatewayConfig | undefined;
      try {
        const createParams = {
          name: uniqueName('sdk-gateway-bearer'),
          endpoint: 'https://api.bearer-test.com',
          auth_mechanism: { type: 'bearer' as const },
        };
        console.log('Creating gateway config with params:', JSON.stringify(createParams, null, 2));

        gatewayConfig = await sdk.gatewayConfig.create(createParams);
        const info = await gatewayConfig.getInfo();

        console.log('Gateway config info after create:', JSON.stringify(info, null, 2));
        console.log('Auth mechanism returned:', JSON.stringify(info.auth_mechanism, null, 2));

        expect(info.auth_mechanism).toBeDefined();
        expect(info.auth_mechanism.type).toBe('bearer');
      } finally {
        await cleanUpGatewayConfig(gatewayConfig);
      }
    });

    test('create gateway config with header auth and verify roundtrip', async () => {
      let gatewayConfig: GatewayConfig | undefined;
      try {
        const createParams = {
          name: uniqueName('sdk-gateway-header'),
          endpoint: 'https://api.header-test.com',
          auth_mechanism: { type: 'header' as const, key: 'x-api-key' },
        };
        console.log('Creating gateway config with params:', JSON.stringify(createParams, null, 2));

        gatewayConfig = await sdk.gatewayConfig.create(createParams);
        const info = await gatewayConfig.getInfo();

        console.log('Gateway config info after create:', JSON.stringify(info, null, 2));
        console.log('Auth mechanism returned:', JSON.stringify(info.auth_mechanism, null, 2));

        expect(info.auth_mechanism).toBeDefined();
        expect(info.auth_mechanism.type).toBe('header');
        expect(info.auth_mechanism.key).toBe('x-api-key');
      } finally {
        await cleanUpGatewayConfig(gatewayConfig);
      }
    });

    test('create gateway config with Authorization header auth', async () => {
      let gatewayConfig: GatewayConfig | undefined;
      try {
        const createParams = {
          name: uniqueName('sdk-gateway-auth-header'),
          endpoint: 'https://api.auth-header-test.com',
          auth_mechanism: { type: 'header' as const, key: 'Authorization' },
        };
        console.log('Creating gateway config with params:', JSON.stringify(createParams, null, 2));

        gatewayConfig = await sdk.gatewayConfig.create(createParams);
        const info = await gatewayConfig.getInfo();

        console.log('Gateway config info after create:', JSON.stringify(info, null, 2));
        console.log('Auth mechanism returned:', JSON.stringify(info.auth_mechanism, null, 2));

        expect(info.auth_mechanism).toBeDefined();
        expect(info.auth_mechanism.type).toBe('header');
        expect(info.auth_mechanism.key).toBe('Authorization');
      } finally {
        await cleanUpGatewayConfig(gatewayConfig);
      }
    });
  });

  // Test devbox creation with gateway config and secret
  (process.env['RUN_SMOKETESTS'] ? describe : describe.skip)('devbox with gateway config and secret', () => {
    test(
      'create devbox with gateway spec and verify environment variables',
      async () => {
        let devbox: Devbox | undefined;
        let gatewayConfig: GatewayConfig | undefined;
        const testSecretName = uniqueName('gateway-devbox-test-secret');

        try {
          // Create a secret for this test
          await sdk.api.secrets.create({
            name: testSecretName,
            value: 'test-secret-value-for-gateway',
          });

          // Create a custom gateway config for testing
          gatewayConfig = await sdk.gatewayConfig.create({
            name: uniqueName('sdk-gateway-devbox-test'),
            endpoint: 'https://api.anthropic.com',
            auth_mechanism: { type: 'header', key: 'x-api-key' },
            description: 'Gateway config for devbox test',
          });

          // Create a devbox with the gateway spec
          devbox = await sdk.devbox.create({
            name: uniqueName('devbox-with-gateway'),
            launch_parameters: {
              resource_size_request: 'X_SMALL',
              keep_alive_time_seconds: 60,
            },
            gateways: {
              ANTHROPIC: {
                gateway: gatewayConfig.id,
                secret: testSecretName,
              },
            },
          });

          expect(devbox).toBeDefined();
          expect(devbox.id).toBeTruthy();

          // Get devbox info and verify gateway spec is present
          const info = await devbox.getInfo();
          expect(info.gateway_specs).toBeDefined();
          expect(info.gateway_specs?.['ANTHROPIC']).toBeDefined();
          expect(info.gateway_specs?.['ANTHROPIC']?.gateway_config_id).toBe(gatewayConfig.id);

          // Verify environment variables are set correctly using exec
          // ANTHROPIC_URL should contain the gateway URL
          const urlResult = await devbox.cmd.exec('echo $ANTHROPIC_URL');
          expect(urlResult.exitCode).toBe(0);
          const urlValue = (await urlResult.stdout()).trim();
          expect(urlValue).toBeTruthy();
          expect(urlValue.startsWith('http')).toBe(true);

          // ANTHROPIC should start with 'gws_' (gateway secret token)
          const secretResult = await devbox.cmd.exec('echo $ANTHROPIC');
          expect(secretResult.exitCode).toBe(0);
          const secretValue = (await secretResult.stdout()).trim();
          expect(secretValue).toBeTruthy();
          expect(secretValue.startsWith('gws_')).toBe(true);
        } finally {
          // Clean up
          if (devbox) {
            try {
              await devbox.shutdown();
            } catch {
              // Ignore shutdown errors
            }
          }
          await cleanUpGatewayConfig(gatewayConfig);
          // Clean up the secret
          try {
            await sdk.api.secrets.delete(testSecretName);
          } catch {
            // Ignore if already deleted
          }
        }
      },
      MEDIUM_TIMEOUT,
    );
  });

  // End-to-end test: Server devbox with tunnel + Client devbox with gateway
  // This verifies the gateway actually proxies the secret to the target server
  (process.env['RUN_SMOKETESTS'] ? describe : describe.skip)(
    'end-to-end gateway proxying verification',
    () => {
      test(
        'gateway proxies secret header to tunneled server',
        async () => {
          let serverDevbox: Devbox | undefined;
          let clientDevbox: Devbox | undefined;
          let gatewayConfig: GatewayConfig | undefined;
          let networkPolicy: NetworkPolicy | undefined;
          const testSecretName = uniqueName('e2e-gateway-secret');
          const testSecretValue = 'test-secret-value-12345';

          try {
            // Step 0: Create a network policy that allows all traffic
            console.log('Creating network policy (allow_all)...');
            networkPolicy = await sdk.networkPolicy.create({
              name: uniqueName('e2e-gateway-policy'),
              allow_all: true,
              description: 'Allow all traffic for e2e gateway test',
            });
            console.log('Network policy created:', networkPolicy.id);

            // Step 1: Create a secret with a known value
            console.log('Creating test secret...');
            await sdk.api.secrets.create({
              name: testSecretName,
              value: testSecretValue,
            });

            // Step 2: Create server devbox with a tunnel
            console.log('Creating server devbox with tunnel...');
            serverDevbox = await sdk.devbox.create({
              name: uniqueName('e2e-gateway-server'),
              launch_parameters: {
                resource_size_request: 'X_SMALL',
                keep_alive_time_seconds: 300,
              },
              tunnel: { auth_mode: 'open' },
            });

            // Get the tunnel URL from the server devbox
            const serverInfo = await serverDevbox.getInfo();
            expect(serverInfo.tunnel).toBeDefined();
            const tunnelKey = serverInfo.tunnel!.tunnel_key;

            // Construct the tunnel URL (format: https://{port}-{tunnel_key}.tunnel.runloop.{domain})
            // We'll use port 8080 for our test server
            const baseUrl = process.env['RUNLOOP_BASE_URL'] || 'https://api.runloop.ai';
            const domain = baseUrl.includes('ai') ? 'ai' : 'pro';
            const tunnelUrl = `https://8080-${tunnelKey}.tunnel.runloop.${domain}`;
            console.log('Server tunnel URL:', tunnelUrl);

            // Step 3: Start a simple HTTP server on the server devbox that logs headers
            console.log('Starting HTTP server on server devbox...');
            const serverScript = `
import http.server
import json

class HeaderLoggingHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        # Log all headers to a file
        with open('/tmp/received_headers.json', 'w') as f:
            json.dump(dict(self.headers), f)
        
        # Also print to stdout for debugging
        print("Received headers:", dict(self.headers), flush=True)
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        response = {'status': 'ok', 'headers_received': dict(self.headers)}
        self.wfile.write(json.dumps(response).encode())
    
    def log_message(self, format, *args):
        print(format % args, flush=True)

print("Starting server on port 8080...", flush=True)
server = http.server.HTTPServer(('0.0.0.0', 8080), HeaderLoggingHandler)
server.serve_forever()
`;
            // Write and start the server script in the background
            await serverDevbox.file.write({ file_path: '/tmp/server.py', contents: serverScript });
            await serverDevbox.cmd.exec('nohup python3 /tmp/server.py > /tmp/server.log 2>&1 &');

            // Wait for server to start
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Verify server is running locally
            const localTest = await serverDevbox.cmd.exec('curl -s http://localhost:8080/');
            console.log('Local server test:', (await localTest.stdout()).trim());

            // Verify tunnel works by hitting it from this test runner using curl
            console.log('Testing tunnel from test runner:', tunnelUrl);
            const { execSync } = await import('child_process');
            const tunnelCurlOutput = execSync(`curl -s -w "\\n%{http_code}" "${tunnelUrl}"`, {
              encoding: 'utf-8',
              timeout: 30000,
            });

            const tunnelLines = tunnelCurlOutput.trim().split('\n');
            const tunnelHttpCode = tunnelLines.pop();
            const tunnelResponseBody = tunnelLines.join('\n');
            console.log('Tunnel response status:', tunnelHttpCode);
            console.log('Tunnel response body:', tunnelResponseBody);
            expect(tunnelHttpCode).toBe('200');

            // Step 4: Create gateway config pointing to the tunnel URL
            console.log('Creating gateway config...');
            gatewayConfig = await sdk.gatewayConfig.create({
              name: uniqueName('e2e-gateway-config'),
              endpoint: tunnelUrl,
              auth_mechanism: { type: 'bearer' },
              description: 'E2E test gateway config',
            });

            // Step 5: Create client devbox with the gateway
            console.log('Creating client devbox with gateway...');
            clientDevbox = await sdk.devbox.create({
              name: uniqueName('e2e-gateway-client'),
              launch_parameters: {
                resource_size_request: 'X_SMALL',
                keep_alive_time_seconds: 300,
              },
              gateways: {
                TESTGW: {
                  gateway: gatewayConfig.id,
                  secret: testSecretName,
                },
              },
            });

            // Verify client devbox has the gateway env vars
            const clientInfo = await clientDevbox.getInfo();
            expect(clientInfo.gateway_specs?.['TESTGW']).toBeDefined();

            // Check environment variables on client
            const urlResult = await clientDevbox.cmd.exec('echo $TESTGW_URL');
            const urlValue = (await urlResult.stdout()).trim();
            console.log('TESTGW_URL on client:', urlValue);
            expect(urlValue).toBeTruthy();
            expect(urlValue.startsWith('http')).toBe(true);

            const tokenResult = await clientDevbox.cmd.exec('echo $TESTGW');
            const tokenValue = (await tokenResult.stdout()).trim();
            console.log('TESTGW token on client:', tokenValue.slice(0, 10) + '...');
            expect(tokenValue.startsWith('gws_')).toBe(true);

            // Step 6: Make a request from the client through the gateway
            console.log('Making request from client through gateway...');
            const curlResult = await clientDevbox.cmd.exec(
              'curl -s -v -H "Authorization: Bearer $TESTGW" "$TESTGW_URL/"',
            );
            const curlOutput = (await curlResult.stdout()).trim();
            const curlError = (await curlResult.stderr()).trim();
            console.log('Curl response:', curlOutput);
            console.log('Curl error:', curlError);
            console.log('Curl exit code:', curlResult.exitCode);

            expect(curlResult.exitCode).toBe(0);

            // Step 7: Check the headers received by the server
            console.log('Checking received headers on server...');
            const headersResult = await serverDevbox.cmd.exec(
              'cat /tmp/received_headers.json 2>/dev/null || echo "{}"',
            );
            const headersJson = (await headersResult.stdout()).trim();
            console.log('Server received headers:', headersJson);

            // Parse and verify the Authorization header contains our secret
            const receivedHeaders = JSON.parse(headersJson);
            const authHeader = receivedHeaders['Authorization'] || receivedHeaders['authorization'];
            console.log('Received Authorization header:', authHeader);

            // The gateway should have proxied our secret value as a Bearer token
            expect(authHeader).toBe(`Bearer ${testSecretValue}`);
          } finally {
            // Clean up all resources
            console.log('Cleaning up...');

            if (clientDevbox) {
              try {
                await clientDevbox.shutdown();
              } catch {
                // Ignore
              }
            }

            if (serverDevbox) {
              try {
                await serverDevbox.shutdown();
              } catch {
                // Ignore
              }
            }

            await cleanUpGatewayConfig(gatewayConfig);
            await cleanUpPolicy(networkPolicy);

            // Delete the test secret
            try {
              await sdk.api.secrets.delete(testSecretName);
            } catch {
              // Ignore if already deleted
            }
          }
        },
        15 * 60 * 1000, // 15 minute timeout to allow for 10 min pause
      );
    },
  );
});
