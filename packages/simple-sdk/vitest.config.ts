import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true, // Use global test APIs (describe, it, expect)
    environment: 'node', // Set the testing environment to Node.js
    coverage: {
      provider: 'istanbul', // Coverage provider
      reporter: ['text', 'json', 'html'], // Coverage reporters
      include: ['src/**/*.ts'], // Files to include for coverage
      exclude: ['src/utils/logger.ts'], // Files to exclude
    },
    setupFiles: './tests/setup.ts', // Path to setup files
  },
});