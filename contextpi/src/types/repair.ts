/**
 * Contextπ Generic AI-Assisted Playwright Repair Engine - Data Models & Types
 * Application-agnostic definitions for failure diagnosis, repair proposals,
 * safety validation, and execution traceability.
 */

import { ProjectContext, SchemaContext } from './context.js';
import { TargetApiContract } from './contract.js';
import { CatalogEntry } from './catalogue.js';
import { TestExecutionResult } from './execution.js';

export type RepairType =
  | 'ROUTE'
  | 'METHOD'
  | 'PAYLOAD'
  | 'HEADERS'
  | 'RELATIONSHIP_DATA'
  | 'DEPENDENCY_LIFECYCLE'
  | 'NO_SAFE_REPAIR';

export type RepairState =
  | 'PROVIDER_UNAVAILABLE'
  | 'PROVIDER_ERROR'
  | 'INVALID_JSON'
  | 'NO_SAFE_REPAIR'
  | 'VALIDATION_REJECTED'
  | 'PATCH_FAILED'
  | 'REEXECUTION_FAILED'
  | 'REPAIRED_PASS';

export interface RepairProposal {
  diagnosis: string;
  confidence: number; // 0.0 to 1.0
  repairType: RepairType;
  reason: string;
  proposedChange: {
    route?: string;
    httpMethod?: string;
    payload?: Record<string, any>;
    headers?: Record<string, string>;
    relationshipId?: string;
    dependencyValue?: any;
  };
}

export interface FailureContext {
  testId: string;
  targetEntity: string;
  projectContext: ProjectContext;
  contract?: TargetApiContract;
  schema?: SchemaContext;
  catalogEntry: CatalogEntry;
  originalSpecCode: string;
  httpMethod: string;
  url: string;
  requestPayload?: any;
  requestHeaders?: Record<string, string>;
  expectedStatus: number;
  actualStatus?: number;
  actualResponseBody?: any;
  executionError: string;
}

export interface RepairValidationResult {
  valid: boolean;
  errors: string[];
}

export interface RepairTraceabilityRecord {
  testId: string;
  originalSpecHash: string;
  failureResponse: {
    status?: number;
    body?: any;
    error: string;
  };
  repairType?: RepairType;
  repairReasoning?: string;
  validationResult: RepairValidationResult;
  retryCount: number;
  finalResult: 'PASS' | 'FAIL';
  repairState: RepairState;
  providerCalled?: boolean;
  providerAvailable?: boolean;
  modelId?: string;
  patchedSpec?: boolean;
  reExecuted?: boolean;
  reExecutionStatus?: string;
  timestamp: string;
}

export interface RepairResult {
  testId: string;
  repaired: boolean;
  retryCount: number; // Maximum 3 attempts
  originalSpecHash: string;
  finalSpecCode: string;
  repairState: RepairState;
  proposal?: RepairProposal;
  validation?: RepairValidationResult;
  executionResult?: TestExecutionResult;
  traceability: RepairTraceabilityRecord;
}

export interface RepairOptions {
  maxAttempts?: number; // Default 3
  generatedTestsDir?: string;
  targetApiBaseUrl?: string;
}
