import { RunloopSDK } from '@runloop/api-client';
import { makeClient } from '../utils';

const client = makeClient();
const sdk = new RunloopSDK({
  bearerToken: process.env['RUNLOOP_API_KEY'],
  baseURL: process.env['RUNLOOP_BASE_URL'],
  timeout: 120_000,
  maxRetries: 1,
});

describe('smoketest: object-oriented SDK', () => {
  describe('RunloopSDK initialization', () => {
    test('should create SDK instance', () => {
      expect(sdk).toBeDefined();
      expect(sdk.devbox).toBeDefined();
      expect(sdk.blueprint).toBeDefined();
      expect(sdk.snapshot).toBeDefined();
      expect(sdk.storageObject).toBeDefined();
      expect(sdk.api).toBeDefined();
    });

    test('should provide access to legacy API', () => {
      expect(sdk.api).toBeDefined();
      expect(sdk.api.devboxes).toBeDefined();
      expect(sdk.api.blueprints).toBeDefined();
      expect(sdk.api.objects).toBeDefined();
    });
  });
});
