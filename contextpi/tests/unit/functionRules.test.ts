import { describe, it } from 'node:test';
import assert from 'node:assert';

import { getMockProjectContext } from '../../src/context/mockMongoContext.js';
import { evaluateFunctionRules } from '../../src/rules/functionRules.js';

describe('Custom Function Rule Engine Subsystem', () => {
  it('should generate structured intents for function happy path, missing param, unknown fn, response schema assertions, project mismatch, and registry lifecycle', () => {
    const ctx = getMockProjectContext('FunctionTestProject');
    const intents = evaluateFunctionRules(ctx);

    // Happy Path
    const happy = intents.find(i => i.description.includes("Execute 'calculateDiscount' - Happy Path"));
    assert.ok(happy);
    assert.strictEqual(happy.targetRouteKey, 'executeFunction');

    // Missing Required Parameter
    const missingParam = intents.find(i => i.description.includes("Missing Required Parameter 'itemCode'"));
    assert.ok(missingParam);
    assert.strictEqual(missingParam.expectedResult.statusCode, 400);

    // Unknown Function
    const unknownFn = intents.find(i => i.description.includes("Target Unknown Function Route"));
    assert.ok(unknownFn);
    assert.strictEqual(unknownFn.expectedResult.statusCode, 404);

    // Response Schema Assertions
    const respAssert = intents.find(i => i.description.includes("Assert Response Schema for 'calculateDiscount'"));
    assert.ok(respAssert);
    assert.ok(respAssert.expectedResult.responseBodySchema);
    assert.ok(respAssert.dependencies.includes(happy.intentId));

    // Project Mismatch
    const projMismatch = intents.find(i => i.description.includes("Invalid Project Context"));
    assert.ok(projMismatch);
    assert.strictEqual(projMismatch.expectedResult.statusCode, 403);

    // Function Registry Lifecycle
    assert.ok(intents.some(i => i.description.includes("Create Custom Function")));
    assert.ok(intents.some(i => i.description.includes("Reject Duplicate Registration")));
    assert.ok(intents.some(i => i.description.includes("List All Functions")));
  });
});
