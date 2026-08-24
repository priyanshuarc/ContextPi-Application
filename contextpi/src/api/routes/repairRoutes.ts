/**
 * Contextπ AI Repair Engine REST API Routes
 * Exposes generic AI diagnosis, validation, and self-healing test repair endpoints.
 */

import { Router, Request, Response } from 'express';
import { apiState } from '../stateStore.js';
import { AIRepairEngine, SERVER_BUILD_INFO } from '../../ai/aiRepairEngine.js';
import { BedrockQwenRepairProvider } from '../../ai/providers/bedrockQwenRepairProvider.js';
import { FailureContext } from '../../types/repair.js';

export const repairRouter = Router();
const repairProvider = new BedrockQwenRepairProvider();
const repairEngine = new AIRepairEngine(repairProvider);

/**
 * GET /api/repair/status
 * Returns availability status of the AI Repair Engine, model ID, and server build info
 */
repairRouter.get('/repair/status', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    engine: 'AI-assisted • Qwen3 Coder Repair Engine',
    modelId: repairProvider.getModelId(),
    providerAvailable: repairProvider.isAvailable(),
    status: repairProvider.isAvailable() ? 'READY' : 'FALLBACK_MODE',
    buildInfo: SERVER_BUILD_INFO
  });
});

/**
 * POST /api/repair
 * Diagnoses a failed test execution and attempts safe self-healing repair
 */
repairRouter.post('/repair', async (req: Request, res: Response): Promise<void> => {
  try {
    const { testId, targetApiBaseUrl } = req.body || {};
    const activeCtx = apiState.getActiveContext();

    if (!activeCtx) {
      res.status(400).json({
        success: false,
        error: {
          code: 'NO_ACTIVE_CONTEXT',
          message: 'No active ProjectContext found. Please load project context first.'
        }
      });
      return;
    }

    const latestRun = apiState.getLatestTestRun();
    if (!latestRun) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NO_TEST_RUNS',
          message: 'No previous test runs found. Please execute tests before invoking repair.'
        }
      });
      return;
    }

    const failedResult = latestRun.results.find(r => (!testId || r.testId === testId) && !r.passed);
    if (!failedResult) {
      res.json({
        success: true,
        message: 'No failing tests requiring repair.',
        repaired: false
      });
      return;
    }

    const catStore = apiState.getLatestCatalogueStore();
    const catalog = catStore?.getCatalog();
    const catalogEntry = catalog?.entries.find(e => e.testId === failedResult.testId);

    if (!catalogEntry) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CATALOG_ENTRY_NOT_FOUND',
          message: `CatalogEntry for test '${failedResult.testId}' not found.`
        }
      });
      return;
    }

    const targetEntity = catalogEntry.targetEntity;
    const schema = activeCtx.schemas.find(s => s.schemaName.toLowerCase() === targetEntity.toLowerCase());

    const failureContext: FailureContext = {
      testId: failedResult.testId,
      targetEntity,
      projectContext: activeCtx,
      schema,
      catalogEntry,
      originalSpecCode: '// Sample Playwright Spec Code',
      httpMethod: catalogEntry.httpMethod || 'POST',
      url: targetApiBaseUrl || process.env.API_BASE_URL || 'http://localhost:3000',
      requestPayload: catalogEntry.payloadTemplate,
      expectedStatus: catalogEntry.expectedResult?.statusCode || 200,
      actualStatus: failedResult.statusCodeReceived,
      actualResponseBody: failedResult.responseBody || failedResult.error,
      executionError: failedResult.error?.message || String(failedResult.error || 'Execution failed')
    };

    // Execute Self-Healing Repair Loop
    const repairResult = await repairEngine.repairAndReexecute(failureContext, {
      targetApiBaseUrl: targetApiBaseUrl || process.env.API_BASE_URL || 'http://localhost:3000'
    });

    res.json({
      success: true,
      repairResult,
      buildInfo: SERVER_BUILD_INFO
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REPAIR_ENGINE_ERROR',
        message: err.message || 'Error executing AI repair engine'
      }
    });
  }
});
