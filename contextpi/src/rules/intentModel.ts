/**
 * Intermediate Test Intent Model
 * Pure internal representation of rule engine outputs.
 * Completely application-agnostic, deterministic, and serializable.
 */

import { JsonObject } from '../types/json.js';
import { TargetRouteKey } from '../types/catalogue.js';
import { TestCategory, TestPriority, RequirementSource, CatalogExpectedResult } from '../types/catalogue.js';

export interface TestIntent {
  intentId: string;
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
  metadata?: JsonObject;
}

/**
 * Generates a stable, deterministic intentId for reproducibility.
 * Identical input parameters will always produce the exact same ID.
 */
export function generateStableIntentId(
  projectName: string,
  category: TestCategory,
  targetEntity: string,
  ruleName: string,
  sourceRef: string
): string {
  const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, '_').toUpperCase();
  const proj = sanitize(projectName);
  const cat = sanitize(category);
  const ent = sanitize(targetEntity);
  const rule = sanitize(ruleName);
  const ref = sanitize(sourceRef);

  return `INTENT-${proj}-${cat}-${ent}-${rule}-${ref}`;
}
