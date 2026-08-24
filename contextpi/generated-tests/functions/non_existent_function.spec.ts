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

test.describe.serial('Function NON_EXISTENT_FUNCTION API Spec', () => {
  let createdRecordId: string | undefined = undefined;
  let referencedRecordId: string | undefined = undefined;

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-NONEXISTENTFUNCTION-FUNC-001
   * Category: CUSTOM_FUNCTION
   * Priority: MEDIUM
   * Target Entity: NON_EXISTENT_FUNCTION
   * Source: FUNCTION_REGISTRY
   * Source Ref: FunctionRegistry.NON_EXISTENT_FUNCTION
   * Reasoning: Executing unregistered function returns HTTP 404
   * Dependencies: []
   */
  test('TC-NONEXISTENTFUNCTION-FUNC-001 — Custom Function: Target Unknown Function Route', async ({ request }) => {
    const payload = {
    "functionName": "NON_EXISTENT_FUNCTION"
};

    const response = await request.post(`${BASE_URL}${FUNCTION_ROUTES.executeFunction('NON_EXISTENT_FUNCTION')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body).toBeDefined();
  });
});
