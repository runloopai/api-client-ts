module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testTimeout: 300000, // 5 minutes for smoke tests
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', { sourceMaps: 'inline' }],
  },
  moduleNameMapper: {
    '^@runloop/api-client$': '<rootDir>/src/index.ts',
    '^@runloop/api-client/_shims/auto/(.*)$': '<rootDir>/src/_shims/auto/$1-node',
    '^@runloop/api-client/(.*)$': '<rootDir>/src/$1',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/ecosystem-tests/',
    '<rootDir>/dist/',
    '<rootDir>/deno/',
    '<rootDir>/deno_tests/',
  ],
  testMatch: ['**/tests/smoketests/object-oriented/**/*.test.ts'],
  collectCoverageFrom: ['src/objects/**/*.ts', '!src/objects/index.ts', '!**/*.d.ts', '!**/node_modules/**'],
  coverageDirectory: 'coverage-objects',
  coverageReporters: ['text', 'lcov', 'json-summary', 'html'],
  coverageThreshold: {
    global: {
      functions: 100,
    },
  },
  collectCoverage: true,
  displayName: 'Object Coverage Tests',
};
