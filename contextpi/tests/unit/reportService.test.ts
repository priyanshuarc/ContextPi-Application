import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { generateReportFiles, renderHtmlReport, renderJsonReport } from '../../src/runner/reportService.js';
import { ExecutionSummary, TestExecutionResult } from '../../src/types/execution.js';
import { CatalogEntry } from '../../src/types/catalogue.js';

describe('Report Service Unit Tests', () => {
  const dummyEntry: CatalogEntry = {
    testId: 'TC-ITEMS-CRUD-001',
    category: 'CRUD',
    targetEntity: 'items',
    description: 'Create items - Happy Path',
    source: 'MONGO_SCHEMA',
    sourceRef: 'items',
    reasoning: 'Create items happy path',
    expectedResult: { statusCode: 201 },
    priority: 'CRITICAL',
    dependencies: [],
    httpMethod: 'POST',
    targetRouteKey: 'formCreate',
    payloadTemplate: { itemCode: 'ITM-1' },
    selected: true
  };

  const sampleResults: TestExecutionResult[] = [
    {
      testId: 'TC-ITEMS-CRUD-001',
      passed: true,
      status: 'PASS',
      durationMs: 45,
      category: 'CRUD',
      targetEntity: 'items',
      source: 'MONGO_SCHEMA',
      sourceRef: 'items',
      reasoning: 'Create items happy path',
      priority: 'CRITICAL',
      executedAt: '2026-08-23T12:00:00.000Z',
      traceability: dummyEntry
    },
    {
      testId: 'TC-ITEMS-FIELD-001',
      passed: false,
      status: 'FAIL',
      durationMs: 12,
      error: {
        message: 'Expected status 400 but received 200',
        location: 'generated-tests/forms/items.spec.ts:45'
      },
      category: 'FIELD_VALIDATION',
      targetEntity: 'items',
      source: 'MONGO_SCHEMA',
      sourceRef: 'items.price',
      reasoning: 'Omit mandatory price field',
      priority: 'HIGH',
      executedAt: '2026-08-23T12:00:00.000Z',
      traceability: { ...dummyEntry, testId: 'TC-ITEMS-FIELD-001', category: 'FIELD_VALIDATION', priority: 'HIGH' }
    }
  ];

  const sampleSummary: ExecutionSummary = {
    projectName: 'AuthenticityCheckProject',
    executedAt: '2026-08-23T12:00:00.000Z',
    targetApiBaseUrl: 'http://localhost:3000',
    totalExecuted: 2,
    passed: 1,
    failed: 1,
    skipped: 0,
    passRatePercentage: 50,
    totalDurationMs: 57,
    categoryBreakdown: {
      CRUD: { total: 1, passed: 1, failed: 0 },
      FIELD_VALIDATION: { total: 1, passed: 0, failed: 1 }
    },
    priorityBreakdown: {
      CRITICAL: { total: 1, passed: 1, failed: 0 },
      HIGH: { total: 1, passed: 0, failed: 1 }
    },
    results: sampleResults
  };

  it('should render valid JSON report derived strictly from supplied summary object', () => {
    const jsonStr = renderJsonReport(sampleSummary);
    const parsed = JSON.parse(jsonStr);

    assert.strictEqual(parsed.projectName, 'AuthenticityCheckProject');
    assert.strictEqual(parsed.totalExecuted, 2);
    assert.strictEqual(parsed.passed, 1);
    assert.strictEqual(parsed.failed, 1);
    assert.strictEqual(parsed.passRatePercentage, 50);
  });

  it('should render rich HTML report containing project name, metrics, pass rate, and failure trace', () => {
    const html = renderHtmlReport(sampleSummary);

    assert.ok(html.includes('AuthenticityCheckProject'));
    assert.ok(html.includes('50% PASS RATE'));
    assert.ok(html.includes('TC-ITEMS-CRUD-001'));
    assert.ok(html.includes('TC-ITEMS-FIELD-001'));
    assert.ok(html.includes('Expected status 400 but received 200'));
    assert.ok(html.includes('generated-tests/forms/items.spec.ts:45'));
  });

  it('should write summary.json and report.html to disk', async () => {
    const outDir = path.resolve('test-output/unit-report-files');
    const res = await generateReportFiles(sampleSummary, outDir);

    assert.ok(res.htmlPath.endsWith('report.html'));
    assert.ok(res.jsonPath.endsWith('summary.json'));

    const htmlContent = await fs.readFile(res.htmlPath, 'utf-8');
    const jsonContent = await fs.readFile(res.jsonPath, 'utf-8');

    assert.ok(htmlContent.includes('AuthenticityCheckProject'));
    assert.ok(jsonContent.includes('"projectName": "AuthenticityCheckProject"'));
  });
});
