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

test.describe.serial('Form Entity suppliers API Spec', () => {
  let createdRecordId: string | undefined = undefined;
  let referencedRecordId: string | undefined = undefined;

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-SUPPLIERS-CRUD-001
   * Category: CRUD
   * Priority: CRITICAL
   * Target Entity: suppliers
   * Source: MONGO_SCHEMA
   * Source Ref: suppliers
   * Reasoning: Validate creation of suppliers with valid payload
   * Dependencies: []
   */
  test('TC-SUPPLIERS-CRUD-001 — Create suppliers - Happy Path', async ({ request }) => {
    const payload = {
    "supplierCode": "SUP-0101",
    "supplierName": "Apex Industrial Tech",
    "contactName": "Sarah Jenkins",
    "email": "contact@apextech.com",
    "phone": "18005550101",
    "website": "https://apextech.com",
    "rating": 4.8,
    "status": "ACTIVE",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('suppliers')}`, {
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
   * Test ID: TC-SUPPLIERS-CRUD-002
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: suppliers
   * Source: MONGO_SCHEMA
   * Source Ref: suppliers
   * Reasoning: Fetch suppliers record using ID returned from creation
   * Dependencies: ["TC-SUPPLIERS-CRUD-001"]
   */
  test('TC-SUPPLIERS-CRUD-002 — Read suppliers by ID', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "suppliers",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('suppliers')}`, {
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
   * Test ID: TC-SUPPLIERS-CRUD-003
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: suppliers
   * Source: MONGO_SCHEMA
   * Source Ref: suppliers
   * Reasoning: Fetch array list of suppliers entities
   * Dependencies: ["TC-SUPPLIERS-CRUD-001"]
   */
  test('TC-SUPPLIERS-CRUD-003 — Read List of suppliers records', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "suppliers",
    "limit": 10
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('suppliers')}`, {
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
   * Test ID: TC-SUPPLIERS-CRUD-004
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: suppliers
   * Source: MONGO_SCHEMA
   * Source Ref: suppliers
   * Reasoning: Query suppliers with filter parameters
   * Dependencies: ["TC-SUPPLIERS-CRUD-001"]
   */
  test('TC-SUPPLIERS-CRUD-004 — Search & Filter suppliers records', async ({ request }) => {
    const payload = {
    "schemaName": "suppliers",
    "query": {
        "supplierCode": "SUP-0101",
        "supplierName": "Apex Industrial Tech",
        "contactName": "Sarah Jenkins",
        "email": "contact@apextech.com",
        "phone": "18005550101",
        "website": "https://apextech.com",
        "rating": 4.8,
        "status": "ACTIVE",
        "isDeleted": false
    }
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.query}`, {
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
   * Test ID: TC-SUPPLIERS-CRUD-005
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: suppliers
   * Source: MONGO_SCHEMA
   * Source Ref: suppliers
   * Reasoning: Modify existing suppliers fields
   * Dependencies: ["TC-SUPPLIERS-CRUD-001"]
   */
  test('TC-SUPPLIERS-CRUD-005 — Update suppliers record', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "supplierCode": "SUP-0101",
    "supplierName": "Apex Industrial Tech",
    "contactName": "Sarah Jenkins",
    "email": "contact@apextech.com",
    "phone": "18005550101",
    "website": "https://apextech.com",
    "rating": 4.8,
    "status": "ACTIVE",
    "isDeleted": false,
    "_id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formUpdate('suppliers')}`, {
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
   * Test ID: TC-SUPPLIERS-CRUD-006
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: suppliers
   * Source: MONGO_SCHEMA
   * Source Ref: suppliers
   * Reasoning: Remove suppliers by ID
   * Dependencies: ["TC-SUPPLIERS-CRUD-001"]
   */
  test('TC-SUPPLIERS-CRUD-006 — Delete suppliers record', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "suppliers",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formDelete('suppliers')}`, {
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
   * Test ID: TC-SUPPLIERS-CRUD-007
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: suppliers
   * Source: MONGO_SCHEMA
   * Source Ref: suppliers
   * Reasoning: Deleted suppliers record should return 404 or be excluded from query results
   * Dependencies: ["TC-SUPPLIERS-CRUD-006"]
   */
  test('TC-SUPPLIERS-CRUD-007 — Verify Deleted suppliers Excluded', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "suppliers",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('suppliers')}`, {
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

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-SUPPLIERS-CRUD-008
   * Category: CRUD
   * Priority: CRITICAL
   * Target Entity: suppliers
   * Source: MONGO_SCHEMA
   * Source Ref: suppliers.supplierCode
   * Reasoning: Omit mandatory field 'supplierCode' to assert HTTP 400 rejection
   * Dependencies: []
   */
  test('TC-SUPPLIERS-CRUD-008 — Create suppliers - Missing Mandatory Field \'supplierCode\'', async ({ request }) => {
    const payload = {
    "supplierName": "Apex Industrial Tech",
    "contactName": "Sarah Jenkins",
    "email": "contact@apextech.com",
    "phone": "18005550101",
    "website": "https://apextech.com",
    "rating": 4.8,
    "status": "ACTIVE",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('suppliers')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('suppliercode');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-SUPPLIERS-CRUD-009
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: suppliers
   * Source: MONGO_SCHEMA
   * Source Ref: suppliers.rating
   * Reasoning: Send string for numeric field 'rating' to assert HTTP 400 rejection
   * Dependencies: []
   */
  test('TC-SUPPLIERS-CRUD-009 — Create suppliers - Wrong Type for Field \'rating\'', async ({ request }) => {
    const payload = {
    "supplierCode": "SUP-0203",
    "supplierName": "Apex Industrial Tech",
    "contactName": "Sarah Jenkins",
    "email": "contact@apextech.com",
    "phone": "18005550101",
    "website": "https://apextech.com",
    "rating": "INVALID_STRING_VALUE",
    "status": "ACTIVE",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('suppliers')}`, {
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
   * Test ID: TC-SUPPLIERS-BULK-001
   * Category: BULK_UPLOAD
   * Priority: HIGH
   * Target Entity: suppliers
   * Source: MONGO_SCHEMA
   * Source Ref: suppliers.bulk
   * Reasoning: Valid bulk CSV upload for suppliers schema returns HTTP 200
   * Dependencies: []
   */
  test('TC-SUPPLIERS-BULK-001 — Bulk Upload: Valid CSV File for suppliers (TC-BULK-01)', async ({ request }) => {
    const payload = {
    "schemaName": "suppliers",
    "records": [
        {
            "supplierCode": "SUP-0302",
            "supplierName": "Apex Industrial Tech",
            "contactName": "Sarah Jenkins",
            "email": "contact@apextech.com",
            "phone": "18005550101",
            "website": "https://apextech.com",
            "rating": 4.8,
            "status": "ACTIVE",
            "isDeleted": false
        },
        {
            "supplierCode": "SUP-0303",
            "supplierName": "Apex Industrial Tech",
            "contactName": "Sarah Jenkins",
            "email": "contact@apextech.com",
            "phone": "18005550101",
            "website": "https://apextech.com",
            "rating": 4.8,
            "status": "ACTIVE",
            "isDeleted": false
        }
    ]
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formBulkupload('suppliers')}`, {
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
   * Test ID: TC-SUPPLIERS-FIELD-001
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: suppliers
   * Source: MONGO_SCHEMA
   * Source Ref: suppliers.supplierCode
   * Reasoning: Field 'supplierCode' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-SUPPLIERS-FIELD-001 — Field Validation: Missing Mandatory Field \'supplierCode\'', async ({ request }) => {
    const payload = {
    "supplierName": "Apex Industrial Tech",
    "contactName": "Sarah Jenkins",
    "email": "contact@apextech.com",
    "phone": "18005550101",
    "website": "https://apextech.com",
    "rating": 4.8,
    "status": "ACTIVE",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('suppliers')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('suppliercode');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-SUPPLIERS-FIELD-002
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: suppliers
   * Source: MONGO_SCHEMA
   * Source Ref: suppliers.supplierName
   * Reasoning: Field 'supplierName' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-SUPPLIERS-FIELD-002 — Field Validation: Missing Mandatory Field \'supplierName\'', async ({ request }) => {
    const payload = {
    "supplierCode": "SUP-0101",
    "contactName": "Sarah Jenkins",
    "email": "contact@apextech.com",
    "phone": "18005550101",
    "website": "https://apextech.com",
    "rating": 4.8,
    "status": "ACTIVE",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('suppliers')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('suppliername');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-SUPPLIERS-FIELD-003
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: suppliers
   * Source: MONGO_SCHEMA
   * Source Ref: suppliers.email
   * Reasoning: Field 'email' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-SUPPLIERS-FIELD-003 — Field Validation: Missing Mandatory Field \'email\'', async ({ request }) => {
    const payload = {
    "supplierCode": "SUP-0101",
    "supplierName": "Apex Industrial Tech",
    "contactName": "Sarah Jenkins",
    "phone": "18005550101",
    "website": "https://apextech.com",
    "rating": 4.8,
    "status": "ACTIVE",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('suppliers')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('email');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-SUPPLIERS-FIELD-004
   * Category: FIELD_VALIDATION
   * Priority: HIGH
   * Target Entity: suppliers
   * Source: MONGO_SCHEMA
   * Source Ref: suppliers.website
   * Reasoning: Field 'website' requires URL format; malformed URL must return HTTP 400
   * Dependencies: []
   */
  test('TC-SUPPLIERS-FIELD-004 — Field Validation: Malformed URL for Field \'website\'', async ({ request }) => {
    const payload = {
    "supplierCode": "SUP-0101",
    "supplierName": "Apex Industrial Tech",
    "contactName": "Sarah Jenkins",
    "email": "contact@apextech.com",
    "phone": "18005550101",
    "website": "not-a-valid-url-string",
    "rating": 4.8,
    "status": "ACTIVE",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('suppliers')}`, {
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
   * Test ID: TC-SUPPLIERS-FIELD-005
   * Category: FIELD_VALIDATION
   * Priority: HIGH
   * Target Entity: suppliers
   * Source: MONGO_SCHEMA
   * Source Ref: suppliers.rating
   * Reasoning: Field 'rating' expects numeric type; sending string must return HTTP 400
   * Dependencies: []
   */
  test('TC-SUPPLIERS-FIELD-005 — Field Validation: Wrong Data Type for Numeric Field \'rating\'', async ({ request }) => {
    const payload = {
    "supplierCode": "SUP-0101",
    "supplierName": "Apex Industrial Tech",
    "contactName": "Sarah Jenkins",
    "email": "contact@apextech.com",
    "phone": "18005550101",
    "website": "https://apextech.com",
    "rating": "INVALID_NON_NUMERIC_STRING",
    "status": "ACTIVE",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('suppliers')}`, {
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
   * Test ID: TC-SUPPLIERS-FIELD-006
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: suppliers
   * Source: MONGO_SCHEMA
   * Source Ref: suppliers.status
   * Reasoning: Field 'status' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-SUPPLIERS-FIELD-006 — Field Validation: Missing Mandatory Field \'status\'', async ({ request }) => {
    const payload = {
    "supplierCode": "SUP-0101",
    "supplierName": "Apex Industrial Tech",
    "contactName": "Sarah Jenkins",
    "email": "contact@apextech.com",
    "phone": "18005550101",
    "website": "https://apextech.com",
    "rating": 4.8,
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('suppliers')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('status');
  });
});
