import { describe, it } from 'node:test';
import assert from 'node:assert';

import {
  normalizeField,
  normalizeSchema,
  normalizeFunctionContext,
  normalizeSampleRecord
} from '../../src/context/contextNormalizer.js';

import {
  getMockProjectContext
} from '../../src/context/mockMongoContext.js';

import {
  MongoContextLoader,
  ContextLoaderError,
  sanitizeMongoUri
} from '../../src/context/contextLoader.js';

describe('Context Normalizer Subsystem', () => {
  it('should normalize FieldMetadata with standard and dynamic data types', () => {
    const rawField = {
      name: 'customSensorData',
      dataType: 'CustomTelemetryType', // Unknown/custom type preserved safely
      mandatoryField: true,
      inputType: 'sensor-input',
      mappedTableRef: 'telemetry_nodes',
      multipleSelect: true,
      defaultValue: { active: true },
      enum: ['T1', 'T2']
    };

    const { result, warnings } = normalizeField(rawField, 'testSchema');
    assert.strictEqual(warnings.length, 0);
    assert.ok(result);
    assert.strictEqual(result.name, 'customSensorData');
    assert.strictEqual(result.dataType, 'CustomTelemetryType');
    assert.strictEqual(result.mandatoryField, true);
    assert.strictEqual(result.inputType, 'sensor-input');
    assert.strictEqual(result.mappedTableRef, 'telemetry_nodes');
    assert.strictEqual(result.multipleSelect, true);
    assert.deepStrictEqual(result.defaultValue, { active: true });
    assert.deepStrictEqual(result.enum, ['T1', 'T2']);
  });

  it('should handle alternative field property names (type, required, isMulti, ref)', () => {
    const rawField = {
      name: 'productId',
      type: 'ObjectId',
      required: true,
      ref: 'products',
      isMulti: false
    };

    const { result } = normalizeField(rawField, 'testSchema');
    assert.ok(result);
    assert.strictEqual(result.name, 'productId');
    assert.strictEqual(result.dataType, 'ObjectId');
    assert.strictEqual(result.mandatoryField, true);
    assert.strictEqual(result.mappedTableRef, 'products');
    assert.strictEqual(result.multipleSelect, false);
  });

  it('should ignore malformed field documents and produce warnings', () => {
    const { result: r1, warnings: w1 } = normalizeField('invalid-string', 'testSchema');
    assert.strictEqual(r1, null);
    assert.ok(w1.length > 0);

    const { result: r2, warnings: w2 } = normalizeField({ name: '' }, 'testSchema');
    assert.strictEqual(r2, null);
    assert.ok(w2.length > 0);
  });

  it('should normalize active SchemaContext and filter inactive schemas', () => {
    const rawActive = {
      schemaName: 'products',
      active: true,
      fields: [
        { name: 'sku', dataType: 'String', mandatoryField: true, inputType: 'text' }
      ]
    };
    const { result: activeSchema } = normalizeSchema(rawActive);
    assert.ok(activeSchema);
    assert.strictEqual(activeSchema.schemaName, 'products');
    assert.strictEqual(activeSchema.fields.length, 1);

    const rawInactive = {
      schemaName: 'deprecated_items',
      active: false,
      fields: [{ name: 'oldId', dataType: 'String' }]
    };
    const { result: inactiveSchema, warnings } = normalizeSchema(rawInactive);
    assert.strictEqual(inactiveSchema, null);
    assert.ok(warnings.some(w => w.message.includes('inactive')));
  });

  it('should normalize structured FunctionContext with parameters and response fields', () => {
    const rawFn = {
      name: 'calculateTax',
      isActive: true,
      parameters: [
        { name: 'amount', type: 'number', isActive: true, required: true },
        { name: 'country', type: 'string', isActive: true, required: false }
      ],
      expectedResponseFields: [
        { name: 'taxAmount', type: 'number', required: true },
        { name: 'totalAmount', type: 'number', required: true }
      ]
    };

    const { result: fn } = normalizeFunctionContext(rawFn);
    assert.ok(fn);
    assert.strictEqual(fn.name, 'calculateTax');
    assert.strictEqual(fn.isActive, true);
    assert.strictEqual(fn.parameters.length, 2);
    assert.strictEqual(fn.parameters[0].name, 'amount');
    assert.strictEqual(fn.parameters[0].required, true);
    assert.strictEqual(fn.expectedResponseFields.length, 2);
    assert.strictEqual(fn.expectedResponseFields[0].name, 'taxAmount');
  });

  it('should normalize sample records and redact sensitive credential keys', () => {
    const rawRecord = {
      _id: '65d1a2b3c4d5e6f7a8b9c0d1',
      username: 'johndoe',
      password: 'SuperSecretPassword123',
      apiKey: 'xyz-secret-key-12345',
      createdDate: new Date('2026-08-23T12:00:00Z')
    };

    const sample = normalizeSampleRecord(rawRecord);
    assert.ok(sample);
    assert.strictEqual(sample['_id'], '65d1a2b3c4d5e6f7a8b9c0d1');
    assert.strictEqual(sample['username'], 'johndoe');
    assert.strictEqual(sample['password'], '[REDACTED]');
    assert.strictEqual(sample['apiKey'], '[REDACTED]');
    assert.strictEqual(sample['createdDate'], '2026-08-23T12:00:00.000Z');
  });
});

describe('Mock Mongo Context Adapter (`mockMongoContext.ts`)', () => {
  it('should generate a rich synthetic ProjectContext meeting all Task 3 criteria', () => {
    const ctx = getMockProjectContext('SyntheticDemoProject');

    assert.strictEqual(ctx.projectName, 'SyntheticDemoProject');
    assert.ok(ctx.schemas.length >= 2);

    const itemsSchema = ctx.schemas.find(s => s.schemaName === 'items');
    assert.ok(itemsSchema);

    // Verify multiple field types
    const types = new Set(itemsSchema.fields.map(f => f.dataType));
    assert.ok(types.has('String'));
    assert.ok(types.has('Number'));
    assert.ok(types.has('Array'));

    // Verify relationship
    const ordersSchema = ctx.schemas.find(s => s.schemaName === 'orders');
    assert.ok(ordersSchema);
    const relField = ordersSchema.fields.find(f => f.mappedTableRef === 'items');
    assert.ok(relField);

    // Verify multi-select field
    const multiField = itemsSchema.fields.find(f => f.multipleSelect === true);
    assert.ok(multiField);

    // Verify default value field
    const defaultField = itemsSchema.fields.find(f => f.defaultValue !== undefined);
    assert.ok(defaultField);

    // Verify enum field
    const enumField = itemsSchema.fields.find(f => f.enum && f.enum.length > 0);
    assert.ok(enumField);

    // Verify custom function with structured parameters and response fields
    assert.ok(ctx.functions.length >= 1);
    const fn = ctx.functions[0];
    assert.strictEqual(fn.name, 'calculateDiscount');
    assert.ok(fn.parameters.length >= 2);
    assert.ok(fn.expectedResponseFields.length >= 2);
  });
});

describe('MongoDB Context Loader Security & Diagnostics', () => {
  it('should sanitize credentials in MongoDB URIs', () => {
    const sensitiveUri = 'mongodb://user123:SecretPassWord99@db.example.com:27017/dbname';
    const sanitized = sanitizeMongoUri(sensitiveUri);

    assert.strictEqual(sanitized.includes('SecretPassWord99'), false);
    assert.strictEqual(sanitized.includes('user123'), false);
    assert.strictEqual(sanitized, 'mongodb://****:****@db.example.com:27017/dbname');
  });

  it('should throw ContextLoaderError when empty projectName is passed', async () => {
    const loader = new MongoContextLoader();
    await assert.rejects(async () => {
      await loader.loadProjectContext('');
    }, ContextLoaderError);
  });

  it('should throw actionable error when MongoDB is unreachable', async () => {
    const loader = new MongoContextLoader({
      mongodbUri: 'mongodb://127.0.0.1:1', // Invalid port to force fast connection error
      timeoutMs: 100
    });

    await assert.rejects(async () => {
      await loader.connect();
    }, ContextLoaderError);
  });
});
