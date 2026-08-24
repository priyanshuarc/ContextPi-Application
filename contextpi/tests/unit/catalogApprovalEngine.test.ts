import { describe, it } from 'node:test';
import assert from 'node:assert';

import { getMockProjectContext } from '../../src/context/mockMongoContext.js';
import { evaluateAllRules } from '../../src/rules/index.js';
import {
  createDraftCatalogue,
  selectEntry,
  deselectEntry,
  selectAll,
  deselectAll,
  approveCatalogue,
  getSelectedEntries,
  getApprovedEntries,
  getSummary,
  serializeCatalog,
  deserializeCatalog,
  CatalogApprovalError
} from '../../src/catalogue/approval/catalogApprovalEngine.js';
import { CatalogStateStore } from '../../src/catalogue/approval/catalogStateStore.js';

describe('Test Catalogue Approval Engine Subsystem', () => {
  it('should initialize catalogue in DRAFT status with all entries selected by default', async () => {
    const ctx = getMockProjectContext('DraftApprovalProject');
    const { intents } = await evaluateAllRules(ctx);

    const catalog = createDraftCatalogue(ctx, intents);

    assert.strictEqual(catalog.status, 'DRAFT');
    assert.ok(catalog.entries.length > 0);
    assert.ok(catalog.entries.every(e => e.selected === true));
  });

  it('should allow selecting and deselecting individual entries', async () => {
    const ctx = getMockProjectContext('SelectDeselectProject');
    const { intents } = await evaluateAllRules(ctx);

    let catalog = createDraftCatalogue(ctx, intents);
    const targetId = catalog.entries[0].testId;

    // Deselect entry
    catalog = deselectEntry(catalog, targetId);
    assert.strictEqual(catalog.entries[0].selected, false);

    // Re-select entry
    catalog = selectEntry(catalog, targetId);
    assert.strictEqual(catalog.entries[0].selected, true);
  });

  it('should support selectAll and deselectAll operations', async () => {
    const ctx = getMockProjectContext('SelectAllProject');
    const { intents } = await evaluateAllRules(ctx);

    let catalog = createDraftCatalogue(ctx, intents);

    catalog = deselectAll(catalog);
    assert.ok(catalog.entries.every(e => e.selected === false));

    catalog = selectAll(catalog);
    assert.ok(catalog.entries.every(e => e.selected === true));
  });

  it('should approve draft catalogue when valid and all dependencies are selected', async () => {
    const ctx = getMockProjectContext('ValidApprovalProject');
    const { intents } = await evaluateAllRules(ctx);

    let catalog = createDraftCatalogue(ctx, intents);

    // Approve catalogue
    const approved = approveCatalogue(catalog);
    assert.strictEqual(approved.status, 'APPROVED');

    // Get approved entries
    const approvedEntries = getApprovedEntries(approved);
    assert.strictEqual(approvedEntries.length, catalog.entries.length);
  });

  it('should block approval if selected test depends on an unselected test', async () => {
    const ctx = getMockProjectContext('DepConflictProject');
    const { intents } = await evaluateAllRules(ctx);

    let catalog = createDraftCatalogue(ctx, intents);

    // Find an entry with dependencies (e.g. Read by ID depends on Create)
    const dependentEntry = catalog.entries.find(e => e.dependencies.length > 0);
    assert.ok(dependentEntry, 'Expected at least one entry with dependencies');

    const prereqTestId = dependentEntry.dependencies[0];

    // Deselect the prerequisite test while keeping the dependent test selected
    catalog = deselectEntry(catalog, prereqTestId);

    assert.throws(
      () => approveCatalogue(catalog),
      (err: unknown) => {
        return err instanceof CatalogApprovalError && err.message.includes('unselected dependencies');
      }
    );
  });

  it('should block approval if 0 entries are selected', async () => {
    const ctx = getMockProjectContext('ZeroSelectedProject');
    const { intents } = await evaluateAllRules(ctx);

    let catalog = createDraftCatalogue(ctx, intents);
    catalog = deselectAll(catalog);

    assert.throws(
      () => approveCatalogue(catalog),
      (err: unknown) => {
        return err instanceof CatalogApprovalError && err.message.includes('No test cases are selected');
      }
    );
  });

  it('should revert APPROVED catalogue to DRAFT status if selection is mutated', async () => {
    const ctx = getMockProjectContext('RevertDraftProject');
    const { intents } = await evaluateAllRules(ctx);

    let catalog = createDraftCatalogue(ctx, intents);
    catalog = approveCatalogue(catalog);
    assert.strictEqual(catalog.status, 'APPROVED');

    // Mutate selection on approved catalog
    const targetId = catalog.entries[0].testId;
    const mutated = deselectEntry(catalog, targetId);

    assert.strictEqual(mutated.status, 'DRAFT');
  });

  it('should throw error when getApprovedEntries is called on DRAFT catalogue', async () => {
    const ctx = getMockProjectContext('UnapprovedGetProject');
    const { intents } = await evaluateAllRules(ctx);

    const catalog = createDraftCatalogue(ctx, intents);

    assert.throws(
      () => getApprovedEntries(catalog),
      (err: unknown) => {
        return err instanceof CatalogApprovalError && err.message.includes('must be APPROVED first');
      }
    );
  });

  it('should compute catalogue preview summary data correctly', async () => {
    const ctx = getMockProjectContext('SummaryProject');
    const { intents } = await evaluateAllRules(ctx);

    const catalog = createDraftCatalogue(ctx, intents);
    const summary = getSummary(catalog);

    assert.strictEqual(summary.projectName, 'SummaryProject');
    assert.strictEqual(summary.status, 'DRAFT');
    assert.strictEqual(summary.totalTests, catalog.entries.length);
    assert.strictEqual(summary.selectedCount, catalog.entries.length);
    assert.strictEqual(summary.unselectedCount, 0);
    assert.ok(summary.testsByCategory.CRUD > 0);
    assert.ok(summary.testsByCategory.FIELD_VALIDATION > 0);
    assert.ok(summary.testsByCategory.CUSTOM_FUNCTION > 0);
    assert.ok(summary.testsByCategory.RELATIONSHIP > 0);
  });

  it('should serialize and deserialize TestCatalog correctly', async () => {
    const ctx = getMockProjectContext('SerializeProject');
    const { intents } = await evaluateAllRules(ctx);

    const catalog = approveCatalogue(createDraftCatalogue(ctx, intents));

    const json = serializeCatalog(catalog);
    assert.ok(typeof json === 'string');

    const restored = deserializeCatalog(json);
    assert.strictEqual(restored.projectName, catalog.projectName);
    assert.strictEqual(restored.status, 'APPROVED');
    assert.strictEqual(restored.entries.length, catalog.entries.length);
    assert.deepStrictEqual(restored, catalog);
  });

  it('should operate correctly through CatalogStateStore encapsulation', async () => {
    const ctx = getMockProjectContext('StateStoreProject');
    const { intents } = await evaluateAllRules(ctx);

    const store = CatalogStateStore.createDraft(ctx, intents);
    assert.strictEqual(store.getCatalog().status, 'DRAFT');

    const firstId = store.getCatalog().entries[0].testId;
    store.deselectEntry(firstId);
    assert.strictEqual(store.getSelectedEntries().length, store.getCatalog().entries.length - 1);

    store.selectEntry(firstId);
    const approved = store.approveCatalogue();
    assert.strictEqual(approved.status, 'APPROVED');
    assert.strictEqual(store.getApprovedEntries().length, approved.entries.length);
  });
});
