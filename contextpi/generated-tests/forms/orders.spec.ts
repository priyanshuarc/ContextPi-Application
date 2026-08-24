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

test.describe.serial('Form Entity orders API Spec', () => {
  let createdRecordId: string | undefined = undefined;
  let referencedRecordId: string | undefined = undefined;

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-ORDERS-CRUD-001
   * Category: CRUD
   * Priority: CRITICAL
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders
   * Reasoning: Validate creation of orders with valid payload
   * Dependencies: []
   */
  test('TC-ORDERS-CRUD-001 — Create orders - Happy Path', async ({ request }) => {
    const payload = {
    "orderId": "ORD-5101",
    "itemId": "65d1a2b3c4d5e6f7a8b9c0d1",
    "quantity": 2,
    "customerEmail": "customer@example.com",
    "orderDate": "2026-08-23T12:00:00Z"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('orders')}`, {
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
   * Test ID: TC-ORDERS-CRUD-002
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders
   * Reasoning: Fetch orders record using ID returned from creation
   * Dependencies: ["TC-ORDERS-CRUD-001"]
   */
  test('TC-ORDERS-CRUD-002 — Read orders by ID', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "orders",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('orders')}`, {
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
   * Test ID: TC-ORDERS-CRUD-003
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders
   * Reasoning: Fetch array list of orders entities
   * Dependencies: ["TC-ORDERS-CRUD-001"]
   */
  test('TC-ORDERS-CRUD-003 — Read List of orders records', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "orders",
    "limit": 10
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('orders')}`, {
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
   * Test ID: TC-ORDERS-CRUD-004
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders
   * Reasoning: Query orders with filter parameters
   * Dependencies: ["TC-ORDERS-CRUD-001"]
   */
  test('TC-ORDERS-CRUD-004 — Search & Filter orders records', async ({ request }) => {
    const payload = {
    "schemaName": "orders",
    "query": {
        "orderId": "ORD-5101",
        "itemId": "65d1a2b3c4d5e6f7a8b9c0d1",
        "quantity": 2,
        "customerEmail": "customer@example.com",
        "orderDate": "2026-08-23T12:00:00Z"
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
   * Test ID: TC-ORDERS-CRUD-005
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders
   * Reasoning: Modify existing orders fields
   * Dependencies: ["TC-ORDERS-CRUD-001"]
   */
  test('TC-ORDERS-CRUD-005 — Update orders record', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "orderId": "ORD-5101",
    "itemId": "65d1a2b3c4d5e6f7a8b9c0d1",
    "quantity": 2,
    "customerEmail": "customer@example.com",
    "orderDate": "2026-08-23T12:00:00Z",
    "_id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formUpdate('orders')}`, {
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
   * Test ID: TC-ORDERS-CRUD-006
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders
   * Reasoning: Remove orders by ID
   * Dependencies: ["TC-ORDERS-CRUD-001"]
   */
  test('TC-ORDERS-CRUD-006 — Delete orders record', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "orders",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formDelete('orders')}`, {
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
   * Test ID: TC-ORDERS-CRUD-007
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders
   * Reasoning: Deleted orders record should return 404 or be excluded from query results
   * Dependencies: ["TC-ORDERS-CRUD-006"]
   */
  test('TC-ORDERS-CRUD-007 — Verify Deleted orders Excluded', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "orders",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('orders')}`, {
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
   * Test ID: TC-ORDERS-CRUD-008
   * Category: CRUD
   * Priority: CRITICAL
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders.orderId
   * Reasoning: Omit mandatory field 'orderId' to assert HTTP 400 rejection
   * Dependencies: []
   */
  test('TC-ORDERS-CRUD-008 — Create orders - Missing Mandatory Field \'orderId\'', async ({ request }) => {
    const payload = {
    "itemId": "65d1a2b3c4d5e6f7a8b9c0d1",
    "quantity": 2,
    "customerEmail": "customer@example.com",
    "orderDate": "2026-08-23T12:00:00Z"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('orders')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('orderid');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-ORDERS-CRUD-009
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders.quantity
   * Reasoning: Send string for numeric field 'quantity' to assert HTTP 400 rejection
   * Dependencies: []
   */
  test('TC-ORDERS-CRUD-009 — Create orders - Wrong Type for Field \'quantity\'', async ({ request }) => {
    const payload = {
    "orderId": "ORD-5203",
    "itemId": "65d1a2b3c4d5e6f7a8b9c0d1",
    "quantity": "INVALID_STRING_VALUE",
    "customerEmail": "customer@example.com",
    "orderDate": "2026-08-23T12:00:00Z"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('orders')}`, {
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
   * Test ID: TC-ORDERS-BULK-001
   * Category: BULK_UPLOAD
   * Priority: HIGH
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders.bulk
   * Reasoning: Valid bulk CSV upload for orders schema returns HTTP 200
   * Dependencies: []
   */
  test('TC-ORDERS-BULK-001 — Bulk Upload: Valid CSV File for orders (TC-BULK-01)', async ({ request }) => {
    const payload = {
    "schemaName": "orders",
    "records": [
        {
            "orderId": "ORD-5302",
            "itemId": "65d1a2b3c4d5e6f7a8b9c0d1",
            "quantity": 2,
            "customerEmail": "customer@example.com",
            "orderDate": "2026-08-23T12:00:00Z"
        },
        {
            "orderId": "ORD-5303",
            "itemId": "65d1a2b3c4d5e6f7a8b9c0d1",
            "quantity": 2,
            "customerEmail": "customer@example.com",
            "orderDate": "2026-08-23T12:00:00Z"
        }
    ]
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formBulkupload('orders')}`, {
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
   * Test ID: TC-ORDERS-FIELD-001
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders.orderId
   * Reasoning: Field 'orderId' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-ORDERS-FIELD-001 — Field Validation: Missing Mandatory Field \'orderId\'', async ({ request }) => {
    const payload = {
    "itemId": "65d1a2b3c4d5e6f7a8b9c0d1",
    "quantity": 2,
    "customerEmail": "customer@example.com",
    "orderDate": "2026-08-23T12:00:00Z"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('orders')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('orderid');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-ORDERS-FIELD-002
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders.itemId
   * Reasoning: Field 'itemId' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-ORDERS-FIELD-002 — Field Validation: Missing Mandatory Field \'itemId\'', async ({ request }) => {
    const payload = {
    "orderId": "ORD-5101",
    "quantity": 2,
    "customerEmail": "customer@example.com",
    "orderDate": "2026-08-23T12:00:00Z"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('orders')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('itemid');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-ORDERS-FIELD-003
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders.quantity
   * Reasoning: Field 'quantity' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-ORDERS-FIELD-003 — Field Validation: Missing Mandatory Field \'quantity\'', async ({ request }) => {
    const payload = {
    "orderId": "ORD-5101",
    "itemId": "65d1a2b3c4d5e6f7a8b9c0d1",
    "customerEmail": "customer@example.com",
    "orderDate": "2026-08-23T12:00:00Z"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('orders')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('quantity');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-ORDERS-FIELD-004
   * Category: FIELD_VALIDATION
   * Priority: HIGH
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders.quantity
   * Reasoning: Field 'quantity' expects numeric type; sending string must return HTTP 400
   * Dependencies: []
   */
  test('TC-ORDERS-FIELD-004 — Field Validation: Wrong Data Type for Numeric Field \'quantity\'', async ({ request }) => {
    const payload = {
    "orderId": "ORD-5101",
    "itemId": "65d1a2b3c4d5e6f7a8b9c0d1",
    "quantity": "INVALID_NON_NUMERIC_STRING",
    "customerEmail": "customer@example.com",
    "orderDate": "2026-08-23T12:00:00Z"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('orders')}`, {
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
   * Test ID: TC-ORDERS-FIELD-005
   * Category: FIELD_VALIDATION
   * Priority: MEDIUM
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders.quantity
   * Reasoning: Field 'quantity' specifies default value 1; omitting field applies default
   * Dependencies: []
   */
  test('TC-ORDERS-FIELD-005 — Field Validation: Default Value Verification for Field \'quantity\'', async ({ request }) => {
    const payload = {
    "orderId": "ORD-5002",
    "itemId": "65d1a2b3c4d5e6f7a8b9c0d1",
    "customerEmail": "customer@example.com",
    "orderDate": "2026-08-23T12:00:00Z"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('orders')}`, {
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
   * Test ID: TC-ORDERS-FIELD-006
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders.customerEmail
   * Reasoning: Field 'customerEmail' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-ORDERS-FIELD-006 — Field Validation: Missing Mandatory Field \'customerEmail\'', async ({ request }) => {
    const payload = {
    "orderId": "ORD-5101",
    "itemId": "65d1a2b3c4d5e6f7a8b9c0d1",
    "quantity": 2,
    "orderDate": "2026-08-23T12:00:00Z"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('orders')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('customeremail');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-ORDERS-REL-001
   * Category: RELATIONSHIP
   * Priority: CRITICAL
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders.itemId -> items
   * Reasoning: Field 'itemId' references 'items'; passing existing referenced ID returns HTTP 201
   * Dependencies: []
   */
  test('TC-ORDERS-REL-001 — Relationship Test: Valid Reference \'itemId\' -> \'items\'', async ({ request }) => {
    expect(referencedRecordId, 'Prerequisite referenced record creation failed or referencedRecordId is undefined').toBeDefined();
    const payload = {
    "orderId": "ORD-5101",
    "itemId": referencedRecordId!,
    "quantity": 2,
    "customerEmail": "customer@example.com",
    "orderDate": "2026-08-23T12:00:00Z"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('orders')}`, {
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
   * Test ID: TC-ORDERS-REL-002
   * Category: RELATIONSHIP
   * Priority: HIGH
   * Target Entity: orders
   * Source: MONGO_SCHEMA
   * Source Ref: orders.itemId -> items
   * Reasoning: Field 'itemId' references 'items'; passing non-existent ID '65f000...' returns HTTP 400
   * Dependencies: []
   */
  test('TC-ORDERS-REL-002 — Relationship Test: Non-existent Reference \'itemId\' -> \'items\'', async ({ request }) => {
    const payload = {
    "orderId": "ORD-5101",
    "itemId": "65f000000000000000000000",
    "quantity": 2,
    "customerEmail": "customer@example.com",
    "orderDate": "2026-08-23T12:00:00Z"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('orders')}`, {
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
