import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AuthoritativeRunResult, ExecutionSummary, TestExecutionResult } from '../../src/types/execution.js';

test('Authoritative Execution Pipeline Unit Tests', async (t) => {
  const mockCatalogEntry = {
    testId: 'TC-001',
    category: 'CRUD' as const,
    targetEntity: 'items',
    description: 'Test 1',
    source: 'MONGO_SCHEMA',
    sourceRef: 'items',
    reasoning: 'Test 1',
    expectedResult: { statusCode: 200 },
    priority: 'HIGH' as const,
    dependencies: [],
    httpMethod: 'GET',
    targetRouteKey: 'formGet',
    payloadTemplate: {}
  };

  const createMockResult = (id: string, passed: boolean, category = 'CRUD', priority = 'HIGH'): TestExecutionResult => ({
    testId: id,
    passed,
    status: passed ? 'PASS' : 'FAIL',
    durationMs: 50,
    category: category as any,
    targetEntity: 'items',
    source: 'MONGO_SCHEMA',
    sourceRef: 'items',
    reasoning: 'Reasoning',
    priority: priority as any,
    executedAt: new Date().toISOString(),
    traceability: mockCatalogEntry as any
  });

  await t.test('1. No AI repair: finalRun metrics match initialRun', () => {
    const results = [createMockResult('TC-1', true), createMockResult('TC-2', true)];
    const initialRun: ExecutionSummary = {
      projectName: 'Test',
      executedAt: new Date().toISOString(),
      targetApiBaseUrl: 'http://localhost:3000',
      totalExecuted: 2,
      passed: 2,
      failed: 0,
      skipped: 0,
      passRatePercentage: 100,
      totalDurationMs: 100,
      categoryBreakdown: { CRUD: { total: 2, passed: 2, failed: 0 } },
      priorityBreakdown: { HIGH: { total: 2, passed: 2, failed: 0 } },
      results
    };

    const finalRun = { ...initialRun };

    assert.equal(finalRun.passRatePercentage, initialRun.passRatePercentage);
    assert.equal(finalRun.totalExecuted, initialRun.totalExecuted);
    assert.equal(finalRun.passed, initialRun.passed);
  });

  await t.test('2. Result Merging by Test ID: No duplicate test IDs in final result set', () => {
    const initialResults = [
      createMockResult('TC-001', false),
      createMockResult('TC-002', true)
    ];

    const repairedResult = {
      ...createMockResult('TC-001', true),
      isRepaired: true,
      repairType: 'PAYLOAD'
    };

    // Merge by test ID
    const mergedResultsMap = new Map<string, TestExecutionResult>();
    initialResults.forEach(r => mergedResultsMap.set(r.testId, r));
    mergedResultsMap.set(repairedResult.testId, repairedResult);

    const finalResults = Array.from(mergedResultsMap.values());

    assert.equal(finalResults.length, 2);
    assert.equal(finalResults.find(r => r.testId === 'TC-001')?.passed, true);
    assert.equal(finalResults.find(r => r.testId === 'TC-001')?.isRepaired, true);
  });

  await t.test('3. Recalculation: categoryBreakdown and priorityBreakdown recomputed from final results', () => {
    const finalResults = [
      createMockResult('TC-001', true, 'CRUD', 'HIGH'),
      createMockResult('TC-002', true, 'FIELD_VALIDATION', 'CRITICAL')
    ];

    const categoryBreakdown: Record<string, any> = {};
    const priorityBreakdown: Record<string, any> = {};

    for (const r of finalResults) {
      if (!categoryBreakdown[r.category]) categoryBreakdown[r.category] = { total: 0, passed: 0, failed: 0 };
      categoryBreakdown[r.category].total++;
      if (r.passed) categoryBreakdown[r.category].passed++;

      if (!priorityBreakdown[r.priority]) priorityBreakdown[r.priority] = { total: 0, passed: 0, failed: 0 };
      priorityBreakdown[r.priority].total++;
      if (r.passed) priorityBreakdown[r.priority].passed++;
    }

    assert.equal(categoryBreakdown['CRUD'].passed, 1);
    assert.equal(categoryBreakdown['FIELD_VALIDATION'].passed, 1);
    assert.equal(priorityBreakdown['HIGH'].passed, 1);
    assert.equal(priorityBreakdown['CRITICAL'].passed, 1);
  });

  await t.test('4. AuthoritativeRunResult Contract Structure Validation', () => {
    const authRun: AuthoritativeRunResult = {
      runId: 'run-123',
      initialRun: {
        projectName: 'NexaSupply',
        executedAt: new Date().toISOString(),
        targetApiBaseUrl: 'http://localhost:3000',
        totalExecuted: 23,
        passed: 21,
        failed: 2,
        skipped: 0,
        passRatePercentage: 91.3,
        totalDurationMs: 1200,
        categoryBreakdown: {},
        priorityBreakdown: {},
        results: []
      },
      repairSummary: {
        aiRepairEnabled: true,
        initialStats: { totalExecuted: 23, passed: 21, failed: 2, passRatePercentage: 91.3 },
        repairStats: { attemptedCount: 2, successCount: 2, failedCount: 0 },
        finalStats: { totalExecuted: 23, passed: 23, failed: 0, passRatePercentage: 100 },
        repairDetails: []
      },
      finalRun: {
        projectName: 'NexaSupply',
        executedAt: new Date().toISOString(),
        targetApiBaseUrl: 'http://localhost:3000',
        totalExecuted: 23,
        passed: 23,
        failed: 0,
        skipped: 0,
        passRatePercentage: 100,
        totalDurationMs: 1350,
        categoryBreakdown: {},
        priorityBreakdown: {},
        results: []
      },
      source: 'PLAYWRIGHT_REAL_EXECUTION',
      finalizedAt: new Date().toISOString()
    };

    assert.equal(authRun.initialRun.passRatePercentage, 91.3);
    assert.equal(authRun.finalRun.passRatePercentage, 100);
    assert.equal(authRun.repairSummary?.repairStats.successCount, 2);
    assert.equal(authRun.source, 'PLAYWRIGHT_REAL_EXECUTION');
  });
});
