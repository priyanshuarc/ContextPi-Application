import { describe, it } from 'node:test';
import assert from 'node:assert';

import { evaluateAllRules } from '../../src/rules/index.js';
import { getMockProjectContext } from '../../src/context/mockMongoContext.js';
import { ProjectContext } from '../../src/types/context.js';

describe('Combined Rule Engine Pipeline Integration Test', () => {
  it('should run full rule engine pipeline and produce combined CRUD, field, relationship, function, and business rule intents', async () => {
    const ctx = getMockProjectContext('CombinedPipelineProject');
    const { intents, diagnostics } = await evaluateAllRules(ctx);

    assert.strictEqual(diagnostics.length, 0);
    assert.ok(intents.length > 20);

    const categories = new Set(intents.map(i => i.category));
    assert.ok(categories.has('CRUD'));
    assert.ok(categories.has('FIELD_VALIDATION'));
    assert.ok(categories.has('RELATIONSHIP'));
    assert.ok(categories.has('CUSTOM_FUNCTION'));
    assert.ok(categories.has('BUSINESS_RULE'));
    assert.ok(categories.has('REGISTRY'));
  });

  it('APPLICATION-AGNOSTICISM TEST: Process TWO distinct synthetic domains with zero code changes', async () => {
    // Synthetic Domain A: Inventory & Supply Chain (items, orders)
    const appA: ProjectContext = {
      projectName: 'SyntheticAppA_Inventory',
      schemas: [
        {
          schemaName: 'inventoryItems',
          active: true,
          fields: [
            { name: 'skuCode', dataType: 'String', mandatoryField: true, inputType: 'text' },
            { name: 'unitPrice', dataType: 'Number', mandatoryField: true, inputType: 'number' },
            { name: 'categories', dataType: 'Array', mandatoryField: false, inputType: 'multiselect', multipleSelect: true }
          ]
        },
        {
          schemaName: 'purchaseOrders',
          active: true,
          fields: [
            { name: 'poNumber', dataType: 'String', mandatoryField: true, inputType: 'text' },
            { name: 'itemId', dataType: 'ObjectId', mandatoryField: true, inputType: 'text', mappedTableRef: 'inventoryItems' }
          ]
        }
      ],
      functions: [
        {
          name: 'reorderStock',
          isActive: true,
          parameters: [{ name: 'skuCode', type: 'string', isActive: true, required: true }],
          expectedResponseFields: [{ name: 'confirmationId', type: 'string', required: true }]
        }
      ],
      requirement: 'unitPrice must be non-negative; skuCode must be length 8 digits'
    };

    // Synthetic Domain B: Education System (students, courses, enrollments)
    const appB: ProjectContext = {
      projectName: 'SyntheticAppB_Education',
      schemas: [
        {
          schemaName: 'students',
          active: true,
          fields: [
            { name: 'studentId', dataType: 'String', mandatoryField: true, inputType: 'text' },
            { name: 'email', dataType: 'String', mandatoryField: true, inputType: 'email' },
            { name: 'age', dataType: 'Number', mandatoryField: false, inputType: 'number' }
          ]
        },
        {
          schemaName: 'courses',
          active: true,
          fields: [
            { name: 'courseCode', dataType: 'String', mandatoryField: true, inputType: 'text' },
            { name: 'courseTitle', dataType: 'String', mandatoryField: true, inputType: 'text' }
          ]
        },
        {
          schemaName: 'enrollments',
          active: true,
          fields: [
            { name: 'enrollmentId', dataType: 'String', mandatoryField: true, inputType: 'text' },
            { name: 'studentRef', dataType: 'ObjectId', mandatoryField: true, inputType: 'text', mappedTableRef: 'students' },
            { name: 'courseRef', dataType: 'ObjectId', mandatoryField: true, inputType: 'text', mappedTableRef: 'courses' }
          ]
        }
      ],
      functions: [
        {
          name: 'calculateGpa',
          isActive: true,
          parameters: [{ name: 'studentId', type: 'string', isActive: true, required: true }],
          expectedResponseFields: [{ name: 'gpa', type: 'number', required: true }]
        }
      ],
      requirement: 'studentId length 8 digits; age must be greater than 16'
    };

    const resultA = await evaluateAllRules(appA);
    const resultB = await evaluateAllRules(appB);

    assert.ok(resultA.intents.length > 0);
    assert.ok(resultB.intents.length > 0);

    // Verify App A targets inventoryItems and purchaseOrders
    assert.ok(resultA.intents.some(i => i.targetEntity === 'inventoryItems'));
    assert.ok(resultA.intents.some(i => i.targetEntity === 'purchaseOrders'));
    assert.ok(resultA.intents.some(i => i.targetEntity === 'reorderStock'));

    // Verify App B targets students, courses, and enrollments
    assert.ok(resultB.intents.some(i => i.targetEntity === 'students'));
    assert.ok(resultB.intents.some(i => i.targetEntity === 'courses'));
    assert.ok(resultB.intents.some(i => i.targetEntity === 'enrollments'));
    assert.ok(resultB.intents.some(i => i.targetEntity === 'calculateGpa'));

    // Zero NexaSupply references in any output
    const jsonA = JSON.stringify(resultA);
    const jsonB = JSON.stringify(resultB);
    assert.strictEqual(jsonA.includes('NexaSupply'), false);
    assert.strictEqual(jsonB.includes('NexaSupply'), false);
  });

  it('DETERMINISM TEST: Identical input must produce 100% identical intent IDs and content', async () => {
    const ctx = getMockProjectContext('DeterminismProject');

    const run1 = await evaluateAllRules(ctx);
    const run2 = await evaluateAllRules(ctx);

    assert.strictEqual(run1.intents.length, run2.intents.length);
    assert.deepStrictEqual(run1.intents, run2.intents);

    const ids1 = run1.intents.map(i => i.intentId);
    const ids2 = run2.intents.map(i => i.intentId);
    assert.deepStrictEqual(ids1, ids2);
  });
});
