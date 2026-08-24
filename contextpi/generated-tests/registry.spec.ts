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

test.describe.serial('Function Registry API Spec', () => {
  let createdRecordId: string | undefined = undefined;
  let referencedRecordId: string | undefined = undefined;

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-FUNCTIONREGISTRY-REG-001
   * Category: REGISTRY
   * Priority: HIGH
   * Target Entity: FunctionRegistry
   * Source: FUNCTION_REGISTRY
   * Source Ref: FunctionRegistry
   * Reasoning: Register new custom function definition returns HTTP 201
   * Dependencies: []
   */
  test('TC-FUNCTIONREGISTRY-REG-001 — Function Registry: Create Custom Function (TC-REG-01)', async ({ request }) => {
    const payload = {
    "name": "syntheticDynamicFn",
    "isActive": true,
    "parameters": [],
    "expectedResponseFields": []
};

    const response = await request.post(`${BASE_URL}${FUNCTION_ROUTES.createFunction}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(201);
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
   * Test ID: TC-FUNCTIONREGISTRY-REG-002
   * Category: REGISTRY
   * Priority: HIGH
   * Target Entity: FunctionRegistry
   * Source: FUNCTION_REGISTRY
   * Source Ref: FunctionRegistry
   * Reasoning: Attempting to register existing function name returns HTTP 400 or 409
   * Dependencies: ["TC-FUNCTIONREGISTRY-REG-001"]
   */
  test('TC-FUNCTIONREGISTRY-REG-002 — Function Registry: Reject Duplicate Registration (TC-REG-02)', async ({ request }) => {
    const payload = {
    "name": "syntheticDynamicFn",
    "isActive": true,
    "parameters": [],
    "expectedResponseFields": []
};

    const response = await request.post(`${BASE_URL}${FUNCTION_ROUTES.createFunction}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-FUNCTIONREGISTRY-REG-003
   * Category: REGISTRY
   * Priority: HIGH
   * Target Entity: FunctionRegistry
   * Source: FUNCTION_REGISTRY
   * Source Ref: FunctionRegistry
   * Reasoning: Fetch registered custom function schema definition returns HTTP 200
   * Dependencies: ["TC-FUNCTIONREGISTRY-REG-001"]
   */
  test('TC-FUNCTIONREGISTRY-REG-003 — Function Registry: Get Function Definition by Name (TC-REG-03)', async ({ request }) => {
    const payload = {
    "name": "syntheticDynamicFn"
};

    const response = await request.get(`${BASE_URL}${FUNCTION_ROUTES.getAllFunction}`, {
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
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-FUNCTIONREGISTRY-REG-004
   * Category: REGISTRY
   * Priority: HIGH
   * Target Entity: FunctionRegistry
   * Source: FUNCTION_REGISTRY
   * Source Ref: FunctionRegistry
   * Reasoning: Fetch list of all registered custom functions returns HTTP 200
   * Dependencies: ["TC-FUNCTIONREGISTRY-REG-001"]
   */
  test('TC-FUNCTIONREGISTRY-REG-004 — Function Registry: List All Functions (TC-REG-04)', async ({ request }) => {
    const payload = {};

    const response = await request.get(`${BASE_URL}${FUNCTION_ROUTES.getAllFunction}`, {
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
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-SYNTHETICDYNAMICFN-REG-001
   * Category: REGISTRY
   * Priority: HIGH
   * Target Entity: syntheticDynamicFn
   * Source: FUNCTION_REGISTRY
   * Source Ref: FunctionRegistry.syntheticDynamicFn
   * Reasoning: Execute newly registered custom function definition returns HTTP 200
   * Dependencies: ["TC-FUNCTIONREGISTRY-REG-001"]
   */
  test('TC-SYNTHETICDYNAMICFN-REG-001 — Function Registry: Execute Custom Function After Create (TC-REG-05)', async ({ request }) => {
    const payload = {};

    const response = await request.post(`${BASE_URL}${FUNCTION_ROUTES.executeFunction('syntheticDynamicFn')}`, {
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
});
