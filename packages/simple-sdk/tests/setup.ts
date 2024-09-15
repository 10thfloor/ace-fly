import { beforeEach, vi } from 'vitest';

// Mock the `flyctlExecute` utility
vi.mock('../src/utils/flyctl', () => ({
  flyctlExecute: vi.fn(),
}));