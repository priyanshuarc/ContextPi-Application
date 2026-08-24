import { resetDatabase } from './resetDatabase.js';
import { runPlaywrightSpecs } from '../src/runner/playwrightRunner.js';
import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import path from 'node:path';

function getSpecFiles(dir: string, files: string[] = []): string[] {
  if (!fsSync.existsSync(dir)) return files;
  const items = fsSync.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const res = path.resolve(dir, item.name);
    if (item.isDirectory()) {
      getSpecFiles(res, files);
    } else if (item.name.endsWith('.spec.ts')) {
      files.push(res);
    }
  }
  return files;
}

function extractAllCatalogEntries(): any[] {
  const specFiles = getSpecFiles('generated-tests');
  const entries: any[] = [];
  specFiles.forEach(file => {
    const content = fsSync.readFileSync(file, 'utf-8');
    const matches = content.matchAll(/\/\*\*[\s\S]*?\* Test ID:\s*(TC-[A-Z0-9_-]+)[\s\S]*?Target Entity:\s*([a-zA-Z0-9_-]+)[\s\S]*?\*\//g);
    for (const m of matches) {
      entries.push({
        testId: m[1],
        targetEntity: m[2],
        category: m[1].split('-')[1] || 'CRUD',
        priority: 'CRITICAL',
        description: m[1],
        source: 'MONGO_SCHEMA',
        sourceRef: m[2],
        reasoning: m[1],
        expectedResult: { statusCode: 200 },
        dependencies: [],
        httpMethod: 'POST',
        targetRouteKey: 'formCreate',
        payloadTemplate: {},
        selected: true
      });
    }
  });
  return entries;
}

export async function runCleanE2E(): Promise<{ total: number; passed: number; failed: number }> {
  console.log('--- Step 1: Performing clean database reset ---');
  await resetDatabase();

  const targetUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  console.log(`--- Step 2: Verifying target API server at ${targetUrl} ---`);
  try {
    const healthRes = await fetch(`${targetUrl}/health`);
    if (!healthRes.ok) {
      throw new Error(`Target API returned HTTP ${healthRes.status}`);
    }
  } catch (err: any) {
    console.error(`Target API server is not accessible at ${targetUrl}. Make sure NexaSupply server is running.`);
    throw err;
  }

  console.log('--- Step 3: Executing Contextπ Playwright Test Suite (148 tests) ---');
  const entries = extractAllCatalogEntries();
  const catalog: any = {
    projectName: 'NexaSupply',
    version: '1.0.0',
    entries
  };

  const execOutput = await runPlaywrightSpecs(catalog, {
    generatedTestsDir: 'generated-tests',
    targetApiBaseUrl: targetUrl,
    reportOutputDir: 'reports'
  });

  const results = execOutput.results;
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  if (failed > 0) {
    console.log('\n--- FAILED TEST DETAILS ---');
    results.filter(r => !r.passed).forEach(f => {
      console.log(`Failed: ${f.testId} (${f.targetEntity} - ${f.category}): ${f.error?.message || 'no error message'}`);
    });
  }

  console.log('\n========================================');
  console.log('CONTEXTπ CLEAN E2E EXECUTION REPORT');
  console.log('========================================');
  console.log('INITIAL:');
  console.log(`${total} total`);
  console.log(`${passed} passed`);
  console.log(`${failed} failed`);
  console.log('');
  console.log('AI REPAIR:');
  console.log(`0 attempted`);
  console.log(`0 repaired`);
  console.log(`0 unrepaired`);
  console.log('');
  console.log('FINAL:');
  console.log(`${total} total`);
  console.log(`${passed} passed`);
  console.log(`${failed} failed`);
  console.log('========================================\n');

  return { total, passed, failed };
}

if (process.argv[1] && process.argv[1].includes('runCleanE2E')) {
  runCleanE2E().catch(err => {
    console.error('clean E2E execution failed:', err);
    process.exit(1);
  });
}
