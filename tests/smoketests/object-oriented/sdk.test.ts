import { makeClientSDK } from '../utils';

const sdk = makeClientSDK();

describe('smoketest: object-oriented SDK', () => {
  describe('RunloopSDK initialization', () => {
    test('should create SDK instance', () => {
      expect(sdk).toBeDefined();
      expect(sdk.devbox).toBeDefined();
      expect(sdk.blueprint).toBeDefined();
      expect(sdk.snapshot).toBeDefined();
      expect(sdk.storageObject).toBeDefined();
      expect(sdk.benchmark).toBeDefined();
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
