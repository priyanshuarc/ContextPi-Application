/**
 * Test Execution & Authentic Report Models
 * All metrics originate from actual Playwright HTTP executions.
 */

import { JsonValue } from './json.js';
import { CatalogEntry, TestCategory, TestPriority } from './catalogue.js';

export interface TestExecutionErrorDetails {
  message: string;
  stack?: string;
  location?: string;
}

export interface TestExecutionResult {
  testId: string;
  passed: boolean;
  status: 'PASS' | 'FAIL' | 'SKIPPED';
  durationMs: number;
  statusCodeReceived?: number;
  responseBody?: JsonValue;
  error?: TestExecutionErrorDetails;
  category: TestCategory;
  targetEntity: string;
  source: string;
  sourceRef: string;
  reasoning: string;
  priority: TestPriority;
  executedAt: string;
  traceability: CatalogEntry;
  isRepaired?: boolean;
  repairType?: string;
  repairReason?: string;
  retryCount?: number;
  repairTraceability?: any;
}

export interface CategorySummary {
  total: number;
  passed: number;
  failed: number;
}

export interface PrioritySummary {
  total: number;
  passed: number;
  failed: number;
}

export interface ExecutionSummary {
  projectName: string;
  executedAt: string;
  targetApiBaseUrl: string;
  totalExecuted: number;
  passed: number;
  failed: number;
  skipped: number;
  passRatePercentage: number;
  totalDurationMs: number;
  categoryBreakdown: Record<string, CategorySummary>;
  priorityBreakdown: Record<string, PrioritySummary>;
  results: TestExecutionResult[];
  repairSummary?: any;
}

export interface AuthoritativeRunResult {
  runId: string;
  initialRun: ExecutionSummary;
  repairSummary?: {
    aiRepairEnabled: boolean;
    initialStats: {
      totalExecuted: number;
      passed: number;
      failed: number;
      passRatePercentage: number;
    };
    repairStats: {
      attemptedCount: number;
      successCount: number;
      failedCount: number;
    };
    finalStats: {
      totalExecuted: number;
      passed: number;
      failed: number;
      passRatePercentage: number;
    };
    repairDetails: any[];
  };
  finalRun: ExecutionSummary;
  source: 'PLAYWRIGHT_REAL_EXECUTION' | 'SYNTHETIC_ADAPTER_EXECUTION';
  finalizedAt: string;
}
