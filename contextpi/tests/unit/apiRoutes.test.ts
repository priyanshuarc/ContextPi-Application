/**
 * Express REST API Routes Unit & Integration Tests
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { createServer } from '../../src/api/server.js';
import { apiState } from '../../src/api/stateStore.js';
import { MockTargetApiHarness } from '../harness/mockTargetApi.ts';

let appServer: http.Server;
let baseUrl: string;
let mockTargetHarness: MockTargetApiHarness;
let targetApiUrl: string;

function makeRequest(
  method: string,
  path: string,
  body?: any
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const payloadStr = body ? JSON.stringify(body) : undefined;

    const req = http.request(
      url,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payloadStr ? { 'Content-Length': Buffer.byteLength(payloadStr).toString() } : {})
        }
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          let parsedBody = rawData;
          try {
            parsedBody = JSON.parse(rawData);
          } catch {
            // Raw text
          }
          resolve({ status: res.statusCode || 500, body: parsedBody });
        });
      }
    );

    req.on('error', reject);

    if (payloadStr) {
      req.write(payloadStr);
    }

    req.end();
  });
}

describe('Express REST API Subsystem', () => {
  before(async () => {
    // Start mock target API server for runner test
    mockTargetHarness = new MockTargetApiHarness('ALL_PASS');
    targetApiUrl = await mockTargetHarness.start();

    // Start Express API server on random port
    const app = createServer({ serveClientApp: false });
    await new Promise<void>((resolve) => {
      appServer = app.listen(0, () => {
        const address = appServer.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (appServer) {
      await new Promise<void>((resolve) => appServer.close(() => resolve()));
    }
    if (mockTargetHarness) {
      await mockTargetHarness.stop();
    }
    apiState.clear();
  });

  it('GET /api/health should return OK status and uptime', async () => {
    const res = await makeRequest('GET', '/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'OK');
    assert.ok(typeof res.body.uptimeSeconds === 'number');
  });

  it('POST /api/context/load should load mock context when useMock=true', async () => {
    const res = await makeRequest('POST', '/api/context/load', {
      projectName: 'ApiTestProject',
      requirement: 'Verify Express API context loading',
      useMock: true
    });

    if (res.status !== 200) {
      console.log('CONTEXT LOAD ERROR BODY:', res.body);
    }
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.projectContext.projectName, 'ApiTestProject');
    assert.ok(res.body.schemaCount > 0);
    assert.ok(res.body.functionCount > 0);
  });

  it('GET /api/context/current should return currently active loaded context', async () => {
    const res = await makeRequest('GET', '/api/context/current');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.projectContext.projectName, 'ApiTestProject');
  });

  it('POST /api/catalogue/build should evaluate rules and build a DRAFT catalogue', async () => {
    const res = await makeRequest('POST', '/api/catalogue/build', {});
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.catalogueId);
    assert.strictEqual(res.body.catalogue.projectName, 'ApiTestProject');
    assert.strictEqual(res.body.catalogue.status, 'DRAFT');
    assert.ok(res.body.summary.totalTests > 0);
  });

  it('POST /api/generate should REJECT generation if catalogue is in DRAFT status', async () => {
    const res = await makeRequest('POST', '/api/generate', {
      catalogueId: 'latest'
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'CATALOGUE_NOT_APPROVED');
  });

  it('POST /api/catalogue/:id/select-all, deselect-all, and approve should update catalogue status', async () => {
    // 1. Select all
    const selectRes = await makeRequest('POST', '/api/catalogue/latest/select-all');
    assert.strictEqual(selectRes.status, 200);
    assert.strictEqual(selectRes.body.summary.selectedCount, selectRes.body.summary.totalTests);

    // 2. Approve
    const approveRes = await makeRequest('POST', '/api/catalogue/latest/approve');
    assert.strictEqual(approveRes.status, 200);
    assert.strictEqual(approveRes.body.catalogue.status, 'APPROVED');
  });

  it('POST /api/generate should generate Playwright TypeScript specs from APPROVED catalogue', async () => {
    const res = await makeRequest('POST', '/api/generate', {
      catalogueId: 'latest',
      outputDir: 'test-output/api-generated-specs'
    });

    if (res.status !== 200) {
      console.log('GENERATE ERROR BODY:', res.body);
    }
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.testCount > 0);
    assert.ok(res.body.generatedFiles.length > 0);
    assert.ok(res.body.traceabilitySummary.totalSpecs > 0);
  });

  it('POST /api/run should execute Playwright API tests against mock target API', async () => {
    const res = await makeRequest('POST', '/api/run', {
      catalogueId: 'latest',
      targetApiBaseUrl: targetApiUrl,
      generatedTestsDir: 'test-output/api-generated-specs',
      reportOutputDir: 'test-output/api-reports'
    });

    if (res.status !== 200) {
      console.log('RUN ERROR BODY:', res.body);
    }
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok((res.body.summary?.totalExecuted || res.body.finalRun?.totalExecuted) > 0);
    assert.ok((res.body.summary?.passed || res.body.finalRun?.passed) > 0);
    assert.ok(typeof (res.body.summary?.passRatePercentage || res.body.finalRun?.passRatePercentage) === 'number');
  });

  it('GET /api/runs/latest and GET /api/reports/latest should return execution run summary and HTML report', async () => {
    const runRes = await makeRequest('GET', '/api/runs/latest');
    assert.strictEqual(runRes.status, 200);
    assert.strictEqual(runRes.body.success, true);
    assert.ok(runRes.body.execution.summary.totalExecuted > 0);

    const reportRes = await makeRequest('GET', '/api/reports/latest');
    assert.strictEqual(reportRes.status, 200);
    assert.strictEqual(reportRes.body.success, true);
    assert.ok(typeof reportRes.body.htmlContent === 'string');
  });

  it('404 Handler should return standard JSON error for invalid endpoints', async () => {
    const res = await makeRequest('GET', '/api/invalid/path/test');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'ENDPOINT_NOT_FOUND');
  });
});
