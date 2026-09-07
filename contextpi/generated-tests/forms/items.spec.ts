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
    "itemCode": "ITM10101",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "costPrice": 32.49,
    "stockQuantity": 50,
    "reorderLevel": 20,
    "supplierId": "6a8bca5862985f737dee03e108",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
        "itemCode": "ITM10101",
        "itemName": "Professional ELECTRONICS Product 1",
        "description": "High performance grade item engineered for electronics operations.",
        "category": "electronics",
        "subCategory": "SubCategory-1",
        "brand": "NexaBrand-1",
        "price": 49.99,
        "costPrice": 32.49,
        "stockQuantity": 50,
        "reorderLevel": 20,
        "supplierId": "6a8bca5862985f737dee03e108",
        "warehouseId": "6a8bca5862985f737dee07d100",
        "sku": "SKU-ELE-ITM10001",
        "barcode": "890123456880",
        "unit": "pcs",
        "status": "ACTIVE",
        "tags": [
            "electronics",
            "supply",
            "grade-1"
        ],
        "supplierWebsite": "https://supplier1.com",
        "supportPhone": "18005559999",
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
    "itemCode": "ITM10101",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "costPrice": 32.49,
    "stockQuantity": 50,
    "reorderLevel": 20,
    "supplierId": "6a8bca5862985f737dee03e108",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false,
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
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "costPrice": 32.49,
    "stockQuantity": 50,
    "reorderLevel": 20,
    "supplierId": "6a8bca5862985f737dee03e209",
    "warehouseId": "6a8bca5862985f737dee07d201",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456981",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
    "itemCode": "ITM10203",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": "INVALID_STRING_VALUE",
    "costPrice": 32.49,
    "stockQuantity": 50,
    "reorderLevel": 20,
    "supplierId": "6a8bca5862985f737dee03e210",
    "warehouseId": "6a8bca5862985f737dee07d202",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456982",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
            "itemCode": "ITM10302",
            "itemName": "Professional ELECTRONICS Product 1",
            "description": "High performance grade item engineered for electronics operations.",
            "category": "electronics",
            "subCategory": "SubCategory-1",
            "brand": "NexaBrand-1",
            "price": 49.99,
            "costPrice": 32.49,
            "stockQuantity": 50,
            "reorderLevel": 20,
            "supplierId": "6a8bca5862985f737dee03e309",
            "warehouseId": "6a8bca5862985f737dee07d301",
            "sku": "SKU-ELE-ITM10001",
            "barcode": "890123457081",
            "unit": "pcs",
            "status": "ACTIVE",
            "tags": [
                "electronics",
                "supply",
                "grade-1"
            ],
            "supplierWebsite": "https://supplier1.com",
            "supportPhone": "18005559999",
            "isDeleted": false
        },
        {
            "itemCode": "ITM10303",
            "itemName": "Professional ELECTRONICS Product 1",
            "description": "High performance grade item engineered for electronics operations.",
            "category": "electronics",
            "subCategory": "SubCategory-1",
            "brand": "NexaBrand-1",
            "price": 49.99,
            "costPrice": 32.49,
            "stockQuantity": 50,
            "reorderLevel": 20,
            "supplierId": "6a8bca5862985f737dee03e310",
            "warehouseId": "6a8bca5862985f737dee07d302",
            "sku": "SKU-ELE-ITM10001",
            "barcode": "890123457082",
            "unit": "pcs",
            "status": "ACTIVE",
            "tags": [
                "electronics",
                "supply",
                "grade-1"
            ],
            "supplierWebsite": "https://supplier1.com",
            "supportPhone": "18005559999",
            "isDeleted": false
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
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "costPrice": 32.49,
    "stockQuantity": 50,
    "reorderLevel": 20,
    "supplierId": "6a8bca5862985f737dee03e108",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
    "itemCode": "ITM10101",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "costPrice": 32.49,
    "stockQuantity": 50,
    "reorderLevel": 20,
    "supplierId": "6a8bca5862985f737dee03e108",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
    "itemCode": "ITM10101",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "costPrice": 32.49,
    "stockQuantity": 50,
    "reorderLevel": 20,
    "supplierId": "6a8bca5862985f737dee03e108",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
    "itemCode": "ITM10101",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": "INVALID_NON_NUMERIC_STRING",
    "costPrice": 32.49,
    "stockQuantity": 50,
    "reorderLevel": 20,
    "supplierId": "6a8bca5862985f737dee03e108",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
   * Source Ref: items.costPrice
   * Reasoning: Field 'costPrice' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-005 — Field Validation: Missing Mandatory Field \'costPrice\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM10101",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "stockQuantity": 50,
    "reorderLevel": 20,
    "supplierId": "6a8bca5862985f737dee03e108",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
    expect(JSON.stringify(body).toLowerCase()).toContain('costprice');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-ITEMS-FIELD-006
   * Category: FIELD_VALIDATION
   * Priority: HIGH
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.costPrice
   * Reasoning: Field 'costPrice' expects numeric type; sending string must return HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-006 — Field Validation: Wrong Data Type for Numeric Field \'costPrice\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM10101",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "costPrice": "INVALID_NON_NUMERIC_STRING",
    "stockQuantity": 50,
    "reorderLevel": 20,
    "supplierId": "6a8bca5862985f737dee03e108",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
   * Test ID: TC-ITEMS-FIELD-007
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.category
   * Reasoning: Field 'category' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-007 — Field Validation: Missing Mandatory Field \'category\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM10101",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "costPrice": 32.49,
    "stockQuantity": 50,
    "reorderLevel": 20,
    "supplierId": "6a8bca5862985f737dee03e108",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
   * Test ID: TC-ITEMS-FIELD-008
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.stockQuantity
   * Reasoning: Field 'stockQuantity' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-008 — Field Validation: Missing Mandatory Field \'stockQuantity\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM10101",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "costPrice": 32.49,
    "reorderLevel": 20,
    "supplierId": "6a8bca5862985f737dee03e108",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
    expect(JSON.stringify(body).toLowerCase()).toContain('stockquantity');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-ITEMS-FIELD-009
   * Category: FIELD_VALIDATION
   * Priority: HIGH
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.stockQuantity
   * Reasoning: Field 'stockQuantity' expects numeric type; sending string must return HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-009 — Field Validation: Wrong Data Type for Numeric Field \'stockQuantity\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM10101",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "costPrice": 32.49,
    "stockQuantity": "INVALID_NON_NUMERIC_STRING",
    "reorderLevel": 20,
    "supplierId": "6a8bca5862985f737dee03e108",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
   * Test ID: TC-ITEMS-FIELD-010
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.reorderLevel
   * Reasoning: Field 'reorderLevel' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-010 — Field Validation: Missing Mandatory Field \'reorderLevel\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM10101",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "costPrice": 32.49,
    "stockQuantity": 50,
    "supplierId": "6a8bca5862985f737dee03e108",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
    expect(JSON.stringify(body).toLowerCase()).toContain('reorderlevel');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-ITEMS-FIELD-011
   * Category: FIELD_VALIDATION
   * Priority: HIGH
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.reorderLevel
   * Reasoning: Field 'reorderLevel' expects numeric type; sending string must return HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-011 — Field Validation: Wrong Data Type for Numeric Field \'reorderLevel\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM10101",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "costPrice": 32.49,
    "stockQuantity": 50,
    "reorderLevel": "INVALID_NON_NUMERIC_STRING",
    "supplierId": "6a8bca5862985f737dee03e108",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
   * Priority: CRITICAL
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.status
   * Reasoning: Field 'status' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-012 — Field Validation: Missing Mandatory Field \'status\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM10101",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "costPrice": 32.49,
    "stockQuantity": 50,
    "reorderLevel": 20,
    "supplierId": "6a8bca5862985f737dee03e108",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
    expect(JSON.stringify(body).toLowerCase()).toContain('status');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-ITEMS-FIELD-013
   * Category: FIELD_VALIDATION
   * Priority: HIGH
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.supplierWebsite
   * Reasoning: Field 'supplierWebsite' requires URL format; malformed URL must return HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-FIELD-013 — Field Validation: Malformed URL for Field \'supplierWebsite\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM10101",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "costPrice": 32.49,
    "stockQuantity": 50,
    "reorderLevel": 20,
    "supplierId": "6a8bca5862985f737dee03e108",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "not-a-valid-url-string",
    "supportPhone": "18005559999",
    "isDeleted": false
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
   * Test ID: TC-ITEMS-REL-001
   * Category: RELATIONSHIP
   * Priority: CRITICAL
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.supplierId -> suppliers
   * Reasoning: Field 'supplierId' references 'suppliers'; passing existing referenced ID returns HTTP 201
   * Dependencies: []
   */
  test('TC-ITEMS-REL-001 — Relationship Test: Valid Reference \'supplierId\' -> \'suppliers\'', async ({ request }) => {
    expect(referencedRecordId, 'Prerequisite referenced record creation failed or referencedRecordId is undefined').toBeDefined();
    const payload = {
    "itemCode": "ITM10101",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "costPrice": 32.49,
    "stockQuantity": 50,
    "reorderLevel": 20,
    "supplierId": referencedRecordId!,
    "warehouseId": "6a8bca5862985f737dee07d100",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
   * Test ID: TC-ITEMS-REL-002
   * Category: RELATIONSHIP
   * Priority: HIGH
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.supplierId -> suppliers
   * Reasoning: Field 'supplierId' references 'suppliers'; passing non-existent ID '65f000...' returns HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-REL-002 — Relationship Test: Non-existent Reference \'supplierId\' -> \'suppliers\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM10101",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "costPrice": 32.49,
    "stockQuantity": 50,
    "reorderLevel": 20,
    "supplierId": "65f000000000000000000000",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
   * Test ID: TC-ITEMS-REL-003
   * Category: RELATIONSHIP
   * Priority: CRITICAL
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.warehouseId -> warehouses
   * Reasoning: Field 'warehouseId' references 'warehouses'; passing existing referenced ID returns HTTP 201
   * Dependencies: []
   */
  test('TC-ITEMS-REL-003 — Relationship Test: Valid Reference \'warehouseId\' -> \'warehouses\'', async ({ request }) => {
    expect(referencedRecordId, 'Prerequisite referenced record creation failed or referencedRecordId is undefined').toBeDefined();
    const payload = {
    "itemCode": "ITM10101",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "costPrice": 32.49,
    "stockQuantity": 50,
    "reorderLevel": 20,
    "supplierId": "6a8bca5862985f737dee03e108",
    "warehouseId": referencedRecordId!,
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
   * Test ID: TC-ITEMS-REL-004
   * Category: RELATIONSHIP
   * Priority: HIGH
   * Target Entity: items
   * Source: MONGO_SCHEMA
   * Source Ref: items.warehouseId -> warehouses
   * Reasoning: Field 'warehouseId' references 'warehouses'; passing non-existent ID '65f000...' returns HTTP 400
   * Dependencies: []
   */
  test('TC-ITEMS-REL-004 — Relationship Test: Non-existent Reference \'warehouseId\' -> \'warehouses\'', async ({ request }) => {
    const payload = {
    "itemCode": "ITM10101",
    "itemName": "Professional ELECTRONICS Product 1",
    "description": "High performance grade item engineered for electronics operations.",
    "category": "electronics",
    "subCategory": "SubCategory-1",
    "brand": "NexaBrand-1",
    "price": 49.99,
    "costPrice": 32.49,
    "stockQuantity": 50,
    "reorderLevel": 20,
    "supplierId": "6a8bca5862985f737dee03e108",
    "warehouseId": "65f000000000000000000000",
    "sku": "SKU-ELE-ITM10001",
    "barcode": "890123456880",
    "unit": "pcs",
    "status": "ACTIVE",
    "tags": [
        "electronics",
        "supply",
        "grade-1"
    ],
    "supplierWebsite": "https://supplier1.com",
    "supportPhone": "18005559999",
    "isDeleted": false
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
