import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'C:/ContextPi Application/contextpi/generated-tests',
  testMatch: '**/*.spec.ts',
  testIgnore: ['**/node_modules/**'],
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ['json', { outputFile: 'C:/ContextPi Application/contextpi/reports/playwright-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'x-project-name': 'NexaSupply'
    }
  }
});
