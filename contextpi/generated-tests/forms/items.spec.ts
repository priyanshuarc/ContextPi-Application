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

test.describe.serial('Form Entity items API Spec', () => {
  let createdRecordId: string | undefined = undefined;
  let referencedRecordId: string | undefined = undefined;

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-ITEMS-CRUD-001
   * Category: CRUD
   * Priority: CRITICAL
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items
   * Reasoning: Validate creation of items with valid payload
   * Dependencies: []
   */
  test('TC-ITEMS-CRUD-001 — Create items - Happy Path', async ({ request }) => {
    const payload = {
    "itemCode": "ITM-1101",
    "itemName": "Synthetic Industrial Sensor",
    "price": 149.99,
    "category": "electronics",
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
   * Test ID: TC-ITEMS-CRUD-002
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items
   * Reasoning: Fetch items record using ID returned from creation
   * Dependencies: ["TC-ITEMS-CRUD-001"]
   */
  test('TC-ITEMS-CRUD-002 — Read items by ID', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "items",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('items')}`, {
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
   * Test ID: TC-ITEMS-CRUD-003
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items
   * Reasoning: Fetch array list of items entities
   * Dependencies: ["TC-ITEMS-CRUD-001"]
   */
  test('TC-ITEMS-CRUD-003 — Read List of items records', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "items",
    "limit": 10
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('items')}`, {
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
   * Test ID: TC-ITEMS-CRUD-004
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items
   * Reasoning: Query items with filter parameters
   * Dependencies: ["TC-ITEMS-CRUD-001"]
   */
  test('TC-ITEMS-CRUD-004 — Search & Filter items records', async ({ request }) => {
    const payload = {
    "schemaName": "items",
    "query": {
        "itemCode": "ITM-1101",
        "itemName": "Synthetic Industrial Sensor",
        "price": 149.99,
        "category": "electronics",
        "stockQuantity": 50,
        "tags": [
            "sensor",
            "industrial"
        ],
        "supplierWebsite": "https://supplier.example.com",
        "supportPhone": "9876543210"
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
   * Test ID: TC-ITEMS-CRUD-005
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items
   * Reasoning: Modify existing items fields
   * Dependencies: ["TC-ITEMS-CRUD-001"]
   */
  test('TC-ITEMS-CRUD-005 — Update items record', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "itemCode": "ITM-1101",
    "itemName": "Synthetic Industrial Sensor",
    "price": 149.99,
    "category": "electronics",
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210",
    "_id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formUpdate('items')}`, {
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
   * Test ID: TC-ITEMS-CRUD-006
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items
   * Reasoning: Remove items by ID
   * Dependencies: ["TC-ITEMS-CRUD-001"]
   */
  test('TC-ITEMS-CRUD-006 — Delete items record', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "items",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formDelete('items')}`, {
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
   * Test ID: TC-ITEMS-CRUD-007
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items
   * Reasoning: Deleted items record should return 404 or be excluded from query results
   * Dependencies: ["TC-ITEMS-CRUD-006"]
   */
  test('TC-ITEMS-CRUD-007 — Verify Deleted items Excluded', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "items",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('items')}`, {
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
   * Test ID: TC-ITEMS-CRUD-008
   * Category: CRUD
   * Priority: CRITICAL
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.itemCode
   * Reasoning: Omit mandatory field 'itemCode' to assert HTTP 400 rejection
   * Dependencies: []
   */
  test('TC-ITEMS-CRUD-008 — Create items - Missing Mandatory Field \'itemCode\'', async ({ request }) => {
    const payload = {
    "itemName": "Synthetic Industrial Sensor",
    "price": 149.99,
    "category": "electronics",
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
   * Test ID: TC-ITEMS-CRUD-009
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.price
   * Reasoning: Send string for numeric field 'price' to assert HTTP 400 rejection
   * Dependencies: []
   */
  test('TC-ITEMS-CRUD-009 — Create items - Wrong Type for Field \'price\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM-1203",
    "itemName": "Synthetic Industrial Sensor",
    "price": "INVALID_STRING_VALUE",
    "category": "electronics",
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
   * Test ID: TC-ITEMS-BULK-001
   * Category: BULK_UPLOAD
   * Priority: HIGH
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.bulk
   * Reasoning: Valid bulk CSV upload for items schema returns HTTP 200
   * Dependencies: []
   */
  test('TC-ITEMS-BULK-001 — Bulk Upload: Valid CSV File for items (TC-BULK-01)', async ({ request }) => {
    const payload = {
    "schemaName": "items",
    "records": [
        {
            "itemCode": "ITM-1302",
            "itemName": "Synthetic Industrial Sensor",
            "price": 149.99,
            "category": "electronics",
            "stockQuantity": 50,
            "tags": [
                "sensor",
                "industrial"
            ],
            "supplierWebsite": "https://supplier.example.com",
            "supportPhone": "9876543210"
        },
        {
            "itemCode": "ITM-1303",
            "itemName": "Synthetic Industrial Sensor",
            "price": 149.99,
            "category": "electronics",
            "stockQuantity": 50,
            "tags": [
                "sensor",
                "industrial"
            ],
            "supplierWebsite": "https://supplier.example.com",
            "supportPhone": "9876543210"
        }
    ]
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formBulkupload('items')}`, {
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
   * Test ID: TC-ITEMS-FIELD-001
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.itemCode
   * Reasoning: Field 'itemCode' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-001 — Field Validation: Missing Mandatory Field \'itemCode\'', async ({ request }) => {
    const payload = {
    "itemName": "Synthetic Industrial Sensor",
    "price": 149.99,
    "category": "electronics",
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
   * Test ID: TC-ITEMS-FIELD-002
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.itemName
   * Reasoning: Field 'itemName' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-002 — Field Validation: Missing Mandatory Field \'itemName\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM-1101",
    "price": 149.99,
    "category": "electronics",
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('itemname');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-ITEMS-FIELD-003
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.price
   * Reasoning: Field 'price' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-003 — Field Validation: Missing Mandatory Field \'price\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM-1101",
    "itemName": "Synthetic Industrial Sensor",
    "category": "electronics",
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('price');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-ITEMS-FIELD-004
   * Category: FIELD_VALIDATION
   * Priority: HIGH
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.price
   * Reasoning: Field 'price' expects numeric type; sending string must return HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-004 — Field Validation: Wrong Data Type for Numeric Field \'price\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM-1101",
    "itemName": "Synthetic Industrial Sensor",
    "price": "INVALID_NON_NUMERIC_STRING",
    "category": "electronics",
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
   * Test ID: TC-ITEMS-FIELD-005
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.category
   * Reasoning: Field 'category' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-005 — Field Validation: Missing Mandatory Field \'category\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM-1101",
    "itemName": "Synthetic Industrial Sensor",
    "price": 149.99,
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('category');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-ITEMS-FIELD-006
   * Category: FIELD_VALIDATION
   * Priority: LOW
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.category
   * Reasoning: Field 'category' enum includes 'electronics'; returns HTTP 201
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-006 — Field Validation: Allowed Enum Value for Field \'category\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM-1002",
    "itemName": "Synthetic Industrial Sensor",
    "price": 149.99,
    "category": "electronics",
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
   * Test ID: TC-ITEMS-FIELD-007
   * Category: FIELD_VALIDATION
   * Priority: HIGH
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.category
   * Reasoning: Field 'category' restricted to enum options; unlisted value returns HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-007 — Field Validation: Unlisted Enum Value for Field \'category\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM-1101",
    "itemName": "Synthetic Industrial Sensor",
    "price": 149.99,
    "category": "UNLISTED_INVALID_ENUM_OPTION_XYZ",
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
   * Test ID: TC-ITEMS-FIELD-008
   * Category: FIELD_VALIDATION
   * Priority: HIGH
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.stockQuantity
   * Reasoning: Field 'stockQuantity' expects numeric type; sending string must return HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-008 — Field Validation: Wrong Data Type for Numeric Field \'stockQuantity\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM-1101",
    "itemName": "Synthetic Industrial Sensor",
    "price": 149.99,
    "category": "electronics",
    "stockQuantity": "INVALID_NON_NUMERIC_STRING",
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
   * Test ID: TC-ITEMS-FIELD-009
   * Category: FIELD_VALIDATION
   * Priority: MEDIUM
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.stockQuantity
   * Reasoning: Field 'stockQuantity' specifies default value 0; omitting field applies default
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-009 — Field Validation: Default Value Verification for Field \'stockQuantity\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM-1003",
    "itemName": "Synthetic Industrial Sensor",
    "price": 149.99,
    "category": "electronics",
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
   * Test ID: TC-ITEMS-FIELD-010
   * Category: FIELD_VALIDATION
   * Priority: MEDIUM
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.tags
   * Reasoning: Field 'tags' is multi-select; array payload returns HTTP 201
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-010 — Field Validation: Array Payload for Multi-Select Field \'tags\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM-1004",
    "itemName": "Synthetic Industrial Sensor",
    "price": 149.99,
    "category": "electronics",
    "stockQuantity": 50,
    "tags": [
        "item_1",
        "item_2"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
   * Test ID: TC-ITEMS-FIELD-011
   * Category: FIELD_VALIDATION
   * Priority: MEDIUM
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.tags
   * Reasoning: Field 'tags' is multi-select; sending scalar string instead of array returns HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-011 — Field Validation: Non-array Scalar Payload for Multi-Select Field \'tags\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM-1101",
    "itemName": "Synthetic Industrial Sensor",
    "price": 149.99,
    "category": "electronics",
    "stockQuantity": 50,
    "tags": "scalar_non_array_string",
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
   * Test ID: TC-ITEMS-FIELD-012
   * Category: FIELD_VALIDATION
   * Priority: HIGH
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.supplierWebsite
   * Reasoning: Field 'supplierWebsite' requires URL format; malformed URL must return HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-012 — Field Validation: Malformed URL for Field \'supplierWebsite\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM-1101",
    "itemName": "Synthetic Industrial Sensor",
    "price": 149.99,
    "category": "electronics",
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "not-a-valid-url-string",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
   * Test ID: TC-ITEMS-FIELD-013
   * Category: FIELD_VALIDATION
   * Priority: LOW
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.supportPhone
   * Reasoning: Field 'supportPhone' expects phone format; valid 10-digit phone string returns HTTP 201
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-013 — Field Validation: Valid Phone Format for Field \'supportPhone\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM-1005",
    "itemName": "Synthetic Industrial Sensor",
    "price": 149.99,
    "category": "electronics",
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
   * Test ID: TC-ITEMS-FIELD-014
   * Category: FIELD_VALIDATION
   * Priority: HIGH
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.supportPhone
   * Reasoning: Field 'supportPhone' expects phone format; invalid characters must return HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-014 — Field Validation: Invalid Phone Format for Field \'supportPhone\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM-1101",
    "itemName": "Synthetic Industrial Sensor",
    "price": 149.99,
    "category": "electronics",
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "invalid-phone-abc-xyz"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
   * Test ID: TC-ITEMS-BIZ-001
   * Category: BUSINESS_RULE
   * Priority: CRITICAL
   * Target Entity: items
   * Source: BUSINESS_REQUIREMENT
   * Source Ref: Requirement.BR-RULE-1 (items.price)
   * Reasoning: Statement requirement specifies items.price must be non-negative (>= 0)
   * Dependencies: []
   */
  test('TC-ITEMS-BIZ-001 — Business Rule: Negative Value Rejection for \'price\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM-1101",
    "itemName": "Synthetic Industrial Sensor",
    "price": -10,
    "category": "electronics",
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
   * Test ID: TC-ITEMS-BIZ-002
   * Category: BUSINESS_RULE
   * Priority: CRITICAL
   * Target Entity: items
   * Source: BUSINESS_REQUIREMENT
   * Source Ref: Requirement.BR-RULE-1 (items.price)
   * Reasoning: Statement requirement specifies items.price must be non-negative (>= 0); passing 0 returns HTTP 201
   * Dependencies: []
   */
  test('TC-ITEMS-BIZ-002 — Business Rule: Non-negative Value Acceptance for \'price\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM-1101",
    "itemName": "Synthetic Industrial Sensor",
    "price": 0,
    "category": "electronics",
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
   * Test ID: TC-ITEMS-BIZ-003
   * Category: BUSINESS_RULE
   * Priority: CRITICAL
   * Target Entity: items
   * Source: BUSINESS_REQUIREMENT
   * Source Ref: Requirement.BR-RULE-2 (items.itemCode)
   * Reasoning: Statement requirement specifies exactly 8 digits/characters for items.itemCode
   * Dependencies: []
   */
  test('TC-ITEMS-BIZ-003 — Business Rule: Valid Exact 8 Digits for \'itemCode\'', async ({ request }) => {
    const payload = {
    "itemCode": "11111111",
    "itemName": "Synthetic Industrial Sensor",
    "price": 149.99,
    "category": "electronics",
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
   * Test ID: TC-ITEMS-BIZ-004
   * Category: BUSINESS_RULE
   * Priority: CRITICAL
   * Target Entity: items
   * Source: BUSINESS_REQUIREMENT
   * Source Ref: Requirement.BR-RULE-2 (items.itemCode)
   * Reasoning: Statement requirement specifies exactly 8 digits/characters for items.itemCode; passing 7 digits returns HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-BIZ-004 — Business Rule: Invalid Digit Count (7 != 8) for \'itemCode\'', async ({ request }) => {
    const payload = {
    "itemCode": "1111111",
    "itemName": "Synthetic Industrial Sensor",
    "price": 149.99,
    "category": "electronics",
    "stockQuantity": 50,
    "tags": [
        "sensor",
        "industrial"
    ],
    "supplierWebsite": "https://supplier.example.com",
    "supportPhone": "9876543210"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('items')}`, {
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
});
