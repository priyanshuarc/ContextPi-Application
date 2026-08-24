import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { getMockProjectContext } from '../../src/context/mockMongoContext.js';
import { evaluateAllRules } from '../../src/rules/index.js';
import { createDraftCatalogue, approveCatalogue } from '../../src/catalogue/approval/catalogApprovalEngine.js';
import {
  generatePlaywrightSpecs,
  sanitizeFileName,
  assertSafePath,
  SpecGeneratorError
} from '../../src/generator/specWriter.js';
import { renderSpecFileContent } from '../../src/generator/templates/codeTemplates.js';

describe('Playwright Spec Generator Subsystem', () => {
  const TEST_GEN_DIR = path.resolve('test-output/unit-generated-specs');

  it('should throw SpecGeneratorError when attempting to generate specs from a DRAFT catalogue', async () => {
    const ctx = getMockProjectContext('DraftSpecProject');
    const { intents } = await evaluateAllRules(ctx);
    const draftCatalog = createDraftCatalogue(ctx, intents);

    assert.strictEqual(draftCatalog.status, 'DRAFT');

    await assert.rejects(
      async () => generatePlaywrightSpecs(draftCatalog, undefined, { outputDir: TEST_GEN_DIR }),
      (err: unknown) => {
        return err instanceof SpecGeneratorError && err.message.includes('Catalogue must be APPROVED first');
      }
    );
  });

  it('should generate Playwright TypeScript specs from an APPROVED catalogue', async () => {
    const ctx = getMockProjectContext('ApprovedSpecProject');
    const { intents } = await evaluateAllRules(ctx);
    const approvedCatalog = approveCatalogue(createDraftCatalogue(ctx, intents));

    const result = await generatePlaywrightSpecs(approvedCatalog, undefined, {
      outputDir: TEST_GEN_DIR,
      cleanOutputDir: true
    });

    assert.ok(result.totalFiles > 0);
    assert.strictEqual(result.totalTestBlocks, approvedCatalog.entries.length);
    assert.strictEqual(result.traceableTestIds.length, approvedCatalog.entries.length);

    // Verify files physically exist on disk
    for (const fileInfo of result.generatedFiles) {
      const content = await fs.readFile(fileInfo.filePath, 'utf-8');
      assert.ok(content.includes("import { test, expect } from '@playwright/test';"));
      assert.ok(content.includes('Contextπ Generated Playwright API Test'));
      assert.ok(content.includes('test.describe.serial'));
    }
  });

  it('should exclude unselected entries from generated spec files', async () => {
    const ctx = getMockProjectContext('UnselectedSpecProject');
    const { intents } = await evaluateAllRules(ctx);
    let catalog = createDraftCatalogue(ctx, intents);

    // Find an independent entry with no downstream dependents (e.g. last entry)
    const independentEntry = [...catalog.entries].reverse().find(e => {
      return !catalog.entries.some(other => other.dependencies.includes(e.testId));
    })!;

    const unselectedId = independentEntry.testId;
    independentEntry.selected = false;
    const approvedCatalog = approveCatalogue(catalog);

    const result = await generatePlaywrightSpecs(approvedCatalog, undefined, {
      outputDir: path.join(TEST_GEN_DIR, 'unselected')
    });

    assert.strictEqual(result.totalTestBlocks, catalog.entries.length - 1);
    assert.strictEqual(result.traceableTestIds.includes(unselectedId), false);
  });

  it('should produce 100% byte-for-byte deterministic output for identical input', async () => {
    const ctx = getMockProjectContext('DeterminismSpecProject');
    const { intents } = await evaluateAllRules(ctx);
    const approvedCatalog = approveCatalogue(createDraftCatalogue(ctx, intents));

    const content1 = renderSpecFileContent('Items Spec', approvedCatalog.entries, approvedCatalog);
    const content2 = renderSpecFileContent('Items Spec', approvedCatalog.entries, approvedCatalog);

    assert.strictEqual(content1, content2);
  });

  it('should sanitize entity and function file names and reject path traversal', () => {
    assert.strictEqual(sanitizeFileName('items'), 'items');
    assert.strictEqual(sanitizeFileName('calculateDiscount'), 'calculatediscount');
    assert.strictEqual(sanitizeFileName('User-Profile@V1'), 'user-profile_v1');

    assert.throws(() => sanitizeFileName('../malicious/path'), /Path traversal attempt/);
    assert.throws(() => sanitizeFileName('items/subpath'), /Path traversal attempt/);

    const rootDir = path.resolve('generated-tests');
    const safePath = path.resolve('generated-tests/forms/items.spec.ts');
    const unsafePath = path.resolve('generated-tests/../../outside.ts');

    assert.doesNotThrow(() => assertSafePath(safePath, rootDir));
    assert.throws(() => assertSafePath(unsafePath, rootDir), /Security violation/);
  });

  it('should generate structured response field type assertions for custom function specs', async () => {
    const ctx = getMockProjectContext('FunctionAssertionSpecProject');
    const { intents } = await evaluateAllRules(ctx);
    const approvedCatalog = approveCatalogue(createDraftCatalogue(ctx, intents));

    const fnEntries = approvedCatalog.entries.filter(e => e.category === 'CUSTOM_FUNCTION');
    assert.ok(fnEntries.length > 0);

    const content = renderSpecFileContent('Function Test', fnEntries, approvedCatalog);

    assert.ok(content.includes("FUNCTION_ROUTES.executeFunction('calculateDiscount')"));
    assert.ok(content.includes("expect(typeof body.discountedPrice).toBe('number');"));
    assert.ok(content.includes("expect(typeof body.savingsAmount).toBe('number');"));
    assert.ok(content.includes("expect(typeof body.status).toBe('string');"));
  });
});
