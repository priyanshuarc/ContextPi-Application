import * as realMongo from "mongodb";
import * as mockMongo from "../src/db/mockDriver";
const mongo = process.env.MOCK_DB === "true" ? mockMongo : realMongo;
const { MongoClient } = mongo;
import { ObjectId } from "mongodb";
import { FormSchema, FunctionRegistry } from "../src/types";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "nexasupply_db";

const makeStableObjectId = (prefixHex: string, index: number): ObjectId => {
  const suffix = index.toString(16).padStart(4, "0");
  return new ObjectId(`${prefixHex}${suffix}`);
};

const BASE_HEX = "6a8bca5862985f737dee";

export const seed = async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`Connected to MongoDB: ${dbName}`);

    // Clear NexaSupply application collections
    await db.collection("suppliers").deleteMany({});
    await db.collection("warehouses").deleteMany({});
    await db.collection("customers").deleteMany({});
    await db.collection("items").deleteMany({});
    await db.collection("inventory").deleteMany({});
    await db.collection("orders").deleteMany({});
    await db.collection("shipments").deleteMany({});
    await db.collection("formSchemas").deleteMany({});
    await db.collection("functionRegistry").deleteMany({});

    // Indexes
    await db.collection("suppliers").createIndex({ supplierCode: 1 }, { unique: true });
    await db.collection("warehouses").createIndex({ warehouseCode: 1 }, { unique: true });
    await db.collection("customers").createIndex({ customerCode: 1 }, { unique: true });
    await db.collection("items").createIndex({ itemCode: 1 }, { unique: true });
    await db.collection("orders").createIndex({ orderId: 1 }, { unique: true });
    await db.collection("shipments").createIndex({ shipmentId: 1 }, { unique: true });

    const FIXED_DATE = new Date("2026-01-01T00:00:00.000Z");

    // -------------------------------------------------------------
    // 1. SEED SUPPLIERS (12)
    // -------------------------------------------------------------
    const supplierIds = Array.from({ length: 12 }, (_, i) => makeStableObjectId(BASE_HEX, 1000 + i));
    const suppliersData = [
      { _id: supplierIds[0], supplierCode: "SUP-0001", supplierName: "Apex Industrial Tech", contactName: "Sarah Jenkins", email: "contact@apextech.com", phone: "18005550101", website: "https://apextech.com", rating: 4.8, status: "ACTIVE" },
      { _id: supplierIds[1], supplierCode: "SUP-0002", supplierName: "Global Packaging Solutions", contactName: "David Miller", email: "info@globalpack.com", phone: "18005550102", website: "https://globalpack.com", rating: 4.5, status: "ACTIVE" },
      { _id: supplierIds[2], supplierCode: "SUP-0003", supplierName: "Vanguard Safety Equipment", contactName: "Elena Rostova", email: "sales@vanguardsafety.com", phone: "18005550103", website: "https://vanguardsafety.com", rating: 4.9, status: "ACTIVE" },
      { _id: supplierIds[3], supplierCode: "SUP-0004", supplierName: "Nexus Component Supplies", contactName: "Kenji Sato", email: "support@nexuscomp.io", phone: "18005550104", website: "https://nexuscomp.io", rating: 4.2, status: "ACTIVE" },
      { _id: supplierIds[4], supplierCode: "SUP-0005", supplierName: "Omni Office Supplies", contactName: "Rachel Adams", email: "orders@omnioffice.com", phone: "18005550105", website: "https://omnioffice.com", rating: 4.0, status: "ACTIVE" },
      { _id: supplierIds[5], supplierCode: "SUP-0006", supplierName: "Titanium Metalworks Inc", contactName: "Marcus Vance", email: "contact@titaniummw.com", phone: "18005550106", website: "https://titaniummw.com", rating: 4.7, status: "ACTIVE" },
      { _id: supplierIds[6], supplierCode: "SUP-0007", supplierName: "EcoPack Sustainable Co", contactName: "Laura Chen", email: "hello@ecopack.org", phone: "18005550107", website: "https://ecopack.org", rating: 4.6, status: "ACTIVE" },
      { _id: supplierIds[7], supplierCode: "SUP-0008", supplierName: "Precision Optics & Electronics", contactName: "Michael Thorne", email: "sales@precisionoptics.net", phone: "18005550108", website: "https://precisionoptics.net", rating: 4.9, status: "ACTIVE" },
      { _id: supplierIds[8], supplierCode: "SUP-0009", supplierName: "Harbor Freight Logistics", contactName: "Tom Martinez", email: "dispatch@harborlogistics.com", phone: "18005550109", website: "https://harborlogistics.com", rating: 3.9, status: "SUSPENDED" },
      { _id: supplierIds[9], supplierCode: "SUP-0010", supplierName: "Beacon Power Systems", contactName: "Chloe Dupont", email: "support@beaconpower.com", phone: "18005550110", website: "https://beaconpower.com", rating: 4.4, status: "ACTIVE" },
      { _id: supplierIds[10], supplierCode: "SUP-0011", supplierName: "Legacy Fasteners Corp", contactName: "Arthur Pendelton", email: "contact@legacyfasteners.com", phone: "18005550111", website: "https://legacyfasteners.com", rating: 3.5, status: "INACTIVE" },
      { _id: supplierIds[11], supplierCode: "SUP-0012", supplierName: "Robotics Core Systems", contactName: "Amara Patel", email: "info@roboticscore.ai", phone: "18005550112", website: "https://roboticscore.ai", rating: 5.0, status: "ACTIVE" }
    ].map(sup => ({ ...sup, isDeleted: false, createdAt: FIXED_DATE, updatedAt: FIXED_DATE }));
    await db.collection("suppliers").insertMany(suppliersData as any);
    console.log(`Seeded ${suppliersData.length} suppliers`);

    // -------------------------------------------------------------
    // 2. SEED WAREHOUSES (6)
    // -------------------------------------------------------------
    const warehouseIds = Array.from({ length: 6 }, (_, i) => makeStableObjectId(BASE_HEX, 2000 + i));
    const warehousesData = [
      { _id: warehouseIds[0], warehouseCode: "WH-001", warehouseName: "Central Distribution Hub", managerName: "Robert Taylor", email: "wh001@nexasupply.com", phone: "18005550201", address: "100 Logistics Way", city: "Chicago", country: "USA", capacity: 50000, currentUtilization: 32000, status: "ACTIVE" },
      { _id: warehouseIds[1], warehouseCode: "WH-002", warehouseName: "West Coast Fulfillment Center", managerName: "Jennifer Wu", email: "wh002@nexasupply.com", phone: "18005550202", address: "450 Pacific Coast Hwy", city: "Los Angeles", country: "USA", capacity: 40000, currentUtilization: 28500, status: "ACTIVE" },
      { _id: warehouseIds[2], warehouseCode: "WH-003", warehouseName: "East Coast Gateway", managerName: "Carlos Santana", email: "wh003@nexasupply.com", phone: "18005550203", address: "12 Harbor Blvd", city: "Newark", country: "USA", capacity: 45000, currentUtilization: 44000, status: "FULL" },
      { _id: warehouseIds[3], warehouseCode: "WH-004", warehouseName: "Southern Regional Depot", managerName: "Amanda Vance", email: "wh004@nexasupply.com", phone: "18005550204", address: "880 Peachtree St", city: "Atlanta", country: "USA", capacity: 30000, currentUtilization: 14000, status: "ACTIVE" },
      { _id: warehouseIds[4], warehouseCode: "WH-005", warehouseName: "European Depot - Rotterdam", managerName: "Hans Zimmer", email: "wh005@nexasupply.com", phone: "31205550205", address: "Europort Quay 4", city: "Rotterdam", country: "Netherlands", capacity: 60000, currentUtilization: 22000, status: "ACTIVE" },
      { _id: warehouseIds[5], warehouseCode: "WH-006", warehouseName: "Old North Warehouse", managerName: "Sean O'Connor", email: "wh006@nexasupply.com", phone: "18005550206", address: "55 Industrial Park", city: "Detroit", country: "USA", capacity: 20000, currentUtilization: 0, status: "INACTIVE" }
    ].map(wh => ({ ...wh, createdAt: FIXED_DATE, updatedAt: FIXED_DATE }));
    await db.collection("warehouses").insertMany(warehousesData as any);
    console.log(`Seeded ${warehousesData.length} warehouses`);

    // -------------------------------------------------------------
    // 3. SEED CUSTOMERS (30)
    // -------------------------------------------------------------
    const customerIds = Array.from({ length: 30 }, (_, i) => makeStableObjectId(BASE_HEX, 3000 + i));
    const customerTypes: ("REGULAR" | "PREMIUM" | "WHOLESALE")[] = ["REGULAR", "PREMIUM", "WHOLESALE"];
    const customerStatuses: ("ACTIVE" | "INACTIVE" | "BLOCKED")[] = ["ACTIVE", "ACTIVE", "ACTIVE", "INACTIVE", "BLOCKED"];
    
    const customersData = Array.from({ length: 30 }, (_, i) => {
      const idx = (i + 1).toString().padStart(4, "0");
      const cType = customerTypes[i % customerTypes.length];
      const status = customerStatuses[i % customerStatuses.length];
      const credit = cType === "WHOLESALE" ? 100000 : cType === "PREMIUM" ? 50000 : 10000;
      return {
        _id: customerIds[i],
        customerCode: `CUST-${idx}`,
        customerName: `Client Organization ${i + 1}`,
        email: `contact.client${i + 1}@enterprise.org`,
        phone: `1800555${(300 + i).toString()}`,
        customerType: cType,
        creditLimit: credit,
        status: status,
        address: `${100 + i} Commerce Blvd`,
        city: i % 2 === 0 ? "New York" : "San Francisco",
        country: "USA",
        isDeleted: false,
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE
      };
    });
    await db.collection("customers").insertMany(customersData as any);
    console.log(`Seeded ${customersData.length} customers`);

    // -------------------------------------------------------------
    // 4. SEED ITEMS (45)
    // -------------------------------------------------------------
    const itemIds = Array.from({ length: 45 }, (_, i) => makeStableObjectId(BASE_HEX, 4000 + i));
    const categories: ("electronics" | "industrial" | "office" | "safety" | "packaging")[] = [
      "electronics", "industrial", "office", "safety", "packaging"
    ];

    const itemsData = Array.from({ length: 45 }, (_, i) => {
      const itemCode = `ITM${(10000 + i + 1).toString()}`;
      const category = categories[i % categories.length];
      const price = Number((49.99 + (i * 15.5)).toFixed(2));
      const costPrice = Number((price * 0.65).toFixed(2));
      const supId = supplierIds[i % supplierIds.length];
      const whId = warehouseIds[i % warehouseIds.length];

      return {
        _id: itemIds[i],
        itemCode: itemCode,
        itemName: `Professional ${category.toUpperCase()} Product ${i + 1}`,
        description: `High performance grade item engineered for ${category} operations.`,
        category: category,
        subCategory: `SubCategory-${(i % 5) + 1}`,
        brand: `NexaBrand-${(i % 4) + 1}`,
        price: price,
        costPrice: costPrice,
        stockQuantity: 50 + (i * 10),
        reorderLevel: 20,
        supplierId: supId,
        warehouseId: whId,
        sku: `SKU-${category.substring(0, 3).toUpperCase()}-${itemCode}`,
        barcode: `89012345678${(i % 10).toString()}`,
        unit: i % 3 === 0 ? "pcs" : i % 3 === 1 ? "box" : "unit",
        status: i === 44 ? "DISCONTINUED" : i === 43 ? "INACTIVE" : "ACTIVE",
        tags: [category, "supply", `grade-${(i % 3) + 1}`],
        supplierWebsite: `https://supplier${(i % 10) + 1}.com`,
        supportPhone: "18005559999",
        isDeleted: false,
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE
      };
    });
    await db.collection("items").insertMany(itemsData as any);
    console.log(`Seeded ${itemsData.length} items`);

    // -------------------------------------------------------------
    // 5. SEED INVENTORY (90)
    // -------------------------------------------------------------
    const inventoryData = [];
    let invCount = 0;
    for (let itemIdx = 0; itemIdx < itemsData.length; itemIdx++) {
      for (let whIdx = 0; whIdx < 2; whIdx++) {
        const whId = warehouseIds[(itemIdx + whIdx) % warehouseIds.length];
        const qty = 100 + invCount * 5;
        const resQty = Math.floor(qty * 0.15);
        const availQty = qty - resQty;
        invCount++;

        inventoryData.push({
          _id: makeStableObjectId(BASE_HEX, 5000 + invCount),
          itemId: itemIds[itemIdx],
          warehouseId: whId,
          quantity: qty,
          reservedQuantity: resQty,
          availableQuantity: availQty,
          reorderLevel: 25,
          batchNumber: `BATCH-2026-${invCount.toString().padStart(3, "0")}`,
          lotNumber: `LOT-A${(invCount % 9) + 1}`,
          expiryDate: new Date("2027-12-31T00:00:00.000Z"),
          status: qty > 50 ? "AVAILABLE" : qty > 0 ? "LOW_STOCK" : "OUT_OF_STOCK",
          updatedAt: FIXED_DATE
        });
      }
    }
    await db.collection("inventory").insertMany(inventoryData as any);
    console.log(`Seeded ${inventoryData.length} inventory records`);

    // -------------------------------------------------------------
    // 6. SEED ORDERS (55)
    // -------------------------------------------------------------
    const orderIds = Array.from({ length: 55 }, (_, i) => makeStableObjectId(BASE_HEX, 6000 + i));
    const orderStatuses: ("PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED")[] = [
      "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"
    ];
    const priorities: ("LOW" | "MEDIUM" | "HIGH" | "CRITICAL")[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

    const ordersData = Array.from({ length: 55 }, (_, i) => {
      const orderCode = `ORD-${(1000 + i + 1).toString()}`;
      const customer = customersData[i % customersData.length];
      const item = itemsData[i % itemsData.length];
      const warehouse = warehousesData[i % warehousesData.length];
      const qty = (i % 5) + 1;
      const unitPrice = item.price;
      const totalAmount = Number((qty * unitPrice).toFixed(2));
      const disc = customer.customerType === "WHOLESALE" ? Number((totalAmount * 0.15).toFixed(2)) : customer.customerType === "PREMIUM" ? Number((totalAmount * 0.10).toFixed(2)) : 0;
      const tax = Number((totalAmount * 0.08).toFixed(2));
      const finalAmount = Number((totalAmount - disc + tax).toFixed(2));

      return {
        _id: orderIds[i],
        orderId: orderCode,
        customerId: customer._id,
        itemId: item._id,
        warehouseId: warehouse._id,
        quantity: qty,
        unitPrice: unitPrice,
        totalAmount: totalAmount,
        discountAmount: disc,
        taxAmount: tax,
        finalAmount: finalAmount,
        customerEmail: customer.email,
        orderDate: FIXED_DATE,
        requiredDeliveryDate: new Date("2026-08-31T00:00:00.000Z"),
        status: orderStatuses[i % orderStatuses.length],
        priority: priorities[i % priorities.length],
        paymentStatus: i % 2 === 0 ? "PAID" : "PENDING",
        shippingAddress: `${customer.address}, ${customer.city}, ${customer.country}`,
        isDeleted: false,
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE
      };
    });
    await db.collection("orders").insertMany(ordersData as any);
    console.log(`Seeded ${ordersData.length} orders`);

    // -------------------------------------------------------------
    // 7. SEED SHIPMENTS (35)
    // -------------------------------------------------------------
    const shipmentStatuses: ("CREATED" | "PICKED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "RETURNED" | "CANCELLED")[] = [
      "CREATED", "PICKED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED"
    ];
    const carriers = ["FedEx Express", "UPS Ground", "DHL Global", "Maersk Logistics"];

    const shipmentsData = Array.from({ length: 35 }, (_, i) => {
      const shipId = `SHIP-${(2000 + i + 1).toString()}`;
      const order = ordersData[i % ordersData.length];
      const warehouse = warehousesData[i % warehousesData.length];
      const status = shipmentStatuses[i % shipmentStatuses.length];
      const tracking = ["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED"].includes(status)
        ? `TRK-${(900000 + i).toString()}`
        : undefined;

      const sDate = FIXED_DATE;
      const eDate = new Date("2026-08-27T00:00:00.000Z");
      const aDate = status === "DELIVERED" ? eDate : undefined;

      return {
        _id: makeStableObjectId(BASE_HEX, 7000 + i),
        shipmentId: shipId,
        orderId: order._id,
        warehouseId: warehouse._id,
        carrier: carriers[i % carriers.length],
        trackingNumber: tracking,
        shipmentDate: sDate,
        expectedDeliveryDate: eDate,
        actualDeliveryDate: aDate,
        status: status,
        shippingCost: 25.50 + (i * 2),
        destination: order.shippingAddress,
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE
      };
    });
    await db.collection("shipments").insertMany(shipmentsData as any);
    console.log(`Seeded ${shipmentsData.length} shipments`);

    // -------------------------------------------------------------
    // 8. SEED FORM SCHEMAS (7 complete schemas)
    // -------------------------------------------------------------
    const formSchemasData: Omit<FormSchema, "_id">[] = [
      {
        schemaName: "suppliers",
        active: true,
        fields: [
          { name: "supplierCode", dataType: "String", mandatory: true, required: true, inputType: "text", unique: true, constraints: { pattern: "^SUP-\\d{4}$" } },
          { name: "supplierName", dataType: "String", mandatory: true, required: true, inputType: "text", constraints: { minLength: 2 } },
          { name: "email", dataType: "String", mandatory: true, required: true, inputType: "email" },
          { name: "phone", dataType: "String", mandatory: false, required: false, inputType: "text" },
          { name: "website", dataType: "String", mandatory: false, required: false, inputType: "url" },
          { name: "rating", dataType: "Number", mandatory: false, required: false, inputType: "number", constraints: { min: 0, max: 5 } },
          { name: "status", dataType: "String", mandatory: true, required: true, inputType: "select", enumValues: ["ACTIVE", "INACTIVE", "SUSPENDED"] }
        ],
        relationships: [],
        sampleData: suppliersData.slice(0, 3)
      },
      {
        schemaName: "warehouses",
        active: true,
        fields: [
          { name: "warehouseCode", dataType: "String", mandatory: true, required: true, inputType: "text", unique: true },
          { name: "warehouseName", dataType: "String", mandatory: true, required: true, inputType: "text" },
          { name: "capacity", dataType: "Number", mandatory: true, required: true, inputType: "number", constraints: { min: 1 } },
          { name: "currentUtilization", dataType: "Number", mandatory: true, required: true, inputType: "number", constraints: { min: 0 } },
          { name: "status", dataType: "String", mandatory: true, required: true, inputType: "select", enumValues: ["ACTIVE", "INACTIVE", "FULL"] },
          { name: "email", dataType: "String", mandatory: false, required: false, inputType: "email" }
        ],
        relationships: [],
        sampleData: warehousesData.slice(0, 3)
      },
      {
        schemaName: "customers",
        active: true,
        fields: [
          { name: "customerCode", dataType: "String", mandatory: true, required: true, inputType: "text", unique: true },
          { name: "customerName", dataType: "String", mandatory: true, required: true, inputType: "text" },
          { name: "email", dataType: "String", mandatory: true, required: true, inputType: "email" },
          { name: "customerType", dataType: "String", mandatory: true, required: true, inputType: "select", enumValues: ["REGULAR", "PREMIUM", "WHOLESALE"] },
          { name: "creditLimit", dataType: "Number", mandatory: true, required: true, inputType: "number", constraints: { min: 0 } },
          { name: "status", dataType: "String", mandatory: true, required: true, inputType: "select", enumValues: ["ACTIVE", "INACTIVE", "BLOCKED"] }
        ],
        relationships: [],
        sampleData: customersData.slice(0, 3)
      },
      {
        schemaName: "items",
        active: true,
        fields: [
          { name: "itemCode", dataType: "String", mandatory: true, required: true, inputType: "text", unique: true, constraints: { exactLength: 8 } },
          { name: "itemName", dataType: "String", mandatory: true, required: true, inputType: "text", constraints: { minLength: 3 } },
          { name: "price", dataType: "Number", mandatory: true, required: true, inputType: "number", constraints: { min: 0 } },
          { name: "costPrice", dataType: "Number", mandatory: true, required: true, inputType: "number", constraints: { min: 0 } },
          { name: "category", dataType: "String", mandatory: true, required: true, inputType: "select", enumValues: ["electronics", "industrial", "office", "safety", "packaging"] },
          { name: "stockQuantity", dataType: "Number", mandatory: true, required: true, inputType: "number", constraints: { min: 0 } },
          { name: "reorderLevel", dataType: "Number", mandatory: true, required: true, inputType: "number", constraints: { min: 0 } },
          { name: "supplierId", dataType: "ObjectId", mandatory: false, required: false, inputType: "text", mappedTableRef: "suppliers", referencedSchema: "suppliers", referencedField: "_id" },
          { name: "warehouseId", dataType: "ObjectId", mandatory: false, required: false, inputType: "text", mappedTableRef: "warehouses", referencedSchema: "warehouses", referencedField: "_id" },
          { name: "status", dataType: "String", mandatory: true, required: true, inputType: "select", enumValues: ["ACTIVE", "INACTIVE", "DISCONTINUED"] },
          { name: "supplierWebsite", dataType: "String", mandatory: false, required: false, inputType: "url" },
          { name: "supportPhone", dataType: "String", mandatory: false, required: false, inputType: "text", constraints: { exactLength: 10 } }
        ],
        relationships: [
          { sourceField: "supplierId", referencedSchema: "suppliers", referencedField: "_id", relationshipType: "many-to-one" },
          { sourceField: "warehouseId", referencedSchema: "warehouses", referencedField: "_id", relationshipType: "many-to-one" }
        ],
        sampleData: itemsData.slice(0, 3)
      },
      {
        schemaName: "inventory",
        active: true,
        fields: [
          { name: "itemId", dataType: "ObjectId", mandatory: true, required: true, inputType: "text", mappedTableRef: "items", referencedSchema: "items", referencedField: "_id" },
          { name: "warehouseId", dataType: "ObjectId", mandatory: true, required: true, inputType: "text", mappedTableRef: "warehouses", referencedSchema: "warehouses", referencedField: "_id" },
          { name: "quantity", dataType: "Number", mandatory: true, required: true, inputType: "number", constraints: { min: 0 } },
          { name: "reservedQuantity", dataType: "Number", mandatory: true, required: true, inputType: "number", constraints: { min: 0 } },
          { name: "availableQuantity", dataType: "Number", mandatory: true, required: true, inputType: "number", constraints: { min: 0 } },
          { name: "status", dataType: "String", mandatory: true, required: true, inputType: "select", enumValues: ["AVAILABLE", "LOW_STOCK", "OUT_OF_STOCK", "BLOCKED"] }
        ],
        relationships: [
          { sourceField: "itemId", referencedSchema: "items", referencedField: "_id", relationshipType: "many-to-one" },
          { sourceField: "warehouseId", referencedSchema: "warehouses", referencedField: "_id", relationshipType: "many-to-one" }
        ],
        sampleData: inventoryData.slice(0, 3)
      },
      {
        schemaName: "orders",
        active: true,
        fields: [
          { name: "orderId", dataType: "String", mandatory: true, required: true, inputType: "text", unique: true },
          { name: "customerId", dataType: "ObjectId", mandatory: false, required: false, inputType: "text", mappedTableRef: "customers", referencedSchema: "customers", referencedField: "_id" },
          { name: "itemId", dataType: "ObjectId", mandatory: true, required: true, inputType: "text", mappedTableRef: "items", referencedSchema: "items", referencedField: "_id" },
          { name: "warehouseId", dataType: "ObjectId", mandatory: false, required: false, inputType: "text", mappedTableRef: "warehouses", referencedSchema: "warehouses", referencedField: "_id" },
          { name: "quantity", dataType: "Number", mandatory: true, required: true, inputType: "number", constraints: { min: 1 } },
          { name: "unitPrice", dataType: "Number", mandatory: false, required: false, inputType: "number", constraints: { min: 0 } },
          { name: "totalAmount", dataType: "Number", mandatory: false, required: false, inputType: "number", constraints: { min: 0 } },
          { name: "discountAmount", dataType: "Number", mandatory: false, required: false, inputType: "number", constraints: { min: 0 } },
          { name: "taxAmount", dataType: "Number", mandatory: false, required: false, inputType: "number", constraints: { min: 0 } },
          { name: "finalAmount", dataType: "Number", mandatory: false, required: false, inputType: "number", constraints: { min: 0 } },
          { name: "customerEmail", dataType: "String", mandatory: true, required: true, inputType: "email" },
          { name: "orderDate", dataType: "Date", mandatory: true, required: true, inputType: "date" },
          { name: "status", dataType: "String", mandatory: true, required: true, inputType: "select", enumValues: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] },
          { name: "priority", dataType: "String", mandatory: false, required: false, inputType: "select", enumValues: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
          { name: "paymentStatus", dataType: "String", mandatory: false, required: false, inputType: "select", enumValues: ["PENDING", "PAID", "FAILED", "REFUNDED"] }
        ],
        relationships: [
          { sourceField: "customerId", referencedSchema: "customers", referencedField: "_id", relationshipType: "many-to-one" },
          { sourceField: "itemId", referencedSchema: "items", referencedField: "_id", relationshipType: "many-to-one" },
          { sourceField: "warehouseId", referencedSchema: "warehouses", referencedField: "_id", relationshipType: "many-to-one" }
        ],
        sampleData: ordersData.slice(0, 3)
      },
      {
        schemaName: "shipments",
        active: true,
        fields: [
          { name: "shipmentId", dataType: "String", mandatory: true, required: true, inputType: "text", unique: true },
          { name: "orderId", dataType: "ObjectId", mandatory: true, required: true, inputType: "text", mappedTableRef: "orders", referencedSchema: "orders", referencedField: "_id" },
          { name: "warehouseId", dataType: "ObjectId", mandatory: true, required: true, inputType: "text", mappedTableRef: "warehouses", referencedSchema: "warehouses", referencedField: "_id" },
          { name: "carrier", dataType: "String", mandatory: false, required: false, inputType: "text" },
          { name: "trackingNumber", dataType: "String", mandatory: false, required: false, inputType: "text" },
          { name: "shipmentDate", dataType: "Date", mandatory: false, required: false, inputType: "date" },
          { name: "expectedDeliveryDate", dataType: "Date", mandatory: false, required: false, inputType: "date" },
          { name: "actualDeliveryDate", dataType: "Date", mandatory: false, required: false, inputType: "date" },
          { name: "status", dataType: "String", mandatory: true, required: true, inputType: "select", enumValues: ["CREATED", "PICKED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED", "CANCELLED"] },
          { name: "shippingCost", dataType: "Number", mandatory: false, required: false, inputType: "number", constraints: { min: 0 } }
        ],
        relationships: [
          { sourceField: "orderId", referencedSchema: "orders", referencedField: "_id", relationshipType: "many-to-one" },
          { sourceField: "warehouseId", referencedSchema: "warehouses", referencedField: "_id", relationshipType: "many-to-one" }
        ],
        sampleData: shipmentsData.slice(0, 3)
      }
    ];
    await db.collection("formSchemas").insertMany(formSchemasData as any);
    console.log(`Seeded ${formSchemasData.length} form schemas`);

    // -------------------------------------------------------------
    // 9. SEED FUNCTION REGISTRY (6 custom functions)
    // -------------------------------------------------------------
    const functionRegistryData: Omit<FunctionRegistry, "_id">[] = [
      {
        name: "calculateDiscount",
        active: true,
        description: "Calculate customer-type specific discount percentage and final price",
        parameters: [
          { name: "price", type: "number", required: true, description: "Base product price" },
          { name: "customerType", type: "string", required: true, enumValues: ["REGULAR", "PREMIUM", "WHOLESALE", "VIP"], description: "Customer classification" }
        ],
        responseFields: [
          { name: "discountedPrice", type: "number" },
          { name: "discount", type: "number" }
        ]
      },
      {
        name: "calculateOrderTotal",
        active: true,
        description: "Calculate total cost based on item unit price and requested quantity",
        parameters: [
          { name: "quantity", type: "number", required: true },
          { name: "unitPrice", type: "number", required: true }
        ],
        responseFields: [
          { name: "totalAmount", type: "number" }
        ]
      },
      {
        name: "calculateFinalAmount",
        active: true,
        description: "Calculate net final order cost applying tax and discount adjustments",
        parameters: [
          { name: "totalAmount", type: "number", required: true },
          { name: "discountAmount", type: "number", required: false },
          { name: "taxAmount", type: "number", required: false }
        ],
        responseFields: [
          { name: "finalAmount", type: "number" }
        ]
      },
      {
        name: "checkInventoryAvailability",
        active: true,
        description: "Check if specified warehouse has sufficient unreserved available stock",
        parameters: [
          { name: "itemId", type: "string", required: true },
          { name: "warehouseId", type: "string", required: true },
          { name: "quantity", type: "number", required: true }
        ],
        responseFields: [
          { name: "available", type: "boolean" },
          { name: "availableQuantity", type: "number" },
          { name: "requestedQuantity", type: "number" }
        ]
      },
      {
        name: "calculateShippingCost",
        active: true,
        description: "Compute shipping charges based on package weight, distance, and shipping priority",
        parameters: [
          { name: "weight", type: "number", required: true },
          { name: "distance", type: "number", required: true },
          { name: "priority", type: "string", required: false, enumValues: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] }
        ],
        responseFields: [
          { name: "shippingCost", type: "number" }
        ]
      },
      {
        name: "calculateReorderStatus",
        active: true,
        description: "Determine whether inventory reorder threshold is breached and compute recommended reorder quantity",
        parameters: [
          { name: "stockQuantity", type: "number", required: true },
          { name: "reorderLevel", type: "number", required: true }
        ],
        responseFields: [
          { name: "needsReorder", type: "boolean" },
          { name: "reorderQuantity", type: "number" },
          { name: "stockStatus", type: "string" }
        ]
      }
    ];
    await db.collection("functionRegistry").insertMany(functionRegistryData as any);
    console.log(`Seeded ${functionRegistryData.length} function registries`);

    console.log("Deterministic seed complete!");
  } catch (err) {
    console.error("Failed to seed database:", err);
  } finally {
    await client.close();
  }
};

if (require.main === module) {
  seed();
}
