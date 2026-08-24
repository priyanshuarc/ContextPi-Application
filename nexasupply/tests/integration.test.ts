import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import request from "supertest";
import * as realMongo from "mongodb";
import * as mockMongo from "../src/db/mockDriver";
const mongo = process.env.MOCK_DB === "true" ? mockMongo : realMongo;
const { MongoClient } = mongo;
import app from "../src/app";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "nexasupply_db";
let client: any;
let db: any;

let createdSupplierId: string;
let createdWarehouseId: string;
let createdCustomerId: string;
let createdItemId: string;
let createdInventoryId: string;
let createdOrderId: string;
let createdShipmentId: string;

describe("NexaSupply Full Supply-Chain Integration Tests", () => {
  before(async () => {
    const { connectDB } = await import("../src/db/connection");
    await connectDB();

    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    
    const { seed } = await import("../seed/seed");
    await seed();
  });

  after(async () => {
    const { closeDB } = await import("../src/db/connection");
    await closeDB();
    await client.close();
  });

  test("GET /health", async () => {
    const res = await request(app).get("/health");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, "ok");
    assert.strictEqual(res.body.service, "NexaSupply");
  });

  // -------------------------------------------------------------
  // SUPPLIERS
  // -------------------------------------------------------------
  test("POST /forms/formCreate/suppliers - Valid", async () => {
    const res = await request(app)
      .post("/forms/formCreate/suppliers")
      .send({
        supplierCode: "SUP-9999",
        supplierName: "Test Supplier Inc",
        email: "test@supplier.com",
        status: "ACTIVE",
        rating: 4.5
      });
    
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.data._id);
    createdSupplierId = res.body.data._id;
  });

  test("POST /forms/formCreate/suppliers - Invalid Code Format", async () => {
    const res = await request(app)
      .post("/forms/formCreate/suppliers")
      .send({
        supplierCode: "INVALID_CODE",
        supplierName: "Bad Supplier",
        email: "bad@supplier.com",
        status: "ACTIVE"
      });
    
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
  });

  // -------------------------------------------------------------
  // WAREHOUSES
  // -------------------------------------------------------------
  test("POST /forms/formCreate/warehouses - Valid", async () => {
    const res = await request(app)
      .post("/forms/formCreate/warehouses")
      .send({
        warehouseCode: "WH-TEST-1",
        warehouseName: "Test Storage Hub",
        capacity: 10000,
        currentUtilization: 2500,
        status: "ACTIVE"
      });
    
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.data._id);
    createdWarehouseId = res.body.data._id;
  });

  test("POST /forms/formCreate/warehouses - Invalid Utilization > Capacity", async () => {
    const res = await request(app)
      .post("/forms/formCreate/warehouses")
      .send({
        warehouseCode: "WH-TEST-2",
        warehouseName: "Overfilled Hub",
        capacity: 100,
        currentUtilization: 500,
        status: "ACTIVE"
      });
    
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
  });

  // -------------------------------------------------------------
  // CUSTOMERS
  // -------------------------------------------------------------
  test("POST /forms/formCreate/customers - Valid", async () => {
    const res = await request(app)
      .post("/forms/formCreate/customers")
      .send({
        customerCode: "CUST-9999",
        customerName: "Acme Logistics Corp",
        email: "purchasing@acme.com",
        customerType: "PREMIUM",
        creditLimit: 50000,
        status: "ACTIVE"
      });
    
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.data._id);
    createdCustomerId = res.body.data._id;
  });

  // -------------------------------------------------------------
  // ITEMS
  // -------------------------------------------------------------
  test("POST /forms/formCreate/items - Valid", async () => {
    const res = await request(app)
      .post("/forms/formCreate/items")
      .send({
        itemCode: "ITM99999",
        itemName: "Super Industrial Sensor",
        price: 199.99,
        costPrice: 120.00,
        category: "electronics",
        stockQuantity: 100,
        reorderLevel: 20,
        supplierId: createdSupplierId,
        warehouseId: createdWarehouseId,
        status: "ACTIVE"
      });
    
    if (res.status !== 201) console.log("Test 7 Item Error Body:", JSON.stringify(res.body));
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.data._id);
    createdItemId = res.body.data._id;
  });

  test("POST /forms/formCreate/items - CostPrice > Price (Invalid)", async () => {
    const res = await request(app)
      .post("/forms/formCreate/items")
      .send({
        itemCode: "ITM99998",
        itemName: "Loss Leader Item",
        price: 50.00,
        costPrice: 100.00,
        category: "electronics",
        stockQuantity: 10,
        reorderLevel: 5,
        status: "ACTIVE"
      });
    
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
  });

  // -------------------------------------------------------------
  // INVENTORY
  // -------------------------------------------------------------
  test("POST /forms/formCreate/inventory - Valid", async () => {
    const res = await request(app)
      .post("/forms/formCreate/inventory")
      .send({
        itemId: createdItemId,
        warehouseId: createdWarehouseId,
        quantity: 500,
        reservedQuantity: 50,
        availableQuantity: 450,
        reorderLevel: 100,
        status: "AVAILABLE"
      });
    
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.data._id);
    createdInventoryId = res.body.data._id;
  });

  // -------------------------------------------------------------
  // ORDERS
  // -------------------------------------------------------------
  test("POST /forms/formCreate/orders - Valid", async () => {
    const res = await request(app)
      .post("/forms/formCreate/orders")
      .send({
        orderId: "ORD-TEST-99",
        customerId: createdCustomerId,
        itemId: createdItemId,
        warehouseId: createdWarehouseId,
        quantity: 5,
        unitPrice: 199.99,
        customerEmail: "purchasing@acme.com",
        orderDate: new Date().toISOString(),
        status: "PENDING",
        priority: "HIGH"
      });
    
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.data._id);
    assert.strictEqual(res.body.data.totalAmount, 999.95);
    createdOrderId = res.body.data._id;
  });

  // -------------------------------------------------------------
  // SHIPMENTS
  // -------------------------------------------------------------
  test("POST /forms/formCreate/shipments - Valid", async () => {
    const res = await request(app)
      .post("/forms/formCreate/shipments")
      .send({
        shipmentId: "SHIP-TEST-99",
        orderId: createdOrderId,
        warehouseId: createdWarehouseId,
        carrier: "FedEx Express",
        trackingNumber: "TRK123456789",
        shipmentDate: new Date().toISOString(),
        expectedDeliveryDate: new Date(Date.now() + 86400000).toISOString(),
        status: "IN_TRANSIT",
        shippingCost: 35.00
      });
    
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.data._id);
    createdShipmentId = res.body.data._id;
  });

  test("POST /forms/formCreate/shipments - IN_TRANSIT missing tracking number (Invalid)", async () => {
    const res = await request(app)
      .post("/forms/formCreate/shipments")
      .send({
        shipmentId: "SHIP-TEST-98",
        orderId: createdOrderId,
        warehouseId: createdWarehouseId,
        carrier: "FedEx Express",
        status: "IN_TRANSIT"
      });
    
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
  });

  // -------------------------------------------------------------
  // CUSTOM FUNCTIONS EXECUTION
  // -------------------------------------------------------------
  test("POST /function/executeFunction - calculateDiscount", async () => {
    const res = await request(app)
      .post("/function/executeFunction")
      .send({
        functionName: "calculateDiscount",
        parameters: { price: 100, customerType: "PREMIUM" }
      });
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.discountedPrice, 90);
    assert.strictEqual(res.body.data.discount, 10);
  });

  test("POST /function/executeFunction - calculateOrderTotal", async () => {
    const res = await request(app)
      .post("/function/executeFunction")
      .send({
        functionName: "calculateOrderTotal",
        parameters: { quantity: 10, unitPrice: 25.50 }
      });
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.totalAmount, 255.00);
  });

  test("POST /function/executeFunction - calculateFinalAmount", async () => {
    const res = await request(app)
      .post("/function/executeFunction")
      .send({
        functionName: "calculateFinalAmount",
        parameters: { totalAmount: 200, discountAmount: 20, taxAmount: 16 }
      });
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.finalAmount, 196);
  });

  test("POST /function/executeFunction - checkInventoryAvailability", async () => {
    const res = await request(app)
      .post("/function/executeFunction")
      .send({
        functionName: "checkInventoryAvailability",
        parameters: { itemId: createdItemId, warehouseId: createdWarehouseId, quantity: 10 }
      });
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.available, true);
  });

  test("POST /function/executeFunction - calculateShippingCost", async () => {
    const res = await request(app)
      .post("/function/executeFunction")
      .send({
        functionName: "calculateShippingCost",
        parameters: { weight: 10, distance: 100, priority: "HIGH" }
      });
    
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.shippingCost > 0);
  });

  test("POST /function/executeFunction - calculateReorderStatus", async () => {
    const res = await request(app)
      .post("/function/executeFunction")
      .send({
        functionName: "calculateReorderStatus",
        parameters: { stockQuantity: 15, reorderLevel: 20 }
      });
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.needsReorder, true);
  });

  // -------------------------------------------------------------
  // GET & QUERY
  // -------------------------------------------------------------
  test("POST /forms/formGet/items - List", async () => {
    const res = await request(app).post("/forms/formGet/items").send({ limit: 10 });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length > 0);
  });

  test("POST /forms/query - Search suppliers", async () => {
    const res = await request(app)
      .post("/forms/query")
      .send({ schemaName: "suppliers", query: { status: "ACTIVE" } });
    
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
  });

  // -------------------------------------------------------------
  // BULK UPLOAD
  // -------------------------------------------------------------
  test("POST /forms/formBulkupload/suppliers - Valid Bulk", async () => {
    const res = await request(app)
      .post("/forms/formBulkupload/suppliers")
      .send({
        schemaName: "suppliers",
        records: [
          { supplierCode: "SUP-8801", supplierName: "Bulk Supplier 1", email: "b1@bulk.com", status: "ACTIVE" },
          { supplierCode: "SUP-8802", supplierName: "Bulk Supplier 2", email: "b2@bulk.com", status: "ACTIVE" }
        ]
      });
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.inserted, 2);
    assert.strictEqual(res.body.failed, 0);
  });

  // -------------------------------------------------------------
  // SOFT DELETE
  // -------------------------------------------------------------
  test("POST /forms/formDelete/items", async () => {
    const res = await request(app)
      .post("/forms/formDelete/items")
      .send({ id: createdItemId });
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.deleted, true);
  });

  test("POST /forms/formGet/items - Fetch deleted item should return 404", async () => {
    const res = await request(app)
      .post("/forms/formGet/items")
      .send({ id: createdItemId });
    
    assert.strictEqual(res.status, 404);
  });
});
