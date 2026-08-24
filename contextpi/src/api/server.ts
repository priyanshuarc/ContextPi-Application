/**
 * Express REST API Server
 * Orchestrates the Contextπ test generation engine over HTTP REST endpoints.
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { contextRouter } from './routes/contextRoutes.js';
import { catalogueRouter } from './routes/catalogueRoutes.js';
import { generateRouter } from './routes/generateRoutes.js';
import { runRouter } from './routes/runRoutes.js';
import { repairRouter } from './routes/repairRoutes.js';
import { explainRouter } from './routes/explainRoutes.js';

import { apiState } from './stateStore.js';

export interface ServerOptions {
  port?: number;
  corsOrigin?: string;
  serveClientApp?: boolean;
}

function loadEnvFile(): void {
  try {
    const envPath = path.resolve('.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...valParts] = trimmed.split('=');
          const val = valParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (key && !process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      }
    }
  } catch {
    // Ignore error loading .env
  }
}

const startTime = Date.now();

export function createServer(options: ServerOptions = {}): Express {
  loadEnvFile();
  const app: Express = express();

  // 1. Security & Body Parsing Middleware
  app.use(cors({
    origin: options.corsOrigin || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-project-name']
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 2. Health Check & Session Reset Endpoints
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000)
    });
  });

  app.post('/api/session/reset', (_req: Request, res: Response) => {
    const result = apiState.resetSessionState();
    res.json({
      success: true,
      message: 'Session state reset successfully.',
      cleared: true,
      warnings: result.warnings
    });
  });

  app.get('/api/session/state', (_req: Request, res: Response) => {
    res.json({
      success: true,
      sessionState: apiState.getSessionState()
    });
  });

  // 3. API Routers
  app.use('/api/context', contextRouter);
  app.use('/api/catalogue', catalogueRouter);
  app.use('/api/generate', generateRouter);
  app.use('/api', runRouter);
  app.use('/api', repairRouter);
  app.use('/api', explainRouter);

  // 4. Static File Serving for HTML Reports
  const reportsDir = path.resolve('reports');
  if (fs.existsSync(reportsDir)) {
    app.use('/reports', express.static(reportsDir));
  }

  // 5. Serve React Production Build if available
  const clientDistDir = path.resolve('client/dist');
  if (options.serveClientApp !== false && fs.existsSync(clientDistDir)) {
    app.use(express.static(clientDistDir));
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/reports')) {
        return next();
      }
      res.sendFile(path.join(clientDistDir, 'index.html'));
    });
  }

  // 6. 404 Route Handler for unmatched API paths
  app.use('/api', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'ENDPOINT_NOT_FOUND',
        message: `API endpoint '${req.originalUrl}' does not exist.`
      }
    });
  });

  // 7. Global Error Handler (Sanitizes stack traces in production)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.status || err.statusCode || 500;
    const isProd = process.env.NODE_ENV === 'production';

    res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: err.message || 'An unexpected internal server error occurred',
        ...(isProd ? {} : { stack: err.stack })
      }
    });
  });

  return app;
}

/**
 * Utility to start Express server listener
 */
export function startServer(port: number = 3001): Promise<{ app: Express; server: any; url: string }> {
  const app = createServer();
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      const url = `http://localhost:${port}`;
      console.log(`Contextπ Express REST API Server listening on ${url}`);
      resolve({ app, server, url });
    });
  });
}

// Auto-start server if executed directly
startServer(process.env.PORT ? parseInt(process.env.PORT, 10) : 3001);
