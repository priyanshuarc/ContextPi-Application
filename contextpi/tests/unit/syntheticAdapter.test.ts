import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { SyntheticTargetAdapter } from '../../src/adapter/syntheticTargetAdapter.js';
import { ProjectContext } from '../../src/types/context.js';

describe('Synthetic Target Application Adapter Unit Tests', () => {
  let adapter: SyntheticTargetAdapter;
  const mockContext: ProjectContext = {
    projectName: 'SyntheticApp',
    projectVersion: '1.0.0',
    discoveredAt: new Date().toISOString(),
    mongoUri: 'mongodb://mock',
    databaseName: 'mock_db',
    isAdapterMode: true,
    schemas: [
      {
        schemaName: 'items',
        collectionName: 'items',
        fields: [
          { name: 'itemCode', dataType: 'string', mandatoryField: true, rules: 'Required unique' },
          { name: 'price', dataType: 'number', mandatoryField: true, rules: 'Positive number' },
          { name: 'status', dataType: 'string', mandatoryField: false, enum: ['ACTIVE', 'INACTIVE'] }
        ]
      }
    ],
    functions: [
      {
        name: 'calculateDiscount',
        isActive: true,
        parameters: [{ name: 'amount', type: 'number', required: true, isActive: true }],
        expectedResponseFields: [{ name: 'discountAmount', type: 'number', required: true }]
      }
    ],
    relationships: [],
    businessRules: [],
    sampleData: {
      items: [{ id: 'item_001', itemCode: 'ITEM-1', price: 99.99, status: 'ACTIVE' }]
    }
  };

  before(async () => {
    adapter = new SyntheticTargetAdapter(mockContext);
  });

  it('should initialize and seed records from ProjectContext sample data', () => {
    const stats = adapter.getStats();
    assert.strictEqual(stats.seededEntitiesCount, 1);
    assert.strictEqual(adapter.getDefaultReferencedId('items'), 'item_001');
  });

  it('should handle POST create request and return HTTP 201 for valid payload', () => {
    const res = adapter.handleRequest('POST', '/api/forms/items', {}, {
      itemCode: 'ITEM-2',
      price: 150.00,
      status: 'ACTIVE'
    });
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.id);
  });

  it('should return HTTP 400 when mandatory field is missing', () => {
    const res = adapter.handleRequest('POST', '/api/forms/items', {}, {
      price: 150.00
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error, 'MISSING_MANDATORY_FIELD');
  });

  it('should return HTTP 400 when primitive data type is invalid', () => {
    const res = adapter.handleRequest('POST', '/api/forms/items', {}, {
      itemCode: 'ITEM-3',
      price: 'invalid_number_string'
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.error, 'INVALID_FIELD_TYPE');
  });

  it('should return HTTP 404 for unknown entity routes', () => {
    const res = adapter.handleRequest('POST', '/api/forms/non_existent_entity', {}, {});
    assert.strictEqual(res.statusCode, 404);
  });

  it('should handle GET read request for existing seeded record', () => {
    const res = adapter.handleRequest('GET', '/api/forms/items/item_001', {}, {});
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.itemCode, 'ITEM-1');
  });

  it('should handle DELETE request for existing record', () => {
    const res = adapter.handleRequest('DELETE', '/api/forms/items/item_001', {}, {});
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('should execute custom function and return HTTP 200', () => {
    const res = adapter.handleRequest('POST', '/api/functions/calculateDiscount', {}, { amount: 500 });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.functionName, 'calculateDiscount');
  });

  it('should start and stop local HTTP server cleanly', async () => {
    const url = await adapter.start(0);
    assert.ok(url.startsWith('http://127.0.0.1:'));
    await adapter.stop();
  });
});
