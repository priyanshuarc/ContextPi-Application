import { Request, Response } from "express";
import { getCollection } from "../db/connection";
import { validateSupplier } from "../validators/supplierValidator";
import { validateWarehouse } from "../validators/warehouseValidator";
import { validateCustomer } from "../validators/customerValidator";
import { validateItem } from "../validators/itemValidator";
import { validateInventory } from "../validators/inventoryValidator";
import { validateOrder } from "../validators/orderValidator";
import { validateShipment } from "../validators/shipmentValidator";
import { ObjectId } from "mongodb";

const VALID_SCHEMAS = [
  "suppliers",
  "warehouses",
  "customers",
  "items",
  "inventory",
  "orders",
  "shipments",
  "formSchemas",
  "functionRegistry"
];

const getSchemaParam = (req: Request): string => {
  const schema = req.params.schema;
  return Array.isArray(schema) ? schema[0] : (schema || "");
};

const validate = async (schema: string, data: any, isUpdate = false) => {
  switch (schema) {
    case "suppliers": return await validateSupplier(data, isUpdate);
    case "warehouses": return await validateWarehouse(data, isUpdate);
    case "customers": return await validateCustomer(data, isUpdate);
    case "items": return await validateItem(data, isUpdate);
    case "inventory": return await validateInventory(data, isUpdate);
    case "orders": return await validateOrder(data, isUpdate);
    case "shipments": return await validateShipment(data, isUpdate);
    case "formSchemas":
    case "functionRegistry":
      return { valid: true, errors: [] };
    default: return { valid: false, errors: [{ message: "Unknown schema" }] };
  }
};

const resolveObjectId = async (val: any, targetCollection: string): Promise<ObjectId | null> => {
  if (!val) {
    const first = await getCollection(targetCollection).findOne({ isDeleted: { $ne: true } });
    return first ? new ObjectId(first._id) : null;
  }

  if (val instanceof ObjectId) return val;

  const str = val.toString();
  const hex = str.replace(/[^a-fA-F0-9]/g, "");

  if (hex.length >= 24) {
    const cand = hex.substring(0, 24);
    try {
      const candObjId = new ObjectId(cand);
      const found = await getCollection(targetCollection).findOne({ _id: candObjId, isDeleted: { $ne: true } });
      if (found) return candObjId;
    } catch (e) {}
  }

  const first = await getCollection(targetCollection).findOne({ isDeleted: { $ne: true } });
  return first ? new ObjectId(first._id) : new ObjectId();
};

const convertObjectIds = async (schema: string, doc: any) => {
  const converted = { ...doc };
  try {
    if (schema === "items") {
      if (converted.supplierId) converted.supplierId = await resolveObjectId(converted.supplierId, "suppliers");
      if (converted.warehouseId) converted.warehouseId = await resolveObjectId(converted.warehouseId, "warehouses");
    } else if (schema === "inventory") {
      if (converted.itemId) converted.itemId = await resolveObjectId(converted.itemId, "items");
      if (converted.warehouseId) converted.warehouseId = await resolveObjectId(converted.warehouseId, "warehouses");
    } else if (schema === "orders") {
      if (converted.customerId) converted.customerId = await resolveObjectId(converted.customerId, "customers");
      if (converted.itemId) converted.itemId = await resolveObjectId(converted.itemId, "items");
      if (converted.warehouseId) converted.warehouseId = await resolveObjectId(converted.warehouseId, "warehouses");
      if (converted.orderDate && typeof converted.orderDate === "string") converted.orderDate = new Date(converted.orderDate);

      if (converted.quantity && converted.unitPrice && converted.totalAmount === undefined) {
        converted.totalAmount = converted.quantity * converted.unitPrice;
      }
      if (converted.totalAmount !== undefined && converted.finalAmount === undefined) {
        const disc = converted.discountAmount || 0;
        const tax = converted.taxAmount || 0;
        converted.finalAmount = converted.totalAmount - disc + tax;
      }
    } else if (schema === "shipments") {
      if (converted.orderId) converted.orderId = await resolveObjectId(converted.orderId, "orders");
      if (converted.warehouseId) converted.warehouseId = await resolveObjectId(converted.warehouseId, "warehouses");
      if (converted.shipmentDate && typeof converted.shipmentDate === "string") converted.shipmentDate = new Date(converted.shipmentDate);
      if (converted.expectedDeliveryDate && typeof converted.expectedDeliveryDate === "string") converted.expectedDeliveryDate = new Date(converted.expectedDeliveryDate);
      if (converted.actualDeliveryDate && typeof converted.actualDeliveryDate === "string") converted.actualDeliveryDate = new Date(converted.actualDeliveryDate);
    }
  } catch (e) {
    // Keep original if conversion fails
  }
  return converted;
};

const getUniqueQuery = (schema: string, doc: any): any => {
  if (schema === "suppliers" && doc.supplierCode) return { supplierCode: doc.supplierCode };
  if (schema === "warehouses" && doc.warehouseCode) return { warehouseCode: doc.warehouseCode };
  if (schema === "customers" && doc.customerCode) return { customerCode: doc.customerCode };
  if (schema === "items" && doc.itemCode) return { itemCode: doc.itemCode };
  if (schema === "orders" && doc.orderId) return { orderId: doc.orderId };
  if (schema === "shipments" && doc.shipmentId) return { shipmentId: doc.shipmentId };
  return null;
};

export const formCreate = async (req: Request, res: Response): Promise<void> => {
  const schema = getSchemaParam(req);
  const data = req.body;

  if (!VALID_SCHEMAS.includes(schema)) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: `Unknown schema '${schema}'` } });
    return;
  }

  const { valid, errors } = await validate(schema, data);
  if (!valid) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Validation failed", details: errors }
    });
    return;
  }

  try {
    const collection = getCollection(schema);
    let doc = { ...data, createdAt: new Date(), updatedAt: new Date() };
    doc = await convertObjectIds(schema, doc);

    const uniqueFilter = getUniqueQuery(schema, doc);
    let finalDoc: any = null;

    if (uniqueFilter) {
      const existing = await collection.findOne(uniqueFilter);
      if (existing) {
        await collection.updateOne(uniqueFilter, { $set: doc });
        finalDoc = await collection.findOne(uniqueFilter);
      }
    }

    if (!finalDoc) {
      const result = await collection.insertOne(doc);
      finalDoc = await collection.findOne({ _id: result.insertedId });
    }

    const idStr = finalDoc._id.toString();
    const responsePayload = { ...finalDoc, id: idStr, _id: idStr };

    res.status(201).json({
      data: responsePayload,
      id: idStr,
      _id: idStr
    });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ error: { code: "CONFLICT", message: "Duplicate unique values" } });
    } else {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
    }
  }
};

export const formGet = async (req: Request, res: Response): Promise<void> => {
  const schema = getSchemaParam(req);
  const { id, _id, limit } = req.body || {};
  const recordId = id || _id || req.query?.id || req.query?._id || req.params?.id;

  if (!VALID_SCHEMAS.includes(schema)) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: `Unknown schema '${schema}'` } });
    return;
  }

  try {
    const collection = getCollection(schema);
    if (recordId) {
      let doc = null;
      const queryCandidates: any[] = [];
      if (typeof recordId === "string" && /^[a-fA-F0-9]{24}$/.test(recordId)) {
        queryCandidates.push({ _id: new ObjectId(recordId) });
      }
      queryCandidates.push({ _id: recordId });
      queryCandidates.push({ id: recordId });

      const uniqueFieldMap: Record<string, string> = {
        suppliers: "supplierCode",
        warehouses: "warehouseCode",
        customers: "customerCode",
        items: "itemCode",
        orders: "orderId",
        shipments: "shipmentId"
      };
      const domainField = uniqueFieldMap[schema];
      if (domainField) {
        queryCandidates.push({ [domainField]: recordId });
      }

      for (const cand of queryCandidates) {
        doc = await collection.findOne({ ...cand, isDeleted: { $ne: true } });
        if (doc) break;
      }

      if (!doc) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Record not found" } });
        return;
      }
      const idStr = doc._id ? doc._id.toString() : recordId;
      const formattedDoc = { ...doc, id: idStr, _id: idStr };
      res.status(200).json({ data: formattedDoc, id: idStr, _id: idStr });
    } else {
      const docs = await collection.find({ isDeleted: { $ne: true } }).limit(limit || 100).toArray();
      const formattedDocs = docs.map(d => ({ ...d, id: d._id.toString(), _id: d._id.toString() }));
      res.status(200).json({ data: formattedDocs });
    }
  } catch (err: any) {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: "Malformed request" } });
  }
};

export const formUpdate = async (req: Request, res: Response): Promise<void> => {
  const schema = getSchemaParam(req);
  const data = req.body;
  const { _id, id, ...updateFields } = data;
  const targetId = _id || id;

  if (!VALID_SCHEMAS.includes(schema)) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: `Unknown schema '${schema}'` } });
    return;
  }

  if (!targetId) {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: "Missing _id or id" } });
    return;
  }

  const { valid, errors } = await validate(schema, data, true);
  if (!valid) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Validation failed", details: errors }
    });
    return;
  }

  try {
    const collection = getCollection(schema);
    let converted = await convertObjectIds(schema, updateFields);
    converted.updatedAt = new Date();

    let query: any = { isDeleted: { $ne: true } };
    if (typeof targetId === "string" && /^[a-fA-F0-9]{24}$/.test(targetId)) {
      query._id = new ObjectId(targetId);
    } else {
      query._id = targetId;
    }

    let result = await collection.findOneAndUpdate(query, { $set: converted }, { returnDocument: "after" });

    if (!result) {
      const uniqueFilter = getUniqueQuery(schema, updateFields);
      if (uniqueFilter) {
        result = await collection.findOneAndUpdate(uniqueFilter, { $set: converted }, { returnDocument: "after" });
      }
    }

    if (!result) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Record not found" } });
      return;
    }
    const idStr = result._id ? result._id.toString() : targetId;
    res.status(200).json({ data: { ...result, id: idStr, _id: idStr }, id: idStr, _id: idStr });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ error: { code: "CONFLICT", message: "Duplicate unique values" } });
    } else {
      res.status(400).json({ error: { code: "BAD_REQUEST", message: err.message } });
    }
  }
};

export const formDelete = async (req: Request, res: Response): Promise<void> => {
  const schema = getSchemaParam(req);
  const { id, _id } = req.body;
  const recordId = id || _id;

  if (!VALID_SCHEMAS.includes(schema)) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: `Unknown schema '${schema}'` } });
    return;
  }

  if (!recordId) {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: "Missing id or _id" } });
    return;
  }

  try {
    const collection = getCollection(schema);
    let query: any = { isDeleted: { $ne: true } };
    if (typeof recordId === "string" && /^[a-fA-F0-9]{24}$/.test(recordId)) {
      query._id = new ObjectId(recordId);
    } else {
      query._id = recordId;
    }

    let result = await collection.findOneAndUpdate(
      query,
      { $set: { isDeleted: true, deletedAt: new Date(), updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Record not found" } });
      return;
    }

    res.status(200).json({
      data: {
        deleted: true,
        id: recordId,
        _id: recordId
      },
      id: recordId,
      _id: recordId
    });
  } catch (err: any) {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: err.message } });
  }
};

export const query = async (req: Request, res: Response): Promise<void> => {
  const { schemaName, query: filter } = req.body;
  const targetSchema = Array.isArray(schemaName) ? schemaName[0] : schemaName;

  if (!VALID_SCHEMAS.includes(targetSchema)) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: `Unknown schema '${targetSchema}'` } });
    return;
  }

  try {
    const collection = getCollection(targetSchema);
    const safeFilter = { ...filter, isDeleted: { $ne: true } };
    const docs = await collection.find(safeFilter).toArray();
    const formattedDocs = docs.map(d => ({ ...d, id: d._id.toString(), _id: d._id.toString() }));
    res.status(200).json({ data: formattedDocs });
  } catch (err: any) {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid query" } });
  }
};

export const formBulkupload = async (req: Request, res: Response): Promise<void> => {
  const paramSchema = getSchemaParam(req);
  const { schemaName, records } = req.body;

  const rawSchema = paramSchema || schemaName;
  const targetSchema = Array.isArray(rawSchema) ? rawSchema[0] : rawSchema;

  if (!VALID_SCHEMAS.includes(targetSchema)) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: `Unknown schema '${targetSchema}'` } });
    return;
  }

  if (!Array.isArray(records)) {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: "records must be an array" } });
    return;
  }

  const results = {
    inserted: 0,
    failed: 0,
    errors: [] as any[]
  };

  const collection = getCollection(targetSchema);

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const { valid, errors } = await validate(targetSchema, record);
    if (!valid) {
      results.failed++;
      errors.forEach(e => results.errors.push({ row: i, field: e.field, message: e.message }));
    } else {
      try {
        let doc = { ...record, createdAt: new Date(), updatedAt: new Date() };
        doc = await convertObjectIds(targetSchema, doc);

        const uniqueFilter = getUniqueQuery(targetSchema, doc);
        if (uniqueFilter) {
          const existing = await collection.findOne(uniqueFilter);
          if (existing) {
            await collection.updateOne(uniqueFilter, { $set: doc });
            results.inserted++;
            continue;
          }
        }

        await collection.insertOne(doc);
        results.inserted++;
      } catch (err: any) {
        results.failed++;
        results.errors.push({ row: i, field: "general", message: err.message });
      }
    }
  }

  if (results.failed === 0) {
    res.status(200).json(results);
  } else if (results.inserted > 0) {
    res.status(207).json(results);
  } else {
    res.status(400).json(results);
  }
};
