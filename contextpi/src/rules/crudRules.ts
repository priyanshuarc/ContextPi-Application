/**
 * CRUD Rule Engine Subsystem
 * Generates standard CRUD test intents per active schema.
 * Uses TargetApiContract route keys and enforces explicit dependency graphs.
 */

import { ProjectContext, SchemaContext, FieldMetadata } from '../types/context.js';
import { TestIntent, generateStableIntentId } from './intentModel.js';
import { determinePriority } from './priority.js';
import { JsonObject, JsonValue } from '../types/json.js';

/**
 * Constructs a valid sample payload for a schema using sampleRecord or default metadata values.
 */
export function buildValidPayloadForSchema(
  schema: SchemaContext,
  uniqueSuffix: string | number = 100,
  context?: ProjectContext
): JsonObject {
  const base = schema.sampleRecord && Object.keys(schema.sampleRecord).length > 0
    ? { ...schema.sampleRecord }
    : {};

  if (!schema.sampleRecord || Object.keys(schema.sampleRecord).length === 0) {
    for (const field of schema.fields) {
      base[field.name] = generateDefaultPlaceholderForField(field, context);
    }
  }

  // Strip pre-existing database metadata fields from creation payload
  delete base['_id'];
  delete base['createdAt'];
  delete base['updatedAt'];
  delete base['__v'];

  const payload = { ...base };
  if (uniqueSuffix !== undefined && uniqueSuffix !== '' && uniqueSuffix !== 0) {
    for (const key of Object.keys(payload)) {
      if (/code$/i.test(key) || key === 'itemCode' || key === 'orderId' || (/id$/i.test(key) && key !== 'itemId')) {
        const val = String(payload[key]);
        const match = val.match(/^(.*?)(\d+)$/);
        if (match) {
          const prefix = match[1];
          const numStr = match[2];
          const nextNum = parseInt(numStr, 10) + Number(uniqueSuffix);
          payload[key] = `${prefix}${String(nextNum).padStart(numStr.length, '0')}`;
        } else {
          payload[key] = `${val}_${uniqueSuffix}`;
        }
      }
    }
  }

  // If itemId is present, resolve referenced item _id from context if available
  if (payload['itemId'] && context) {
    const itemsSchema = context.schemas.find(s => s.schemaName === 'items');
    if (itemsSchema && itemsSchema.sampleRecord && itemsSchema.sampleRecord._id) {
      payload['itemId'] = String(itemsSchema.sampleRecord._id);
    }
  }

  return payload;
}

function generateDefaultPlaceholderForField(field: FieldMetadata, context?: ProjectContext): JsonValue {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }
  if (field.enum && field.enum.length > 0) {
    return field.enum[0];
  }

  const lowerType = field.dataType.toLowerCase();
  const lowerInput = field.inputType.toLowerCase();

  if (lowerInput === 'email') return 'test.user@example.com';
  if (lowerInput === 'url') return 'https://example.com';
  if (lowerInput === 'phone') return '9876543210';

  if (field.name === 'itemId' && context) {
    const itemsSchema = context.schemas.find(s => s.schemaName === 'items');
    if (itemsSchema?.sampleRecord?._id) {
      return String(itemsSchema.sampleRecord._id);
    }
  }

  if (lowerType.includes('number') || lowerInput === 'number') return 100;
  if (lowerType.includes('boolean')) return true;
  if (lowerType.includes('array') || field.multipleSelect) return ['sample_item'];
  if (lowerType.includes('date') || lowerInput === 'date') return '2026-08-23T12:00:00Z';
  if (lowerType.includes('objectid')) return '65d1a2b3c4d5e6f7a8b9c0d1';

  return `SAMPLE_${field.name.toUpperCase()}`;
}

export function evaluateCrudRules(context: ProjectContext): TestIntent[] {
  const intents: TestIntent[] = [];

  for (const schema of context.schemas) {
    if (!schema.active) continue;

    const entityName = schema.schemaName;
    const validPayload = buildValidPayloadForSchema(schema, 100, context);
    const mandatoryField = schema.fields.find(f => f.mandatoryField);
    const numericField = schema.fields.find(f => f.dataType.toLowerCase().includes('number'));

    // 1. Create Happy Path
    const createIntentId = generateStableIntentId(context.projectName, 'CRUD', entityName, 'CREATE_HAPPY_PATH', entityName);
    intents.push({
      intentId: createIntentId,
      category: 'CRUD',
      targetEntity: entityName,
      description: `Create ${entityName} - Happy Path`,
      source: 'MONGO_SCHEMA',
      sourceRef: `${entityName}`,
      reasoning: `Validate creation of ${entityName} with valid payload`,
      expectedResult: { statusCode: 201 },
      priority: determinePriority('CRUD', 'CREATE_HAPPY_PATH'),
      dependencies: [],
      payloadTemplate: validPayload,
      httpMethod: 'POST',
      targetRouteKey: 'formCreate'
    });

    // 2. Read by ID (Depends on Create Happy Path)
    const readByIdIntentId = generateStableIntentId(context.projectName, 'CRUD', entityName, 'READ_BY_ID', entityName);
    intents.push({
      intentId: readByIdIntentId,
      category: 'CRUD',
      targetEntity: entityName,
      description: `Read ${entityName} by ID`,
      source: 'MONGO_SCHEMA',
      sourceRef: `${entityName}`,
      reasoning: `Fetch ${entityName} record using ID returned from creation`,
      expectedResult: { statusCode: 200 },
      priority: determinePriority('CRUD', 'READ_BY_ID'),
      dependencies: [createIntentId],
      payloadTemplate: { schemaName: entityName, id: '{{CREATE_RECORD_ID}}' },
      httpMethod: 'POST',
      targetRouteKey: 'formGet'
    });

    // 3. Read List (Depends on Create Happy Path)
    const readListIntentId = generateStableIntentId(context.projectName, 'CRUD', entityName, 'READ_LIST', entityName);
    intents.push({
      intentId: readListIntentId,
      category: 'CRUD',
      targetEntity: entityName,
      description: `Read List of ${entityName} records`,
      source: 'MONGO_SCHEMA',
      sourceRef: `${entityName}`,
      reasoning: `Fetch array list of ${entityName} entities`,
      expectedResult: { statusCode: 200 },
      priority: determinePriority('CRUD', 'READ_LIST'),
      dependencies: [createIntentId],
      payloadTemplate: { schemaName: entityName, limit: 10 },
      httpMethod: 'POST',
      targetRouteKey: 'formGet'
    });

    // 4. Search / Filter (Depends on Create Happy Path)
    const searchIntentId = generateStableIntentId(context.projectName, 'CRUD', entityName, 'SEARCH_FILTER', entityName);
    intents.push({
      intentId: searchIntentId,
      category: 'CRUD',
      targetEntity: entityName,
      description: `Search & Filter ${entityName} records`,
      source: 'MONGO_SCHEMA',
      sourceRef: `${entityName}`,
      reasoning: `Query ${entityName} with filter parameters`,
      expectedResult: { statusCode: 200 },
      priority: determinePriority('CRUD', 'SEARCH_FILTER'),
      dependencies: [createIntentId],
      payloadTemplate: { schemaName: entityName, query: validPayload },
      httpMethod: 'POST',
      targetRouteKey: 'query'
    });

    // 5. Update / Patch (Depends on Create Happy Path)
    const updatedPayload = { ...validPayload, _id: '{{CREATE_RECORD_ID}}' };
    const updateIntentId = generateStableIntentId(context.projectName, 'CRUD', entityName, 'UPDATE_PATCH', entityName);
    intents.push({
      intentId: updateIntentId,
      category: 'CRUD',
      targetEntity: entityName,
      description: `Update ${entityName} record`,
      source: 'MONGO_SCHEMA',
      sourceRef: `${entityName}`,
      reasoning: `Modify existing ${entityName} fields`,
      expectedResult: { statusCode: 200 },
      priority: determinePriority('CRUD', 'UPDATE'),
      dependencies: [createIntentId],
      payloadTemplate: updatedPayload,
      httpMethod: 'POST',
      targetRouteKey: 'formUpdate'
    });

    // 6. Delete / Soft Delete (Depends on Create Happy Path)
    const deleteIntentId = generateStableIntentId(context.projectName, 'CRUD', entityName, 'DELETE_ENTITY', entityName);
    intents.push({
      intentId: deleteIntentId,
      category: 'CRUD',
      targetEntity: entityName,
      description: `Delete ${entityName} record`,
      source: 'MONGO_SCHEMA',
      sourceRef: `${entityName}`,
      reasoning: `Remove ${entityName} by ID`,
      expectedResult: { statusCode: 200 },
      priority: determinePriority('CRUD', 'DELETE'),
      dependencies: [createIntentId],
      payloadTemplate: { schemaName: entityName, id: '{{CREATE_RECORD_ID}}' },
      httpMethod: 'POST',
      targetRouteKey: 'formDelete'
    });

    // 7. Deleted Filter (Depends on Delete)
    const deletedFilterIntentId = generateStableIntentId(context.projectName, 'CRUD', entityName, 'DELETED_FILTER', entityName);
    intents.push({
      intentId: deletedFilterIntentId,
      category: 'CRUD',
      targetEntity: entityName,
      description: `Verify Deleted ${entityName} Excluded`,
      source: 'MONGO_SCHEMA',
      sourceRef: `${entityName}`,
      reasoning: `Deleted ${entityName} record should return 404 or be excluded from query results`,
      expectedResult: { statusCode: 404 },
      priority: determinePriority('CRUD', 'DELETED_FILTER'),
      dependencies: [deleteIntentId],
      payloadTemplate: { schemaName: entityName, id: '{{CREATE_RECORD_ID}}' },
      httpMethod: 'POST',
      targetRouteKey: 'formGet'
    });

    // 8. Missing Mandatory Field
    if (mandatoryField) {
      const missingPayload = { ...buildValidPayloadForSchema(schema, 201, context) };
      delete missingPayload[mandatoryField.name];
      const missingIntentId = generateStableIntentId(context.projectName, 'CRUD', entityName, 'MISSING_MANDATORY', mandatoryField.name);
      intents.push({
        intentId: missingIntentId,
        category: 'CRUD',
        targetEntity: entityName,
        description: `Create ${entityName} - Missing Mandatory Field '${mandatoryField.name}'`,
        source: 'MONGO_SCHEMA',
        sourceRef: `${entityName}.${mandatoryField.name}`,
        reasoning: `Omit mandatory field '${mandatoryField.name}' to assert HTTP 400 rejection`,
        expectedResult: { statusCode: 400, errorMessagePattern: mandatoryField.name },
        priority: determinePriority('CRUD', 'MISSING_MANDATORY'),
        dependencies: [],
        payloadTemplate: missingPayload,
        httpMethod: 'POST',
        targetRouteKey: 'formCreate'
      });
    }

    // 9. Wrong Data Type
    if (numericField) {
      const wrongTypePayload = { ...buildValidPayloadForSchema(schema, 202, context), [numericField.name]: 'INVALID_STRING_VALUE' };
      const wrongTypeIntentId = generateStableIntentId(context.projectName, 'CRUD', entityName, 'WRONG_TYPE', numericField.name);
      intents.push({
        intentId: wrongTypeIntentId,
        category: 'CRUD',
        targetEntity: entityName,
        description: `Create ${entityName} - Wrong Type for Field '${numericField.name}'`,
        source: 'MONGO_SCHEMA',
        sourceRef: `${entityName}.${numericField.name}`,
        reasoning: `Send string for numeric field '${numericField.name}' to assert HTTP 400 rejection`,
        expectedResult: { statusCode: 400 },
        priority: determinePriority('CRUD', 'WRONG_TYPE'),
        dependencies: [],
        payloadTemplate: wrongTypePayload,
        httpMethod: 'POST',
        targetRouteKey: 'formCreate'
      });
    }

    // 10. Missing Schema / Invalid Entity
    const missingSchemaIntentId = generateStableIntentId(context.projectName, 'CRUD', entityName, 'MISSING_SCHEMA', 'INVALID_SCHEMA');
    intents.push({
      intentId: missingSchemaIntentId,
      category: 'CRUD',
      targetEntity: 'NON_EXISTENT_ENTITY',
      description: `Create Request to Non-existent Entity Route`,
      source: 'MONGO_SCHEMA',
      sourceRef: `NON_EXISTENT_ENTITY`,
      reasoning: `Targeting unknown schema route must return HTTP 404`,
      expectedResult: { statusCode: 404 },
      priority: determinePriority('CRUD', 'MISSING_SCHEMA'),
      dependencies: [],
      payloadTemplate: { schemaName: 'NON_EXISTENT_ENTITY', foo: 'bar' },
      httpMethod: 'POST',
      targetRouteKey: 'formCreate'
    });

    // 11. PS10 Bulk Upload: Valid Bulk CSV Upload (TC-BULK-01)
    const bulkPayload1 = buildValidPayloadForSchema(schema, 301, context);
    const bulkPayload2 = buildValidPayloadForSchema(schema, 302, context);
    const bulkValidId = generateStableIntentId(context.projectName, 'BULK_UPLOAD', entityName, 'VALID_BULK', entityName);
    intents.push({
      intentId: bulkValidId,
      category: 'BULK_UPLOAD',
      targetEntity: entityName,
      description: `Bulk Upload: Valid CSV File for ${entityName} (TC-BULK-01)`,
      source: 'MONGO_SCHEMA',
      sourceRef: `${entityName}.bulk`,
      reasoning: `Valid bulk CSV upload for ${entityName} schema returns HTTP 200`,
      expectedResult: { statusCode: 200 },
      priority: determinePriority('BULK_UPLOAD', 'VALID_BULK'),
      dependencies: [],
      payloadTemplate: { schemaName: entityName, records: [bulkPayload1, bulkPayload2] },
      httpMethod: 'POST',
      targetRouteKey: 'formBulkupload'
    });
  }

  return intents;
}
