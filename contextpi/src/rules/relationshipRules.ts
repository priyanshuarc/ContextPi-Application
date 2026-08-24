/**
 * Relationship Rule Engine Subsystem
 * Evaluates entity relationships defined by `mappedTableRef`.
 * Validates foreign key joins against existing schemas in ProjectContext.
 * Produces diagnostic warnings if referenced schema is missing.
 */

import { ProjectContext, SchemaContext } from '../types/context.js';
import { TestIntent, generateStableIntentId } from './intentModel.js';
import { determinePriority } from './priority.js';
import { buildValidPayloadForSchema } from './crudRules.js';

export function evaluateRelationshipRules(context: ProjectContext): TestIntent[] {
  const intents: TestIntent[] = [];
  const activeSchemaMap = new Map<string, SchemaContext>();
  for (const s of context.schemas) {
    if (s.active) {
      activeSchemaMap.set(s.schemaName.toLowerCase(), s);
    }
  }

  for (const schema of context.schemas) {
    if (!schema.active) continue;

    const sourceEntity = schema.schemaName;
    const basePayload = buildValidPayloadForSchema(schema);

    for (const field of schema.fields) {
      if (!field.mappedTableRef || field.mappedTableRef.trim() === '') {
        continue;
      }

      const targetEntity = field.mappedTableRef.trim();
      const fieldRef = `${sourceEntity}.${field.name} -> ${targetEntity}`;
      const referencedSchema = activeSchemaMap.get(targetEntity.toLowerCase());

      if (!referencedSchema) {
        // Referenced schema missing from ProjectContext: emit diagnostic warning intent
        const diagIntentId = generateStableIntentId(context.projectName, 'RELATIONSHIP', sourceEntity, 'UNRESOLVED_REFERENCE', field.name);
        intents.push({
          intentId: diagIntentId,
          category: 'RELATIONSHIP',
          targetEntity: sourceEntity,
          description: `Relationship Diagnostic: Unresolved Reference '${targetEntity}' in Field '${field.name}'`,
          source: 'MONGO_SCHEMA',
          sourceRef: fieldRef,
          reasoning: `Field '${field.name}' references entity '${targetEntity}', but '${targetEntity}' is not active in ProjectContext. Diagnostic recorded; false test omitted.`,
          expectedResult: { statusCode: 400 },
          priority: 'LOW',
          dependencies: [],
          payloadTemplate: { ...basePayload, [field.name]: 'UNRESOLVED_TARGET_REF' },
          httpMethod: 'POST',
          targetRouteKey: 'formCreate',
          metadata: { isDiagnostic: true, unresolvedTargetEntity: targetEntity }
        });
        continue;
      }

      // 1. Valid Referenced ID (Positive FK Test)
      const validRefPayload = { ...basePayload, [field.name]: '{{VALID_REFERENCED_RECORD_ID}}' };
      const validRefIntentId = generateStableIntentId(context.projectName, 'RELATIONSHIP', sourceEntity, 'VALID_REFERENCE', field.name);
      intents.push({
        intentId: validRefIntentId,
        category: 'RELATIONSHIP',
        targetEntity: sourceEntity,
        description: `Relationship Test: Valid Reference '${field.name}' -> '${targetEntity}'`,
        source: 'MONGO_SCHEMA',
        sourceRef: fieldRef,
        reasoning: `Field '${field.name}' references '${targetEntity}'; passing existing referenced ID returns HTTP 201`,
        expectedResult: { statusCode: 201 },
        priority: determinePriority('RELATIONSHIP', 'VALID_REFERENCE'),
        dependencies: [],
        payloadTemplate: validRefPayload,
        httpMethod: 'POST',
        targetRouteKey: 'formCreate'
      });

      // 2. Invalid / Nonexistent Referenced ID (Negative FK Test)
      const invalidRefPayload = { ...basePayload, [field.name]: '65f000000000000000000000' };
      const invalidRefIntentId = generateStableIntentId(context.projectName, 'RELATIONSHIP', sourceEntity, 'INVALID_REFERENCE', field.name);
      intents.push({
        intentId: invalidRefIntentId,
        category: 'RELATIONSHIP',
        targetEntity: sourceEntity,
        description: `Relationship Test: Non-existent Reference '${field.name}' -> '${targetEntity}'`,
        source: 'MONGO_SCHEMA',
        sourceRef: fieldRef,
        reasoning: `Field '${field.name}' references '${targetEntity}'; passing non-existent ID '65f000...' returns HTTP 400`,
        expectedResult: { statusCode: 400 },
        priority: determinePriority('RELATIONSHIP', 'INVALID_REFERENCE'),
        dependencies: [],
        payloadTemplate: invalidRefPayload,
        httpMethod: 'POST',
        targetRouteKey: 'formCreate'
      });
    }
  }

  return intents;
}
