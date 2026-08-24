import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SpecValidator } from '../../src/generator/specValidator.js';
import { CatalogEntry } from '../../src/types/catalogue.js';

describe('Strict 16-Point Spec Validator Unit Tests', () => {
  const sampleEntry: CatalogEntry = {
    testId: 'TC-ITEMS-CRUD-001',
    category: 'CRUD',
    targetEntity: 'items',
    description: 'Create items - Happy Path',
    source: 'MONGO_SCHEMA',
    sourceRef: 'items',
    reasoning: 'Create items happy path',
    expectedResult: { statusCode: 201 },
    priority: 'CRITICAL',
    dependencies: [],
    httpMethod: 'POST',
    targetRouteKey: 'formCreate',
    payloadTemplate: { itemCode: 'ITEM-001' },
    selected: true
  };

  const validSpecCode = `
  /*
  Contextπ Traceability
  Test ID: TC-ITEMS-CRUD-001
  Category: CRUD
  Target Entity: items
  Source: MONGO_SCHEMA
  Source Ref: items
  Reasoning: Create items happy path
  Priority: CRITICAL
  Dependencies: []
  */
  test('TC-ITEMS-CRUD-001 — Create items — Happy Path', async ({ request }) => {
    const payload = { itemCode: 'ITEM-001' };
    const response = await request.post(\`\${BASE_URL}\${FORM_ROUTES.formCreate}\`, {
      data: payload,
      headers: { 'x-project-name': PROJECT_NAME }
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toBeDefined();
  });`;

  it('should accept valid Playwright API spec code meeting all 16 rules', () => {
    const result = SpecValidator.validateSpecCode(sampleEntry, validSpecCode, '/forms/formCreate');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.errors.length, 0);
  });

  it('should REJECT spec code targeting unauthorized hardcoded /api/v1 route', () => {
    const invalidRouteCode = validSpecCode.replace('FORM_ROUTES.formCreate', "'/api/v1/items'");
    const result = SpecValidator.validateSpecCode(sampleEntry, invalidRouteCode, '/forms/formCreate');
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('RULE-09-NO-HARDCODED-API-V1')));
  });

  it('should REJECT spec code with expected status code mismatch', () => {
    const statusMismatchCode = validSpecCode.replace('toBe(201)', 'toBe(200)');
    const result = SpecValidator.validateSpecCode(sampleEntry, statusMismatchCode, '/forms/formCreate');
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('RULE-06-STATUS-CODE')));
  });

  it('should REJECT spec code containing browser DOM UI APIs (page.goto / page.click)', () => {
    const domApiCode = validSpecCode + "\n await page.goto('http://localhost:3000');";
    const result = SpecValidator.validateSpecCode(sampleEntry, domApiCode, '/forms/formCreate');
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('RULE-13-NO-BROWSER-DOM-APIS')));
  });

  it('should REJECT spec code with hardcoded secrets or bearer tokens', () => {
    const secretCode = validSpecCode + "\n const secret = 'Bearer secret_token_abc123456789';";
    const result = SpecValidator.validateSpecCode(sampleEntry, secretCode, '/forms/formCreate');
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('RULE-10-NO-SECRETS')));
  });

  it('should REJECT spec code with missing traceability comment block', () => {
    const noTraceabilityCode = `test('TC-ITEMS-CRUD-001', async ({ request }) => { expect(response.status()).toBe(201); });`;
    const result = SpecValidator.validateSpecCode(sampleEntry, noTraceabilityCode, '/forms/formCreate');
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('RULE-08-TRACEABILITY-COMMENT')));
  });
});
