import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include:
      process.env.RUN_INTEGRATION === '1'
        ? ['src/**/*.test.ts', 'app/**/*.test.tsx', 'test/**/*.integration.test.ts']
        : ['src/**/*.test.ts', 'app/**/*.test.tsx'],
    exclude: ['e2e/**', 'node_modules/**', '.next/**'],
    passWithNoTests: true,
  },
});
