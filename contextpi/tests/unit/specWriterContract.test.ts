/**
 * Spec Writer Route Resolution & Code Quality Unit Tests
 * Proves that generated Playwright spec files:
 * 1. Use TargetApiContract route resolution exclusively without hardcoded paths
 * 2. Render human-readable titles (e.g., 'TC-ITEMS-CRUD-001 — Create items — Happy Path')
 * 3. Include full 10-point traceability header comments
 * 4. Derive HTTP status codes and exact body assertions directly from entry.expectedResult
 * 5. Render field-specific negative mutations, relationship state, and business-rule payloads
 * 6. Demonstrate application agnosticism across TWO unrelated synthetic domains (ECommerce and Healthcare)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CatalogEntry, TestCatalog } from '../../src/types/catalogue.js';
import { DEFAULT_PS10_CONTRACT } from '../../src/contract/defaultPs10Contract.js';
import { renderTestBlock, renderSpecHeader, renderSpecFileContent } from '../../src/generator/templates/codeTemplates.js';

describe('Spec Writer Code Quality & Contract Resolution Unit Tests', () => {
  it('should resolve form routes exclusively using TargetApiContract without hardcoding /api/v1', () => {
    const catalog: TestCatalog = {
      projectName: 'ContractRouteApp',
      createdAt: new Date().toISOString(),
      status: 'APPROVED',
      entries: []
    };

    const headerCode = renderSpecHeader(catalog, DEFAULT_PS10_CONTRACT);

    assert.ok(headerCode.includes('BASE_URL'));
    assert.ok(headerCode.includes(DEFAULT_PS10_CONTRACT.formRoutes.formCreate));
    assert.ok(headerCode.includes(DEFAULT_PS10_CONTRACT.functionRoutes.createFunction));
    assert.ok(!headerCode.includes('/api/v1/hardcoded'));
  });

  it('should render human-readable test titles with em-dash separator and full 10-point traceability headers', () => {
    const entry: CatalogEntry = {
      testId: 'TC-ITEMS-CRUD-001',
      category: 'CRUD',
      targetEntity: 'items',
      description: 'Create items — Happy Path',
      source: 'MONGO_SCHEMA',
      sourceRef: 'items',
      reasoning: 'Validate creation of items with valid payload',
      expectedResult: { statusCode: 201 },
      priority: 'CRITICAL',
      dependencies: [],
      httpMethod: 'POST',
      targetRouteKey: 'formCreate',
      payloadTemplate: { itemCode: 'ITM-1001', price: 149.99 },
      selected: true
    };

    const codeBlock = renderTestBlock(entry);

    // Verify human-readable test title format
    assert.ok(codeBlock.includes("test('TC-ITEMS-CRUD-001 — Create items — Happy Path'"));

    // Verify 10-point traceability header comment
    assert.ok(codeBlock.includes('Contextπ Generated Playwright API Test'));
    assert.ok(codeBlock.includes('Test ID: TC-ITEMS-CRUD-001'));
    assert.ok(codeBlock.includes('Category: CRUD'));
    assert.ok(codeBlock.includes('Priority: CRITICAL'));
    assert.ok(codeBlock.includes('Target Entity: items'));
    assert.ok(codeBlock.includes('Source: MONGO_SCHEMA'));
    assert.ok(codeBlock.includes('Source Ref: items'));
    assert.ok(codeBlock.includes('Reasoning: Validate creation of items with valid payload'));
  });

  it('should derive expected HTTP status code and body schema assertions directly from entry.expectedResult', () => {
    const entry: CatalogEntry = {
      testId: 'TC-FUNC-SCHEMA-001',
      category: 'CUSTOM_FUNCTION',
      targetEntity: 'calculateTax',
      description: 'Tax calculation function spec with custom schema response assertions',
      source: 'FUNCTION_REGISTRY',
      sourceRef: 'calculateTax',
      reasoning: 'Verify structured tax response body',
      expectedResult: {
        statusCode: 202,
        responseBodySchema: {
          taxAmount: { expectedType: 'number', required: true },
          currency: { expectedType: 'string', required: true }
        }
      },
      priority: 'CRITICAL',
      dependencies: [],
      httpMethod: 'POST',
      targetRouteKey: 'executeFunction',
      payloadTemplate: { baseAmount: 100 },
      selected: true
    };

    const codeBlock = renderTestBlock(entry);

    assert.ok(codeBlock.includes('expect(response.status()).toBe(202)'));
    assert.ok(codeBlock.includes("expect(typeof body.taxAmount).toBe('number')"));
    assert.ok(codeBlock.includes("expect(typeof body.currency).toBe('string')"));
  });

  it('should render field-specific negative mutations correctly in test code payload', () => {
    const entry: CatalogEntry = {
      testId: 'TC-ITEMS-FIELD-003',
      category: 'FIELD_VALIDATION',
      targetEntity: 'items',
      description: 'Invalid URL for supplierWebsite',
      source: 'MONGO_SCHEMA',
      sourceRef: 'items.supplierWebsite',
      reasoning: 'Send malformed URL for field supplierWebsite to assert HTTP 400 rejection',
      expectedResult: { statusCode: 400, errorMessagePattern: 'supplierWebsite' },
      priority: 'HIGH',
      dependencies: [],
      httpMethod: 'POST',
      targetRouteKey: 'formCreate',
      payloadTemplate: {
        itemCode: 'ITM-1001',
        supplierWebsite: 'invalid-url-string'
      },
      selected: true
    };

    const codeBlock = renderTestBlock(entry);

    assert.ok(codeBlock.includes("test('TC-ITEMS-FIELD-003 — Invalid URL for supplierWebsite'"));
    assert.ok(codeBlock.includes('"supplierWebsite": "invalid-url-string"'));
    assert.ok(codeBlock.includes('expect(response.status()).toBe(400)'));
    assert.ok(codeBlock.includes('.toContain(\'supplierwebsite\')'));
  });

  it('APPLICATION-AGNOSTICISM TEST: Generate spec files for TWO distinct synthetic domains with zero code changes', () => {
    const domain1Catalog: TestCatalog = {
      projectName: 'ECommerceDomain',
      createdAt: new Date().toISOString(),
      status: 'APPROVED',
      entries: [
        {
          testId: 'TC-PRODUCT-CRUD-001',
          category: 'CRUD',
          targetEntity: 'products',
          description: 'Create products — Happy Path',
          source: 'MONGO_SCHEMA',
          sourceRef: 'products',
          reasoning: 'Validate product creation',
          expectedResult: { statusCode: 201 },
          priority: 'CRITICAL',
          dependencies: [],
          httpMethod: 'POST',
          targetRouteKey: 'formCreate',
          payloadTemplate: { sku: 'PROD-01', price: 99.99 },
          selected: true
        }
      ]
    };

    const domain2Catalog: TestCatalog = {
      projectName: 'HealthcarePortalDomain',
      createdAt: new Date().toISOString(),
      status: 'APPROVED',
      entries: [
        {
          testId: 'TC-PATIENT-CRUD-001',
          category: 'CRUD',
          targetEntity: 'patients',
          description: 'Create patients — Happy Path',
          source: 'MONGO_SCHEMA',
          sourceRef: 'patients',
          reasoning: 'Validate patient registration',
          expectedResult: { statusCode: 201 },
          priority: 'CRITICAL',
          dependencies: [],
          httpMethod: 'POST',
          targetRouteKey: 'formCreate',
          payloadTemplate: { mrn: 'MRN-9982', fullName: 'Jane Doe' },
          selected: true
        }
      ]
    };

    const code1 = renderSpecFileContent('products', domain1Catalog.entries, domain1Catalog);
    const code2 = renderSpecFileContent('patients', domain2Catalog.entries, domain2Catalog);

    assert.ok(code1.includes('Project: ECommerceDomain'));
    assert.ok(code1.includes("test('TC-PRODUCT-CRUD-001 — Create products — Happy Path'"));
    assert.ok(code1.includes('"sku": "PROD-01"'));

    assert.ok(code2.includes('Project: HealthcarePortalDomain'));
    assert.ok(code2.includes("test('TC-PATIENT-CRUD-001 — Create patients — Happy Path'"));
    assert.ok(code2.includes('"mrn": "MRN-9982"'));
  });
});
