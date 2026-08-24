import { describe, it } from 'node:test';
import assert from 'node:assert';

import { getMockProjectContext } from '../../src/context/mockMongoContext.js';
import { evaluateRelationshipRules } from '../../src/rules/relationshipRules.js';
import { ProjectContext } from '../../src/types/context.js';

describe('Relationship Rule Engine Subsystem', () => {
  it('should generate valid reference and nonexistent reference test intents for mappedTableRef', () => {
    const ctx = getMockProjectContext('RelationshipTestProject');
    const intents = evaluateRelationshipRules(ctx);

    const validRef = intents.find(i => i.description.includes("Valid Reference 'itemId' -> 'items'"));
    assert.ok(validRef);
    assert.strictEqual(validRef.expectedResult.statusCode, 201);

    const invalidRef = intents.find(i => i.description.includes("Non-existent Reference 'itemId' -> 'items'"));
    assert.ok(invalidRef);
    assert.strictEqual(invalidRef.expectedResult.statusCode, 400);
  });

  it('should produce a diagnostic intent and NOT invent false tests if referenced schema is missing from ProjectContext', () => {
    const missingRefCtx: ProjectContext = {
      projectName: 'MissingRefApp',
      schemas: [
        {
          schemaName: 'orders',
          active: true,
          fields: [
            {
              name: 'missingEntityId',
              dataType: 'ObjectId',
              mandatoryField: true,
              inputType: 'text',
              mappedTableRef: 'nonExistentTargetEntity'
            }
          ]
        }
      ],
      functions: []
    };

    const intents = evaluateRelationshipRules(missingRefCtx);
    assert.strictEqual(intents.length, 1);
    const diag = intents[0];
    assert.ok(diag.description.includes("Unresolved Reference 'nonExistentTargetEntity'"));
    assert.strictEqual(diag.metadata?.isDiagnostic, true);
    assert.strictEqual(diag.metadata?.unresolvedTargetEntity, 'nonExistentTargetEntity');
  });
});
