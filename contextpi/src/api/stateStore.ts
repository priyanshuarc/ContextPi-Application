/**
 * Contextπ API In-Memory State Store
 * Authoritative single source of truth for working session state,
 * dynamic context, catalogue stores, generated specs, runs, and reports.
 */

import { ProjectContext } from '../types/context.js';
import { TestCatalog } from '../types/catalogue.js';
import { CatalogStateStore } from '../catalogue/approval/catalogStateStore.js';
import { ExecutionSummary, TestExecutionResult } from '../types/execution.js';

export interface GeneratedSpecsState {
  generationId: string;
  catalogueId: string;
  sessionId?: string;
  generatedFiles: string[];
  testCount: number;
  outputDir: string;
  generatedAt: string;
  generationEngine?: string;
  llmDurationMs?: number;
  validatedSpecs?: number;
  rejectedSpecs?: number;
  retryCount?: number;
  traceabilitySummary: {
    totalSpecs: number;
    categories: Record<string, number>;
    priorities: Record<string, number>;
  };
  fileContents?: Record<string, string>;
}

export interface TestRunState {
  executionId: string;
  catalogueId: string;
  sessionId?: string;
  summary: ExecutionSummary;
  results: TestExecutionResult[];
  reportLocation: {
    jsonReportPath: string;
    htmlReportPath: string;
  };
  executedAt: string;
}

export interface AuthoritativeSessionState {
  sessionId: string;
  connectionMode: 'DISCONNECTED' | 'ADAPTER' | 'LIVE';
  projectName: string | null;
  contextLoaded: boolean;
  mongoStatus: 'NOT_CONNECTED' | 'ADAPTER' | 'LIVE';
  apiStatus: 'NOT_CONFIGURED' | 'LOCAL_HARNESS' | 'CONNECTED' | 'DISCONNECTED';
  catalogueId: string | null;
  catalogueStatus: 'DRAFT' | 'APPROVED' | null;
  selectedCount: number;
  totalCount: number;
  categoryBreakdown: Record<string, number>;
  generatedSpecCount: number;
  latestRunId: string | null;
  latestReportId: string | null;
  passRatePercentage?: number;
}

class ApiStateStore {
  private sessionId: string = `sess-${Date.now()}`;
  private activeContext: ProjectContext | null = null;
  private catalogues: Map<string, CatalogStateStore> = new Map();
  private latestCatalogueId: string | null = null;
  private generatedSpecs: Map<string, GeneratedSpecsState> = new Map();
  private latestGenerationId: string | null = null;
  private testRuns: Map<string, TestRunState> = new Map();
  private latestExecutionId: string | null = null;
  private isApiReachable: boolean = false;

  public getSessionId(): string {
    return this.sessionId;
  }

  // Context management with strict cascade invalidation
  public setActiveContext(context: ProjectContext): void {
    // Generate new session identity for new context load
    this.sessionId = `sess-${Date.now()}`;
    this.activeContext = context;

    // Invalidate downstream assets on context reload
    this.catalogues.clear();
    this.latestCatalogueId = null;
    this.generatedSpecs.clear();
    this.latestGenerationId = null;
    this.testRuns.clear();
    this.latestExecutionId = null;
  }

  public getActiveContext(): ProjectContext | null {
    return this.activeContext;
  }

  public setApiReachable(reachable: boolean): void {
    this.isApiReachable = reachable;
  }

  // Catalogue management with identity safeguards
  public addCatalogue(catalog: TestCatalog): CatalogStateStore {
    const id = catalog.projectName ? `${catalog.projectName}-${Date.now()}` : `cat-${Date.now()}`;
    const catalogWithId: TestCatalog = {
      ...catalog,
      projectName: catalog.projectName || 'ContextPi'
    };
    const store = new CatalogStateStore(catalogWithId);
    this.catalogues.set(id, store);
    this.latestCatalogueId = id;

    // Invalidate downstream specs and runs when a new catalogue is built
    this.generatedSpecs.clear();
    this.latestGenerationId = null;
    this.testRuns.clear();
    this.latestExecutionId = null;

    return store;
  }

  public getCatalogueStore(id: string): CatalogStateStore | undefined {
    return this.catalogues.get(id);
  }

  public getLatestCatalogueStore(): CatalogStateStore | undefined {
    if (!this.latestCatalogueId) return undefined;
    return this.catalogues.get(this.latestCatalogueId);
  }

  public getLatestCatalogueId(): string | null {
    return this.latestCatalogueId;
  }

  // Generated specs management
  public setGeneratedSpecs(specs: GeneratedSpecsState): void {
    // Ensure spec carries current sessionId safeguard
    const specsWithSession = { ...specs, sessionId: this.sessionId };
    this.generatedSpecs.set(specs.generationId, specsWithSession);
    this.latestGenerationId = specs.generationId;
  }

  public getGeneratedSpecs(id: string): GeneratedSpecsState | undefined {
    const specs = this.generatedSpecs.get(id);
    if (specs && specs.sessionId === this.sessionId) {
      return specs;
    }
    return undefined;
  }

  public getLatestGeneratedSpecs(): GeneratedSpecsState | undefined {
    if (!this.latestGenerationId) return undefined;
    const specs = this.generatedSpecs.get(this.latestGenerationId);
    if (specs && specs.sessionId === this.sessionId) {
      return specs;
    }
    return undefined;
  }

  // Test runs management
  public addTestRun(run: TestRunState): void {
    const runWithSession = { ...run, sessionId: this.sessionId };
    this.testRuns.set(run.executionId, runWithSession);
    this.latestExecutionId = run.executionId;
  }

  public getTestRun(id: string): TestRunState | undefined {
    const run = this.testRuns.get(id);
    if (run && run.sessionId === this.sessionId) {
      return run;
    }
    return undefined;
  }

  public getLatestTestRun(): TestRunState | undefined {
    if (!this.latestExecutionId) return undefined;
    const run = this.testRuns.get(this.latestExecutionId);
    if (run && run.sessionId === this.sessionId) {
      return run;
    }
    return undefined;
  }

  public getLatestExecutionId(): string | null {
    return this.latestExecutionId;
  }

  // Get Authoritative Single Source of Truth Session State
  public getSessionState(): AuthoritativeSessionState {
    const context = this.activeContext;
    const catalogueStore = this.getLatestCatalogueStore();
    const catalogue = catalogueStore?.getCatalog();
    const latestSpecs = this.getLatestGeneratedSpecs();
    const latestRun = this.getLatestTestRun();

    let connectionMode: 'DISCONNECTED' | 'ADAPTER' | 'LIVE' = 'DISCONNECTED';
    let mongoStatus: 'NOT_CONNECTED' | 'ADAPTER' | 'LIVE' = 'NOT_CONNECTED';
    let apiStatus: 'NOT_CONFIGURED' | 'LOCAL_HARNESS' | 'CONNECTED' | 'DISCONNECTED' = 'NOT_CONFIGURED';

    if (context) {
      const ctxAny = context as any;
      if (ctxAny.useMock || ctxAny.isAdapterMode) {
        connectionMode = 'ADAPTER';
        mongoStatus = 'ADAPTER';
        apiStatus = this.isApiReachable ? 'LOCAL_HARNESS' : 'DISCONNECTED';
      } else {
        connectionMode = 'LIVE';
        mongoStatus = 'LIVE';
        apiStatus = this.isApiReachable ? 'CONNECTED' : 'DISCONNECTED';
      }
    } else {
      connectionMode = 'DISCONNECTED';
      mongoStatus = 'NOT_CONNECTED';
      apiStatus = 'NOT_CONFIGURED';
    }

    const selectedEntries = catalogue?.entries?.filter(e => e.selected !== false) || [];
    const categoryBreakdown: Record<string, number> = {};

    selectedEntries.forEach(e => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + 1;
    });

    return {
      sessionId: this.sessionId,
      connectionMode,
      projectName: context?.projectName || null,
      contextLoaded: !!context,
      mongoStatus,
      apiStatus,
      catalogueId: this.latestCatalogueId,
      catalogueStatus: catalogue?.status || null,
      selectedCount: selectedEntries.length,
      totalCount: catalogue?.entries?.length || 0,
      categoryBreakdown,
      generatedSpecCount: latestSpecs?.testCount || 0,
      latestRunId: latestRun?.executionId || null,
      latestReportId: latestRun?.executionId || null,
      passRatePercentage: latestRun?.summary?.passRatePercentage
    };
  }

  // Reset/Clear working session state
  public clear(): void {
    this.sessionId = `sess-${Date.now()}`;
    this.activeContext = null;
    this.catalogues.clear();
    this.latestCatalogueId = null;
    this.generatedSpecs.clear();
    this.latestGenerationId = null;
    this.testRuns.clear();
    this.latestExecutionId = null;
    this.isApiReachable = false;
  }

  public resetSessionState(): { cleared: boolean; warnings: string[] } {
    this.clear();
    const warnings: string[] = [];

    try {
      const fs = require('fs');
      const path = require('path');
      const specDir = path.resolve('test-output/generated-specs');
      const reportDir = path.resolve('test-output/reports');

      if (fs.existsSync(specDir)) {
        fs.rmSync(specDir, { recursive: true, force: true });
      }
      if (fs.existsSync(reportDir)) {
        fs.rmSync(reportDir, { recursive: true, force: true });
      }
    } catch (err: any) {
      warnings.push(`Session artifact cleanup warning: ${err.message || String(err)}`);
    }

    return { cleared: true, warnings };
  }
}

export const apiState = new ApiStateStore();
