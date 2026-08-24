/**
 * Contextπ Generated Playwright API Test Spec
 * Project: NexaSupply
 * Status: APPROVED
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.API_BASE_URL || '';
const PROJECT_NAME = process.env.PROJECT_NAME || 'NexaSupply';

// Route Key Contracts
const FORM_ROUTES = {
  formGet: (schema: string) => '/forms/formGet/' + schema,
  formCreate: (schema: string) => '/forms/formCreate/' + schema,
  formUpdate: (schema: string) => '/forms/formUpdate/' + schema,
  formDelete: (schema: string) => '/forms/formDelete/' + schema,
  formBulkupload: (schema: string) => '/forms/formBulkupload/' + schema,
  query: '/forms/query'
};

const FUNCTION_ROUTES = {
  executeFunction: (name: string) => '/function/:name'.replace(':name', name),
  createFunction: '/function/createfunction',
  getAllFunction: '/function/getAllfunction'
};

test.describe.serial('Function calculateDiscount API Spec', () => {
  let createdRecordId: string | undefined = undefined;
  let referencedRecordId: string | undefined = undefined;

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-CALCULATEDISCOUNT-FUNC-001
   * Category: CUSTOM_FUNCTION
   * Priority: HIGH
   * Target Entity: calculateDiscount
   * Source: FUNCTION_REGISTRY
   * Source Ref: FunctionRegistry.calculateDiscount
   * Reasoning: Execute function 'calculateDiscount' with valid active parameters returns HTTP 200
   * Dependencies: []
   */
  test('TC-CALCULATEDISCOUNT-FUNC-001 — Custom Function: Execute \'calculateDiscount\' - Happy Path', async ({ request }) => {
    const payload = {
    "itemCode": "SAMPLE_ITEMCODE",
    "discountPercentage": 10
};

    const response = await request.post(`${BASE_URL}${FUNCTION_ROUTES.executeFunction('calculateDiscount')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(typeof body === 'object' && body !== null).toBeTruthy();
    if (body.id || body._id || body.data?._id || body.data?.id) {
      const capturedId = body.id || body._id || body.data?._id || body.data?.id;
      if (typeof capturedId === 'string' && capturedId.length > 0) {
        createdRecordId = capturedId;
      }
    }
    expect(createdRecordId || body, 'Positive creation response must return valid record').toBeDefined();
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-CALCULATEDISCOUNT-FUNC-002
   * Category: CUSTOM_FUNCTION
   * Priority: MEDIUM
   * Target Entity: calculateDiscount
   * Source: FUNCTION_REGISTRY
   * Source Ref: FunctionRegistry.calculateDiscount.itemCode
   * Reasoning: Required parameter 'itemCode' omitted; function execution returns HTTP 400
   * Dependencies: []
   */
  test('TC-CALCULATEDISCOUNT-FUNC-002 — Custom Function: Execute \'calculateDiscount\' - Missing Required Parameter \'itemCode\'', async ({ request }) => {
    const payload = {
    "discountPercentage": 10
};

    const response = await request.post(`${BASE_URL}${FUNCTION_ROUTES.executeFunction('calculateDiscount')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('itemcode');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-CALCULATEDISCOUNT-FUNC-003
   * Category: CUSTOM_FUNCTION
   * Priority: HIGH
   * Target Entity: calculateDiscount
   * Source: FUNCTION_REGISTRY
   * Source Ref: FunctionRegistry.calculateDiscount
   * Reasoning: Assert returned response payload contains expected structured response fields
   * Dependencies: ["TC-CALCULATEDISCOUNT-FUNC-001"]
   */
  test('TC-CALCULATEDISCOUNT-FUNC-003 — Custom Function: Assert Response Schema for \'calculateDiscount\'', async ({ request }) => {
    const payload = {
    "itemCode": "SAMPLE_ITEMCODE",
    "discountPercentage": 10
};

    const response = await request.post(`${BASE_URL}${FUNCTION_ROUTES.executeFunction('calculateDiscount')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(typeof body === 'object' && body !== null).toBeTruthy();
    expect(body).toHaveProperty('discountedPrice');
    expect(typeof body.discountedPrice).toBe('number');
    expect(body).toHaveProperty('savingsAmount');
    expect(typeof body.savingsAmount).toBe('number');
    expect(body).toHaveProperty('status');
    expect(typeof body.status).toBe('string');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-CALCULATEDISCOUNT-FUNC-004
   * Category: CUSTOM_FUNCTION
   * Priority: MEDIUM
   * Target Entity: calculateDiscount
   * Source: FUNCTION_REGISTRY
   * Source Ref: FunctionRegistry.calculateDiscount
   * Reasoning: Executing function under wrong project scope returns HTTP 403 or 404
   * Dependencies: []
   */
  test('TC-CALCULATEDISCOUNT-FUNC-004 — Custom Function: Execute \'calculateDiscount\' under Invalid Project Context', async ({ request }) => {
    const payload = {
    "itemCode": "SAMPLE_ITEMCODE",
    "discountPercentage": 10,
    "projectName": "INVALID_PROJECT_NAME_XYZ"
};

    const response = await request.post(`${BASE_URL}${FUNCTION_ROUTES.executeFunction('calculateDiscount')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body).toBeDefined();
  });
});
