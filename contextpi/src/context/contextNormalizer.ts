/**
 * Context Normalizer Subsystem
 * Normalizes dynamic untrusted MongoDB documents into strict TypeScript models.
 * Preserves unknown field metadata safely without hallucinating or inventing test cases.
 */

import { isJsonObject, isJsonValue, JsonObject, JsonValue } from '../types/json.js';
import {
  FieldMetadata,
  FunctionContext,
  FunctionParameter,
  FunctionResponseField,
  SchemaContext
} from '../types/context.js';

export interface NormalizationWarning {
  entity: string;
  field?: string;
  message: string;
}

export interface NormalizationResult<T> {
  result: T | null;
  warnings: NormalizationWarning[];
}

/**
 * Normalizes raw BSON/Mongo document into safe JsonObject.
 * Converts BSON ObjectIds, Dates, and redacts common sensitive keys.
 */
export function normalizeSampleRecord(doc: unknown): JsonObject | undefined {
  if (!isJsonObject(doc)) {
    return undefined;
  }

  const result: JsonObject = {};
  const sensitiveKeys = new Set(['password', 'pass', 'secret', 'token', 'apikey', 'authhash', 'privatekey']);

  for (const [key, value] of Object.entries(doc as Record<string, unknown>)) {
    if (key === '_id') {
      result['_id'] = String(value);
      continue;
    }

    if (sensitiveKeys.has(key.toLowerCase())) {
      result[key] = '[REDACTED]';
      continue;
    }

    result[key] = convertBsonToJsonValue(value);
  }

  return result;
}

function convertBsonToJsonValue(val: unknown): JsonValue {
  if (val === null || val === undefined) {
    return null;
  }
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return val;
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (typeof val === 'object' && val !== null) {
    const recordVal = val as Record<string, unknown>;
    // Handle BSON ObjectId or objects with toHexString / toString
    if ('toHexString' in recordVal && typeof recordVal['toHexString'] === 'function') {
      return String((recordVal['toHexString'] as () => string)());
    }
    if ('_bsontype' in recordVal && recordVal['_bsontype'] === 'ObjectID') {
      return String(val);
    }
    if (Array.isArray(val)) {
      return val.map(convertBsonToJsonValue);
    }
    if (isJsonObject(val)) {
      const obj: JsonObject = {};
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        obj[k] = convertBsonToJsonValue(v);
      }
      return obj;
    }
  }
  return String(val);
}

/**
 * Normalizes field metadata extracted from MongoDB.
 */
export function normalizeField(raw: unknown, schemaName: string): NormalizationResult<FieldMetadata> {
  const warnings: NormalizationWarning[] = [];

  if (!isJsonObject(raw)) {
    return {
      result: null,
      warnings: [{ entity: schemaName, message: 'Field metadata document must be an object' }]
    };
  }

  const name = typeof raw['name'] === 'string' ? raw['name'].trim() : '';
  if (!name) {
    return {
      result: null,
      warnings: [{ entity: schemaName, message: 'Field metadata missing valid name' }]
    };
  }

  // Preserve unknown dataTypes as normalized strings without failing
  const rawDataType = raw['dataType'] || raw['type'];
  const dataType = typeof rawDataType === 'string' && rawDataType.trim() !== ''
    ? rawDataType.trim()
    : 'String';

  // Normalize mandatory field flag
  const mandatoryField = typeof raw['mandatoryField'] === 'boolean'
    ? raw['mandatoryField']
    : typeof raw['required'] === 'boolean'
      ? raw['required']
      : false;

  // Preserve inputType
  const rawInputType = raw['inputType'];
  const inputType = typeof rawInputType === 'string' && rawInputType.trim() !== ''
    ? rawInputType.trim().toLowerCase()
    : 'text';

  const field: FieldMetadata = {
    name,
    dataType,
    mandatoryField,
    inputType
  };

  // Optional relationship reference
  if (typeof raw['mappedTableRef'] === 'string' && raw['mappedTableRef'].trim() !== '') {
    field.mappedTableRef = raw['mappedTableRef'].trim();
  } else if (typeof raw['ref'] === 'string' && raw['ref'].trim() !== '') {
    field.mappedTableRef = raw['ref'].trim();
  }

  // Optional multi-select flag
  if (typeof raw['multipleSelect'] === 'boolean') {
    field.multipleSelect = raw['multipleSelect'];
  } else if (typeof raw['isMulti'] === 'boolean') {
    field.multipleSelect = raw['isMulti'];
  }

  // Optional default value
  if ('defaultValue' in raw && raw['defaultValue'] !== undefined) {
    if (isJsonValue(raw['defaultValue'])) {
      field.defaultValue = raw['defaultValue'];
    } else {
      warnings.push({
        entity: schemaName,
        field: name,
        message: `Default value for field '${name}' is non-serializable; ignored`
      });
    }
  }

  // Optional enum values
  if (Array.isArray(raw['enum'])) {
    const validEnum = raw['enum'].filter(isJsonValue);
    if (validEnum.length > 0) {
      field.enum = validEnum;
    }
  } else if (Array.isArray(raw['options'])) {
    const validEnum = raw['options'].filter(isJsonValue);
    if (validEnum.length > 0) {
      field.enum = validEnum;
    }
  }

  return { result: field, warnings };
}

/**
 * Normalizes a dynamic MongoDB schema document into SchemaContext.
 */
export function normalizeSchema(raw: unknown): NormalizationResult<SchemaContext> {
  const warnings: NormalizationWarning[] = [];

  if (!isJsonObject(raw)) {
    return {
      result: null,
      warnings: [{ entity: 'Schema', message: 'Schema document must be an object' }]
    };
  }

  const schemaName = typeof raw['schemaName'] === 'string'
    ? raw['schemaName'].trim()
    : typeof raw['name'] === 'string'
      ? raw['name'].trim()
      : '';

  if (!schemaName) {
    return {
      result: null,
      warnings: [{ entity: 'Schema', message: 'Schema document missing schemaName' }]
    };
  }

  const active = typeof raw['active'] === 'boolean'
    ? raw['active']
    : typeof raw['isActive'] === 'boolean'
      ? raw['isActive']
      : true;

  if (!active) {
    return {
      result: null,
      warnings: [{ entity: schemaName, message: `Schema '${schemaName}' is marked inactive; skipped` }]
    };
  }

  const rawFields = Array.isArray(raw['fields']) ? raw['fields'] : [];
  const fields: FieldMetadata[] = [];

  for (const rawF of rawFields) {
    const { result: f, warnings: fWarns } = normalizeField(rawF, schemaName);
    warnings.push(...fWarns);
    if (f) {
      fields.push(f);
    }
  }

  const schema: SchemaContext = {
    schemaName,
    active,
    fields
  };

  if ('sampleRecord' in raw && isJsonObject(raw['sampleRecord'])) {
    schema.sampleRecord = normalizeSampleRecord(raw['sampleRecord']);
  }

  return { result: schema, warnings };
}

/**
 * Normalizes a FunctionParameter document.
 */
export function normalizeFunctionParameter(raw: unknown, fnName: string): NormalizationResult<FunctionParameter> {
  if (!isJsonObject(raw)) {
    return {
      result: null,
      warnings: [{ entity: fnName, message: 'FunctionParameter must be an object' }]
    };
  }

  const name = typeof raw['name'] === 'string' ? raw['name'].trim() : '';
  if (!name) {
    return {
      result: null,
      warnings: [{ entity: fnName, message: 'FunctionParameter missing name' }]
    };
  }

  const type = typeof raw['type'] === 'string' && raw['type'].trim() !== ''
    ? raw['type'].trim()
    : 'string';

  const isActive = typeof raw['isActive'] === 'boolean'
    ? raw['isActive']
    : typeof raw['active'] === 'boolean'
      ? raw['active']
      : true;

  const required = typeof raw['required'] === 'boolean'
    ? raw['required']
    : typeof raw['mandatory'] === 'boolean'
      ? raw['mandatory']
      : false;

  return {
    result: { name, type, isActive, required },
    warnings: []
  };
}

/**
 * Normalizes a FunctionResponseField document.
 */
export function normalizeFunctionResponseField(raw: unknown, fnName: string): NormalizationResult<FunctionResponseField> {
  if (!isJsonObject(raw)) {
    return {
      result: null,
      warnings: [{ entity: fnName, message: 'FunctionResponseField must be an object' }]
    };
  }

  const name = typeof raw['name'] === 'string' ? raw['name'].trim() : '';
  if (!name) {
    return {
      result: null,
      warnings: [{ entity: fnName, message: 'FunctionResponseField missing name' }]
    };
  }

  const type = typeof raw['type'] === 'string' && raw['type'].trim() !== ''
    ? raw['type'].trim()
    : 'string';

  const required = typeof raw['required'] === 'boolean'
    ? raw['required']
    : typeof raw['mandatory'] === 'boolean'
      ? raw['mandatory']
      : true;

  return {
    result: { name, type, required },
    warnings: []
  };
}

/**
 * Normalizes a FunctionContext document from the Function Registry.
 */
export function normalizeFunctionContext(raw: unknown): NormalizationResult<FunctionContext> {
  const warnings: NormalizationWarning[] = [];

  if (!isJsonObject(raw)) {
    return {
      result: null,
      warnings: [{ entity: 'Function', message: 'Function document must be an object' }]
    };
  }

  const name = typeof raw['name'] === 'string'
    ? raw['name'].trim()
    : typeof raw['functionName'] === 'string'
      ? raw['functionName'].trim()
      : '';

  if (!name) {
    return {
      result: null,
      warnings: [{ entity: 'Function', message: 'Function document missing name' }]
    };
  }

  const isActive = typeof raw['isActive'] === 'boolean'
    ? raw['isActive']
    : typeof raw['active'] === 'boolean'
      ? raw['active']
      : true;

  if (!isActive) {
    return {
      result: null,
      warnings: [{ entity: name, message: `Function '${name}' is marked inactive; skipped` }]
    };
  }

  const rawParams = Array.isArray(raw['parameters'])
    ? raw['parameters']
    : Array.isArray(raw['bodyParams'])
      ? raw['bodyParams']
      : [];

  const parameters: FunctionParameter[] = [];
  for (const p of rawParams) {
    if (typeof p === 'string') {
      parameters.push({ name: p, type: 'string', isActive: true, required: true });
    } else {
      const { result: param, warnings: pWarns } = normalizeFunctionParameter(p, name);
      warnings.push(...pWarns);
      if (param) parameters.push(param);
    }
  }

  const rawResponses = Array.isArray(raw['expectedResponseFields'])
    ? raw['expectedResponseFields']
    : Array.isArray(raw['responseFields'])
      ? raw['responseFields']
      : [];

  const expectedResponseFields: FunctionResponseField[] = [];
  for (const rf of rawResponses) {
    if (typeof rf === 'string') {
      expectedResponseFields.push({ name: rf, type: 'string', required: true });
    } else {
      const { result: resp, warnings: rWarns } = normalizeFunctionResponseField(rf, name);
      warnings.push(...rWarns);
      if (resp) expectedResponseFields.push(resp);
    }
  }

  return {
    result: {
      name,
      isActive,
      parameters,
      expectedResponseFields
    },
    warnings
  };
}
