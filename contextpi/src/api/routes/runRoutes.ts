/**
 * Test Execution & Reporting API Routes
 * Triggers Playwright API test executions, invokes AI self-healing repair loop,
 * merges post-repair results, and serves authentic execution reports.
 * Supports authentic Synthetic Adapter Mode (100% self-contained) and Live Target Mode.
 */

import { Router, Request, Response } from 'express';
import * as fs from 'node:fs/promises';
import { apiState, TestRunState } from '../stateStore.js';
import { runPlaywrightSpecs } from '../../runner/playwrightRunner.js';
import { generateReportFiles } from '../../runner/reportService.js';
import { CatalogStateStore } from '../../catalogue/approval/catalogStateStore.js';
import { evaluateAllRules } from '../../rules/index.js';
import { createDraftCatalogue } from '../../catalogue/approval/catalogApprovalEngine.js';
import { SyntheticTargetAdapter } from '../../adapter/syntheticTargetAdapter.js';

import { AIRepairEngine } from '../../ai/aiRepairEngine.js';
import { BedrockQwenRepairProvider } from '../../ai/providers/bedrockQwenRepairProvider.js';
import { FailureContext } from '../../types/repair.js';
import { TestExecutionResult, ExecutionSummary, AuthoritativeRunResult } from '../../types/execution.js';
import { getSpecFilePath } from '../../generator/specWriter.js';

export const runRouter = Router();

function sanitizeId(rawId: string | string[]): string {
  const idStr = Array.isArray(rawId) ? rawId[0] : rawId;
  return idStr ? idStr.replace(/[^a-zA-Z0-9_-]/g, '') : 'latest';
}

function getStoreById(rawId?: string | string[]): CatalogStateStore | undefined {
  if (!rawId) return apiState.getLatestCatalogueStore();
  const cleanId = sanitizeId(rawId);
  if (cleanId === 'latest') return apiState.getLatestCatalogueStore();
  const exact = apiState.getCatalogueStore(cleanId);
  if (exact) return exact;
  return apiState.getLatestCatalogueStore();
}

/**
 * POST /api/run
 * Executes generated Playwright HTTP API tests against a target server (Synthetic Adapter or Live Server),
 * executes AI self-healing repair loop for failing tests, and persists post-repair state.
 */
runRouter.post('/run', async (req: Request, res: Response): Promise<void> => {
  let syntheticAdapter: SyntheticTargetAdapter | null = null;

  try {
    const { catalogueId, targetApiBaseUrl, generatedTestsDir, reportOutputDir, filterTestIds, enableAiRepair } = req.body || {};
    const cleanCatId = catalogueId ? sanitizeId(catalogueId) : 'latest';
    let store = getStoreById(catalogueId);
    const activeCtx = apiState.getActiveContext();

    if (!store && activeCtx) {
      const rulesResult = await evaluateAllRules(activeCtx);
      const draftCat = createDraftCatalogue(activeCtx, rulesResult.intents);
      store = apiState.addCatalogue(draftCat);
      store.approveCatalogue();
    }

    if (!store) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CATALOGUE_NOT_FOUND',
          message: `No test catalogue found for current session. Please generate and approve a catalogue first.`
        }
      });
      return;
    }

    const catalog = store.getCatalog();
    const specDir = generatedTestsDir || 'generated-tests';
    const repDir = reportOutputDir || 'reports';
    const runId = `run-${Date.now()}`;

    // Determine execution mode (Adapter Mode vs Live Mode)
    const isAdapterMode = Boolean(
      req.body?.isAdapterMode ||
      activeCtx?.isAdapterMode ||
      activeCtx?.useMock ||
      !targetApiBaseUrl
    );

    let targetUrl = targetApiBaseUrl || process.env.API_BASE_URL || 'http://localhost:3000';

    if (isAdapterMode && activeCtx) {
      syntheticAdapter = new SyntheticTargetAdapter(activeCtx);
      targetUrl = await syntheticAdapter.start(0);
    }

    // 1. Initial Playwright runner execution
    const execOutput = await runPlaywrightSpecs(catalog, {
      generatedTestsDir: specDir,
      targetApiBaseUrl: targetUrl,
      reportOutputDir: repDir,
      filterTestIds: Array.isArray(filterTestIds) ? filterTestIds : undefined
    });

    const initialResults = execOutput.results;
    const initialTotal = initialResults.length;
    const initialPassed = initialResults.filter(r => r.passed).length;
    const initialFailed = initialResults.filter(r => !r.passed).length;
    const initialPassRate = initialTotal > 0 ? parseFloat(((initialPassed / initialTotal) * 100).toFixed(1)) : 0;

    const initialCategoryBreakdown: Record<string, any> = {};
    const initialPriorityBreakdown: Record<string, any> = {};

    for (const r of initialResults) {
      if (!initialCategoryBreakdown[r.category]) {
        initialCategoryBreakdown[r.category] = { total: 0, passed: 0, failed: 0 };
      }
      initialCategoryBreakdown[r.category].total++;
      if (r.passed) initialCategoryBreakdown[r.category].passed++;
      else initialCategoryBreakdown[r.category].failed++;

      if (!initialPriorityBreakdown[r.priority]) {
        initialPriorityBreakdown[r.priority] = { total: 0, passed: 0, failed: 0 };
      }
      initialPriorityBreakdown[r.priority].total++;
      if (r.passed) initialPriorityBreakdown[r.priority].passed++;
      else initialPriorityBreakdown[r.priority].failed++;
    }

    const initialRunSummary: ExecutionSummary = {
      projectName: catalog.projectName || 'ContextPi',
      executedAt: new Date().toISOString(),
      targetApiBaseUrl: isAdapterMode ? 'http://synthetic-adapter.local' : targetUrl,
      totalExecuted: initialTotal,
      passed: initialPassed,
      failed: initialFailed,
      skipped: initialResults.filter(r => r.status === 'SKIPPED').length,
      passRatePercentage: initialPassRate,
      totalDurationMs: execOutput.summary.totalDurationMs,
      categoryBreakdown: initialCategoryBreakdown,
      priorityBreakdown: initialPriorityBreakdown,
      results: initialResults
    };

    let finalResults: TestExecutionResult[] = [...initialResults];
    let repairAttemptedCount = 0;
    let repairSuccessCount = 0;
    const repairDetails: any[] = [];

    // 2. AI Self-Healing Repair Loop (if enabled and failures present)
    const shouldRepair = enableAiRepair !== false && initialFailed > 0;
    if (shouldRepair && activeCtx) {
      const repairProvider = new BedrockQwenRepairProvider();
      const repairEngine = new AIRepairEngine(repairProvider);

      for (let i = 0; i < finalResults.length; i++) {
        const result = finalResults[i];
        if (result.passed) continue;

        repairAttemptedCount++;
        const catalogEntry = catalog.entries.find(e => e.testId === result.testId);

        if (catalogEntry) {
          const schema = activeCtx.schemas.find(s => s.schemaName.toLowerCase() === catalogEntry.targetEntity.toLowerCase());

          // Read original spec code from disk
          const specFilePath = getSpecFilePath(specDir, catalogEntry.category, catalogEntry.targetEntity);
          let originalSpecCode = '';
          try {
            originalSpecCode = await fs.readFile(specFilePath, 'utf-8');
          } catch {
            originalSpecCode = '// Spec code unavailable';
          }

          const failureContext: FailureContext = {
            testId: result.testId,
            targetEntity: catalogEntry.targetEntity,
            projectContext: activeCtx,
            schema,
            catalogEntry,
            originalSpecCode,
            httpMethod: catalogEntry.httpMethod || 'POST',
            url: targetUrl,
            requestPayload: catalogEntry.payloadTemplate,
            expectedStatus: catalogEntry.expectedResult?.statusCode || 200,
            actualStatus: result.statusCodeReceived,
            actualResponseBody: result.responseBody || result.error,
            executionError: result.error?.message || String(result.error || 'Execution failed')
          };

          const repairRes = await repairEngine.repairAndReexecute(failureContext, {
            generatedTestsDir: specDir,
            targetApiBaseUrl: targetUrl,
            maxAttempts: 3
          });

          if (repairRes.repaired && repairRes.executionResult) {
            repairSuccessCount++;
            const repairedResult: TestExecutionResult = {
              ...repairRes.executionResult,
              traceability: catalogEntry
            };
            (repairedResult as any).isRepaired = true;
            (repairedResult as any).repairType = repairRes.proposal?.repairType;
            (repairedResult as any).repairReason = repairRes.proposal?.reason;
            (repairedResult as any).retryCount = repairRes.retryCount;
            finalResults[i] = repairedResult;

            repairDetails.push({
              testId: result.testId,
              targetEntity: catalogEntry.targetEntity,
              repaired: true,
              attempts: repairRes.retryCount,
              repairType: repairRes.proposal?.repairType,
              reason: repairRes.proposal?.reason,
              finalStatus: 'PASS'
            });
          } else {
            repairDetails.push({
              testId: result.testId,
              targetEntity: catalogEntry.targetEntity,
              repaired: false,
              attempts: repairRes.retryCount,
              repairType: repairRes.proposal?.repairType,
              reason: repairRes.proposal?.reason || 'Repair rejected or failed re-execution',
              finalStatus: 'FAIL'
            });
          }
        }
      }
    }

    // Stop synthetic server if started
    if (syntheticAdapter) {
      await syntheticAdapter.stop();
      syntheticAdapter = null;
    }

    // 3. Recompute statistics for final merged summary
    const finalTotal = finalResults.length;
    const finalPassed = finalResults.filter(r => r.passed).length;
    const finalFailed = finalResults.filter(r => !r.passed).length;
    const finalSkipped = finalResults.filter(r => r.status === 'SKIPPED').length;
    const passRatePercentage = finalTotal > 0 ? parseFloat(((finalPassed / finalTotal) * 100).toFixed(1)) : 0;

    const categoryBreakdown: Record<string, any> = {};
    const priorityBreakdown: Record<string, any> = {};

    for (const r of finalResults) {
      if (!categoryBreakdown[r.category]) {
        categoryBreakdown[r.category] = { total: 0, passed: 0, failed: 0 };
      }
      categoryBreakdown[r.category].total++;
      if (r.passed) categoryBreakdown[r.category].passed++;
      else categoryBreakdown[r.category].failed++;

      if (!priorityBreakdown[r.priority]) {
        priorityBreakdown[r.priority] = { total: 0, passed: 0, failed: 0 };
      }
      priorityBreakdown[r.priority].total++;
      if (r.passed) priorityBreakdown[r.priority].passed++;
      else priorityBreakdown[r.priority].failed++;
    }

    const repairSummary = {
      aiRepairEnabled: enableAiRepair !== false,
      initialStats: {
        totalExecuted: initialTotal,
        passed: initialPassed,
        failed: initialFailed,
        passRatePercentage: initialPassRate
      },
      repairStats: {
        attemptedCount: repairAttemptedCount,
        successCount: repairSuccessCount,
        failedCount: repairAttemptedCount - repairSuccessCount
      },
      finalStats: {
        totalExecuted: finalTotal,
        passed: finalPassed,
        failed: finalFailed,
        passRatePercentage
      },
      repairDetails
    };

    const finalRunSummary: ExecutionSummary = {
      projectName: catalog.projectName || 'ContextPi',
      executedAt: new Date().toISOString(),
      targetApiBaseUrl: isAdapterMode ? 'http://synthetic-adapter.local' : targetUrl,
      totalExecuted: finalTotal,
      passed: finalPassed,
      failed: finalFailed,
      skipped: finalSkipped,
      passRatePercentage,
      totalDurationMs: execOutput.summary.totalDurationMs,
      categoryBreakdown,
      priorityBreakdown,
      results: finalResults
    };
    (finalRunSummary as any).repairSummary = repairSummary;
    (finalRunSummary as any).isAdapterMode = isAdapterMode;
    (initialRunSummary as any).repairSummary = repairSummary;
    (initialRunSummary as any).isAdapterMode = isAdapterMode;

    const authoritativeRun: AuthoritativeRunResult = {
      runId,
      initialRun: initialRunSummary,
      repairSummary,
      finalRun: finalRunSummary,
      source: isAdapterMode ? 'SYNTHETIC_ADAPTER_EXECUTION' : 'PLAYWRIGHT_REAL_EXECUTION',
      finalizedAt: new Date().toISOString()
    };

    // 4. Generate authentic report files on disk from finalRunSummary
    const reportFiles = await generateReportFiles(finalRunSummary, repDir);

    // 5. Persist authoritative TestRunState in session state
    const testRunState: TestRunState = {
      executionId: runId,
      catalogueId: cleanCatId,
      summary: finalRunSummary,
      results: finalResults,
      reportLocation: {
        jsonReportPath: reportFiles.jsonPath,
        htmlReportPath: reportFiles.htmlPath
      },
      executedAt: new Date().toISOString()
    };
    apiState.addTestRun(testRunState);

    res.json({
      success: true,
      runId,
      isAdapterMode,
      initialRun: initialRunSummary,
      repairSummary,
      finalRun: finalRunSummary,
      summary: finalRunSummary,
      reportLocation: {
        jsonReportPath: reportFiles.jsonPath,
        htmlReportPath: reportFiles.htmlPath
      },
      authoritativeRun
    });
  } catch (err: unknown) {
    if (syntheticAdapter) {
      try {
        await syntheticAdapter.stop();
      } catch {
        // ignore
      }
    }
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXECUTION_ERROR',
        message
      }
    });
  }
});

/**
 * GET /api/runs/latest
 * Returns latest test execution run state
 */
runRouter.get('/runs/latest', (_req: Request, res: Response): void => {
  const latestRun = apiState.getLatestTestRun();
  if (!latestRun) {
    res.status(404).json({
      success: false,
      error: {
        code: 'RUN_NOT_FOUND',
        message: 'No test execution run found for current working session.'
      }
    });
    return;
  }

  res.json({
    success: true,
    execution: latestRun
  });
});

/**
 * GET /api/reports/latest
 * Returns latest execution HTML report content
 */
runRouter.get('/reports/latest', async (_req: Request, res: Response): Promise<void> => {
  const latestRun = apiState.getLatestTestRun();
  if (!latestRun || !latestRun.reportLocation?.htmlReportPath) {
    res.status(404).json({
      success: false,
      error: {
        code: 'REPORT_NOT_FOUND',
        message: 'No execution report found for current working session.'
      }
    });
    return;
  }

  try {
    const htmlContent = await fs.readFile(latestRun.reportLocation.htmlReportPath, 'utf-8');
    res.json({
      success: true,
      htmlContent
    });
  } catch {
    res.status(404).json({
      success: false,
      error: {
        code: 'REPORT_FILE_NOT_FOUND',
        message: 'Execution report file does not exist on disk.'
      }
    });
  }
});
