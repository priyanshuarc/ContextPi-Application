/**
 * Catalogue Subsystem Express REST Routes
 * Manages rule evaluation, draft catalogue building, reactive item selection toggling,
 * 5-step approval gate, and catalogue state retrieval.
 */

import { Router, Request, Response } from 'express';
import { ProjectContext } from '../../types/context.js';
import { TargetApiContract } from '../../types/contract.js';
import { evaluateAllRules } from '../../rules/index.js';
import {
  createDraftCatalogue,
  CatalogApprovalError
} from '../../catalogue/approval/catalogApprovalEngine.js';
import { CatalogStateStore } from '../../catalogue/approval/catalogStateStore.js';
import { apiState } from '../stateStore.js';

export const catalogueRouter = Router();

function sanitizeId(rawId: string | string[]): string {
  const idStr = Array.isArray(rawId) ? rawId[0] : rawId;
  return idStr ? idStr.replace(/[^a-zA-Z0-9_-]/g, '') : 'latest';
}

function getStoreById(rawId: string | string[]): CatalogStateStore | undefined {
  const cleanId = sanitizeId(rawId);
  if (cleanId === 'latest') {
    const latest = apiState.getLatestCatalogueStore();
    if (latest) return latest;
  }
  const exact = apiState.getCatalogueStore(cleanId);
  if (exact) return exact;
  return apiState.getLatestCatalogueStore();
}

/**
 * POST /api/catalogue/build
 * Analyzes context, runs rule engine pipeline, and creates a DRAFT TestCatalog
 */
catalogueRouter.post('/build', async (req: Request, res: Response): Promise<void> => {
  try {
    let context = req.body?.projectContext as ProjectContext | undefined;

    if (!context) {
      context = apiState.getActiveContext() || undefined;
    }

    if (!context || !context.projectName) {
      res.status(400).json({
        success: false,
        error: {
          code: 'NO_CONTEXT_PROVIDED',
          message: 'No ProjectContext provided in request body and no active context found. Please load context first.'
        }
      });
      return;
    }

    const targetApiContract = req.body?.targetApiContract as TargetApiContract | undefined;

    // 1. Run deterministic rule engines
    const pipelineOutput = await evaluateAllRules(context);

    // 2. Build draft catalogue
    const draftCatalogue = createDraftCatalogue(context, pipelineOutput.intents, targetApiContract);
    const catalogueId = `${context.projectName}-${Date.now()}`;
    draftCatalogue.projectName = context.projectName;

    // Store in API state
    apiState.setActiveContext(context);
    const store = apiState.addCatalogue(draftCatalogue);

    res.json({
      success: true,
      catalogueId: apiState.getLatestCatalogueId() || catalogueId,
      catalogue: store.getCatalog(),
      summary: store.getSummary(),
      diagnostics: pipelineOutput.diagnostics
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      success: false,
      error: {
        code: 'CATALOGUE_BUILD_ERROR',
        message
      }
    });
  }
});

/**
 * GET /api/catalogue/latest
 * Returns the currently active catalogue and summary
 */
catalogueRouter.get('/latest', (_req: Request, res: Response): void => {
  const store = apiState.getLatestCatalogueStore();
  if (!store) {
    res.status(404).json({
      success: false,
      error: {
        code: 'CATALOGUE_NOT_FOUND',
        message: 'No active catalogue has been generated yet.'
      }
    });
    return;
  }

  res.json({
    success: true,
    catalogueId: apiState.getLatestCatalogueId(),
    catalogue: store.getCatalog(),
    summary: store.getSummary()
  });
});

/**
 * GET /api/catalogue/:id
 * Returns a specific catalogue by ID
 */
catalogueRouter.get('/:id', (req: Request, res: Response): void => {
  const cleanId = sanitizeId(req.params.id);
  const store = getStoreById(req.params.id);

  if (!store) {
    res.status(404).json({
      success: false,
      error: {
        code: 'CATALOGUE_NOT_FOUND',
        message: `Test catalogue '${cleanId}' was not found.`
      }
    });
    return;
  }

  res.json({
    success: true,
    catalogueId: cleanId,
    catalogue: store.getCatalog(),
    summary: store.getSummary()
  });
});

/**
 * POST /api/catalogue/:id/select
 * Selects a specific test case in the catalogue
 */
catalogueRouter.post('/:id/select', (req: Request, res: Response): void => {
  const cleanId = sanitizeId(req.params.id);
  const store = getStoreById(req.params.id);

  if (!store) {
    res.status(404).json({
      success: false,
      error: {
        code: 'CATALOGUE_NOT_FOUND',
        message: `Catalogue '${cleanId}' not found.`
      }
    });
    return;
  }

  const { testId } = req.body || {};
  if (!testId || typeof testId !== 'string') {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_TEST_ID',
        message: 'A valid testId string is required in request body.'
      }
    });
    return;
  }

  try {
    const updated = store.selectEntry(testId);
    res.json({
      success: true,
      catalogue: updated,
      summary: store.getSummary()
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({
      success: false,
      error: {
        code: 'SELECTION_ERROR',
        message
      }
    });
  }
});

/**
 * POST /api/catalogue/:id/deselect
 * Deselects a specific test case in the catalogue
 */
catalogueRouter.post('/:id/deselect', (req: Request, res: Response): void => {
  const cleanId = sanitizeId(req.params.id);
  const store = getStoreById(req.params.id);

  if (!store) {
    res.status(404).json({
      success: false,
      error: {
        code: 'CATALOGUE_NOT_FOUND',
        message: `Catalogue '${cleanId}' not found.`
      }
    });
    return;
  }

  const { testId } = req.body || {};
  if (!testId || typeof testId !== 'string') {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_TEST_ID',
        message: 'A valid testId string is required in request body.'
      }
    });
    return;
  }

  try {
    const updated = store.deselectEntry(testId);
    res.json({
      success: true,
      catalogue: updated,
      summary: store.getSummary()
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({
      success: false,
      error: {
        code: 'SELECTION_ERROR',
        message
      }
    });
  }
});

/**
 * POST /api/catalogue/:id/select-all
 * Selects all test cases in the catalogue
 */
catalogueRouter.post('/:id/select-all', (req: Request, res: Response): void => {
  const cleanId = sanitizeId(req.params.id);
  const store = getStoreById(req.params.id);

  if (!store) {
    res.status(404).json({
      success: false,
      error: {
        code: 'CATALOGUE_NOT_FOUND',
        message: `Catalogue '${cleanId}' not found.`
      }
    });
    return;
  }

  const updated = store.selectAll();
  res.json({
    success: true,
    catalogue: updated,
    summary: store.getSummary()
  });
});

/**
 * POST /api/catalogue/:id/deselect-all
 * Deselects all test cases in the catalogue
 */
catalogueRouter.post('/:id/deselect-all', (req: Request, res: Response): void => {
  const cleanId = sanitizeId(req.params.id);
  const store = getStoreById(req.params.id);

  if (!store) {
    res.status(404).json({
      success: false,
      error: {
        code: 'CATALOGUE_NOT_FOUND',
        message: `Catalogue '${cleanId}' not found.`
      }
    });
    return;
  }

  const updated = store.deselectAll();
  res.json({
    success: true,
    catalogue: updated,
    summary: store.getSummary()
  });
});

/**
 * POST /api/catalogue/:id/approve
 * Executes 5-Step Approval Gate
 */
catalogueRouter.post('/:id/approve', (req: Request, res: Response): void => {
  const cleanId = sanitizeId(req.params.id);
  const store = getStoreById(req.params.id);

  if (!store) {
    res.status(404).json({
      success: false,
      error: {
        code: 'CATALOGUE_NOT_FOUND',
        message: `Catalogue '${cleanId}' not found.`
      }
    });
    return;
  }

  try {
    const approvedCatalog = store.approveCatalogue();
    res.json({
      success: true,
      catalogue: approvedCatalog,
      summary: store.getSummary()
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const code = err instanceof CatalogApprovalError ? 'APPROVAL_GATE_REJECTED' : 'APPROVAL_ERROR';
    res.status(400).json({
      success: false,
      error: {
        code,
        message
      }
    });
  }
});
