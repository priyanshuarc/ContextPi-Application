import { defineConfig } from '@playwright/test';
import * as path from 'node:path';

/**
 * Contextπ Playwright Configuration
 * Pure HTTP API Testing Only.
 * Zero browser projects (no Chromium, Firefox, WebKit).
 */
const rawTestDir = (process.env.GENERATED_TESTS_DIR || process.env.generated_tests_dir || './generated-tests').trim();

export default defineConfig({
  testDir: path.resolve(rawTestDir),
  testMatch: '**/*.spec.ts',
  testIgnore: ['**/node_modules/**'],
  timeout: 30000,
  fullyParallel: false, // Serial execution to preserve lifecycle dependencies (Create -> Read -> Update -> Delete)
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [
    ['json', { outputFile: 'reports/playwright-results.json' }],
    ['html', { outputFolder: 'reports/playwright-html-report', open: 'never' }]
  ],
  use: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'x-project-name': process.env.PROJECT_NAME || 'ContextPi'
    }
  }
});
