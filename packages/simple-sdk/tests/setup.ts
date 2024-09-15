import { mock } from 'bun:test';

// Mock the `flyctlExecute` utility
mock.module('../../src/utils/flyctl', () => ({
  flyctlExecute: () => Promise.resolve({ stdout: '', stderr: '' }),
}));