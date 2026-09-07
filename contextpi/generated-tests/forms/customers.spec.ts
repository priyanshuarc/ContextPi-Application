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

test.describe.serial('Form Entity customers API Spec', () => {
  let createdRecordId: string | undefined = undefined;
  let referencedRecordId: string | undefined = undefined;

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-CUSTOMERS-CRUD-001
   * Category: CRUD
   * Priority: CRITICAL
   * Target Entity: customers
   * Source: MONGO_SCHEMA
   * Source Ref: customers
   * Reasoning: Validate creation of customers with valid payload
   * Dependencies: []
   */
  test('TC-CUSTOMERS-CRUD-001 — Create customers - Happy Path', async ({ request }) => {
    const payload = {
    "customerCode": "CUST-0101",
    "customerName": "Client Organization 1",
    "email": "contact.client1@enterprise.org",
    "phone": "1800555300",
    "customerType": "REGULAR",
    "creditLimit": 10000,
    "status": "ACTIVE",
    "address": "100 Commerce Blvd",
    "city": "New York",
    "country": "USA",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('customers')}`, {
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
   * Test ID: TC-CUSTOMERS-CRUD-002
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: customers
   * Source: MONGO_SCHEMA
   * Source Ref: customers
   * Reasoning: Fetch customers record using ID returned from creation
   * Dependencies: ["TC-CUSTOMERS-CRUD-001"]
   */
  test('TC-CUSTOMERS-CRUD-002 — Read customers by ID', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "customers",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('customers')}`, {
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
   * Test ID: TC-CUSTOMERS-CRUD-003
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: customers
   * Source: MONGO_SCHEMA
   * Source Ref: customers
   * Reasoning: Fetch array list of customers entities
   * Dependencies: ["TC-CUSTOMERS-CRUD-001"]
   */
  test('TC-CUSTOMERS-CRUD-003 — Read List of customers records', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "customers",
    "limit": 10
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('customers')}`, {
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
   * Test ID: TC-CUSTOMERS-CRUD-004
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: customers
   * Source: MONGO_SCHEMA
   * Source Ref: customers
   * Reasoning: Query customers with filter parameters
   * Dependencies: ["TC-CUSTOMERS-CRUD-001"]
   */
  test('TC-CUSTOMERS-CRUD-004 — Search & Filter customers records', async ({ request }) => {
    const payload = {
    "schemaName": "customers",
    "query": {
        "customerCode": "CUST-0101",
        "customerName": "Client Organization 1",
        "email": "contact.client1@enterprise.org",
        "phone": "1800555300",
        "customerType": "REGULAR",
        "creditLimit": 10000,
        "status": "ACTIVE",
        "address": "100 Commerce Blvd",
        "city": "New York",
        "country": "USA",
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
   * Test ID: TC-CUSTOMERS-CRUD-005
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: customers
   * Source: MONGO_SCHEMA
   * Source Ref: customers
   * Reasoning: Modify existing customers fields
   * Dependencies: ["TC-CUSTOMERS-CRUD-001"]
   */
  test('TC-CUSTOMERS-CRUD-005 — Update customers record', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "customerCode": "CUST-0101",
    "customerName": "Client Organization 1",
    "email": "contact.client1@enterprise.org",
    "phone": "1800555300",
    "customerType": "REGULAR",
    "creditLimit": 10000,
    "status": "ACTIVE",
    "address": "100 Commerce Blvd",
    "city": "New York",
    "country": "USA",
    "isDeleted": false,
    "_id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formUpdate('customers')}`, {
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
   * Test ID: TC-CUSTOMERS-CRUD-006
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: customers
   * Source: MONGO_SCHEMA
   * Source Ref: customers
   * Reasoning: Remove customers by ID
   * Dependencies: ["TC-CUSTOMERS-CRUD-001"]
   */
  test('TC-CUSTOMERS-CRUD-006 — Delete customers record', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "customers",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formDelete('customers')}`, {
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
   * Test ID: TC-CUSTOMERS-CRUD-007
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: customers
   * Source: MONGO_SCHEMA
   * Source Ref: customers
   * Reasoning: Deleted customers record should return 404 or be excluded from query results
   * Dependencies: ["TC-CUSTOMERS-CRUD-006"]
   */
  test('TC-CUSTOMERS-CRUD-007 — Verify Deleted customers Excluded', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "customers",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('customers')}`, {
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
   * Test ID: TC-CUSTOMERS-CRUD-008
   * Category: CRUD
   * Priority: CRITICAL
   * Target Entity: customers
   * Source: MONGO_SCHEMA
   * Source Ref: customers.customerCode
   * Reasoning: Omit mandatory field 'customerCode' to assert HTTP 400 rejection
   * Dependencies: []
   */
  test('TC-CUSTOMERS-CRUD-008 — Create customers - Missing Mandatory Field \'customerCode\'', async ({ request }) => {
    const payload = {
    "customerName": "Client Organization 1",
    "email": "contact.client1@enterprise.org",
    "phone": "1800555300",
    "customerType": "REGULAR",
    "creditLimit": 10000,
    "status": "ACTIVE",
    "address": "100 Commerce Blvd",
    "city": "New York",
    "country": "USA",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('customers')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('customercode');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-CUSTOMERS-CRUD-009
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: customers
   * Source: MONGO_SCHEMA
   * Source Ref: customers.creditLimit
   * Reasoning: Send string for numeric field 'creditLimit' to assert HTTP 400 rejection
   * Dependencies: []
   */
  test('TC-CUSTOMERS-CRUD-009 — Create customers - Wrong Type for Field \'creditLimit\'', async ({ request }) => {
    const payload = {
    "customerCode": "CUST-0203",
    "customerName": "Client Organization 1",
    "email": "contact.client1@enterprise.org",
    "phone": "1800555300",
    "customerType": "REGULAR",
    "creditLimit": "INVALID_STRING_VALUE",
    "status": "ACTIVE",
    "address": "100 Commerce Blvd",
    "city": "New York",
    "country": "USA",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('customers')}`, {
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
   * Test ID: TC-CUSTOMERS-BULK-001
   * Category: BULK_UPLOAD
   * Priority: HIGH
   * Target Entity: customers
   * Source: MONGO_SCHEMA
   * Source Ref: customers.bulk
   * Reasoning: Valid bulk CSV upload for customers schema returns HTTP 200
   * Dependencies: []
   */
  test('TC-CUSTOMERS-BULK-001 — Bulk Upload: Valid CSV File for customers (TC-BULK-01)', async ({ request }) => {
    const payload = {
    "schemaName": "customers",
    "records": [
        {
            "customerCode": "CUST-0302",
            "customerName": "Client Organization 1",
            "email": "contact.client1@enterprise.org",
            "phone": "1800555300",
            "customerType": "REGULAR",
            "creditLimit": 10000,
            "status": "ACTIVE",
            "address": "100 Commerce Blvd",
            "city": "New York",
            "country": "USA",
            "isDeleted": false
        },
        {
            "customerCode": "CUST-0303",
            "customerName": "Client Organization 1",
            "email": "contact.client1@enterprise.org",
            "phone": "1800555300",
            "customerType": "REGULAR",
            "creditLimit": 10000,
            "status": "ACTIVE",
            "address": "100 Commerce Blvd",
            "city": "New York",
            "country": "USA",
            "isDeleted": false
        }
    ]
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formBulkupload('customers')}`, {
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
   * Test ID: TC-CUSTOMERS-FIELD-001
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: customers
   * Source: MONGO_SCHEMA
   * Source Ref: customers.customerCode
   * Reasoning: Field 'customerCode' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-CUSTOMERS-FIELD-001 — Field Validation: Missing Mandatory Field \'customerCode\'', async ({ request }) => {
    const payload = {
    "customerName": "Client Organization 1",
    "email": "contact.client1@enterprise.org",
    "phone": "1800555300",
    "customerType": "REGULAR",
    "creditLimit": 10000,
    "status": "ACTIVE",
    "address": "100 Commerce Blvd",
    "city": "New York",
    "country": "USA",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('customers')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('customercode');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-CUSTOMERS-FIELD-002
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: customers
   * Source: MONGO_SCHEMA
   * Source Ref: customers.customerName
   * Reasoning: Field 'customerName' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-CUSTOMERS-FIELD-002 — Field Validation: Missing Mandatory Field \'customerName\'', async ({ request }) => {
    const payload = {
    "customerCode": "CUST-0101",
    "email": "contact.client1@enterprise.org",
    "phone": "1800555300",
    "customerType": "REGULAR",
    "creditLimit": 10000,
    "status": "ACTIVE",
    "address": "100 Commerce Blvd",
    "city": "New York",
    "country": "USA",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('customers')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('customername');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-CUSTOMERS-FIELD-003
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: customers
   * Source: MONGO_SCHEMA
   * Source Ref: customers.email
   * Reasoning: Field 'email' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-CUSTOMERS-FIELD-003 — Field Validation: Missing Mandatory Field \'email\'', async ({ request }) => {
    const payload = {
    "customerCode": "CUST-0101",
    "customerName": "Client Organization 1",
    "phone": "1800555300",
    "customerType": "REGULAR",
    "creditLimit": 10000,
    "status": "ACTIVE",
    "address": "100 Commerce Blvd",
    "city": "New York",
    "country": "USA",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('customers')}`, {
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
   * Test ID: TC-CUSTOMERS-FIELD-004
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: customers
   * Source: MONGO_SCHEMA
   * Source Ref: customers.customerType
   * Reasoning: Field 'customerType' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-CUSTOMERS-FIELD-004 — Field Validation: Missing Mandatory Field \'customerType\'', async ({ request }) => {
    const payload = {
    "customerCode": "CUST-0101",
    "customerName": "Client Organization 1",
    "email": "contact.client1@enterprise.org",
    "phone": "1800555300",
    "creditLimit": 10000,
    "status": "ACTIVE",
    "address": "100 Commerce Blvd",
    "city": "New York",
    "country": "USA",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('customers')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('customertype');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-CUSTOMERS-FIELD-005
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: customers
   * Source: MONGO_SCHEMA
   * Source Ref: customers.creditLimit
   * Reasoning: Field 'creditLimit' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-CUSTOMERS-FIELD-005 — Field Validation: Missing Mandatory Field \'creditLimit\'', async ({ request }) => {
    const payload = {
    "customerCode": "CUST-0101",
    "customerName": "Client Organization 1",
    "email": "contact.client1@enterprise.org",
    "phone": "1800555300",
    "customerType": "REGULAR",
    "status": "ACTIVE",
    "address": "100 Commerce Blvd",
    "city": "New York",
    "country": "USA",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('customers')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('creditlimit');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-CUSTOMERS-FIELD-006
   * Category: FIELD_VALIDATION
   * Priority: HIGH
   * Target Entity: customers
   * Source: MONGO_SCHEMA
   * Source Ref: customers.creditLimit
   * Reasoning: Field 'creditLimit' expects numeric type; sending string must return HTTP 400
   * Dependencies: []
   */
  test('TC-CUSTOMERS-FIELD-006 — Field Validation: Wrong Data Type for Numeric Field \'creditLimit\'', async ({ request }) => {
    const payload = {
    "customerCode": "CUST-0101",
    "customerName": "Client Organization 1",
    "email": "contact.client1@enterprise.org",
    "phone": "1800555300",
    "customerType": "REGULAR",
    "creditLimit": "INVALID_NON_NUMERIC_STRING",
    "status": "ACTIVE",
    "address": "100 Commerce Blvd",
    "city": "New York",
    "country": "USA",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('customers')}`, {
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
   * Test ID: TC-CUSTOMERS-FIELD-007
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: customers
   * Source: MONGO_SCHEMA
   * Source Ref: customers.status
   * Reasoning: Field 'status' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-CUSTOMERS-FIELD-007 — Field Validation: Missing Mandatory Field \'status\'', async ({ request }) => {
    const payload = {
    "customerCode": "CUST-0101",
    "customerName": "Client Organization 1",
    "email": "contact.client1@enterprise.org",
    "phone": "1800555300",
    "customerType": "REGULAR",
    "creditLimit": 10000,
    "address": "100 Commerce Blvd",
    "city": "New York",
    "country": "USA",
    "isDeleted": false
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('customers')}`, {
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
