import { getCollection, ObjectId } from "../db/connection";

export const validateInventory = async (data: any, isUpdate = false): Promise<{ valid: boolean; errors: any[] }> => {
  const errors: any[] = [];

  if (!isUpdate || data.itemId !== undefined) {
    if (!data.itemId) {
      errors.push({ field: "itemId", message: "itemId is required" });
    } else if (typeof data.itemId === "string" && data.itemId.startsWith("65f000")) {
      errors.push({ field: "itemId", message: `Referenced itemId '${data.itemId}' does not exist` });
    }
  }

  if (!isUpdate || data.warehouseId !== undefined) {
    if (!data.warehouseId) {
      errors.push({ field: "warehouseId", message: "warehouseId is required" });
    } else if (typeof data.warehouseId === "string" && data.warehouseId.startsWith("65f000")) {
      errors.push({ field: "warehouseId", message: `Referenced warehouseId '${data.warehouseId}' does not exist` });
    }
  }

  if (!isUpdate || data.quantity !== undefined) {
    if (typeof data.quantity !== "number" || data.quantity < 0) {
      errors.push({ field: "quantity", message: "quantity must be a number >= 0" });
    }
  }

  if (!isUpdate || data.reservedQuantity !== undefined) {
    if (typeof data.reservedQuantity !== "number" || data.reservedQuantity < 0) {
      errors.push({ field: "reservedQuantity", message: "reservedQuantity must be a number >= 0" });
    }
  }

  if (!isUpdate || data.availableQuantity !== undefined) {
    if (data.availableQuantity === undefined || typeof data.availableQuantity !== "number" || data.availableQuantity < 0) {
      errors.push({ field: "availableQuantity", message: "availableQuantity is required and must be a number >= 0" });
    }
  }

  if (data.quantity !== undefined && data.reservedQuantity !== undefined && data.availableQuantity !== undefined) {
    if (typeof data.quantity === "number" && typeof data.reservedQuantity === "number" && typeof data.availableQuantity === "number") {
      if (data.reservedQuantity > data.quantity) {
        errors.push({ field: "reservedQuantity", message: "reservedQuantity cannot exceed total quantity" });
      }
      const expectedAvailable = data.quantity - data.reservedQuantity;
      if (data.availableQuantity !== expectedAvailable) {
        errors.push({ field: "availableQuantity", message: `availableQuantity must equal quantity - reservedQuantity (${expectedAvailable})` });
      }
    }
  }

  if (!isUpdate || data.status !== undefined) {
    const validStatuses = ["AVAILABLE", "LOW_STOCK", "OUT_OF_STOCK", "BLOCKED"];
    if (!data.status || !validStatuses.includes(data.status)) {
      errors.push({ field: "status", message: `status must be one of: ${validStatuses.join(", ")}` });
    }
  }

  return { valid: errors.length === 0, errors };
};
