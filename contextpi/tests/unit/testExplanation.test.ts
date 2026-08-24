import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateTestExplanation } from '../../client/src/utils/testExplanationGenerator.js';
import { CatalogEntry, ProjectContext } from '../../client/src/types/api.js';

describe('Deterministic Test Explanation Generator', () => {
  it('should generate structured explanation metadata for CRUD catalog entry', () => {
    const entry: CatalogEntry = {
      testId: 'TC-ITEMS-CRUD-001',
      category: 'CRUD',
      targetEntity: 'Item',
      description: 'Create item happy path',
      source: 'MONGO_SCHEMA',
      sourceRef: 'Item',
      reasoning: 'Core CRUD validation for entity Item',
      expectedResult: { statusCode: 201 },
      priority: 'HIGH',
      dependencies: [],
      httpMethod: 'POST',
      targetRouteKey: 'formCreate',
      payloadTemplate: { itemCode: 'ITM-100', price: 150 }
    };

    const context: ProjectContext = {
      projectName: 'TestSystem',
      schemas: [
        {
          schemaName: 'Item',
          fields: [
            { name: 'itemCode', dataType: 'String', inputType: 'text', mandatoryField: true, required: true },
            { name: 'price', dataType: 'Number', inputType: 'number', mandatoryField: true, required: true }
          ]
        }
      ]
    };

    const explanation = generateTestExplanation(entry, context);

    assert.strictEqual(explanation.testId, 'TC-ITEMS-CRUD-001');
    assert.strictEqual(explanation.category, 'CRUD');
    assert.strictEqual(explanation.targetEntity, 'Item');
    assert.ok(explanation.whatTestDoes.includes('Executes Playwright HTTP POST request'));
    assert.ok(explanation.whyTestExists.includes('Discovered dynamically from target MongoDB metadata'));
    assert.strictEqual(explanation.expectedStatus, 201);
    assert.strictEqual(explanation.relatedFields.length, 2);
    assert.strictEqual(explanation.relatedFields[0].name, 'itemCode');
  });

  it('should generate explanation for custom function test entry without schema context', () => {
    const entry: CatalogEntry = {
      testId: 'TC-FN-CALCDISC-001',
      category: 'CUSTOM_FUNCTION',
      targetEntity: 'calculateDiscount',
      description: 'Execute custom function discount logic',
      source: 'FUNCTION_REGISTRY',
      sourceRef: 'calculateDiscount',
      reasoning: 'Custom function availability',
      expectedResult: { statusCode: 200 },
      priority: 'CRITICAL',
      dependencies: [],
      httpMethod: 'POST',
      targetRouteKey: 'executeFunction',
      payloadTemplate: { orderAmount: 500 }
    };

    const explanation = generateTestExplanation(entry, null);

    assert.strictEqual(explanation.testId, 'TC-FN-CALCDISC-001');
    assert.strictEqual(explanation.category, 'CUSTOM_FUNCTION');
    assert.strictEqual(explanation.route, '/api/functions/calculateDiscount');
    assert.ok(explanation.whatTestDoes.includes('Executes custom function API endpoint'));
  });
});
