/**
 * Debug script for gateway config testing.
 * Creates a devbox with gateway config and pauses for inspection.
 *
 * Run with: npx ts-node tests/smoketests/debug-gateway.ts
 */

import { RunloopSDK } from '../../src/sdk';

const sdk = new RunloopSDK({
  bearerToken: process.env['RUNLOOP_API_KEY'],
  baseURL: process.env['RUNLOOP_BASE_URL'],
  timeout: 120_000,
  maxRetries: 1,
});

async function main() {
  const uniqueName = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const testSecretName = uniqueName('debug-gateway-secret');
  const testSecretValue = 'debug-secret-value-12345';

  console.log('=== Gateway Config Debug Script ===\n');
  console.log('RUNLOOP_API_KEY:', process.env['RUNLOOP_API_KEY']?.slice(0, 15) + '...');
  console.log('RUNLOOP_BASE_URL:', process.env['RUNLOOP_BASE_URL']);
  console.log('');

  let gatewayConfig;
  let devbox;

  try {
    // Step 1: Create a test secret
    console.log('Step 1: Creating test secret...');
    console.log(`  Secret name: ${testSecretName}`);
    await sdk.api.secrets.create({
      name: testSecretName,
      value: testSecretValue,
    });
    console.log('  ✓ Secret created\n');

    // Step 2: Create gateway config
    console.log('Step 2: Creating gateway config...');
    gatewayConfig = await sdk.gatewayConfig.create({
      name: uniqueName('debug-gateway-config'),
      endpoint: 'https://api.anthropic.com',
      auth_mechanism: { type: 'header', key: 'x-api-key' },
      description: 'Debug gateway config',
    });
    console.log(`  Gateway config ID: ${gatewayConfig.id}`);
    const gwInfo = await gatewayConfig.getInfo();
    console.log(`  Gateway config name: ${gwInfo.name}`);
    console.log('  ✓ Gateway config created\n');

    // Step 3: Create devbox with gateway
    console.log('Step 3: Creating devbox with gateway...');
    devbox = await sdk.devbox.create({
      name: uniqueName('debug-devbox-gateway'),
      launch_parameters: {
        resource_size_request: 'X_SMALL',
        keep_alive_time_seconds: 600, // 10 minutes
      },
      gateways: {
        TESTGW: {
          gateway: gatewayConfig.id,
          secret: testSecretName,
        },
      },
    });
    console.log(`  ✓ Devbox created\n`);

    // Step 4: Print devbox info
    const devboxInfo = await devbox.getInfo();
    console.log('=== DEVBOX INFO ===');
    console.log(`  Devbox ID: ${devboxInfo.id}`);
    console.log(`  Devbox Name: ${devboxInfo.name}`);
    console.log(`  Devbox Status: ${devboxInfo.status}`);
    console.log(`  Gateway Specs: ${JSON.stringify(devboxInfo.gateway_specs, null, 2)}`);
    console.log('');

    // Step 5: Check environment variables
    console.log('=== ENVIRONMENT VARIABLES ===');
    const urlResult = await devbox.cmd.exec('echo $TESTGW_URL');
    const urlValue = (await urlResult.stdout()).trim();
    console.log(`  TESTGW_URL: "${urlValue}"`);

    const tokenResult = await devbox.cmd.exec('echo $TESTGW');
    const tokenValue = (await tokenResult.stdout()).trim();
    console.log(`  TESTGW: "${tokenValue.slice(0, 15)}..."`);

    const envResult = await devbox.cmd.exec('env | grep -i testgw || echo "No TESTGW vars found"');
    const envOutput = (await envResult.stdout()).trim();
    console.log(`  All TESTGW env vars:\n${envOutput}`);
    console.log('');

    // Step 6: Pause for inspection
    console.log('=== PAUSED FOR INSPECTION ===');
    console.log(`You can now inspect devbox: ${devboxInfo.name} (${devboxInfo.id})`);
    console.log('Press Ctrl+C to cleanup and exit...\n');

    // Keep the process running
    await new Promise((resolve) => {
      process.on('SIGINT', () => {
        console.log('\n\nReceived SIGINT, cleaning up...');
        resolve(undefined);
      });
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Cleanup
    console.log('\n=== CLEANUP ===');

    if (devbox) {
      try {
        console.log('Shutting down devbox...');
        await devbox.shutdown();
        console.log('  ✓ Devbox shut down');
      } catch (e) {
        console.log('  (devbox cleanup failed, may already be gone)');
      }
    }

    if (gatewayConfig) {
      try {
        console.log('Deleting gateway config...');
        await gatewayConfig.delete();
        console.log('  ✓ Gateway config deleted');
      } catch (e) {
        console.log('  (gateway config cleanup failed, may already be gone)');
      }
    }

    try {
      console.log('Deleting test secret...');
      await sdk.api.secrets.delete(testSecretName);
      console.log('  ✓ Secret deleted');
    } catch (e) {
      console.log('  (secret cleanup failed, may already be gone)');
    }

    console.log('\nDone!');
  }
}

main();
