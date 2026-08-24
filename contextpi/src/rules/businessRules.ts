/**
 * Business Rule Intent Generator Subsystem
 * Converts BusinessRuleConstraint objects into positive and negative TestIntents.
 */

import { ProjectContext } from '../types/context.js';
import { BusinessRuleConstraint } from '../types/rules.js';
import { TestIntent, generateStableIntentId } from './intentModel.js';
import { determinePriority } from './priority.js';
import { buildValidPayloadForSchema } from './crudRules.js';

export function generateBusinessRuleIntents(
  constraints: BusinessRuleConstraint[],
  context: ProjectContext
): TestIntent[] {
  const intents: TestIntent[] = [];

  const schemaMap = new Map<string, any>();
  for (const s of context.schemas) {
    if (s.active) {
      schemaMap.set(s.schemaName.toLowerCase(), s);
    }
  }

  for (const constraint of constraints) {
    // targetFieldOrEntity format is "schemaName.fieldName"
    const parts = constraint.targetFieldOrEntity.split('.');
    if (parts.length !== 2) continue;

    const [schemaName, fieldName] = parts;
    const schema = schemaMap.get(schemaName.toLowerCase());
    if (!schema) continue;

    const basePayload = buildValidPayloadForSchema(schema);
    const sourceRef = `Requirement.${constraint.ruleId} (${constraint.targetFieldOrEntity})`;

    switch (constraint.constraintType) {
      case 'EXACT_DIGITS': {
        const digits = typeof constraint.parameters['digits'] === 'number' ? constraint.parameters['digits'] : 8;
        const validValue = '1'.repeat(digits);
        const invalidValue = '1'.repeat(Math.max(1, digits - 1));

        // Positive Test (Exact N Digits)
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'BUSINESS_RULE', schemaName, 'EXACT_DIGITS_POS', fieldName),
          category: 'BUSINESS_RULE',
          targetEntity: schemaName,
          description: `Business Rule: Valid Exact ${digits} Digits for '${fieldName}'`,
          source: 'BUSINESS_REQUIREMENT',
          sourceRef,
          reasoning: constraint.reasoning,
          expectedResult: { statusCode: 201 },
          priority: determinePriority('BUSINESS_RULE', 'EXACT_DIGITS'),
          dependencies: [],
          payloadTemplate: { ...basePayload, [fieldName]: validValue },
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });

        // Negative Test (Invalid Digits Count)
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'BUSINESS_RULE', schemaName, 'EXACT_DIGITS_NEG', fieldName),
          category: 'BUSINESS_RULE',
          targetEntity: schemaName,
          description: `Business Rule: Invalid Digit Count (${invalidValue.length} != ${digits}) for '${fieldName}'`,
          source: 'BUSINESS_REQUIREMENT',
          sourceRef,
          reasoning: `${constraint.reasoning}; passing ${invalidValue.length} digits returns HTTP 400`,
          expectedResult: { statusCode: 400 },
          priority: determinePriority('BUSINESS_RULE', 'EXACT_DIGITS'),
          dependencies: [],
          payloadTemplate: { ...basePayload, [fieldName]: invalidValue },
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });
        break;
      }

      case 'NON_NEGATIVE': {
        // Negative Test (Negative Value)
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'BUSINESS_RULE', schemaName, 'NON_NEGATIVE_NEG', fieldName),
          category: 'BUSINESS_RULE',
          targetEntity: schemaName,
          description: `Business Rule: Negative Value Rejection for '${fieldName}'`,
          source: 'BUSINESS_REQUIREMENT',
          sourceRef,
          reasoning: constraint.reasoning,
          expectedResult: { statusCode: 400 },
          priority: determinePriority('BUSINESS_RULE', 'NON_NEGATIVE'),
          dependencies: [],
          payloadTemplate: { ...basePayload, [fieldName]: -10 },
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });

        // Positive Test (Zero / Non-negative)
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'BUSINESS_RULE', schemaName, 'NON_NEGATIVE_POS', fieldName),
          category: 'BUSINESS_RULE',
          targetEntity: schemaName,
          description: `Business Rule: Non-negative Value Acceptance for '${fieldName}'`,
          source: 'BUSINESS_REQUIREMENT',
          sourceRef,
          reasoning: `${constraint.reasoning}; passing 0 returns HTTP 201`,
          expectedResult: { statusCode: 201 },
          priority: determinePriority('BUSINESS_RULE', 'NON_NEGATIVE'),
          dependencies: [],
          payloadTemplate: { ...basePayload, [fieldName]: 0 },
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });
        break;
      }

      case 'GREATER_THAN': {
        const threshold = typeof constraint.parameters['threshold'] === 'number' ? constraint.parameters['threshold'] : 0;

        // Negative Test (Value <= Threshold)
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'BUSINESS_RULE', schemaName, 'GREATER_THAN_NEG', fieldName),
          category: 'BUSINESS_RULE',
          targetEntity: schemaName,
          description: `Business Rule: Value <= ${threshold} Rejection for '${fieldName}'`,
          source: 'BUSINESS_REQUIREMENT',
          sourceRef,
          reasoning: constraint.reasoning,
          expectedResult: { statusCode: 400 },
          priority: determinePriority('BUSINESS_RULE', 'GREATER_THAN'),
          dependencies: [],
          payloadTemplate: { ...basePayload, [fieldName]: threshold },
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });

        // Positive Test (Value > Threshold)
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'BUSINESS_RULE', schemaName, 'GREATER_THAN_POS', fieldName),
          category: 'BUSINESS_RULE',
          targetEntity: schemaName,
          description: `Business Rule: Value > ${threshold} Acceptance for '${fieldName}'`,
          source: 'BUSINESS_REQUIREMENT',
          sourceRef,
          reasoning: `${constraint.reasoning}; passing ${threshold + 1} returns HTTP 201`,
          expectedResult: { statusCode: 201 },
          priority: determinePriority('BUSINESS_RULE', 'GREATER_THAN'),
          dependencies: [],
          payloadTemplate: { ...basePayload, [fieldName]: threshold + 1 },
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });
        break;
      }

      case 'LESS_THAN': {
        const threshold = typeof constraint.parameters['threshold'] === 'number' ? constraint.parameters['threshold'] : 100;

        // Negative Test (Value >= Threshold)
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'BUSINESS_RULE', schemaName, 'LESS_THAN_NEG', fieldName),
          category: 'BUSINESS_RULE',
          targetEntity: schemaName,
          description: `Business Rule: Value >= ${threshold} Rejection for '${fieldName}'`,
          source: 'BUSINESS_REQUIREMENT',
          sourceRef,
          reasoning: constraint.reasoning,
          expectedResult: { statusCode: 400 },
          priority: determinePriority('BUSINESS_RULE', 'LESS_THAN'),
          dependencies: [],
          payloadTemplate: { ...basePayload, [fieldName]: threshold },
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });

        // Positive Test (Value < Threshold)
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'BUSINESS_RULE', schemaName, 'LESS_THAN_POS', fieldName),
          category: 'BUSINESS_RULE',
          targetEntity: schemaName,
          description: `Business Rule: Value < ${threshold} Acceptance for '${fieldName}'`,
          source: 'BUSINESS_REQUIREMENT',
          sourceRef,
          reasoning: `${constraint.reasoning}; passing ${threshold - 1} returns HTTP 201`,
          expectedResult: { statusCode: 201 },
          priority: determinePriority('BUSINESS_RULE', 'LESS_THAN'),
          dependencies: [],
          payloadTemplate: { ...basePayload, [fieldName]: threshold - 1 },
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });
        break;
      }

      case 'BETWEEN': {
        const min = typeof constraint.parameters['min'] === 'number' ? constraint.parameters['min'] : 0;
        const max = typeof constraint.parameters['max'] === 'number' ? constraint.parameters['max'] : 100;

        // Negative Test Below Range
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'BUSINESS_RULE', schemaName, 'BETWEEN_LOW_NEG', fieldName),
          category: 'BUSINESS_RULE',
          targetEntity: schemaName,
          description: `Business Rule: Value Below Range (< ${min}) Rejection for '${fieldName}'`,
          source: 'BUSINESS_REQUIREMENT',
          sourceRef,
          reasoning: constraint.reasoning,
          expectedResult: { statusCode: 400 },
          priority: determinePriority('BUSINESS_RULE', 'BETWEEN'),
          dependencies: [],
          payloadTemplate: { ...basePayload, [fieldName]: min - 1 },
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });

        // Positive Test Inside Range
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'BUSINESS_RULE', schemaName, 'BETWEEN_POS', fieldName),
          category: 'BUSINESS_RULE',
          targetEntity: schemaName,
          description: `Business Rule: Value Inside Range [${min}, ${max}] Acceptance for '${fieldName}'`,
          source: 'BUSINESS_REQUIREMENT',
          sourceRef,
          reasoning: constraint.reasoning,
          expectedResult: { statusCode: 201 },
          priority: determinePriority('BUSINESS_RULE', 'BETWEEN'),
          dependencies: [],
          payloadTemplate: { ...basePayload, [fieldName]: Math.floor((min + max) / 2) },
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });

        // Negative Test Above Range
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'BUSINESS_RULE', schemaName, 'BETWEEN_HIGH_NEG', fieldName),
          category: 'BUSINESS_RULE',
          targetEntity: schemaName,
          description: `Business Rule: Value Above Range (> ${max}) Rejection for '${fieldName}'`,
          source: 'BUSINESS_REQUIREMENT',
          sourceRef,
          reasoning: constraint.reasoning,
          expectedResult: { statusCode: 400 },
          priority: determinePriority('BUSINESS_RULE', 'BETWEEN'),
          dependencies: [],
          payloadTemplate: { ...basePayload, [fieldName]: max + 1 },
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });
        break;
      }

      case 'NOT_EMPTY': {
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'BUSINESS_RULE', schemaName, 'NOT_EMPTY_NEG', fieldName),
          category: 'BUSINESS_RULE',
          targetEntity: schemaName,
          description: `Business Rule: Empty Value Rejection for '${fieldName}'`,
          source: 'BUSINESS_REQUIREMENT',
          sourceRef,
          reasoning: constraint.reasoning,
          expectedResult: { statusCode: 400 },
          priority: determinePriority('BUSINESS_RULE', 'NOT_EMPTY'),
          dependencies: [],
          payloadTemplate: { ...basePayload, [fieldName]: '' },
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });
        break;
      }

      case 'VALID_URL': {
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'BUSINESS_RULE', schemaName, 'VALID_URL_NEG', fieldName),
          category: 'BUSINESS_RULE',
          targetEntity: schemaName,
          description: `Business Rule: Malformed URL Rejection for '${fieldName}'`,
          source: 'BUSINESS_REQUIREMENT',
          sourceRef,
          reasoning: constraint.reasoning,
          expectedResult: { statusCode: 400 },
          priority: determinePriority('BUSINESS_RULE', 'VALID_URL'),
          dependencies: [],
          payloadTemplate: { ...basePayload, [fieldName]: 'not-a-valid-url' },
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });
        break;
      }

      case 'VALID_EMAIL': {
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'BUSINESS_RULE', schemaName, 'VALID_EMAIL_NEG', fieldName),
          category: 'BUSINESS_RULE',
          targetEntity: schemaName,
          description: `Business Rule: Invalid Email Rejection for '${fieldName}'`,
          source: 'BUSINESS_REQUIREMENT',
          sourceRef,
          reasoning: constraint.reasoning,
          expectedResult: { statusCode: 400 },
          priority: determinePriority('BUSINESS_RULE', 'VALID_EMAIL'),
          dependencies: [],
          payloadTemplate: { ...basePayload, [fieldName]: 'invalid-email-string' },
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });
        break;
      }
    }
  }

  return intents;
}
