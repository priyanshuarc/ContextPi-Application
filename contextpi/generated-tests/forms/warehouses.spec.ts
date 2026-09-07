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

test.describe.serial('Form Entity warehouses API Spec', () => {
  let createdRecordId: string | undefined = undefined;
  let referencedRecordId: string | undefined = undefined;

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-WAREHOUSES-CRUD-001
   * Category: CRUD
   * Priority: CRITICAL
   * Target Entity: warehouses
   * Source: MONGO_SCHEMA
   * Source Ref: warehouses
   * Reasoning: Validate creation of warehouses with valid payload
   * Dependencies: []
   */
  test('TC-WAREHOUSES-CRUD-001 — Create warehouses - Happy Path', async ({ request }) => {
    const payload = {
    "warehouseCode": "WH-101",
    "warehouseName": "Central Distribution Hub",
    "managerName": "Robert Taylor",
    "email": "wh001@nexasupply.com",
    "phone": "18005550201",
    "address": "100 Logistics Way",
    "city": "Chicago",
    "country": "USA",
    "capacity": 50000,
    "currentUtilization": 32000,
    "status": "ACTIVE"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('warehouses')}`, {
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
   * Test ID: TC-WAREHOUSES-CRUD-002
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: warehouses
   * Source: MONGO_SCHEMA
   * Source Ref: warehouses
   * Reasoning: Fetch warehouses record using ID returned from creation
   * Dependencies: ["TC-WAREHOUSES-CRUD-001"]
   */
  test('TC-WAREHOUSES-CRUD-002 — Read warehouses by ID', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "warehouses",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('warehouses')}`, {
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
   * Test ID: TC-WAREHOUSES-CRUD-003
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: warehouses
   * Source: MONGO_SCHEMA
   * Source Ref: warehouses
   * Reasoning: Fetch array list of warehouses entities
   * Dependencies: ["TC-WAREHOUSES-CRUD-001"]
   */
  test('TC-WAREHOUSES-CRUD-003 — Read List of warehouses records', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "warehouses",
    "limit": 10
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('warehouses')}`, {
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
   * Test ID: TC-WAREHOUSES-CRUD-004
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: warehouses
   * Source: MONGO_SCHEMA
   * Source Ref: warehouses
   * Reasoning: Query warehouses with filter parameters
   * Dependencies: ["TC-WAREHOUSES-CRUD-001"]
   */
  test('TC-WAREHOUSES-CRUD-004 — Search & Filter warehouses records', async ({ request }) => {
    const payload = {
    "schemaName": "warehouses",
    "query": {
        "warehouseCode": "WH-101",
        "warehouseName": "Central Distribution Hub",
        "managerName": "Robert Taylor",
        "email": "wh001@nexasupply.com",
        "phone": "18005550201",
        "address": "100 Logistics Way",
        "city": "Chicago",
        "country": "USA",
        "capacity": 50000,
        "currentUtilization": 32000,
        "status": "ACTIVE"
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
   * Test ID: TC-WAREHOUSES-CRUD-005
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: warehouses
   * Source: MONGO_SCHEMA
   * Source Ref: warehouses
   * Reasoning: Modify existing warehouses fields
   * Dependencies: ["TC-WAREHOUSES-CRUD-001"]
   */
  test('TC-WAREHOUSES-CRUD-005 — Update warehouses record', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "warehouseCode": "WH-101",
    "warehouseName": "Central Distribution Hub",
    "managerName": "Robert Taylor",
    "email": "wh001@nexasupply.com",
    "phone": "18005550201",
    "address": "100 Logistics Way",
    "city": "Chicago",
    "country": "USA",
    "capacity": 50000,
    "currentUtilization": 32000,
    "status": "ACTIVE",
    "_id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formUpdate('warehouses')}`, {
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
   * Test ID: TC-WAREHOUSES-CRUD-006
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: warehouses
   * Source: MONGO_SCHEMA
   * Source Ref: warehouses
   * Reasoning: Remove warehouses by ID
   * Dependencies: ["TC-WAREHOUSES-CRUD-001"]
   */
  test('TC-WAREHOUSES-CRUD-006 — Delete warehouses record', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "warehouses",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formDelete('warehouses')}`, {
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
   * Test ID: TC-WAREHOUSES-CRUD-007
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: warehouses
   * Source: MONGO_SCHEMA
   * Source Ref: warehouses
   * Reasoning: Deleted warehouses record should return 404 or be excluded from query results
   * Dependencies: ["TC-WAREHOUSES-CRUD-006"]
   */
  test('TC-WAREHOUSES-CRUD-007 — Verify Deleted warehouses Excluded', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "warehouses",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('warehouses')}`, {
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
   * Test ID: TC-WAREHOUSES-CRUD-008
   * Category: CRUD
   * Priority: CRITICAL
   * Target Entity: warehouses
   * Source: MONGO_SCHEMA
   * Source Ref: warehouses.warehouseCode
   * Reasoning: Omit mandatory field 'warehouseCode' to assert HTTP 400 rejection
   * Dependencies: []
   */
  test('TC-WAREHOUSES-CRUD-008 — Create warehouses - Missing Mandatory Field \'warehouseCode\'', async ({ request }) => {
    const payload = {
    "warehouseName": "Central Distribution Hub",
    "managerName": "Robert Taylor",
    "email": "wh001@nexasupply.com",
    "phone": "18005550201",
    "address": "100 Logistics Way",
    "city": "Chicago",
    "country": "USA",
    "capacity": 50000,
    "currentUtilization": 32000,
    "status": "ACTIVE"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('warehouses')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('warehousecode');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-WAREHOUSES-CRUD-009
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: warehouses
   * Source: MONGO_SCHEMA
   * Source Ref: warehouses.capacity
   * Reasoning: Send string for numeric field 'capacity' to assert HTTP 400 rejection
   * Dependencies: []
   */
  test('TC-WAREHOUSES-CRUD-009 — Create warehouses - Wrong Type for Field \'capacity\'', async ({ request }) => {
    const payload = {
    "warehouseCode": "WH-203",
    "warehouseName": "Central Distribution Hub",
    "managerName": "Robert Taylor",
    "email": "wh001@nexasupply.com",
    "phone": "18005550201",
    "address": "100 Logistics Way",
    "city": "Chicago",
    "country": "USA",
    "capacity": "INVALID_STRING_VALUE",
    "currentUtilization": 32000,
    "status": "ACTIVE"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('warehouses')}`, {
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
   * Test ID: TC-WAREHOUSES-BULK-001
   * Category: BULK_UPLOAD
   * Priority: HIGH
   * Target Entity: warehouses
   * Source: MONGO_SCHEMA
   * Source Ref: warehouses.bulk
   * Reasoning: Valid bulk CSV upload for warehouses schema returns HTTP 200
   * Dependencies: []
   */
  test('TC-WAREHOUSES-BULK-001 — Bulk Upload: Valid CSV File for warehouses (TC-BULK-01)', async ({ request }) => {
    const payload = {
    "schemaName": "warehouses",
    "records": [
        {
            "warehouseCode": "WH-302",
            "warehouseName": "Central Distribution Hub",
            "managerName": "Robert Taylor",
            "email": "wh001@nexasupply.com",
            "phone": "18005550201",
            "address": "100 Logistics Way",
            "city": "Chicago",
            "country": "USA",
            "capacity": 50000,
            "currentUtilization": 32000,
            "status": "ACTIVE"
        },
        {
            "warehouseCode": "WH-303",
            "warehouseName": "Central Distribution Hub",
            "managerName": "Robert Taylor",
            "email": "wh001@nexasupply.com",
            "phone": "18005550201",
            "address": "100 Logistics Way",
            "city": "Chicago",
            "country": "USA",
            "capacity": 50000,
            "currentUtilization": 32000,
            "status": "ACTIVE"
        }
    ]
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formBulkupload('warehouses')}`, {
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
   * Test ID: TC-WAREHOUSES-FIELD-001
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: warehouses
   * Source: MONGO_SCHEMA
   * Source Ref: warehouses.warehouseCode
   * Reasoning: Field 'warehouseCode' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-WAREHOUSES-FIELD-001 — Field Validation: Missing Mandatory Field \'warehouseCode\'', async ({ request }) => {
    const payload = {
    "warehouseName": "Central Distribution Hub",
    "managerName": "Robert Taylor",
    "email": "wh001@nexasupply.com",
    "phone": "18005550201",
    "address": "100 Logistics Way",
    "city": "Chicago",
    "country": "USA",
    "capacity": 50000,
    "currentUtilization": 32000,
    "status": "ACTIVE"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('warehouses')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('warehousecode');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-WAREHOUSES-FIELD-002
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: warehouses
   * Source: MONGO_SCHEMA
   * Source Ref: warehouses.warehouseName
   * Reasoning: Field 'warehouseName' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-WAREHOUSES-FIELD-002 — Field Validation: Missing Mandatory Field \'warehouseName\'', async ({ request }) => {
    const payload = {
    "warehouseCode": "WH-101",
    "managerName": "Robert Taylor",
    "email": "wh001@nexasupply.com",
    "phone": "18005550201",
    "address": "100 Logistics Way",
    "city": "Chicago",
    "country": "USA",
    "capacity": 50000,
    "currentUtilization": 32000,
    "status": "ACTIVE"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('warehouses')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('warehousename');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-WAREHOUSES-FIELD-003
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: warehouses
   * Source: MONGO_SCHEMA
   * Source Ref: warehouses.capacity
   * Reasoning: Field 'capacity' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-WAREHOUSES-FIELD-003 — Field Validation: Missing Mandatory Field \'capacity\'', async ({ request }) => {
    const payload = {
    "warehouseCode": "WH-101",
    "warehouseName": "Central Distribution Hub",
    "managerName": "Robert Taylor",
    "email": "wh001@nexasupply.com",
    "phone": "18005550201",
    "address": "100 Logistics Way",
    "city": "Chicago",
    "country": "USA",
    "currentUtilization": 32000,
    "status": "ACTIVE"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('warehouses')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('capacity');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-WAREHOUSES-FIELD-004
   * Category: FIELD_VALIDATION
   * Priority: HIGH
   * Target Entity: warehouses
   * Source: MONGO_SCHEMA
   * Source Ref: warehouses.capacity
   * Reasoning: Field 'capacity' expects numeric type; sending string must return HTTP 400
   * Dependencies: []
   */
  test('TC-WAREHOUSES-FIELD-004 — Field Validation: Wrong Data Type for Numeric Field \'capacity\'', async ({ request }) => {
    const payload = {
    "warehouseCode": "WH-101",
    "warehouseName": "Central Distribution Hub",
    "managerName": "Robert Taylor",
    "email": "wh001@nexasupply.com",
    "phone": "18005550201",
    "address": "100 Logistics Way",
    "city": "Chicago",
    "country": "USA",
    "capacity": "INVALID_NON_NUMERIC_STRING",
    "currentUtilization": 32000,
    "status": "ACTIVE"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('warehouses')}`, {
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
   * Test ID: TC-WAREHOUSES-FIELD-005
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: warehouses
   * Source: MONGO_SCHEMA
   * Source Ref: warehouses.currentUtilization
   * Reasoning: Field 'currentUtilization' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-WAREHOUSES-FIELD-005 — Field Validation: Missing Mandatory Field \'currentUtilization\'', async ({ request }) => {
    const payload = {
    "warehouseCode": "WH-101",
    "warehouseName": "Central Distribution Hub",
    "managerName": "Robert Taylor",
    "email": "wh001@nexasupply.com",
    "phone": "18005550201",
    "address": "100 Logistics Way",
    "city": "Chicago",
    "country": "USA",
    "capacity": 50000,
    "status": "ACTIVE"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('warehouses')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('currentutilization');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-WAREHOUSES-FIELD-006
   * Category: FIELD_VALIDATION
   * Priority: HIGH
   * Target Entity: warehouses
   * Source: MONGO_SCHEMA
   * Source Ref: warehouses.currentUtilization
   * Reasoning: Field 'currentUtilization' expects numeric type; sending string must return HTTP 400
   * Dependencies: []
   */
  test('TC-WAREHOUSES-FIELD-006 — Field Validation: Wrong Data Type for Numeric Field \'currentUtilization\'', async ({ request }) => {
    const payload = {
    "warehouseCode": "WH-101",
    "warehouseName": "Central Distribution Hub",
    "managerName": "Robert Taylor",
    "email": "wh001@nexasupply.com",
    "phone": "18005550201",
    "address": "100 Logistics Way",
    "city": "Chicago",
    "country": "USA",
    "capacity": 50000,
    "currentUtilization": "INVALID_NON_NUMERIC_STRING",
    "status": "ACTIVE"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('warehouses')}`, {
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
   * Test ID: TC-WAREHOUSES-FIELD-007
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: warehouses
   * Source: MONGO_SCHEMA
   * Source Ref: warehouses.status
   * Reasoning: Field 'status' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-WAREHOUSES-FIELD-007 — Field Validation: Missing Mandatory Field \'status\'', async ({ request }) => {
    const payload = {
    "warehouseCode": "WH-101",
    "warehouseName": "Central Distribution Hub",
    "managerName": "Robert Taylor",
    "email": "wh001@nexasupply.com",
    "phone": "18005550201",
    "address": "100 Logistics Way",
    "city": "Chicago",
    "country": "USA",
    "capacity": 50000,
    "currentUtilization": 32000
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('warehouses')}`, {
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
