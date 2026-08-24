import { Request, Response } from "express";
import { getCollection } from "../db/connection";
import { calculateDiscount } from "../services/functions/calculateDiscount";
import { calculateOrderTotal } from "../services/functions/calculateOrderTotal";
import { calculateFinalAmount } from "../services/functions/calculateFinalAmount";
import { checkInventoryAvailability } from "../services/functions/checkInventoryAvailability";
import { calculateShippingCost } from "../services/functions/calculateShippingCost";
import { calculateReorderStatus } from "../services/functions/calculateReorderStatus";
import { FunctionRegistry } from "../types";

export const executeFunction = async (req: Request, res: Response): Promise<void> => {
  const { functionName, parameters } = req.body;

  if (!functionName) {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: "functionName is required" } });
    return;
  }

  const collection = getCollection<FunctionRegistry>("functionRegistry");
  const func = await collection.findOne({ name: functionName, active: true });

  if (!func) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: `Unknown function '${functionName}'` } });
    return;
  }

  let funcResult: { valid: boolean; result?: any; errors?: any[] };

  switch (functionName) {
    case "calculateDiscount":
      funcResult = calculateDiscount(parameters);
      break;
    case "calculateOrderTotal":
      funcResult = calculateOrderTotal(parameters);
      break;
    case "calculateFinalAmount":
      funcResult = calculateFinalAmount(parameters);
      break;
    case "checkInventoryAvailability":
      funcResult = await checkInventoryAvailability(parameters);
      break;
    case "calculateShippingCost":
      funcResult = calculateShippingCost(parameters);
      break;
    case "calculateReorderStatus":
      funcResult = calculateReorderStatus(parameters);
      break;
    default:
      res.status(500).json({ error: { code: "NOT_IMPLEMENTED", message: "Function registered but not implemented" } });
      return;
  }

  if (!funcResult.valid) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid function parameters", details: funcResult.errors }
    });
    return;
  }

  res.status(200).json({ data: funcResult.result });
};

export const createFunction = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  
  if (!data.name) {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: "name is required" } });
    return;
  }

  const collection = getCollection<FunctionRegistry>("functionRegistry");
  const existing = await collection.findOne({ name: data.name });

  if (existing) {
    res.status(409).json({ error: { code: "CONFLICT", message: "Duplicate name" } });
    return;
  }

  try {
    const doc = { ...data };
    const result = await collection.insertOne(doc);
    const created = await collection.findOne({ _id: result.insertedId });
    res.status(201).json({ data: created });
  } catch (err: any) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
};

export const getAllFunction = async (req: Request, res: Response): Promise<void> => {
  try {
    const collection = getCollection<FunctionRegistry>("functionRegistry");
    const docs = await collection.find({ active: true }).toArray();
    res.status(200).json({ data: docs });
  } catch (err: any) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
};

export const getFunction = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: "name is required" } });
    return;
  }

  try {
    const collection = getCollection<FunctionRegistry>("functionRegistry");
    const doc = await collection.findOne({ name, active: true });
    if (!doc) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Function not found" } });
      return;
    }
    res.status(200).json({ data: doc });
  } catch (err: any) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
  }
};
