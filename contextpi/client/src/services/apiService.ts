/**
 * Client API Service
 * Contextπ Express Backend Communication Layer
 */

import type {
  ProjectContext,
  TestCatalog,
  CatalogSummary,
  CatalogEntry,
  GeneratedSpecsState,
  ExecutionSummary,
  TestRunState
} from '../types/api';

const API_BASE_URL = '/api';

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errorMsg = `API request failed with status ${response.status}`;
    try {
      const errData = await response.json();
      if (errData?.error?.message) errorMsg = errData.error.message;
    } catch {
      // Ignored
    }
    throw new ApiError(response.status, errorMsg);
  }

  return response.json();
}

export const apiService = {
  // Session & Reset
  getCurrentContext: () =>
    request<{ success: boolean; projectContext: ProjectContext | null }>('/context/current'),

  loadContext: (body: {
    projectName: string;
    mongoUri?: string;
    database?: string;
    targetApiBaseUrl?: string;
    requirement?: string;
    useMock?: boolean;
  }) =>
    request<{
      success: boolean;
      projectContext: ProjectContext;
      connectionMode: string;
      warning?: string;
    }>('/context/load', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  resetSession: () =>
    request<{ success: boolean; cleared: boolean }>('/session/reset', {
      method: 'POST'
    }),

  getSessionState: () =>
    request<{ success: boolean; sessionState: any }>('/session/state'),

  // Catalogue
  buildCatalogue: (body?: { projectContext?: ProjectContext }) =>
    request<{
      success: boolean;
      catalogueId: string;
      catalogue: TestCatalog;
      summary: CatalogSummary;
    }>('/catalogue/build', {
      method: 'POST',
      body: JSON.stringify(body || {})
    }),

  explainTest: (entry: CatalogEntry, context?: ProjectContext) =>
    request<{
      success: boolean;
      testId: string;
      providerInfo?: {
        provider: string;
        modelId: string;
        providerStatus: string;
        llmCallMade: boolean;
        fallbackUsed: boolean;
        analysisTimestamp: string;
        latencyMs: number;
      };
      aiAnalysis: {
        summary: string;
        businessImpact: string;
        assertionImportance: string;
        edgeCases: string[];
        verificationConsiderations: string[];
      };
      engineUsed: string;
    }>('/explain', {
      method: 'POST',
      body: JSON.stringify({ entry, context })
    }),

  getLatestCatalogue: () =>
    request<{
      success: boolean;
      catalogueId: string;
      catalogue: TestCatalog;
      summary: CatalogSummary;
    }>('/catalogue/latest'),

  getCatalogue: (id: string) =>
    request<{
      success: boolean;
      catalogueId: string;
      catalogue: TestCatalog;
      summary: CatalogSummary;
    }>(`/catalogue/${id}`),

  selectTest: (catalogueId: string, testId: string) =>
    request<{ success: boolean; catalogue: TestCatalog; summary: CatalogSummary }>(
      `/catalogue/${catalogueId}/select`,
      { method: 'POST', body: JSON.stringify({ testId }) }
    ),

  deselectTest: (catalogueId: string, testId: string) =>
    request<{ success: boolean; catalogue: TestCatalog; summary: CatalogSummary }>(
      `/catalogue/${catalogueId}/deselect`,
      { method: 'POST', body: JSON.stringify({ testId }) }
    ),

  selectAll: (catalogueId: string) =>
    request<{ success: boolean; catalogue: TestCatalog; summary: CatalogSummary }>(
      `/catalogue/${catalogueId}/select-all`,
      { method: 'POST' }
    ),

  deselectAll: (catalogueId: string) =>
    request<{ success: boolean; catalogue: TestCatalog; summary: CatalogSummary }>(
      `/catalogue/${catalogueId}/deselect-all`,
      { method: 'POST' }
    ),

  approveCatalogue: (catalogueId: string) =>
    request<{ success: boolean; catalogue: TestCatalog; summary: CatalogSummary }>(
      `/catalogue/${catalogueId}/approve`,
      { method: 'POST' }
    ),

  // Generator
  generateSpecs: (body: { catalogueId?: string; outputDir?: string; cleanOutputDir?: boolean }) =>
    request<{
      success: boolean;
      generationId: string;
      generatedFiles: string[];
      testCount: number;
      outputDir: string;
      traceabilitySummary: any;
    }>('/generate', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  getLatestGeneratedSpecs: () =>
    request<{
      success: boolean;
      specs: GeneratedSpecsState;
    }>('/generate/latest'),

  getGeneratedFileContent: (filePath: string) =>
    request<{
      success: boolean;
      filePath: string;
      content: string;
    }>(`/generate/file?filePath=${encodeURIComponent(filePath)}`),

  // Runner
  runTests: (body: {
    catalogueId?: string;
    targetApiBaseUrl?: string;
    generatedTestsDir?: string;
    reportOutputDir?: string;
    filterTestIds?: string[];
    enableAiRepair?: boolean;
  }) =>
    request<{
      success: boolean;
      executionId: string;
      runId: string;
      total: number;
      passed: number;
      failed: number;
      skipped: number;
      passRatePercentage: number;
      durationMs: number;
      initialRun: ExecutionSummary;
      repairSummary: any;
      finalRun: ExecutionSummary;
      summary: ExecutionSummary;
      results: any[];
      reportLocation: { jsonReportPath: string; htmlReportPath: string };
    }>('/run', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  getLatestRun: () =>
    request<{
      success: boolean;
      execution: TestRunState;
    }>('/runs/latest'),

  getRun: (id: string) =>
    request<{
      success: boolean;
      execution: TestRunState;
    }>(`/runs/${id}`),

  getLatestReport: () =>
    request<{
      success: boolean;
      executionId: string;
      summary: ExecutionSummary;
      reportLocation: any;
      htmlContent: string;
    }>('/reports/latest'),

  getReport: (id: string) =>
    request<{
      success: boolean;
      executionId: string;
      summary: ExecutionSummary;
      results: any[];
      reportLocation: any;
      htmlContent: string;
    }>(`/reports/${id}`)
};
