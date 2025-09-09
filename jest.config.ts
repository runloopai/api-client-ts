import type { JestConfigWithTsJest } from 'ts-jest';

const runSmoketests = process.env['RUN_SMOKETESTS'] === '1';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
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
    // Ignore smoketests unless explicitly enabled via RUN_SMOKETESTS=1
    ...(runSmoketests ? [] : ['<rootDir>/tests/smoketests/']),
  ],
};

export default config;
