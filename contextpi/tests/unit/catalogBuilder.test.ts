import { describe, it } from 'node:test';
import assert from 'node:assert';

import { getMockProjectContext } from '../../src/context/mockMongoContext.js';
import { evaluateAllRules } from '../../src/rules/index.js';
import {
  buildTestCatalog,
  generateStableTestId,
  deduplicateIntents,
  sortEntriesByDependencyOrder,
  validateDependencyGraph
} from '../../src/catalogue/catalogBuilder.js';
import { CatalogEntry } from '../../src/types/catalogue.js';
import { TestIntent } from '../../src/rules/intentModel.js';

describe('Test Catalog Builder Subsystem', () => {
  it('should build a valid TestCatalog with all 10 metadata fields per entry', async () => {
    const ctx = getMockProjectContext('CatalogBuilderProject');
    const { intents } = await evaluateAllRules(ctx);

    const catalog = buildTestCatalog(ctx, intents);

    assert.strictEqual(catalog.projectName, 'CatalogBuilderProject');
    assert.strictEqual(catalog.status, 'DRAFT');
    assert.ok(catalog.entries.length > 20);

    for (const entry of catalog.entries) {
      // Verify 10-Point Traceability fields
      assert.ok(typeof entry.testId === 'string' && entry.testId.startsWith('TC-'));
      assert.ok(
        ['CRUD', 'FIELD_VALIDATION', 'CUSTOM_FUNCTION', 'RELATIONSHIP', 'BUSINESS_RULE', 'REGISTRY', 'BULK_UPLOAD'].includes(
          entry.category
        )
      );
      assert.ok(typeof entry.targetEntity === 'string' && entry.targetEntity.length > 0);
      assert.ok(typeof entry.description === 'string' && entry.description.length > 0);
      assert.ok(['MONGO_SCHEMA', 'FUNCTION_REGISTRY', 'BUSINESS_REQUIREMENT'].includes(entry.source));
      assert.ok(typeof entry.sourceRef === 'string' && entry.sourceRef.length > 0);
      assert.ok(typeof entry.reasoning === 'string' && entry.reasoning.length > 0);
      assert.ok(typeof entry.expectedResult.statusCode === 'number');
      assert.ok(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(entry.priority));
      assert.ok(Array.isArray(entry.dependencies));

      // Execution metadata & selection state
      assert.ok(typeof entry.payloadTemplate === 'object');
      assert.ok(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(entry.httpMethod));
      assert.ok(typeof entry.targetRouteKey === 'string');
      assert.strictEqual(entry.selected, true);
    }
  });

  it('should generate stable, unique, readable Test IDs deterministically', () => {
    const id1 = generateStableTestId('items', 'CRUD', 1);
    const id2 = generateStableTestId('items', 'CRUD', 2);
    const id3 = generateStableTestId('orders', 'RELATIONSHIP', 1);
    const id4 = generateStableTestId('calculateDiscount', 'CUSTOM_FUNCTION', 1);

    assert.strictEqual(id1, 'TC-ITEMS-CRUD-001');
    assert.strictEqual(id2, 'TC-ITEMS-CRUD-002');
    assert.strictEqual(id3, 'TC-ORDERS-REL-001');
    assert.strictEqual(id4, 'TC-CALCULATEDISCOUNT-FUNC-001');
  });

  it('should deduplicate identical overlapping test intents', () => {
    const baseIntent: TestIntent = {
      intentId: 'INT-001',
      category: 'CRUD',
      targetEntity: 'items',
      description: 'Create items',
      source: 'MONGO_SCHEMA',
      sourceRef: 'items',
      reasoning: 'Create test',
      expectedResult: { statusCode: 201 },
      priority: 'CRITICAL',
      dependencies: [],
      payloadTemplate: { code: '123' },
      httpMethod: 'POST',
      targetRouteKey: 'formCreate'
    };

    const duplicateIntent: TestIntent = { ...baseIntent, intentId: 'INT-002' };
    const distinctIntent: TestIntent = {
      ...baseIntent,
      intentId: 'INT-003',
      expectedResult: { statusCode: 400 }
    };

    const rawIntents = [baseIntent, duplicateIntent, distinctIntent];
    const deduplicated = deduplicateIntents(rawIntents);

    assert.strictEqual(deduplicated.length, 2);
    assert.strictEqual(deduplicated[0].intentId, 'INT-001');
    assert.strictEqual(deduplicated[1].intentId, 'INT-003');
  });

  it('should preserve dependencies and topologically sort entries by dependency graph', () => {
    const entries: CatalogEntry[] = [
      {
        testId: 'TC-ITEMS-CRUD-002',
        category: 'CRUD',
        targetEntity: 'items',
        description: 'Read Item by ID',
        source: 'MONGO_SCHEMA',
        sourceRef: 'items',
        reasoning: 'Read test',
        expectedResult: { statusCode: 200 },
        priority: 'HIGH',
        dependencies: ['TC-ITEMS-CRUD-001'],
        payloadTemplate: {},
        httpMethod: 'POST',
        targetRouteKey: 'formGet',
        selected: true
      },
      {
        testId: 'TC-ITEMS-CRUD-001',
        category: 'CRUD',
        targetEntity: 'items',
        description: 'Create Item',
        source: 'MONGO_SCHEMA',
        sourceRef: 'items',
        reasoning: 'Create test',
        expectedResult: { statusCode: 201 },
        priority: 'CRITICAL',
        dependencies: [],
        payloadTemplate: { itemCode: 'ITM-1' },
        httpMethod: 'POST',
        targetRouteKey: 'formCreate',
        selected: true
      }
    ];

    const sorted = sortEntriesByDependencyOrder(entries);

    assert.strictEqual(sorted.length, 2);
    assert.strictEqual(sorted[0].testId, 'TC-ITEMS-CRUD-001');
    assert.strictEqual(sorted[1].testId, 'TC-ITEMS-CRUD-002');
  });

  it('should detect missing dependencies and self dependencies', () => {
    const selfDepEntry: CatalogEntry[] = [
      {
        testId: 'TC-ITEMS-CRUD-001',
        category: 'CRUD',
        targetEntity: 'items',
        description: 'Create Item',
        source: 'MONGO_SCHEMA',
        sourceRef: 'items',
        reasoning: 'Create test',
        expectedResult: { statusCode: 201 },
        priority: 'CRITICAL',
        dependencies: ['TC-ITEMS-CRUD-001'], // Self dep
        payloadTemplate: {},
        httpMethod: 'POST',
        targetRouteKey: 'formCreate',
        selected: true
      }
    ];

    assert.throws(() => validateDependencyGraph(selfDepEntry), /Self dependency detected/);

    const missingDepEntry: CatalogEntry[] = [
      {
        testId: 'TC-ITEMS-CRUD-002',
        category: 'CRUD',
        targetEntity: 'items',
        description: 'Update Item',
        source: 'MONGO_SCHEMA',
        sourceRef: 'items',
        reasoning: 'Update test',
        expectedResult: { statusCode: 200 },
        priority: 'HIGH',
        dependencies: ['TC-NONEXISTENT-001'], // Missing dep
        payloadTemplate: {},
        httpMethod: 'POST',
        targetRouteKey: 'formUpdate',
        selected: true
      }
    ];

    assert.throws(() => validateDependencyGraph(missingDepEntry), /references non-existent dependency/);
  });

  it('should throw error when circular dependencies exist in catalog entries', () => {
    const cycleEntries: CatalogEntry[] = [
      {
        testId: 'TC-ITEMS-CRUD-001',
        category: 'CRUD',
        targetEntity: 'items',
        description: 'Test A',
        source: 'MONGO_SCHEMA',
        sourceRef: 'items',
        reasoning: 'A',
        expectedResult: { statusCode: 200 },
        priority: 'HIGH',
        dependencies: ['TC-ITEMS-CRUD-002'],
        payloadTemplate: {},
        httpMethod: 'POST',
        targetRouteKey: 'formGet',
        selected: true
      },
      {
        testId: 'TC-ITEMS-CRUD-002',
        category: 'CRUD',
        targetEntity: 'items',
        description: 'Test B',
        source: 'MONGO_SCHEMA',
        sourceRef: 'items',
        reasoning: 'B',
        expectedResult: { statusCode: 200 },
        priority: 'HIGH',
        dependencies: ['TC-ITEMS-CRUD-001'], // Cycle: A -> B -> A
        payloadTemplate: {},
        httpMethod: 'POST',
        targetRouteKey: 'formGet',
        selected: true
      }
    ];

    assert.throws(() => validateDependencyGraph(cycleEntries), /Circular dependency detected/);
  });
});
