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

test.describe.serial('Form Entity shipments API Spec', () => {
  let createdRecordId: string | undefined = undefined;
  let referencedRecordId: string | undefined = undefined;

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-SHIPMENTS-CRUD-001
   * Category: CRUD
   * Priority: CRITICAL
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments
   * Reasoning: Validate creation of shipments with valid payload
   * Dependencies: []
   */
  test('TC-SHIPMENTS-CRUD-001 — Create shipments - Happy Path', async ({ request }) => {
    const payload = {
    "shipmentId": "SHIP-2101",
    "orderId": "6a8bca5862985f737dee1870",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "carrier": "FedEx Express",
    "trackingNumber": null,
    "shipmentDate": "2026-01-01T00:00:00.000Z",
    "expectedDeliveryDate": "2026-08-27T00:00:00.000Z",
    "actualDeliveryDate": null,
    "status": "CREATED",
    "shippingCost": 25.5,
    "destination": "100 Commerce Blvd, New York, USA"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('shipments')}`, {
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
   * Test ID: TC-SHIPMENTS-CRUD-002
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments
   * Reasoning: Fetch shipments record using ID returned from creation
   * Dependencies: ["TC-SHIPMENTS-CRUD-001"]
   */
  test('TC-SHIPMENTS-CRUD-002 — Read shipments by ID', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "shipments",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('shipments')}`, {
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
   * Test ID: TC-SHIPMENTS-CRUD-003
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments
   * Reasoning: Fetch array list of shipments entities
   * Dependencies: ["TC-SHIPMENTS-CRUD-001"]
   */
  test('TC-SHIPMENTS-CRUD-003 — Read List of shipments records', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "shipments",
    "limit": 10
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('shipments')}`, {
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
   * Test ID: TC-SHIPMENTS-CRUD-004
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments
   * Reasoning: Query shipments with filter parameters
   * Dependencies: ["TC-SHIPMENTS-CRUD-001"]
   */
  test('TC-SHIPMENTS-CRUD-004 — Search & Filter shipments records', async ({ request }) => {
    const payload = {
    "schemaName": "shipments",
    "query": {
        "shipmentId": "SHIP-2101",
        "orderId": "6a8bca5862985f737dee1870",
        "warehouseId": "6a8bca5862985f737dee07d100",
        "carrier": "FedEx Express",
        "trackingNumber": null,
        "shipmentDate": "2026-01-01T00:00:00.000Z",
        "expectedDeliveryDate": "2026-08-27T00:00:00.000Z",
        "actualDeliveryDate": null,
        "status": "CREATED",
        "shippingCost": 25.5,
        "destination": "100 Commerce Blvd, New York, USA"
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
   * Test ID: TC-SHIPMENTS-CRUD-005
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments
   * Reasoning: Modify existing shipments fields
   * Dependencies: ["TC-SHIPMENTS-CRUD-001"]
   */
  test('TC-SHIPMENTS-CRUD-005 — Update shipments record', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "shipmentId": "SHIP-2101",
    "orderId": "6a8bca5862985f737dee1870",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "carrier": "FedEx Express",
    "trackingNumber": null,
    "shipmentDate": "2026-01-01T00:00:00.000Z",
    "expectedDeliveryDate": "2026-08-27T00:00:00.000Z",
    "actualDeliveryDate": null,
    "status": "CREATED",
    "shippingCost": 25.5,
    "destination": "100 Commerce Blvd, New York, USA",
    "_id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formUpdate('shipments')}`, {
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
   * Test ID: TC-SHIPMENTS-CRUD-006
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments
   * Reasoning: Remove shipments by ID
   * Dependencies: ["TC-SHIPMENTS-CRUD-001"]
   */
  test('TC-SHIPMENTS-CRUD-006 — Delete shipments record', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "shipments",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formDelete('shipments')}`, {
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
   * Test ID: TC-SHIPMENTS-CRUD-007
   * Category: CRUD
   * Priority: MEDIUM
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments
   * Reasoning: Deleted shipments record should return 404 or be excluded from query results
   * Dependencies: ["TC-SHIPMENTS-CRUD-006"]
   */
  test('TC-SHIPMENTS-CRUD-007 — Verify Deleted shipments Excluded', async ({ request }) => {
    expect(createdRecordId, 'Prerequisite record creation failed or createdRecordId is undefined').toBeDefined();
    const payload = {
    "schemaName": "shipments",
    "id": createdRecordId!
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formGet('shipments')}`, {
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
   * Test ID: TC-SHIPMENTS-CRUD-008
   * Category: CRUD
   * Priority: CRITICAL
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments.shipmentId
   * Reasoning: Omit mandatory field 'shipmentId' to assert HTTP 400 rejection
   * Dependencies: []
   */
  test('TC-SHIPMENTS-CRUD-008 — Create shipments - Missing Mandatory Field \'shipmentId\'', async ({ request }) => {
    const payload = {
    "orderId": "6a8bca5862985f737dee1971",
    "warehouseId": "6a8bca5862985f737dee07d201",
    "carrier": "FedEx Express",
    "trackingNumber": null,
    "shipmentDate": "2026-01-01T00:00:00.000Z",
    "expectedDeliveryDate": "2026-08-27T00:00:00.000Z",
    "actualDeliveryDate": null,
    "status": "CREATED",
    "shippingCost": 25.5,
    "destination": "100 Commerce Blvd, New York, USA"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('shipments')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('shipmentid');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-SHIPMENTS-CRUD-009
   * Category: CRUD
   * Priority: HIGH
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments.shippingCost
   * Reasoning: Send string for numeric field 'shippingCost' to assert HTTP 400 rejection
   * Dependencies: []
   */
  test('TC-SHIPMENTS-CRUD-009 — Create shipments - Wrong Type for Field \'shippingCost\'', async ({ request }) => {
    const payload = {
    "shipmentId": "SHIP-2203",
    "orderId": "6a8bca5862985f737dee1972",
    "warehouseId": "6a8bca5862985f737dee07d202",
    "carrier": "FedEx Express",
    "trackingNumber": null,
    "shipmentDate": "2026-01-01T00:00:00.000Z",
    "expectedDeliveryDate": "2026-08-27T00:00:00.000Z",
    "actualDeliveryDate": null,
    "status": "CREATED",
    "shippingCost": "INVALID_STRING_VALUE",
    "destination": "100 Commerce Blvd, New York, USA"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('shipments')}`, {
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
   * Test ID: TC-SHIPMENTS-BULK-001
   * Category: BULK_UPLOAD
   * Priority: HIGH
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments.bulk
   * Reasoning: Valid bulk CSV upload for shipments schema returns HTTP 200
   * Dependencies: []
   */
  test('TC-SHIPMENTS-BULK-001 — Bulk Upload: Valid CSV File for shipments (TC-BULK-01)', async ({ request }) => {
    const payload = {
    "schemaName": "shipments",
    "records": [
        {
            "shipmentId": "SHIP-2302",
            "orderId": "6a8bca5862985f737dee2071",
            "warehouseId": "6a8bca5862985f737dee07d301",
            "carrier": "FedEx Express",
            "trackingNumber": null,
            "shipmentDate": "2026-01-01T00:00:00.000Z",
            "expectedDeliveryDate": "2026-08-27T00:00:00.000Z",
            "actualDeliveryDate": null,
            "status": "CREATED",
            "shippingCost": 25.5,
            "destination": "100 Commerce Blvd, New York, USA"
        },
        {
            "shipmentId": "SHIP-2303",
            "orderId": "6a8bca5862985f737dee2072",
            "warehouseId": "6a8bca5862985f737dee07d302",
            "carrier": "FedEx Express",
            "trackingNumber": null,
            "shipmentDate": "2026-01-01T00:00:00.000Z",
            "expectedDeliveryDate": "2026-08-27T00:00:00.000Z",
            "actualDeliveryDate": null,
            "status": "CREATED",
            "shippingCost": 25.5,
            "destination": "100 Commerce Blvd, New York, USA"
        }
    ]
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formBulkupload('shipments')}`, {
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
   * Test ID: TC-SHIPMENTS-FIELD-001
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments.shipmentId
   * Reasoning: Field 'shipmentId' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-SHIPMENTS-FIELD-001 — Field Validation: Missing Mandatory Field \'shipmentId\'', async ({ request }) => {
    const payload = {
    "orderId": "6a8bca5862985f737dee1870",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "carrier": "FedEx Express",
    "trackingNumber": null,
    "shipmentDate": "2026-01-01T00:00:00.000Z",
    "expectedDeliveryDate": "2026-08-27T00:00:00.000Z",
    "actualDeliveryDate": null,
    "status": "CREATED",
    "shippingCost": 25.5,
    "destination": "100 Commerce Blvd, New York, USA"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('shipments')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('shipmentid');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-SHIPMENTS-FIELD-002
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments.orderId
   * Reasoning: Field 'orderId' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-SHIPMENTS-FIELD-002 — Field Validation: Missing Mandatory Field \'orderId\'', async ({ request }) => {
    const payload = {
    "shipmentId": "SHIP-2101",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "carrier": "FedEx Express",
    "trackingNumber": null,
    "shipmentDate": "2026-01-01T00:00:00.000Z",
    "expectedDeliveryDate": "2026-08-27T00:00:00.000Z",
    "actualDeliveryDate": null,
    "status": "CREATED",
    "shippingCost": 25.5,
    "destination": "100 Commerce Blvd, New York, USA"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('shipments')}`, {
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
   * Test ID: TC-SHIPMENTS-FIELD-003
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments.warehouseId
   * Reasoning: Field 'warehouseId' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-SHIPMENTS-FIELD-003 — Field Validation: Missing Mandatory Field \'warehouseId\'', async ({ request }) => {
    const payload = {
    "shipmentId": "SHIP-2101",
    "orderId": "6a8bca5862985f737dee1870",
    "carrier": "FedEx Express",
    "trackingNumber": null,
    "shipmentDate": "2026-01-01T00:00:00.000Z",
    "expectedDeliveryDate": "2026-08-27T00:00:00.000Z",
    "actualDeliveryDate": null,
    "status": "CREATED",
    "shippingCost": 25.5,
    "destination": "100 Commerce Blvd, New York, USA"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('shipments')}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-project-name': PROJECT_NAME
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(JSON.stringify(body).toLowerCase()).toContain('warehouseid');
  });

  /**
   * Contextπ Generated Playwright API Test
   * Test ID: TC-SHIPMENTS-FIELD-004
   * Category: FIELD_VALIDATION
   * Priority: CRITICAL
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments.status
   * Reasoning: Field 'status' is mandatory; omitting it must return HTTP 400
   * Dependencies: []
   */
  test('TC-SHIPMENTS-FIELD-004 — Field Validation: Missing Mandatory Field \'status\'', async ({ request }) => {
    const payload = {
    "shipmentId": "SHIP-2101",
    "orderId": "6a8bca5862985f737dee1870",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "carrier": "FedEx Express",
    "trackingNumber": null,
    "shipmentDate": "2026-01-01T00:00:00.000Z",
    "expectedDeliveryDate": "2026-08-27T00:00:00.000Z",
    "actualDeliveryDate": null,
    "shippingCost": 25.5,
    "destination": "100 Commerce Blvd, New York, USA"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('shipments')}`, {
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
   * Test ID: TC-SHIPMENTS-FIELD-005
   * Category: FIELD_VALIDATION
   * Priority: HIGH
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments.shippingCost
   * Reasoning: Field 'shippingCost' expects numeric type; sending string must return HTTP 400
   * Dependencies: []
   */
  test('TC-SHIPMENTS-FIELD-005 — Field Validation: Wrong Data Type for Numeric Field \'shippingCost\'', async ({ request }) => {
    const payload = {
    "shipmentId": "SHIP-2101",
    "orderId": "6a8bca5862985f737dee1870",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "carrier": "FedEx Express",
    "trackingNumber": null,
    "shipmentDate": "2026-01-01T00:00:00.000Z",
    "expectedDeliveryDate": "2026-08-27T00:00:00.000Z",
    "actualDeliveryDate": null,
    "status": "CREATED",
    "shippingCost": "INVALID_NON_NUMERIC_STRING",
    "destination": "100 Commerce Blvd, New York, USA"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('shipments')}`, {
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
   * Test ID: TC-SHIPMENTS-REL-001
   * Category: RELATIONSHIP
   * Priority: CRITICAL
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments.orderId -> orders
   * Reasoning: Field 'orderId' references 'orders'; passing existing referenced ID returns HTTP 201
   * Dependencies: []
   */
  test('TC-SHIPMENTS-REL-001 — Relationship Test: Valid Reference \'orderId\' -> \'orders\'', async ({ request }) => {
    expect(referencedRecordId, 'Prerequisite referenced record creation failed or referencedRecordId is undefined').toBeDefined();
    const payload = {
    "shipmentId": "SHIP-2101",
    "orderId": referencedRecordId!,
    "warehouseId": "6a8bca5862985f737dee07d100",
    "carrier": "FedEx Express",
    "trackingNumber": null,
    "shipmentDate": "2026-01-01T00:00:00.000Z",
    "expectedDeliveryDate": "2026-08-27T00:00:00.000Z",
    "actualDeliveryDate": null,
    "status": "CREATED",
    "shippingCost": 25.5,
    "destination": "100 Commerce Blvd, New York, USA"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('shipments')}`, {
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
   * Test ID: TC-SHIPMENTS-REL-002
   * Category: RELATIONSHIP
   * Priority: HIGH
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments.orderId -> orders
   * Reasoning: Field 'orderId' references 'orders'; passing non-existent ID '65f000...' returns HTTP 400
   * Dependencies: []
   */
  test('TC-SHIPMENTS-REL-002 — Relationship Test: Non-existent Reference \'orderId\' -> \'orders\'', async ({ request }) => {
    const payload = {
    "shipmentId": "SHIP-2101",
    "orderId": "65f000000000000000000000",
    "warehouseId": "6a8bca5862985f737dee07d100",
    "carrier": "FedEx Express",
    "trackingNumber": null,
    "shipmentDate": "2026-01-01T00:00:00.000Z",
    "expectedDeliveryDate": "2026-08-27T00:00:00.000Z",
    "actualDeliveryDate": null,
    "status": "CREATED",
    "shippingCost": 25.5,
    "destination": "100 Commerce Blvd, New York, USA"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('shipments')}`, {
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
   * Test ID: TC-SHIPMENTS-REL-003
   * Category: RELATIONSHIP
   * Priority: CRITICAL
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments.warehouseId -> warehouses
   * Reasoning: Field 'warehouseId' references 'warehouses'; passing existing referenced ID returns HTTP 201
   * Dependencies: []
   */
  test('TC-SHIPMENTS-REL-003 — Relationship Test: Valid Reference \'warehouseId\' -> \'warehouses\'', async ({ request }) => {
    expect(referencedRecordId, 'Prerequisite referenced record creation failed or referencedRecordId is undefined').toBeDefined();
    const payload = {
    "shipmentId": "SHIP-2101",
    "orderId": "6a8bca5862985f737dee1870",
    "warehouseId": referencedRecordId!,
    "carrier": "FedEx Express",
    "trackingNumber": null,
    "shipmentDate": "2026-01-01T00:00:00.000Z",
    "expectedDeliveryDate": "2026-08-27T00:00:00.000Z",
    "actualDeliveryDate": null,
    "status": "CREATED",
    "shippingCost": 25.5,
    "destination": "100 Commerce Blvd, New York, USA"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('shipments')}`, {
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
   * Test ID: TC-SHIPMENTS-REL-004
   * Category: RELATIONSHIP
   * Priority: HIGH
   * Target Entity: shipments
   * Source: MONGO_SCHEMA
   * Source Ref: shipments.warehouseId -> warehouses
   * Reasoning: Field 'warehouseId' references 'warehouses'; passing non-existent ID '65f000...' returns HTTP 400
   * Dependencies: []
   */
  test('TC-SHIPMENTS-REL-004 — Relationship Test: Non-existent Reference \'warehouseId\' -> \'warehouses\'', async ({ request }) => {
    const payload = {
    "shipmentId": "SHIP-2101",
    "orderId": "6a8bca5862985f737dee1870",
    "warehouseId": "65f000000000000000000000",
    "carrier": "FedEx Express",
    "trackingNumber": null,
    "shipmentDate": "2026-01-01T00:00:00.000Z",
    "expectedDeliveryDate": "2026-08-27T00:00:00.000Z",
    "actualDeliveryDate": null,
    "status": "CREATED",
    "shippingCost": 25.5,
    "destination": "100 Commerce Blvd, New York, USA"
};

    const response = await request.post(`${BASE_URL}${FORM_ROUTES.formCreate('shipments')}`, {
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
