import { defineConfig, devices } from '@playwright/test';

const port = 4173;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './e2e/web',
  timeout: 360 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  outputDir: 'test-results/',
  snapshotDir: './e2e/web/screenshots',

  expect: {
    timeout: 20 * 1000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      stylePath: './e2e/web/utils/screenshot.css',
    },
  },

  webServer: {
    command: `pnpm preview --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
});
