import type { JestConfigWithTsJest } from 'ts-jest';

const runSmoketests = process.env['RUN_SMOKETESTS'] === '1';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testTimeout: runSmoketests ? 300000 : 120000, // 5 minutes for smoke tests, 2 minutes for regular tests
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
  testPathIgnorePatterns: [
    'scripts',
    // When running smoke tests, ignore regular tests; when running regular tests, ignore smoke tests
    ...(runSmoketests ?
      ['<rootDir>/tests/(?!smoketests).*'] // Ignore all test files except those in smoketests/
    : ['<rootDir>/tests/smoketests/']), // Ignore smoke tests when running regular tests
  ],
  // Add display name for smoke tests to make it clearer in output
  ...(runSmoketests && { displayName: 'Smoke Tests' }),
};

export default config;
