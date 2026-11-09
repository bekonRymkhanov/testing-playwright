import { defineConfig, devices } from '@playwright/test';

export const BASE_URL = process.env.BASE_URL || 'https://practicesoftwaretesting.com';
export const API_URL = process.env.API_URL || 'https://api.practicesoftwaretesting.com';
export const LEGACY_API = process.env.LEGACY_API === '1';
export const AUTH_FILE = 'playwright/.auth/user.json';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: isCI
    ? [['list'], ['github'], ['blob'], ['junit', { outputFile: 'reports/junit.xml' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});
