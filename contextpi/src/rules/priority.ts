/**
 * Centralized Priority Rules Engine
 * Assigns deterministic priority levels (CRITICAL, HIGH, MEDIUM, LOW)
 * based on test category, rule type, and failure impact.
 */

import { TestCategory, TestPriority } from '../types/catalogue.js';

export function determinePriority(category: TestCategory, ruleSubtype: string): TestPriority {
  switch (category) {
    case 'CRUD':
      if (ruleSubtype === 'CREATE_HAPPY_PATH' || ruleSubtype === 'MISSING_MANDATORY') {
        return 'CRITICAL';
      }
      if (ruleSubtype === 'UPDATE' || ruleSubtype === 'DELETE' || ruleSubtype === 'WRONG_TYPE') {
        return 'HIGH';
      }
      return 'MEDIUM';

    case 'FIELD_VALIDATION':
      if (ruleSubtype === 'MISSING_MANDATORY') {
        return 'CRITICAL';
      }
      if (ruleSubtype === 'WRONG_TYPE' || ruleSubtype === 'INVALID_ENUM' || ruleSubtype === 'MALFORMED_URL' || ruleSubtype === 'INVALID_PHONE') {
        return 'HIGH';
      }
      if (ruleSubtype === 'DEFAULT_VALUE' || ruleSubtype === 'MULTI_SELECT') {
        return 'MEDIUM';
      }
      return 'LOW';

    case 'RELATIONSHIP':
      if (ruleSubtype === 'VALID_REFERENCE' || ruleSubtype === 'MANDATORY_FOREIGN_KEY') {
        return 'CRITICAL';
      }
      return 'HIGH';

    case 'CUSTOM_FUNCTION':
      if (ruleSubtype === 'HAPPY_PATH' || ruleSubtype === 'RESPONSE_SCHEMA_ASSERTION') {
        return 'HIGH';
      }
      return 'MEDIUM';

    case 'BUSINESS_RULE':
      return 'CRITICAL';

    case 'REGISTRY':
      return 'HIGH';

    case 'BULK_UPLOAD':
      return 'HIGH';

    default:
      return 'MEDIUM';
  }
}
