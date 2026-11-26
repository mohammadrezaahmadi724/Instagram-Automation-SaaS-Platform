import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    ...devices['Desktop Chrome'],
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  updateSnapshots: process.env.UPDATE_SNAPSHOTS === '1' ? 'all' : 'none',
  webServer: {
    command: 'pnpm exec next build && pnpm exec next start --port 3000',
    url: 'http://127.0.0.1:3000/api/health',
    reuseExistingServer: false,
    timeout: 180000,
    env: { ...process.env, DESIGN_CATALOG: '1' },
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
