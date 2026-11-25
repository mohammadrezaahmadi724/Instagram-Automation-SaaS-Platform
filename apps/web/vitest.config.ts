import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'app/**/*.test.tsx'],
    exclude: ['e2e/**', 'node_modules/**', '.next/**'],
    passWithNoTests: true,
  },
});
