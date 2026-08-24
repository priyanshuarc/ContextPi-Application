/**
 * Client API Types & Data Interfaces
 * Contextπ Business-Context API Test Generation Engine
 */

export interface FieldMetadata {
  name: string;
  dataType: string;
  inputType: string;
  mandatoryField?: boolean;
  required?: boolean;
  unique?: boolean;
  defaultValue?: any;
  enum?: string[];
  enumOptions?: string[];
  validationRules?: any[];
  foreignKey?: {
    targetEntity: string;
    targetField: string;
  };
}

export interface SchemaContext {
  schemaName: string;
  collectionName?: string;
  active?: boolean;
  fields: FieldMetadata[];
  relationships?: any[];
  sampleRecords?: Record<string, any>[];
  primaryKey?: string;
}

export interface FunctionParameter {
  name: string;
  type: string;
  required: boolean;
  isActive?: boolean;
}

export interface FunctionResponseField {
  name: string;
  type: string;
  required: boolean;
}

export interface FunctionContext {
  name: string;
  functionName?: string;
  parameters: FunctionParameter[];
  expectedResponseFields: FunctionResponseField[];
  active?: boolean;
  isActive?: boolean;
  description?: string;
}

export interface ProjectContext {
  projectName: string;
  requirement?: string;
  schemas: SchemaContext[];
  functions?: FunctionContext[];
  customFunctions?: FunctionContext[];
  sampleData?: Record<string, any[]>;
  targetApiBaseUrl?: string;
  useMock?: boolean;
  isAdapterMode?: boolean;
}

export type TestCategory =
  | 'CRUD'
  | 'FIELD_VALIDATION'
  | 'RELATIONSHIP'
  | 'CUSTOM_FUNCTION'
  | 'BUSINESS_RULE'
  | 'REGISTRY'
  | 'BULK_UPLOAD';

export type TestPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface CatalogEntry {
  testId: string;
  category: TestCategory;
  targetEntity: string;
  description: string;
  source: string;
  sourceRef: string;
  reasoning: string;
  expectedResult: Record<string, any>;
  priority: TestPriority;
  dependencies: string[];
  httpMethod: string;
  targetRouteKey: string;
  customUrlPath?: string;
  route?: string;
  payloadTemplate: Record<string, any>;
  selected?: boolean;
}

export interface CatalogSummary {
  projectName: string;
  createdAt: string;
  status: 'DRAFT' | 'APPROVED';
  totalTests: number;
  selectedCount: number;
  unselectedCount: number;
  dependencyCount: number;
  testsByCategory: Record<string, number>;
  testsByPriority: Record<string, number>;
  testsBySource: Record<string, number>;
  diagnostics: string[];
  totalCases?: number;
  selectedCases?: number;
}

export interface TestCatalog {
  projectName: string;
  createdAt: string;
  status: 'DRAFT' | 'APPROVED';
  entries: CatalogEntry[];
}

export interface TestExecutionResult {
  testId: string;
  passed: boolean;
  status: 'PASS' | 'FAIL' | 'SKIPPED';
  durationMs: number;
  statusCode?: number;
  statusCodeReceived?: number;
  responseBody?: any;
  requestPayload?: any;
  requestHeaders?: Record<string, string>;
  route?: string;
  httpMethod?: string;
  category: string;
  targetEntity: string;
  source: string;
  sourceRef: string;
  reasoning: string;
  priority: string;
  traceability?: CatalogEntry;
  error?: any;
  assertionFailureMessage?: string;
  isRepaired?: boolean;
  repairType?: string;
  repairReason?: string;
  repairState?: string;
  retryCount?: number;
  repairTraceability?: {
    testId: string;
    originalSpecHash: string;
    failureResponse: {
      status?: number;
      body?: any;
      error: string;
    };
    repairType?: string;
    repairReasoning?: string;
    validationResult: {
      valid: boolean;
      errors: string[];
    };
    retryCount: number;
    finalResult: 'PASS' | 'FAIL';
    repairState?: string;
    providerCalled?: boolean;
    providerAvailable?: boolean;
    modelId?: string;
    patchedSpec?: boolean;
    reExecuted?: boolean;
    reExecutionStatus?: string;
    timestamp: string;
  };
}

export interface RepairSummaryStats {
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
  repairDetails?: Array<{
    testId: string;
    targetEntity: string;
    repaired: boolean;
    attempts: number;
    repairType?: string;
    reason?: string;
    finalStatus: string;
  }>;
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
  categoryBreakdown?: Record<string, { total: number; passed: number; failed: number }>;
  priorityBreakdown?: Record<string, { total: number; passed: number; failed: number }>;
  byCategory?: Record<string, { total: number; passed: number; failed: number }>;
  byPriority?: Record<string, { total: number; passed: number; failed: number }>;
  results?: TestExecutionResult[];
  repairSummary?: RepairSummaryStats;
}

export interface GeneratedSpecsState {
  generationId: string;
  catalogueId?: string;
  generatedFiles: string[];
  testCount: number;
  outputDir: string;
  generatedAt: string;
  generationEngine?: string;
  llmCallsCount?: number;
  llmDurationMs?: number;
  validatedSpecs?: number;
  fallbackSpecs?: number;
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
  summary: ExecutionSummary;
  results: TestExecutionResult[];
  reportLocation: {
    jsonReportPath: string;
    htmlReportPath: string;
  };
  executedAt: string;
}
