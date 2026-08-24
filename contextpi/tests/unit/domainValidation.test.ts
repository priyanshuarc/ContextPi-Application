import { describe, it } from 'node:test';
import assert from 'node:assert';

import {
  isJsonPrimitive,
  isJsonObject,
  isJsonArray,
  isJsonValue
} from '../../src/types/json.js';

import {
  DEFAULT_PS10_CONTRACT
} from '../../src/types/contract.ts';

import {
  validateFieldMetadata,
  validateSchemaContext,
  validateFunctionParameter,
  validateFunctionResponseField,
  validateFunctionContext,
  validateProjectContext,
  validateTargetApiContract,
  validateBusinessRuleConstraint,
  validateCatalogEntry,
  validateTestCatalog,
  DomainValidationError
} from '../../src/types/validation.js';

describe('Strict JSON Types & Guards', () => {
  it('should correctly identify JsonPrimitives', () => {
    assert.strictEqual(isJsonPrimitive('hello'), true);
    assert.strictEqual(isJsonPrimitive(42), true);
    assert.strictEqual(isJsonPrimitive(true), true);
    assert.strictEqual(isJsonPrimitive(null), true);
    assert.strictEqual(isJsonPrimitive(undefined), false);
    assert.strictEqual(isJsonPrimitive({}), false);
  });

  it('should correctly identify JsonObject and JsonArray', () => {
    assert.strictEqual(isJsonObject({ a: 1 }), true);
    assert.strictEqual(isJsonObject([]), false);
    assert.strictEqual(isJsonObject(null), false);

    assert.strictEqual(isJsonArray([1, 'a', true]), true);
    assert.strictEqual(isJsonArray({}), false);
  });

  it('should recursively validate complex JsonValue structures', () => {
    const validJson = {
      name: 'Item',
      count: 10,
      tags: ['electronics', 'gadget'],
      nested: {
        active: true,
        extra: null
      }
    };
    assert.strictEqual(isJsonValue(validJson), true);

    const invalidJson = {
      func: () => {}
    };
    assert.strictEqual(isJsonValue(invalidJson), false);
  });
});

describe('Domain Model Runtime Validators', () => {
  it('should validate valid FieldMetadata', () => {
    const raw = {
      name: 'sku',
      dataType: 'String',
      mandatoryField: true,
      inputType: 'text',
      defaultValue: 'DEFAULT_SKU',
      enum: ['SKU1', 'SKU2']
    };
    const validated = validateFieldMetadata(raw);
    assert.strictEqual(validated.name, 'sku');
    assert.strictEqual(validated.dataType, 'String');
    assert.strictEqual(validated.mandatoryField, true);
    assert.strictEqual(validated.inputType, 'text');
    assert.strictEqual(validated.defaultValue, 'DEFAULT_SKU');
    assert.deepStrictEqual(validated.enum, ['SKU1', 'SKU2']);
  });

  it('should throw DomainValidationError for invalid FieldMetadata', () => {
    assert.throws(() => {
      validateFieldMetadata({ name: '', dataType: 'String', mandatoryField: true, inputType: 'text' });
    }, DomainValidationError);

    assert.throws(() => {
      validateFieldMetadata({ name: 'price', dataType: 'Number', mandatoryField: 'yes', inputType: 'number' });
    }, DomainValidationError);
  });

  it('should validate valid SchemaContext', () => {
    const rawSchema = {
      schemaName: 'products',
      active: true,
      fields: [
        { name: 'name', dataType: 'String', mandatoryField: true, inputType: 'text' },
        { name: 'price', dataType: 'Number', mandatoryField: true, inputType: 'number' }
      ],
      sampleRecord: { name: 'Sample Product', price: 99.99 }
    };
    const validated = validateSchemaContext(rawSchema);
    assert.strictEqual(validated.schemaName, 'products');
    assert.strictEqual(validated.active, true);
    assert.strictEqual(validated.fields.length, 2);
    assert.strictEqual(validated.sampleRecord?.name, 'Sample Product');
  });

  it('should validate FunctionParameter & FunctionResponseField', () => {
    const rawParam = { name: 'productId', type: 'string', isActive: true, required: true };
    const validatedParam = validateFunctionParameter(rawParam);
    assert.strictEqual(validatedParam.name, 'productId');
    assert.strictEqual(validatedParam.required, true);

    const rawResp = { name: 'discountedPrice', type: 'number', required: true };
    const validatedResp = validateFunctionResponseField(rawResp);
    assert.strictEqual(validatedResp.name, 'discountedPrice');
    assert.strictEqual(validatedResp.type, 'number');
  });

  it('should validate FunctionContext', () => {
    const rawFunction = {
      name: 'calculateDiscount',
      isActive: true,
      parameters: [
        { name: 'productId', type: 'string', isActive: true, required: true },
        { name: 'discountPct', type: 'number', isActive: true, required: false }
      ],
      expectedResponseFields: [
        { name: 'discountedPrice', type: 'number', required: true },
        { name: 'status', type: 'string', required: true }
      ]
    };

    const validated = validateFunctionContext(rawFunction);
    assert.strictEqual(validated.name, 'calculateDiscount');
    assert.strictEqual(validated.parameters.length, 2);
    assert.strictEqual(validated.expectedResponseFields.length, 2);
  });

  it('should validate complete ProjectContext', () => {
    const rawProject = {
      projectName: 'NexaSupply',
      schemas: [
        {
          schemaName: 'products',
          active: true,
          fields: [{ name: 'sku', dataType: 'String', mandatoryField: true, inputType: 'text' }]
        }
      ],
      functions: [
        {
          name: 'checkStock',
          isActive: true,
          parameters: [],
          expectedResponseFields: []
        }
      ],
      requirement: 'price must be non-negative',
      sampleData: {
        products: [{ sku: 'SKU00001' }]
      }
    };

    const validated = validateProjectContext(rawProject);
    assert.strictEqual(validated.projectName, 'NexaSupply');
    assert.strictEqual(validated.schemas.length, 1);
    assert.strictEqual(validated.functions.length, 1);
    assert.strictEqual(validated.sampleData?.['products']?.[0]?.['sku'], 'SKU00001');
  });

  it('should validate TargetApiContract including default PS10 contract', () => {
    const validated = validateTargetApiContract(DEFAULT_PS10_CONTRACT);
    assert.strictEqual(validated.baseUrl, 'http://localhost:3000');
    assert.strictEqual(validated.formRoutes.formCreate, '/forms/formCreate');
    assert.strictEqual(validated.functionRoutes.executeFunction, '/function/:name');
  });

  it('should validate BusinessRuleConstraint with valid constraint types', () => {
    const rawConstraint = {
      ruleId: 'RULE-001',
      targetFieldOrEntity: 'price',
      constraintType: 'NON_NEGATIVE',
      parameters: { min: 0 },
      reasoning: 'Price cannot be below zero'
    };

    const validated = validateBusinessRuleConstraint(rawConstraint);
    assert.strictEqual(validated.ruleId, 'RULE-001');
    assert.strictEqual(validated.constraintType, 'NON_NEGATIVE');
  });

  it('should validate CatalogEntry & TestCatalog with draft/approval status', () => {
    const rawEntry = {
      testId: 'TC-PROD-001',
      category: 'CRUD',
      targetEntity: 'products',
      description: 'Create Product Happy Path',
      source: 'MONGO_SCHEMA',
      sourceRef: 'products',
      reasoning: 'Verify entity creation',
      expectedResult: { statusCode: 201 },
      priority: 'CRITICAL',
      dependencies: [],
      payloadTemplate: { sku: 'PROD1234', name: 'Widget' },
      httpMethod: 'POST',
      targetRouteKey: 'formCreate',
      selected: true
    };

    const rawCatalog = {
      projectName: 'NexaSupply',
      createdAt: new Date().toISOString(),
      status: 'APPROVED',
      entries: [rawEntry]
    };

    const validatedCatalog = validateTestCatalog(rawCatalog);
    assert.strictEqual(validatedCatalog.projectName, 'NexaSupply');
    assert.strictEqual(validatedCatalog.status, 'APPROVED');
    assert.strictEqual(validatedCatalog.entries.length, 1);
    assert.strictEqual(validatedCatalog.entries[0].selected, true);
    assert.strictEqual(validatedCatalog.entries[0].targetRouteKey, 'formCreate');
  });
});
