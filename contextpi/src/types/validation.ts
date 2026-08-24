/**
 * Runtime Type Guard & Validator Functions
 * Validates dynamic external data (MongoDB documents, JSON API payloads)
 * to ensure strict runtime type safety.
 */

import { isJsonObject, isJsonValue, JsonObject } from './json.js';
import {
  FieldMetadata,
  FunctionContext,
  FunctionParameter,
  FunctionResponseField,
  ProjectContext,
  SchemaContext
} from './context.js';
import { TargetApiContract } from './contract.js';
import { CatalogEntry, TestCatalog } from './catalogue.js';
import { BusinessConstraintType, BusinessRuleConstraint } from './rules.js';

export class DomainValidationError extends Error {
  constructor(message: string) {
    super(`[DomainValidationError] ${message}`);
    this.name = 'DomainValidationError';
  }
}

/**
 * Validates dynamic FieldMetadata extracted from external sources (e.g. MongoDB)
 */
export function validateFieldMetadata(data: unknown): FieldMetadata {
  if (!isJsonObject(data)) {
    throw new DomainValidationError('FieldMetadata must be an object');
  }

  if (typeof data['name'] !== 'string' || data['name'].trim() === '') {
    throw new DomainValidationError('FieldMetadata.name must be a non-empty string');
  }

  if (typeof data['dataType'] !== 'string' || data['dataType'].trim() === '') {
    throw new DomainValidationError('FieldMetadata.dataType must be a non-empty string');
  }

  if (typeof data['mandatoryField'] !== 'boolean') {
    throw new DomainValidationError('FieldMetadata.mandatoryField must be a boolean');
  }

  if (typeof data['inputType'] !== 'string' || data['inputType'].trim() === '') {
    throw new DomainValidationError('FieldMetadata.inputType must be a non-empty string');
  }

  const result: FieldMetadata = {
    name: data['name'].trim(),
    dataType: data['dataType'].trim(),
    mandatoryField: data['mandatoryField'],
    inputType: data['inputType'].trim()
  };

  if ('mappedTableRef' in data && data['mappedTableRef'] !== undefined) {
    if (typeof data['mappedTableRef'] !== 'string') {
      throw new DomainValidationError('FieldMetadata.mappedTableRef must be a string if specified');
    }
    result.mappedTableRef = data['mappedTableRef'];
  }

  if ('multipleSelect' in data && data['multipleSelect'] !== undefined) {
    if (typeof data['multipleSelect'] !== 'boolean') {
      throw new DomainValidationError('FieldMetadata.multipleSelect must be a boolean if specified');
    }
    result.multipleSelect = data['multipleSelect'];
  }

  if ('defaultValue' in data && data['defaultValue'] !== undefined) {
    if (!isJsonValue(data['defaultValue'])) {
      throw new DomainValidationError('FieldMetadata.defaultValue must be a valid JsonValue');
    }
    result.defaultValue = data['defaultValue'];
  }

  if ('enum' in data && data['enum'] !== undefined) {
    if (!Array.isArray(data['enum']) || !data['enum'].every(isJsonValue)) {
      throw new DomainValidationError('FieldMetadata.enum must be an array of JsonValues if specified');
    }
    result.enum = data['enum'];
  }

  return result;
}

/**
 * Validates dynamic SchemaContext
 */
export function validateSchemaContext(data: unknown): SchemaContext {
  if (!isJsonObject(data)) {
    throw new DomainValidationError('SchemaContext must be an object');
  }

  if (typeof data['schemaName'] !== 'string' || data['schemaName'].trim() === '') {
    throw new DomainValidationError('SchemaContext.schemaName must be a non-empty string');
  }

  if (typeof data['active'] !== 'boolean') {
    throw new DomainValidationError('SchemaContext.active must be a boolean');
  }

  if (!Array.isArray(data['fields'])) {
    throw new DomainValidationError('SchemaContext.fields must be an array');
  }

  const fields = data['fields'].map((f, idx) => {
    try {
      return validateFieldMetadata(f);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new DomainValidationError(`Invalid field at index ${idx} in schema '${data['schemaName']}': ${msg}`);
    }
  });

  const result: SchemaContext = {
    schemaName: data['schemaName'].trim(),
    active: data['active'],
    fields
  };

  if ('sampleRecord' in data && data['sampleRecord'] !== undefined) {
    if (!isJsonObject(data['sampleRecord'])) {
      throw new DomainValidationError('SchemaContext.sampleRecord must be a JsonObject');
    }
    result.sampleRecord = data['sampleRecord'];
  }

  return result;
}

/**
 * Validates dynamic FunctionParameter
 */
export function validateFunctionParameter(data: unknown): FunctionParameter {
  if (!isJsonObject(data)) {
    throw new DomainValidationError('FunctionParameter must be an object');
  }

  if (typeof data['name'] !== 'string' || data['name'].trim() === '') {
    throw new DomainValidationError('FunctionParameter.name must be a non-empty string');
  }

  if (typeof data['type'] !== 'string' || data['type'].trim() === '') {
    throw new DomainValidationError('FunctionParameter.type must be a non-empty string');
  }

  if (typeof data['isActive'] !== 'boolean') {
    throw new DomainValidationError('FunctionParameter.isActive must be a boolean');
  }

  if (typeof data['required'] !== 'boolean') {
    throw new DomainValidationError('FunctionParameter.required must be a boolean');
  }

  return {
    name: data['name'].trim(),
    type: data['type'].trim(),
    isActive: data['isActive'],
    required: data['required']
  };
}

/**
 * Validates dynamic FunctionResponseField
 */
export function validateFunctionResponseField(data: unknown): FunctionResponseField {
  if (!isJsonObject(data)) {
    throw new DomainValidationError('FunctionResponseField must be an object');
  }

  if (typeof data['name'] !== 'string' || data['name'].trim() === '') {
    throw new DomainValidationError('FunctionResponseField.name must be a non-empty string');
  }

  if (typeof data['type'] !== 'string' || data['type'].trim() === '') {
    throw new DomainValidationError('FunctionResponseField.type must be a non-empty string');
  }

  if (typeof data['required'] !== 'boolean') {
    throw new DomainValidationError('FunctionResponseField.required must be a boolean');
  }

  return {
    name: data['name'].trim(),
    type: data['type'].trim(),
    required: data['required']
  };
}

/**
 * Validates dynamic FunctionContext
 */
export function validateFunctionContext(data: unknown): FunctionContext {
  if (!isJsonObject(data)) {
    throw new DomainValidationError('FunctionContext must be an object');
  }

  if (typeof data['name'] !== 'string' || data['name'].trim() === '') {
    throw new DomainValidationError('FunctionContext.name must be a non-empty string');
  }

  if (typeof data['isActive'] !== 'boolean') {
    throw new DomainValidationError('FunctionContext.isActive must be a boolean');
  }

  if (!Array.isArray(data['parameters'])) {
    throw new DomainValidationError('FunctionContext.parameters must be an array');
  }

  if (!Array.isArray(data['expectedResponseFields'])) {
    throw new DomainValidationError('FunctionContext.expectedResponseFields must be an array');
  }

  const parameters = data['parameters'].map((p, idx) => {
    try {
      return validateFunctionParameter(p);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new DomainValidationError(`Invalid parameter at index ${idx} in function '${data['name']}': ${msg}`);
    }
  });

  const expectedResponseFields = data['expectedResponseFields'].map((rf, idx) => {
    try {
      return validateFunctionResponseField(rf);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new DomainValidationError(`Invalid response field at index ${idx} in function '${data['name']}': ${msg}`);
    }
  });

  return {
    name: data['name'].trim(),
    isActive: data['isActive'],
    parameters,
    expectedResponseFields
  };
}

/**
 * Validates complete ProjectContext from MongoDB
 */
export function validateProjectContext(data: unknown): ProjectContext {
  if (!isJsonObject(data)) {
    throw new DomainValidationError('ProjectContext must be an object');
  }

  if (typeof data['projectName'] !== 'string' || data['projectName'].trim() === '') {
    throw new DomainValidationError('ProjectContext.projectName must be a non-empty string');
  }

  if (!Array.isArray(data['schemas'])) {
    throw new DomainValidationError('ProjectContext.schemas must be an array');
  }

  if (!Array.isArray(data['functions'])) {
    throw new DomainValidationError('ProjectContext.functions must be an array');
  }

  const schemas = data['schemas'].map((s) => validateSchemaContext(s));
  const functions = data['functions'].map((fn) => validateFunctionContext(fn));

  const result: ProjectContext = {
    projectName: data['projectName'].trim(),
    schemas,
    functions
  };

  if ('requirement' in data && data['requirement'] !== undefined) {
    if (typeof data['requirement'] !== 'string') {
      throw new DomainValidationError('ProjectContext.requirement must be a string if specified');
    }
    result.requirement = data['requirement'];
  }

  if ('sampleData' in data && data['sampleData'] !== undefined) {
    if (!isJsonObject(data['sampleData'])) {
      throw new DomainValidationError('ProjectContext.sampleData must be a Record of JsonObject arrays');
    }
    const sampleDataObj: Record<string, JsonObject[]> = {};
    for (const [entityName, records] of Object.entries(data['sampleData'] as JsonObject)) {
      if (!Array.isArray(records) || !records.every(isJsonObject)) {
        throw new DomainValidationError(`Sample data for entity '${entityName}' must be an array of JsonObjects`);
      }
      sampleDataObj[entityName] = records as JsonObject[];
    }
    result.sampleData = sampleDataObj;
  }

  return result;
}

/**
 * Validates TargetApiContract
 */
export function validateTargetApiContract(data: unknown): TargetApiContract {
  if (!isJsonObject(data)) {
    throw new DomainValidationError('TargetApiContract must be an object');
  }

  if (typeof data['baseUrl'] !== 'string' || data['baseUrl'].trim() === '') {
    throw new DomainValidationError('TargetApiContract.baseUrl must be a non-empty string');
  }

  if (!isJsonObject(data['formRoutes'])) {
    throw new DomainValidationError('TargetApiContract.formRoutes must be an object');
  }

  const fr = data['formRoutes'];
  const requiredFormKeys = ['formGet', 'formCreate', 'formUpdate', 'formDelete', 'formBulkupload', 'query'];
  for (const k of requiredFormKeys) {
    if (typeof fr[k] !== 'string' || (fr[k] as string).trim() === '') {
      throw new DomainValidationError(`TargetApiContract.formRoutes.${k} must be a non-empty string`);
    }
  }

  if (!isJsonObject(data['functionRoutes'])) {
    throw new DomainValidationError('TargetApiContract.functionRoutes must be an object');
  }

  const fnr = data['functionRoutes'];
  const requiredFnKeys = ['executeFunction', 'createFunction', 'getAllFunction'];
  for (const k of requiredFnKeys) {
    if (typeof fnr[k] !== 'string' || (fnr[k] as string).trim() === '') {
      throw new DomainValidationError(`TargetApiContract.functionRoutes.${k} must be a non-empty string`);
    }
  }

  return {
    baseUrl: data['baseUrl'].trim(),
    formRoutes: {
      formGet: (fr['formGet'] as string).trim(),
      formCreate: (fr['formCreate'] as string).trim(),
      formUpdate: (fr['formUpdate'] as string).trim(),
      formDelete: (fr['formDelete'] as string).trim(),
      formBulkupload: (fr['formBulkupload'] as string).trim(),
      query: (fr['query'] as string).trim()
    },
    functionRoutes: {
      executeFunction: (fnr['executeFunction'] as string).trim(),
      createFunction: (fnr['createFunction'] as string).trim(),
      getAllFunction: (fnr['getAllFunction'] as string).trim()
    }
  };
}

/**
 * Validates BusinessRuleConstraint
 */
const VALID_CONSTRAINT_TYPES: Set<BusinessConstraintType> = new Set([
  'EXACT_DIGITS',
  'NOT_EMPTY',
  'GREATER_THAN',
  'LESS_THAN',
  'BETWEEN',
  'VALID_URL',
  'VALID_EMAIL',
  'ALLOWED_ENUM',
  'NON_NEGATIVE'
]);

export function validateBusinessRuleConstraint(data: unknown): BusinessRuleConstraint {
  if (!isJsonObject(data)) {
    throw new DomainValidationError('BusinessRuleConstraint must be an object');
  }

  if (typeof data['ruleId'] !== 'string' || data['ruleId'].trim() === '') {
    throw new DomainValidationError('BusinessRuleConstraint.ruleId must be a non-empty string');
  }

  if (typeof data['targetFieldOrEntity'] !== 'string' || data['targetFieldOrEntity'].trim() === '') {
    throw new DomainValidationError('BusinessRuleConstraint.targetFieldOrEntity must be a non-empty string');
  }

  const constraintType = data['constraintType'] as BusinessConstraintType;
  if (!VALID_CONSTRAINT_TYPES.has(constraintType)) {
    throw new DomainValidationError(`Invalid constraintType: '${data['constraintType']}'`);
  }

  if (!isJsonObject(data['parameters'])) {
    throw new DomainValidationError('BusinessRuleConstraint.parameters must be a JsonObject');
  }

  if (typeof data['reasoning'] !== 'string') {
    throw new DomainValidationError('BusinessRuleConstraint.reasoning must be a string');
  }

  return {
    ruleId: data['ruleId'].trim(),
    targetFieldOrEntity: data['targetFieldOrEntity'].trim(),
    constraintType,
    parameters: data['parameters'],
    reasoning: data['reasoning']
  };
}

/**
 * Validates CatalogEntry
 */
export function validateCatalogEntry(data: unknown): CatalogEntry {
  if (!isJsonObject(data)) {
    throw new DomainValidationError('CatalogEntry must be an object');
  }

  if (typeof data['testId'] !== 'string' || data['testId'].trim() === '') {
    throw new DomainValidationError('CatalogEntry.testId must be a non-empty string');
  }

  const validCategories = new Set(['CRUD', 'FIELD_VALIDATION', 'CUSTOM_FUNCTION', 'RELATIONSHIP', 'BUSINESS_RULE', 'REGISTRY', 'BULK_UPLOAD']);
  if (typeof data['category'] !== 'string' || !validCategories.has(data['category'])) {
    throw new DomainValidationError(`Invalid CatalogEntry.category: '${data['category']}'`);
  }

  if (typeof data['targetEntity'] !== 'string' || data['targetEntity'].trim() === '') {
    throw new DomainValidationError('CatalogEntry.targetEntity must be a non-empty string');
  }

  if (typeof data['description'] !== 'string') {
    throw new DomainValidationError('CatalogEntry.description must be a string');
  }

  const validSources = new Set(['MONGO_SCHEMA', 'FUNCTION_REGISTRY', 'BUSINESS_REQUIREMENT']);
  if (typeof data['source'] !== 'string' || !validSources.has(data['source'])) {
    throw new DomainValidationError(`Invalid CatalogEntry.source: '${data['source']}'`);
  }

  if (typeof data['sourceRef'] !== 'string') {
    throw new DomainValidationError('CatalogEntry.sourceRef must be a string');
  }

  if (typeof data['reasoning'] !== 'string') {
    throw new DomainValidationError('CatalogEntry.reasoning must be a string');
  }

  if (!isJsonObject(data['expectedResult'])) {
    throw new DomainValidationError('CatalogEntry.expectedResult must be an object');
  }
  const er = data['expectedResult'];
  if (typeof er['statusCode'] !== 'number') {
    throw new DomainValidationError('CatalogEntry.expectedResult.statusCode must be a number');
  }

  const validPriorities = new Set(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
  if (typeof data['priority'] !== 'string' || !validPriorities.has(data['priority'])) {
    throw new DomainValidationError(`Invalid CatalogEntry.priority: '${data['priority']}'`);
  }

  if (!Array.isArray(data['dependencies']) || !data['dependencies'].every(d => typeof d === 'string')) {
    throw new DomainValidationError('CatalogEntry.dependencies must be an array of strings');
  }

  if (!isJsonObject(data['payloadTemplate'])) {
    throw new DomainValidationError('CatalogEntry.payloadTemplate must be a JsonObject');
  }

  const validMethods = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
  if (typeof data['httpMethod'] !== 'string' || !validMethods.has(data['httpMethod'])) {
    throw new DomainValidationError(`Invalid CatalogEntry.httpMethod: '${data['httpMethod']}'`);
  }

  if (typeof data['targetRouteKey'] !== 'string' || data['targetRouteKey'].trim() === '') {
    throw new DomainValidationError('CatalogEntry.targetRouteKey must be a non-empty string');
  }

  if (typeof data['selected'] !== 'boolean') {
    throw new DomainValidationError('CatalogEntry.selected must be a boolean');
  }

  const entry: CatalogEntry = {
    testId: data['testId'].trim(),
    category: data['category'] as any,
    targetEntity: data['targetEntity'].trim(),
    description: data['description'],
    source: data['source'] as any,
    sourceRef: data['sourceRef'],
    reasoning: data['reasoning'],
    expectedResult: {
      statusCode: er['statusCode'] as number
    },
    priority: data['priority'] as any,
    dependencies: data['dependencies'] as string[],
    payloadTemplate: data['payloadTemplate'],
    httpMethod: data['httpMethod'] as any,
    targetRouteKey: data['targetRouteKey'] as any,
    selected: data['selected']
  };

  if ('responseBodySchema' in er && isJsonObject(er['responseBodySchema'])) {
    entry.expectedResult.responseBodySchema = er['responseBodySchema'];
  }
  if ('errorMessagePattern' in er && typeof er['errorMessagePattern'] === 'string') {
    entry.expectedResult.errorMessagePattern = er['errorMessagePattern'];
  }
  if ('customUrlPath' in data && typeof data['customUrlPath'] === 'string') {
    entry.customUrlPath = data['customUrlPath'];
  }

  return entry;
}

/**
 * Validates complete TestCatalog
 */
export function validateTestCatalog(data: unknown): TestCatalog {
  if (!isJsonObject(data)) {
    throw new DomainValidationError('TestCatalog must be an object');
  }

  if (typeof data['projectName'] !== 'string' || data['projectName'].trim() === '') {
    throw new DomainValidationError('TestCatalog.projectName must be a non-empty string');
  }

  if (typeof data['createdAt'] !== 'string' || data['createdAt'].trim() === '') {
    throw new DomainValidationError('TestCatalog.createdAt must be a non-empty string');
  }

  if (data['status'] !== 'DRAFT' && data['status'] !== 'APPROVED') {
    throw new DomainValidationError("TestCatalog.status must be 'DRAFT' or 'APPROVED'");
  }

  if (!Array.isArray(data['entries'])) {
    throw new DomainValidationError('TestCatalog.entries must be an array');
  }

  const entries = data['entries'].map((e, idx) => {
    try {
      return validateCatalogEntry(e);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new DomainValidationError(`Invalid CatalogEntry at index ${idx}: ${msg}`);
    }
  });

  return {
    projectName: data['projectName'].trim(),
    createdAt: data['createdAt'].trim(),
    status: data['status'],
    entries
  };
}
