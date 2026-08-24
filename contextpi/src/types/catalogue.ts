/**
 * Test Catalogue & 10-Point Traceability Models
 * Enforces catalogue preview, selection state, and approval gate.
 */

import { JsonObject } from './json.js';
import { TargetApiContract } from './contract.js';

export type TestCategory =
  | 'CRUD'
  | 'FIELD_VALIDATION'
  | 'CUSTOM_FUNCTION'
  | 'RELATIONSHIP'
  | 'BUSINESS_RULE'
  | 'REGISTRY'
  | 'BULK_UPLOAD';

export type TestPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type RequirementSource = 'MONGO_SCHEMA' | 'FUNCTION_REGISTRY' | 'BUSINESS_REQUIREMENT';

export type TargetRouteKey =
  | keyof TargetApiContract['formRoutes']
  | keyof TargetApiContract['functionRoutes'];

export interface CatalogExpectedResult {
  statusCode: number;
  responseBodySchema?: JsonObject;
  errorMessagePattern?: string;
}

/**
 * Single Test Catalogue Entry maintaining 10-Point Traceability
 */
export interface CatalogEntry {
  testId: string;
  category: TestCategory;
  targetEntity: string;
  description: string;
  source: RequirementSource;
  sourceRef: string;
  reasoning: string;
  expectedResult: CatalogExpectedResult;
  priority: TestPriority;
  dependencies: string[];
  payloadTemplate: JsonObject;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  targetRouteKey: TargetRouteKey;
  customUrlPath?: string;
  selected: boolean;
}

export type CatalogueStatus = 'DRAFT' | 'APPROVED';

export interface TestCatalog {
  projectName: string;
  createdAt: string;
  status: CatalogueStatus;
  entries: CatalogEntry[];
}
