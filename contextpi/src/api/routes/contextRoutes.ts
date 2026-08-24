/**
 * Context Management API Routes
 * Handles loading project context from MongoDB or dynamic mock adapter.
 */

import { Router, Request, Response } from 'express';
import { MongoContextLoader } from '../../context/contextLoader.js';
import { getMockProjectContext } from '../../context/mockMongoContext.js';
import { apiState } from '../stateStore.js';
import { ProjectContext } from '../../types/context.js';

export const contextRouter = Router();

/**
 * Utility to scrub credentials from URI strings
 */
function sanitizeMongoUri(uri?: string): string {
  if (!uri) return '';
  return uri.replace(/\/\/(.*?)@/, '//***:***@');
}

/**
 * POST /api/context/load
 * Loads project context from MongoDB or fallback mock adapter
 */
contextRouter.post('/load', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectName, mongoUri, database, requirement, targetApiBaseUrl, useMock } = req.body || {};

    if (!projectName || typeof projectName !== 'string' || projectName.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Project name is required'
        }
      });
      return;
    }

    const cleanProjectName = projectName.trim();
    const warnings: string[] = [];

    let projectContext: ProjectContext;

    // Use mock context if requested or if no MongoDB URI provided
    if (useMock || !mongoUri) {
      if (!mongoUri && !useMock) {
        warnings.push('No MongoDB URI provided. Loaded target application metadata using synthetic context adapter.');
      } else if (useMock) {
        warnings.push('Loaded mock application context adapter as requested.');
      }
      projectContext = getMockProjectContext(cleanProjectName, requirement);
      projectContext.useMock = true;
      projectContext.isAdapterMode = true;
    } else {
      try {
        const targetDb = database || process.env.MONGODB_DATABASE || 'nexasupply_db';
        const sanitizedUri = sanitizeMongoUri(mongoUri);
        warnings.push(`Connecting to MongoDB at ${sanitizedUri} [Database: ${targetDb}]...`);

        const loader = new MongoContextLoader({
          mongodbUri: mongoUri,
          databaseName: targetDb,
          timeoutMs: 5000
        });

        projectContext = await loader.loadProjectContext(cleanProjectName, requirement);
        projectContext.useMock = false;
        projectContext.isAdapterMode = false;
      } catch (mongoErr: any) {
        warnings.push(`Live MongoDB connection failed: ${mongoErr.message || String(mongoErr)}`);
        projectContext = getMockProjectContext(cleanProjectName, requirement);
        projectContext.useMock = true;
        projectContext.isAdapterMode = true;
      }
    }

    // Probe real API target reachability with a 2-second timeout
    const targetUrl = targetApiBaseUrl || process.env.API_BASE_URL || 'http://localhost:3000';
    let isApiReachable = false;

    if (targetUrl && typeof targetUrl === 'string' && targetUrl.trim().length > 0) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        await fetch(targetUrl, { method: 'GET', signal: controller.signal });
        clearTimeout(timeoutId);
        isApiReachable = true;
      } catch (_probeErr) {
        isApiReachable = false;
      }
    }

    // Store in active API state
    apiState.setActiveContext(projectContext);
    apiState.setApiReachable(isApiReachable);

    const schemaCount = (projectContext.schemas || []).length;
    const functionList = projectContext.functions || (projectContext as any).customFunctions || [];
    const functionCount = functionList.length;

    res.json({
      success: true,
      projectContext,
      schemaCount,
      functionCount,
      targetApiBaseUrl: targetUrl,
      warnings
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CONTEXT_LOAD_ERROR',
        message: err.message || 'Failed to load project context'
      }
    });
  }
});

/**
 * GET /api/context/current
 * Returns currently loaded active project context
 */
contextRouter.get('/current', (_req: Request, res: Response): void => {
  const currentContext = apiState.getActiveContext();

  if (!currentContext) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NO_ACTIVE_CONTEXT',
        message: 'No project context loaded. Please load a project context first.'
      }
    });
    return;
  }

  const functionList = currentContext.functions || (currentContext as any).customFunctions || [];

  res.json({
    success: true,
    projectContext: currentContext,
    schemaCount: (currentContext.schemas || []).length,
    functionCount: functionList.length
  });
});
