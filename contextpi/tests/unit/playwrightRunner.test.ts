import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';

import { getMockProjectContext } from '../../src/context/mockMongoContext.js';
import { evaluateAllRules } from '../../src/rules/index.js';
import { createDraftCatalogue, approveCatalogue } from '../../src/catalogue/approval/catalogApprovalEngine.js';
import { generatePlaywrightSpecs } from '../../src/generator/specWriter.js';
import { runPlaywrightSpecs, PlaywrightRunnerError } from '../../src/runner/playwrightRunner.js';
import { MockTargetApiHarness } from '../harness/mockTargetApi.js';

describe('Playwright Runner Subsystem Unit Tests', () => {
  it('should throw PlaywrightRunnerError when target spec directory does not exist', async () => {
    const ctx = getMockProjectContext('MissingDirProject');
    const { intents } = await evaluateAllRules(ctx);
    const approvedCatalog = approveCatalogue(createDraftCatalogue(ctx, intents));

    await assert.rejects(
      async () =>
        runPlaywrightSpecs(approvedCatalog, {
          generatedTestsDir: 'non-existent-directory-xyz-123'
        }),
      (err: unknown) => {
        return err instanceof PlaywrightRunnerError && err.message.includes('does not exist');
      }
    );
  });

  it('should execute Playwright HTTP API tests against a live mock target server', async () => {
    const harness = new MockTargetApiHarness('ALL_PASS');
    const baseUrl = await harness.start();

    try {
      const ctx = getMockProjectContext('LiveRunnerProject');
      const { intents } = await evaluateAllRules(ctx);
      const approvedCatalog = approveCatalogue(createDraftCatalogue(ctx, intents));

      const specDir = path.resolve('test-output/runner-unit-specs');
      await generatePlaywrightSpecs(approvedCatalog, undefined, {
        outputDir: specDir,
        cleanOutputDir: true
      });

      const result = await runPlaywrightSpecs(approvedCatalog, {
        generatedTestsDir: specDir,
        targetApiBaseUrl: baseUrl,
        reportOutputDir: 'test-output/runner-unit-reports'
      });

      assert.ok(result.summary.totalExecuted > 0);
      assert.strictEqual(result.summary.targetApiBaseUrl, baseUrl);
      assert.ok(result.results.length === approvedCatalog.entries.length);

      // Verify every result has genuine execution metrics
      for (const res of result.results) {
        assert.ok(typeof res.passed === 'boolean');
        assert.ok(typeof res.durationMs === 'number');
        assert.ok(res.status === 'PASS' || res.status === 'FAIL' || res.status === 'SKIPPED');
        assert.ok(res.testId.startsWith('TC-'));
      }
    } finally {
      await harness.stop();
    }
  });
});
