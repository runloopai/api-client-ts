import {
  RunloopSDK,
  RunloopAPI,
  Devbox,
  Blueprint,
  Snapshot,
  StorageObject,
  DevboxOps,
  BlueprintOps,
  SnapshotOps,
  StorageObjectOps,
  DevboxCmdOps,
  DevboxFileOps,
  DevboxNetOps,
  Execution,
  ExecutionResult,
  type ExecuteStreamingCallbacks,
  type ClientOptions,
} from '../../dist/sdk';

describe('smoketest: built package import', () => {
  let sdk: RunloopSDK;

  beforeAll(() => {
    // Initialize SDK from built package - using dummy token since we're only testing imports/types
    sdk = new RunloopSDK({
      bearerToken: 'dummy-token-for-import-test',
      baseURL: 'https://api.runloop.ai',
      timeout: 120_000,
      maxRetries: 1,
    });
  });

  describe('RunloopSDK from built package', () => {
    test('should create SDK instance from built package', () => {
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

    test('should verify RunloopSDK namespace exports are available', () => {
      // Test that namespace exports are accessible
      // These are exported from the RunloopSDK namespace
      expect(DevboxOps).toBeDefined();
      expect(BlueprintOps).toBeDefined();
      expect(SnapshotOps).toBeDefined();
      expect(StorageObjectOps).toBeDefined();
      expect(Devbox).toBeDefined();
      expect(Blueprint).toBeDefined();
      expect(Snapshot).toBeDefined();
      expect(StorageObject).toBeDefined();
    });

    test('should verify additional SDK classes are available', () => {
      expect(DevboxCmdOps).toBeDefined();
      expect(DevboxFileOps).toBeDefined();
      expect(DevboxNetOps).toBeDefined();
      expect(Execution).toBeDefined();
      expect(ExecutionResult).toBeDefined();
    });

    test('should verify types are available', () => {
      // Type check - if this compiles, the type is available
      const callback: ExecuteStreamingCallbacks = {
        stdout: () => {},
        stderr: () => {},
        output: () => {},
      };
      expect(callback).toBeDefined();
      expect(typeof callback.stdout).toBe('function');
      expect(typeof callback.stderr).toBe('function');
      expect(typeof callback.output).toBe('function');
    });

    test('should allow wrapping runloop types', () => {
      // Test that types can be imported and used for type annotations
      const options: ClientOptions = {
        bearerToken: 'test-token',
        baseURL: 'https://api.runloop.ai',
        timeout: 120_000,
        maxRetries: 1,
      };
      expect(options).toBeDefined();
      expect(options.bearerToken).toBeDefined();
      expect(options.baseURL).toBeDefined();

      // Verify type wrapping works by creating a wrapper function
      function createSDKWithOptions(opts: ClientOptions): RunloopSDK {
        return new RunloopSDK(opts);
      }
      const wrappedSDK = createSDKWithOptions(options);
      expect(wrappedSDK).toBeInstanceOf(RunloopSDK);
    });

    test('should verify RunloopAPI namespace and nested resources', () => {
      expect(RunloopAPI).toBeDefined();
      expect(RunloopAPI.Devboxes).toBeDefined();
      expect(RunloopAPI.Blueprints).toBeDefined();
      expect(RunloopAPI.Objects).toBeDefined();
      expect(RunloopAPI.Secrets).toBeDefined();
      expect(RunloopAPI.Agents).toBeDefined();
      expect(RunloopAPI.Benchmarks).toBeDefined();
      expect(RunloopAPI.Scenarios).toBeDefined();
      expect(RunloopAPI.Repositories).toBeDefined();
    });

    test('should allow creating new types based on execution.result() return type', () => {
      // Extract the return type from execution.result()
      // execution.result() returns Promise<ExecutionResult>
      type ExecutionResultType = Awaited<ReturnType<Execution['result']>>;

      // Create a new type based on the extracted type
      type WrappedExecutionResult = {
        result: ExecutionResultType;
        timestamp: number;
        metadata?: Record<string, unknown>;
      };

      // Verify the type works by creating an instance
      // Note: We can't actually call execution.result() without a real execution,
      // but we can verify the type extraction works by using ExecutionResult directly
      const mockResult = new ExecutionResult(sdk.api, 'devbox-123', 'execution-456', {
        execution_id: 'execution-456',
        devbox_id: 'devbox-123',
        status: 'completed',
        exit_code: 0,
      } as any);

      const wrapped: WrappedExecutionResult = {
        result: mockResult,
        timestamp: Date.now(),
        metadata: { test: true },
      };

      expect(wrapped).toBeDefined();
      expect(wrapped.result).toBeInstanceOf(ExecutionResult);
      expect(wrapped.timestamp).toBeGreaterThan(0);
      expect(wrapped.metadata?.['test']).toBe(true);

      // Verify the type is correctly inferred
      const resultType: ExecutionResultType = mockResult;
      expect(resultType).toBeInstanceOf(ExecutionResult);
    });
  });
});
