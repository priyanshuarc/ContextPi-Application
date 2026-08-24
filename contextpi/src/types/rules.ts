/**
 * Business Rule Constraint & Provider Definitions
 * Serves Phase 1 deterministic rule parser and future LLM providers.
 */

import { JsonObject } from './json.js';

export type BusinessConstraintType =
  | 'EXACT_DIGITS'
  | 'NOT_EMPTY'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'BETWEEN'
  | 'VALID_URL'
  | 'VALID_EMAIL'
  | 'ALLOWED_ENUM'
  | 'NON_NEGATIVE';

export interface BusinessRuleConstraint {
  ruleId: string;
  targetFieldOrEntity: string;
  constraintType: BusinessConstraintType;
  parameters: JsonObject;
  reasoning: string;
}
