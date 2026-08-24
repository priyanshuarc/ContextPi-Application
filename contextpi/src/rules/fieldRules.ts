/**
 * Field Rule Engine Subsystem
 * Evaluates field-level constraints (mandatory, dataType, inputType, multiSelect, default, enum).
 * Preserves unknown/custom metadata without inventing false tests.
 */

import { ProjectContext } from '../types/context.js';
import { TestIntent, generateStableIntentId } from './intentModel.js';
import { determinePriority } from './priority.js';
import { buildValidPayloadForSchema } from './crudRules.js';

export function evaluateFieldRules(context: ProjectContext): TestIntent[] {
  const intents: TestIntent[] = [];

  for (const schema of context.schemas) {
    if (!schema.active) continue;

    const entityName = schema.schemaName;
    let positiveCounter = 1;
    const basePayload = buildValidPayloadForSchema(schema);

    for (const field of schema.fields) {
      const fieldRef = `${entityName}.${field.name}`;
      const lowerType = field.dataType.toLowerCase();
      const lowerInput = field.inputType.toLowerCase();

      // Rule A: mandatoryField === true -> Missing field negative test
      if (field.mandatoryField) {
        const payload = { ...basePayload };
        delete payload[field.name];
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'FIELD_VALIDATION', entityName, 'MISSING_MANDATORY', field.name),
          category: 'FIELD_VALIDATION',
          targetEntity: entityName,
          description: `Field Validation: Missing Mandatory Field '${field.name}'`,
          source: 'MONGO_SCHEMA',
          sourceRef: fieldRef,
          reasoning: `Field '${field.name}' is mandatory; omitting it must return HTTP 400`,
          expectedResult: { statusCode: 400, errorMessagePattern: field.name },
          priority: determinePriority('FIELD_VALIDATION', 'MISSING_MANDATORY'),
          dependencies: [],
          payloadTemplate: payload,
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });
      }

      // Rule B: dataType indicates numeric -> Wrong-type negative test
      if (lowerType.includes('number') || lowerType.includes('float') || lowerType.includes('int')) {
        const payload = { ...basePayload, [field.name]: 'INVALID_NON_NUMERIC_STRING' };
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'FIELD_VALIDATION', entityName, 'WRONG_TYPE_NUMERIC', field.name),
          category: 'FIELD_VALIDATION',
          targetEntity: entityName,
          description: `Field Validation: Wrong Data Type for Numeric Field '${field.name}'`,
          source: 'MONGO_SCHEMA',
          sourceRef: fieldRef,
          reasoning: `Field '${field.name}' expects numeric type; sending string must return HTTP 400`,
          expectedResult: { statusCode: 400 },
          priority: determinePriority('FIELD_VALIDATION', 'WRONG_TYPE'),
          dependencies: [],
          payloadTemplate: payload,
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });
      }

      // Rule C: inputType === 'url' -> Malformed URL negative test
      if (lowerInput === 'url') {
        const payload = { ...basePayload, [field.name]: 'not-a-valid-url-string' };
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'FIELD_VALIDATION', entityName, 'MALFORMED_URL', field.name),
          category: 'FIELD_VALIDATION',
          targetEntity: entityName,
          description: `Field Validation: Malformed URL for Field '${field.name}'`,
          source: 'MONGO_SCHEMA',
          sourceRef: fieldRef,
          reasoning: `Field '${field.name}' requires URL format; malformed URL must return HTTP 400`,
          expectedResult: { statusCode: 400 },
          priority: determinePriority('FIELD_VALIDATION', 'MALFORMED_URL'),
          dependencies: [],
          payloadTemplate: payload,
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });
      }

      // Rule D: inputType === 'phone' -> Valid phone (+) vs Invalid phone (-)
      if (lowerInput === 'phone') {
        // Valid phone positive test
        const posPayload = buildValidPayloadForSchema(schema, positiveCounter++);
        const validPayload = { ...posPayload, [field.name]: '9876543210' };
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'FIELD_VALIDATION', entityName, 'VALID_PHONE', field.name),
          category: 'FIELD_VALIDATION',
          targetEntity: entityName,
          description: `Field Validation: Valid Phone Format for Field '${field.name}'`,
          source: 'MONGO_SCHEMA',
          sourceRef: fieldRef,
          reasoning: `Field '${field.name}' expects phone format; valid 10-digit phone string returns HTTP 201`,
          expectedResult: { statusCode: 201 },
          priority: determinePriority('FIELD_VALIDATION', 'VALID_PHONE'),
          dependencies: [],
          payloadTemplate: validPayload,
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });

        // Invalid phone negative test
        const invalidPayload = { ...basePayload, [field.name]: 'invalid-phone-abc-xyz' };
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'FIELD_VALIDATION', entityName, 'INVALID_PHONE', field.name),
          category: 'FIELD_VALIDATION',
          targetEntity: entityName,
          description: `Field Validation: Invalid Phone Format for Field '${field.name}'`,
          source: 'MONGO_SCHEMA',
          sourceRef: fieldRef,
          reasoning: `Field '${field.name}' expects phone format; invalid characters must return HTTP 400`,
          expectedResult: { statusCode: 400 },
          priority: determinePriority('FIELD_VALIDATION', 'INVALID_PHONE'),
          dependencies: [],
          payloadTemplate: invalidPayload,
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });
      }

      // Rule E: multipleSelect === true -> Array (+) vs Scalar (-)
      if (field.multipleSelect) {
        // Array positive test
        const posPayload = buildValidPayloadForSchema(schema, positiveCounter++);
        const arrayPayload = { ...posPayload, [field.name]: ['item_1', 'item_2'] };
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'FIELD_VALIDATION', entityName, 'MULTI_SELECT_ARRAY', field.name),
          category: 'FIELD_VALIDATION',
          targetEntity: entityName,
          description: `Field Validation: Array Payload for Multi-Select Field '${field.name}'`,
          source: 'MONGO_SCHEMA',
          sourceRef: fieldRef,
          reasoning: `Field '${field.name}' is multi-select; array payload returns HTTP 201`,
          expectedResult: { statusCode: 201 },
          priority: determinePriority('FIELD_VALIDATION', 'MULTI_SELECT'),
          dependencies: [],
          payloadTemplate: arrayPayload,
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });

        // Scalar negative test
        const scalarPayload = { ...basePayload, [field.name]: 'scalar_non_array_string' };
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'FIELD_VALIDATION', entityName, 'MULTI_SELECT_SCALAR', field.name),
          category: 'FIELD_VALIDATION',
          targetEntity: entityName,
          description: `Field Validation: Non-array Scalar Payload for Multi-Select Field '${field.name}'`,
          source: 'MONGO_SCHEMA',
          sourceRef: fieldRef,
          reasoning: `Field '${field.name}' is multi-select; sending scalar string instead of array returns HTTP 400`,
          expectedResult: { statusCode: 400 },
          priority: determinePriority('FIELD_VALIDATION', 'MULTI_SELECT'),
          dependencies: [],
          payloadTemplate: scalarPayload,
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });
      }

      // Rule F: defaultValue exists -> Omit field and verify default value in response
      if (field.defaultValue !== undefined) {
        const posPayload = buildValidPayloadForSchema(schema, positiveCounter++);
        const payloadOmitted = { ...posPayload };
        delete payloadOmitted[field.name];
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'FIELD_VALIDATION', entityName, 'DEFAULT_VALUE_VERIFY', field.name),
          category: 'FIELD_VALIDATION',
          targetEntity: entityName,
          description: `Field Validation: Default Value Verification for Field '${field.name}'`,
          source: 'MONGO_SCHEMA',
          sourceRef: fieldRef,
          reasoning: `Field '${field.name}' specifies default value ${JSON.stringify(field.defaultValue)}; omitting field applies default`,
          expectedResult: {
            statusCode: 201,
            responseBodySchema: { [field.name]: field.defaultValue }
          },
          priority: determinePriority('FIELD_VALIDATION', 'DEFAULT_VALUE'),
          dependencies: [],
          payloadTemplate: payloadOmitted,
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });
      }

      // Rule G: enum is non-empty -> Allowed enum (+) vs Invalid enum (-)
      if (field.enum && field.enum.length > 0) {
        const posPayload = buildValidPayloadForSchema(schema, positiveCounter++);
        const validEnumValue = field.enum[0];
        const validEnumPayload = { ...posPayload, [field.name]: validEnumValue };
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'FIELD_VALIDATION', entityName, 'ALLOWED_ENUM', field.name),
          category: 'FIELD_VALIDATION',
          targetEntity: entityName,
          description: `Field Validation: Allowed Enum Value for Field '${field.name}'`,
          source: 'MONGO_SCHEMA',
          sourceRef: fieldRef,
          reasoning: `Field '${field.name}' enum includes '${String(validEnumValue)}'; returns HTTP 201`,
          expectedResult: { statusCode: 201 },
          priority: determinePriority('FIELD_VALIDATION', 'ALLOWED_ENUM'),
          dependencies: [],
          payloadTemplate: validEnumPayload,
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });

        const invalidEnumPayload = { ...basePayload, [field.name]: 'UNLISTED_INVALID_ENUM_OPTION_XYZ' };
        intents.push({
          intentId: generateStableIntentId(context.projectName, 'FIELD_VALIDATION', entityName, 'INVALID_ENUM', field.name),
          category: 'FIELD_VALIDATION',
          targetEntity: entityName,
          description: `Field Validation: Unlisted Enum Value for Field '${field.name}'`,
          source: 'MONGO_SCHEMA',
          sourceRef: fieldRef,
          reasoning: `Field '${field.name}' restricted to enum options; unlisted value returns HTTP 400`,
          expectedResult: { statusCode: 400 },
          priority: determinePriority('FIELD_VALIDATION', 'INVALID_ENUM'),
          dependencies: [],
          payloadTemplate: invalidEnumPayload,
          httpMethod: 'POST',
          targetRouteKey: 'formCreate'
        });
      }
    }
  }

  return intents;
}
