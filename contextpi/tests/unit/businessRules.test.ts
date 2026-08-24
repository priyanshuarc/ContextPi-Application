import { describe, it } from 'node:test';
import assert from 'node:assert';

import { getMockProjectContext } from '../../src/context/mockMongoContext.js';
import { DeterministicBusinessRuleAnalyzer } from '../../src/rules/analyzers/DeterministicBusinessRuleAnalyzer.js';
import { generateBusinessRuleIntents } from '../../src/rules/businessRules.js';

describe('Business Rule Analyzer & Intent Generator Subsystem', () => {
  it('should parse deterministic business rules into BusinessRuleConstraints', async () => {
    const ctx = getMockProjectContext('BusinessTestProject');
    const analyzer = new DeterministicBusinessRuleAnalyzer();

    const rawReq = `
      price must be non-negative;
      price must be greater than 0;
      price must be less than 10000;
      itemCode must be length 8 digits;
      supplierWebsite must be a valid URL;
      customerEmail must be a valid email;
      stockQuantity must be between 0 and 500;
      itemName must not be empty;
    `;

    const { constraints, diagnostics } = await analyzer.analyzeRequirements(rawReq, ctx);

    assert.strictEqual(diagnostics.length, 0);
    assert.ok(constraints.some(c => c.constraintType === 'NON_NEGATIVE'));
    assert.ok(constraints.some(c => c.constraintType === 'GREATER_THAN'));
    assert.ok(constraints.some(c => c.constraintType === 'LESS_THAN'));
    assert.ok(constraints.some(c => c.constraintType === 'EXACT_DIGITS'));
    assert.ok(constraints.some(c => c.constraintType === 'VALID_URL'));
    assert.ok(constraints.some(c => c.constraintType === 'VALID_EMAIL'));
    assert.ok(constraints.some(c => c.constraintType === 'BETWEEN'));
    assert.ok(constraints.some(c => c.constraintType === 'NOT_EMPTY'));
  });

  it('should emit diagnostic warnings when requirement references unknown field/entity or is ambiguous', async () => {
    const ctx = getMockProjectContext('DiagnosticTestProject');
    const analyzer = new DeterministicBusinessRuleAnalyzer();

    const rawReq = `
      nonExistentUnknownField must be greater than 100;
      price should be fuzzy and nice;
    `;

    const { constraints, diagnostics } = await analyzer.analyzeRequirements(rawReq, ctx);
    assert.strictEqual(constraints.length, 0);
    assert.strictEqual(diagnostics.length, 2);
    assert.ok(diagnostics[0].reason.includes('No matching field or entity found'));
    assert.ok(diagnostics[1].reason.includes('Ambiguous requirement statement'));
  });

  it('should convert BusinessRuleConstraints into positive and negative TestIntents', async () => {
    const ctx = getMockProjectContext('IntentGenTestProject');
    const analyzer = new DeterministicBusinessRuleAnalyzer();
    const rawReq = 'price must be non-negative; price must be greater than 0; itemCode length 8 digits';

    const { constraints } = await analyzer.analyzeRequirements(rawReq, ctx);
    const intents = generateBusinessRuleIntents(constraints, ctx);

    assert.ok(intents.length >= 5);

    // NON_NEGATIVE positive & negative
    assert.ok(intents.some(i => i.description.includes('Non-negative Value Acceptance')));
    assert.ok(intents.some(i => i.description.includes('Negative Value Rejection')));

    // GREATER_THAN positive & negative
    assert.ok(intents.some(i => i.description.includes('Value > 0 Acceptance')));
    assert.ok(intents.some(i => i.description.includes('Value <= 0 Rejection')));

    // EXACT_DIGITS positive & negative
    assert.ok(intents.some(i => i.description.includes('Valid Exact 8 Digits')));
    assert.ok(intents.some(i => i.description.includes('Invalid Digit Count')));
  });
});
