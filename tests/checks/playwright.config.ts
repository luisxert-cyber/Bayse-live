import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  workers: 1,
  use: { baseURL: process.env.E2E_BASE_URL, ...devices['Desktop Chrome'] },
});
