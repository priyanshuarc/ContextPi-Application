import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { getMockProjectContext } from '../../src/context/mockMongoContext.js';
import { evaluateAllRules } from '../../src/rules/index.js';
import { createDraftCatalogue, approveCatalogue } from '../../src/catalogue/approval/catalogApprovalEngine.js';
import { generatePlaywrightSpecs } from '../../src/generator/specWriter.js';
import { ProjectContext } from '../../src/types/context.js';

describe('Playwright Spec Generator End-to-End Pipeline Integration Test', () => {
  const OUTPUT_DIR = path.resolve('test-output/integration-generated-specs');

  it('should generate complete spec suite from synthetic approved catalogue', async () => {
    // 1. Load context & evaluate rules
    const ctx = getMockProjectContext('IntegSpecGenProject');
    const { intents } = await evaluateAllRules(ctx);

    // 2. Approve catalogue
    const approvedCatalog = approveCatalogue(createDraftCatalogue(ctx, intents));
    assert.strictEqual(approvedCatalog.status, 'APPROVED');
    const expectedCount = approvedCatalog.entries.length;
    assert.ok(expectedCount > 0);

    // 3. Generate specs
    const result = await generatePlaywrightSpecs(approvedCatalog, undefined, {
      outputDir: OUTPUT_DIR,
      cleanOutputDir: true
    });

    assert.ok(result.totalFiles > 0);
    assert.strictEqual(result.totalTestBlocks, expectedCount);

    // 4. Verify every catalogue test ID appears exactly ONCE across all generated files
    const allTraceIds = new Set<string>();

    for (const fileInfo of result.generatedFiles) {
      const content = await fs.readFile(fileInfo.filePath, 'utf-8');

      // Check header imports and Playwright fixtures
      assert.ok(content.includes("import { test, expect } from '@playwright/test';"));
      assert.ok(content.includes('BASE_URL'));
      assert.ok(content.includes('PROJECT_NAME'));

      // Check traceability comments
      const matches = content.match(/Test ID:\s+(TC-[A-Z0-9_-]+)/g);
      assert.ok(matches && matches.length > 0);

      for (const match of matches) {
        const id = match.replace(/Test ID:\s+/, '').trim();
        assert.strictEqual(allTraceIds.has(id), false, `Duplicate trace ID detected: '${id}'`);
        allTraceIds.add(id);
      }

      // Check zero NexaSupply hardcoding
      assert.strictEqual(content.includes('NexaSupply'), false);
    }

    assert.strictEqual(allTraceIds.size, expectedCount);
  });

  it('APPLICATION-AGNOSTICISM TEST: Generate specs for TWO unrelated synthetic domains with zero code changes', async () => {
    // Domain A: E-Commerce
    const appA: ProjectContext = {
      projectName: 'ECommerceApp',
      schemas: [
        {
          schemaName: 'products',
          active: true,
          fields: [
            { name: 'productCode', dataType: 'String', mandatoryField: true, inputType: 'text' },
            { name: 'price', dataType: 'Number', mandatoryField: true, inputType: 'number' }
          ]
        }
      ],
      functions: [
        {
          name: 'applyCoupon',
          isActive: true,
          parameters: [{ name: 'couponCode', type: 'string', isActive: true, required: true }],
          expectedResponseFields: [{ name: 'discountedTotal', type: 'number', required: true }]
        }
      ],
      requirement: 'price must be non-negative; productCode length 8 digits'
    };

    // Domain B: Banking & Finance
    const appB: ProjectContext = {
      projectName: 'BankingApp',
      schemas: [
        {
          schemaName: 'accounts',
          active: true,
          fields: [
            { name: 'accountNumber', dataType: 'String', mandatoryField: true, inputType: 'text' },
            { name: 'balance', dataType: 'Number', mandatoryField: true, inputType: 'number' }
          ]
        }
      ],
      functions: [
        {
          name: 'transferFunds',
          isActive: true,
          parameters: [
            { name: 'fromAccount', type: 'string', isActive: true, required: true },
            { name: 'toAccount', type: 'string', isActive: true, required: true },
            { name: 'amount', type: 'number', isActive: true, required: true }
          ],
          expectedResponseFields: [
            { name: 'transactionRef', type: 'string', required: true },
            { name: 'status', type: 'string', required: true }
          ]
        }
      ],
      requirement: 'balance must be non-negative; accountNumber length 8 digits'
    };

    const resA = await evaluateAllRules(appA);
    const resB = await evaluateAllRules(appB);

    const catA = approveCatalogue(createDraftCatalogue(appA, resA.intents));
    const catB = approveCatalogue(createDraftCatalogue(appB, resB.intents));

    const genA = await generatePlaywrightSpecs(catA, undefined, {
      outputDir: path.join(OUTPUT_DIR, 'appA')
    });
    const genB = await generatePlaywrightSpecs(catB, undefined, {
      outputDir: path.join(OUTPUT_DIR, 'appB')
    });

    assert.ok(genA.totalFiles > 0);
    assert.ok(genB.totalFiles > 0);

    // App A targets products and applyCoupon
    assert.ok(genA.generatedFiles.some(f => f.targetEntity === 'products'));
    assert.ok(genA.generatedFiles.some(f => f.targetEntity === 'applyCoupon'));

    // App B targets accounts and transferFunds
    assert.ok(genB.generatedFiles.some(f => f.targetEntity === 'accounts'));
    assert.ok(genB.generatedFiles.some(f => f.targetEntity === 'transferFunds'));
  });
});
