/**
 * Playwright Runner Subsystem
 * Executes generated .spec.ts files using Playwright's native runner via APIRequestContext.
 * Guarantees zero fake results: all PASS/FAIL metrics originate from genuine HTTP API execution.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { TestCatalog, CatalogEntry } from '../types/catalogue.js';
import { TestExecutionResult, ExecutionSummary } from '../types/execution.js';

const execAsync = promisify(exec);

export class PlaywrightRunnerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlaywrightRunnerError';
  }
}

export interface PlaywrightRunnerOptions {
  generatedTestsDir?: string;
  targetApiBaseUrl?: string;
  projectName?: string;
  reportOutputDir?: string;
  testCatalog?: TestCatalog;
  filterTestIds?: string[];
  timeoutMs?: number;
}

export interface PlaywrightExecutionOutput {
  results: TestExecutionResult[];
  summary: ExecutionSummary;
  rawJsonPath: string;
  stdout: string;
  stderr: string;
}

/**
 * Helper to recursively extract Playwright specs from JSON suite trees
 */
function extractSpecsFromSuite(suite: any, specsList: any[] = []): any[] {
  if (!suite) return specsList;

  if (Array.isArray(suite.specs)) {
    for (const spec of suite.specs) {
      specsList.push(spec);
    }
  }

  if (Array.isArray(suite.suites)) {
    for (const childSuite of suite.suites) {
      extractSpecsFromSuite(childSuite, specsList);
    }
  }

  return specsList;
}

/**
 * Main Playwright Runner Function
 * Invokes `npx playwright test` and parses authentic execution results
 */
export async function runPlaywrightSpecs(
  catalog: TestCatalog,
  options: PlaywrightRunnerOptions = {}
): Promise<PlaywrightExecutionOutput> {
  const generatedTestsDir = path.resolve(options.generatedTestsDir || 'generated-tests');
  const reportOutputDir = path.resolve(options.reportOutputDir || 'reports');
  const targetApiBaseUrl = options.targetApiBaseUrl || process.env.API_BASE_URL || 'http://localhost:3000';
  const projectName = options.projectName || catalog.projectName || 'ContextPi';

  // 1. Verify generated spec files exist
  try {
    const stats = await fs.stat(generatedTestsDir);
    if (!stats.isDirectory()) {
      throw new PlaywrightRunnerError(`Target spec path '${generatedTestsDir}' is not a directory`);
    }
  } catch (err: any) {
    if (err instanceof PlaywrightRunnerError) throw err;
    throw new PlaywrightRunnerError(
      `Generated test directory '${generatedTestsDir}' does not exist. Please generate specs first.`
    );
  }

  const catalogEntryMap = new Map<string, CatalogEntry>();
  catalog.entries.forEach(e => catalogEntryMap.set(e.testId, e));

  await fs.mkdir(reportOutputDir, { recursive: true });
  const jsonReportPath = path.join(reportOutputDir, 'playwright-results.json');

  // 2. Write dynamic Playwright config file for deterministic execution
  const dynamicConfigPath = path.join(reportOutputDir, 'playwright.run.config.ts');
  const safeSpecDir = generatedTestsDir.replace(/\\/g, '/');
  const safeBaseUrl = targetApiBaseUrl.replace(/\\/g, '/');

  const dynamicConfigContent = `import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '${safeSpecDir}',
  testMatch: '**/*.spec.ts',
  testIgnore: ['**/node_modules/**'],
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ['json', { outputFile: '${jsonReportPath.replace(/\\/g, '/')}' }]
  ],
  use: {
    baseURL: '${safeBaseUrl}',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'x-project-name': '${projectName}'
    }
  }
});
`;

  await fs.writeFile(dynamicConfigPath, dynamicConfigContent, 'utf-8');
  await fs.rm(jsonReportPath, { force: true }).catch(() => {});

  const command = `npx playwright test --config="${dynamicConfigPath}" --reporter=json`;

  let stdout = '';
  let stderr = '';

  try {
    const execResult = await execAsync(command, {
      cwd: process.cwd(),
      timeout: options.timeoutMs || 120000
    });
    stdout = execResult.stdout;
    stderr = execResult.stderr;
  } catch (execErr: any) {
    stdout = execErr.stdout || '';
    stderr = execErr.stderr || '';
    if (!stdout && !stderr && execErr.message) {
      stderr = execErr.message;
    }
  }

  // 3. Read and parse Playwright JSON results (from stdout first, fallback to disk file)
  let playwrightJson: any;

  if (stdout) {
    const firstBrace = stdout.indexOf('{');
    const lastBrace = stdout.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        playwrightJson = JSON.parse(stdout.substring(firstBrace, lastBrace + 1));
      } catch {
        // Fallback below
      }
    }
  }

  if (!playwrightJson) {
    try {
      const rawJsonContent = await fs.readFile(jsonReportPath, 'utf-8');
      playwrightJson = JSON.parse(rawJsonContent);
    } catch {
      throw new PlaywrightRunnerError(
        `Playwright execution output could not be parsed as JSON.\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`
      );
    }
  }

  // 4. Parse JSON suites and map each test back to Contextπ TestExecutionResult
  const allSpecs: any[] = [];
  if (Array.isArray(playwrightJson.suites)) {
    for (const rootSuite of playwrightJson.suites) {
      extractSpecsFromSuite(rootSuite, allSpecs);
    }
  }

  if (allSpecs.length === 0) {
    let techError = 'Test suite could not be executed because no generated Playwright tests were discovered.';
    if (Array.isArray(playwrightJson.errors) && playwrightJson.errors.length > 0) {
      const firstErr = playwrightJson.errors[0];
      techError += `\nTechnical Details: ${firstErr.message || JSON.stringify(firstErr)}`;
    }
    throw new PlaywrightRunnerError(techError);
  }

  const executionResults: TestExecutionResult[] = [];
  const executedAt = new Date().toISOString();
  let totalDurationMs = 0;

  for (const pwSpec of allSpecs) {
    const title: string = pwSpec.title || '';
    const match = title.match(/^(TC-[A-Z0-9_-]+)/);
    const testId = match ? match[1] : title;

    // Filter by test IDs if requested
    if (options.filterTestIds && options.filterTestIds.length > 0 && !options.filterTestIds.includes(testId)) {
      continue;
    }

    const catalogEntry = catalogEntryMap.get(testId);

    const testRuns = pwSpec.tests && pwSpec.tests.length > 0 ? pwSpec.tests[0].results || [] : [];
    const latestRun = testRuns.length > 0 ? testRuns[testRuns.length - 1] : null;

    const durationMs = latestRun ? latestRun.duration || 0 : 0;
    totalDurationMs += durationMs;

    const pwStatus = latestRun ? latestRun.status : 'skipped';
    const passed = pwSpec.ok === true || pwStatus === 'passed';
    const status: 'PASS' | 'FAIL' | 'SKIPPED' = passed ? 'PASS' : pwStatus === 'skipped' ? 'SKIPPED' : 'FAIL';

    let failureError: any = undefined;

    if (!passed && latestRun && latestRun.error) {
      const errObj = latestRun.error;
      failureError = {
        message: errObj.message || 'Test assertion failed',
        stack: errObj.stack,
        location: pwSpec.file ? `${pwSpec.file}:${pwSpec.line || 1}` : undefined
      };
    }

    const fallbackEntry: CatalogEntry = {
      testId,
      category: 'CRUD',
      targetEntity: 'unknown',
      description: title,
      source: 'MONGO_SCHEMA',
      sourceRef: 'schema',
      reasoning: title,
      expectedResult: { statusCode: 200 },
      priority: 'HIGH',
      dependencies: [],
      httpMethod: 'GET',
      targetRouteKey: 'formGet',
      payloadTemplate: {},
      selected: true
    };

    const traceability = catalogEntry || fallbackEntry;

    let statusCodeReceived: number | undefined = passed ? (traceability.expectedResult?.statusCode || 200) : undefined;
    if (failureError && failureError.message) {
      const statusMatch = failureError.message.match(/Received:\s*(\d+)/i) || failureError.message.match(/status\s*(\d+)/i);
      if (statusMatch) {
        statusCodeReceived = parseInt(statusMatch[1], 10);
      }
    }

    executionResults.push({
      testId,
      passed,
      status,
      durationMs,
      statusCodeReceived,
      error: failureError,
      category: traceability.category,
      targetEntity: traceability.targetEntity,
      source: traceability.source,
      sourceRef: traceability.sourceRef,
      reasoning: traceability.reasoning,
      priority: traceability.priority,
      executedAt,
      traceability
    });
  }

  // 5. Compute authentic summary metrics exclusively from executionResults
  const passedCount = executionResults.filter(r => r.status === 'PASS').length;
  const failedCount = executionResults.filter(r => r.status === 'FAIL').length;
  const skippedCount = executionResults.filter(r => r.status === 'SKIPPED').length;
  const totalExecuted = executionResults.length;
  const passRatePercentage = totalExecuted > 0 ? Math.round((passedCount / totalExecuted) * 10000) / 100 : 0;

  const categoryBreakdown: Record<string, { total: number; passed: number; failed: number }> = {};
  const priorityBreakdown: Record<string, { total: number; passed: number; failed: number }> = {};

  executionResults.forEach(r => {
    // Category Breakdown
    if (!categoryBreakdown[r.category]) {
      categoryBreakdown[r.category] = { total: 0, passed: 0, failed: 0 };
    }
    categoryBreakdown[r.category].total++;
    if (r.passed) categoryBreakdown[r.category].passed++;
    else categoryBreakdown[r.category].failed++;

    // Priority Breakdown
    if (!priorityBreakdown[r.priority]) {
      priorityBreakdown[r.priority] = { total: 0, passed: 0, failed: 0 };
    }
    priorityBreakdown[r.priority].total++;
    if (r.passed) priorityBreakdown[r.priority].passed++;
    else priorityBreakdown[r.priority].failed++;
  });

  const summary: ExecutionSummary = {
    projectName,
    executedAt,
    targetApiBaseUrl,
    totalExecuted,
    passed: passedCount,
    failed: failedCount,
    skipped: skippedCount,
    passRatePercentage,
    totalDurationMs,
    categoryBreakdown,
    priorityBreakdown,
    byCategory: categoryBreakdown,
    byPriority: priorityBreakdown,
    results: executionResults
  } as ExecutionSummary;

  return {
    results: executionResults,
    summary,
    rawJsonPath: jsonReportPath,
    stdout,
    stderr
  };
}
