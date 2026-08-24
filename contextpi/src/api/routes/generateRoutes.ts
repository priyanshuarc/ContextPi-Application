/**
 * Spec Generation API Routes
 * Generates Playwright TypeScript test files from APPROVED TestCatalog objects.
 */

import { Router, Request, Response } from 'express';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { apiState } from '../stateStore.js';
import { generatePlaywrightSpecs } from '../../generator/specWriter.js';
import { CatalogEntry } from '../../types/catalogue.js';

import { CatalogStateStore } from '../../catalogue/approval/catalogStateStore.js';

import { evaluateAllRules } from '../../rules/index.js';
import { createDraftCatalogue } from '../../catalogue/approval/catalogApprovalEngine.js';

export const generateRouter = Router();

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
 * POST /api/generate
 * Generates Playwright TypeScript test specs from an APPROVED catalogue
 */
generateRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { catalogueId, outputDir, cleanOutputDir } = req.body || {};
    const cleanCatId = catalogueId ? sanitizeId(catalogueId) : 'latest';
    let store = getStoreById(catalogueId);

    if (!store) {
      const activeCtx = apiState.getActiveContext();
      if (activeCtx) {
        const rulesResult = await evaluateAllRules(activeCtx);
        const draftCat = createDraftCatalogue(activeCtx, rulesResult.intents);
        store = apiState.addCatalogue(draftCat);
        store.approveCatalogue();
      }
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

    if (catalog.status !== 'APPROVED') {
      res.status(400).json({
        success: false,
        error: {
          code: 'CATALOGUE_NOT_APPROVED',
          message: `Catalogue status is '${catalog.status}'. Spec generation requires an APPROVED catalogue. Please approve the catalogue first.`
        }
      });
      return;
    }

    const targetOutputDir = outputDir || 'generated-tests';

    // 1. Generate specs using existing spec writer engine
    const genResult = await generatePlaywrightSpecs(catalog, undefined, {
      outputDir: targetOutputDir,
      cleanOutputDir: cleanOutputDir !== false
    });

    // 2. Build traceability summary
    const selectedEntries = catalog.entries.filter((e: CatalogEntry) => e.selected !== false);
    const categoryCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};

    selectedEntries.forEach((e: CatalogEntry) => {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
      priorityCounts[e.priority] = (priorityCounts[e.priority] || 0) + 1;
    });

    const filePaths = genResult.generatedFiles.map(f =>
      path.relative(genResult.outputDir, f.filePath).replace(/\\/g, '/')
    );
    const testCount = genResult.totalTestBlocks;

    // 3. Read actual file contents from disk into fileContents map
    const fileContentsMap: Record<string, string> = {};
    for (const fileInfo of genResult.generatedFiles) {
      try {
        const rawContent = await fs.readFile(fileInfo.filePath, 'utf-8');
        const normalizedRelPath = path.relative(genResult.outputDir, fileInfo.filePath).replace(/\\/g, '/');
        const baseName = path.basename(fileInfo.filePath);

        fileContentsMap[normalizedRelPath] = rawContent;
        fileContentsMap[baseName] = rawContent;
        fileContentsMap[fileInfo.filePath] = rawContent;
        fileContentsMap[fileInfo.filePath.replace(/\\/g, '/')] = rawContent;
      } catch {
        // Fallback safely if file read fails
      }
    }

    const generationId = `gen-${Date.now()}`;

    const generatedSpecsState = {
      generationId,
      catalogueId: cleanCatId,
      generatedFiles: filePaths,
      testCount,
      outputDir: genResult.outputDir,
      generatedAt: new Date().toISOString(),
      generationEngine: genResult.engineUsed,
      llmInvoked: genResult.llmInvoked,
      modelId: genResult.modelId,
      llmCallsCount: genResult.llmCallsCount,
      llmSuccessCount: genResult.llmSuccessCount,
      llmDurationMs: genResult.llmDurationMs,
      validatedSpecs: genResult.validatedSpecs,
      fallbackSpecs: genResult.fallbackSpecs,
      rejectedSpecs: genResult.rejectedSpecs,
      retryCount: genResult.retryCount,
      traceabilitySummary: {
        totalSpecs: testCount,
        categories: categoryCounts,
        priorities: priorityCounts
      },
      fileContents: fileContentsMap
    };

    apiState.setGeneratedSpecs(generatedSpecsState);

    res.json({
      success: true,
      generationId,
      generatedFiles: filePaths,
      testCount,
      outputDir: genResult.outputDir,
      generationEngine: genResult.engineUsed,
      llmInvoked: genResult.llmInvoked,
      modelId: genResult.modelId,
      llmCallsCount: genResult.llmCallsCount,
      llmSuccessCount: genResult.llmSuccessCount,
      llmDurationMs: genResult.llmDurationMs,
      validatedSpecs: genResult.validatedSpecs,
      fallbackSpecs: genResult.fallbackSpecs,
      rejectedSpecs: genResult.rejectedSpecs,
      retryCount: genResult.retryCount,
      traceabilitySummary: generatedSpecsState.traceabilitySummary,
      fileContents: fileContentsMap
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SPEC_GENERATION_FAILED', message: err.message }
    });
  }
});

/**
 * GET /api/generate/latest
 * Returns latest generated specs metadata and file contents
 */
generateRouter.get('/latest', (_req: Request, res: Response): void => {
  const specsState = apiState.getLatestGeneratedSpecs();
  if (!specsState) {
    res.status(404).json({
      success: false,
      error: { code: 'NO_SPECS_FOUND', message: 'No generated specs exist yet. Generate specs first.' }
    });
    return;
  }

  res.json({
    success: true,
    specs: specsState
  });
});

/**
 * GET /api/generate/file
 * Query parameter: filePath
 * Returns source code content of a specific generated Playwright spec file
 */
generateRouter.get('/file', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawPath = req.query.filePath as string;
    if (!rawPath) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAM', message: 'filePath query parameter is required.' }
      });
      return;
    }

    const specsState = apiState.getLatestGeneratedSpecs();
    if (specsState && specsState.fileContents) {
      const cleanPath = rawPath.replace(/\\/g, '/');
      const baseName = path.basename(cleanPath);
      if (specsState.fileContents[cleanPath]) {
        res.json({ success: true, filePath: cleanPath, content: specsState.fileContents[cleanPath] });
        return;
      }
      if (specsState.fileContents[baseName]) {
        res.json({ success: true, filePath: baseName, content: specsState.fileContents[baseName] });
        return;
      }
      if (specsState.fileContents[rawPath]) {
        res.json({ success: true, filePath: rawPath, content: specsState.fileContents[rawPath] });
        return;
      }
    }

    // Direct disk read fallback across candidate paths
    const outputDir = specsState?.outputDir || 'generated-tests';
    const baseName = path.basename(rawPath);
    const candidates = [
      path.resolve(outputDir, rawPath),
      path.resolve(outputDir, baseName),
      path.resolve('generated-tests', rawPath),
      path.resolve('generated-tests', baseName),
      path.resolve('generated-tests/forms', baseName),
      path.resolve('generated-tests/functions', baseName),
      path.resolve(baseName)
    ];

    let content: string | null = null;
    for (const cand of candidates) {
      try {
        content = await fs.readFile(cand, 'utf-8');
        if (content) break;
      } catch {
        // try next candidate
      }
    }

    if (content !== null) {
      res.json({ success: true, filePath: rawPath, content });
      return;
    }

    res.status(404).json({
      success: false,
      error: { code: 'FILE_NOT_FOUND', message: `Could not read generated spec file '${rawPath}' from disk.` }
    });
  } catch (err: any) {
    res.status(504).json({
      success: false,
      error: { code: 'FILE_READ_ERROR', message: err.message }
    });
  }
});
