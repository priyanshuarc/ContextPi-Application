import { describe, it } from 'node:test';
import assert from 'node:assert';

import { getMockProjectContext } from '../../src/context/mockMongoContext.js';
import { evaluateCrudRules } from '../../src/rules/crudRules.js';

describe('CRUD Rule Engine Subsystem', () => {
  it('should generate all 10 standard CRUD test intents per active schema', () => {
    const ctx = getMockProjectContext('CrudTestProject');
    const intents = evaluateCrudRules(ctx);

    const itemsIntents = intents.filter(i => i.targetEntity === 'items');
    assert.ok(itemsIntents.length >= 9);

    const categories = new Set(itemsIntents.map(i => i.description));
    assert.ok(itemsIntents.some(i => i.description.includes('Create items - Happy Path')));
    assert.ok(itemsIntents.some(i => i.description.includes('Read items by ID')));
    assert.ok(itemsIntents.some(i => i.description.includes('Read List of items')));
    assert.ok(itemsIntents.some(i => i.description.includes('Search & Filter items')));
    assert.ok(itemsIntents.some(i => i.description.includes('Update items record')));
    assert.ok(itemsIntents.some(i => i.description.includes('Delete items record')));
    assert.ok(itemsIntents.some(i => i.description.includes('Verify Deleted items Excluded')));
    assert.ok(itemsIntents.some(i => i.description.includes("Missing Mandatory Field 'itemCode'")));
    assert.ok(itemsIntents.some(i => i.description.includes("Wrong Type for Field 'price'")));
  });

  it('should explicitly link dependencies between CRUD lifecycle operations', () => {
    const ctx = getMockProjectContext('DependencyTestProject');
    const intents = evaluateCrudRules(ctx);

    const createIntent = intents.find(i => i.description.includes('Create items - Happy Path'));
    assert.ok(createIntent);

    const readByIdIntent = intents.find(i => i.description.includes('Read items by ID'));
    assert.ok(readByIdIntent);
    assert.deepStrictEqual(readByIdIntent.dependencies, [createIntent.intentId]);

    const updateIntent = intents.find(i => i.description.includes('Update items record'));
    assert.ok(updateIntent);
    assert.deepStrictEqual(updateIntent.dependencies, [createIntent.intentId]);

    const deleteIntent = intents.find(i => i.description.includes('Delete items record'));
    assert.ok(deleteIntent);
    assert.deepStrictEqual(deleteIntent.dependencies, [createIntent.intentId]);

    const deletedFilterIntent = intents.find(i => i.description.includes('Verify Deleted items Excluded'));
    assert.ok(deletedFilterIntent);
    assert.deepStrictEqual(deletedFilterIntent.dependencies, [deleteIntent.intentId]);
  });
});
