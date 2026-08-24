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

test.describe.serial('Form Entity NON_EXISTENT_ENTITY API Spec', () => {
  let createdRecordId: string | undefined = undefined;
  let referencedRecordId: string | undefined = undefined;

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-NONEXISTENTENTITY-CRUD-001
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: NON_EXISTENT_ENTITY
   * Source: MONGO_SCHEMA
   * Source Ref: NON_EXISTENT_ENTITY
   * Reasoning: Targeting unknown schema route must return HTTP 404
   * Dependencies: []
   */
  test('TC-NONEXISTENTENTITY-CRUD-001 — Create Request to Non-existent Entity Route', async ({ request }) => {
    const payload = {
    "schemaName": "NON_EXISTENT_ENTITY",
    "foo": "bar"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('NON_EXISTENT_ENTITY')}`, {
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
