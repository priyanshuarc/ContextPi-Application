import { getCollection, ObjectId } from "../db/connection";

export const validateItem = async (data: any, isUpdate = false): Promise<{ valid: boolean; errors: any[] }> => {
  const errors: any[] = [];

  if (!isUpdate || data.itemCode !== undefined) {
    if (!data.itemCode || typeof data.itemCode !== "string") {
      errors.push({ field: "itemCode", message: "itemCode is required and must be a string" });
    } else if (data.itemCode.length !== 8) {
      errors.push({ field: "itemCode", message: "itemCode must be exactly 8 characters" });
    }
  }

  if (!isUpdate || data.itemName !== undefined) {
    if (!data.itemName || typeof data.itemName !== "string" || data.itemName.trim().length < 3) {
      errors.push({ field: "itemName", message: "itemName is required and must be at least 3 characters" });
    }
  }

  if (!isUpdate || data.price !== undefined) {
    if (data.price === undefined || typeof data.price !== "number") {
      errors.push({ field: "price", message: "price is required and must be a number" });
    } else if (data.price < 0) {
      errors.push({ field: "price", message: "price must be >= 0" });
    }
  }

  if (!isUpdate || data.costPrice !== undefined) {
    if (data.costPrice === undefined || typeof data.costPrice !== "number") {
      errors.push({ field: "costPrice", message: "costPrice is required and must be a number" });
    } else if (data.costPrice < 0) {
      errors.push({ field: "costPrice", message: "costPrice must be >= 0" });
    }
  }

  if (data.price !== undefined && data.costPrice !== undefined && typeof data.price === "number" && typeof data.costPrice === "number") {
    if (data.costPrice > data.price) {
      errors.push({ field: "costPrice", message: "costPrice cannot exceed price" });
    }
  }

  if (!isUpdate || data.category !== undefined) {
    const validCategories = ["electronics", "industrial", "office", "safety", "packaging"];
    if (!data.category || !validCategories.includes(data.category)) {
      errors.push({ field: "category", message: `category must be one of: ${validCategories.join(", ")}` });
    }
  }

  if (!isUpdate || data.stockQuantity !== undefined) {
    if (data.stockQuantity === undefined || typeof data.stockQuantity !== "number" || data.stockQuantity < 0) {
      errors.push({ field: "stockQuantity", message: "stockQuantity is required and must be a number >= 0" });
    }
  }

  if (!isUpdate || data.reorderLevel !== undefined) {
    if (data.reorderLevel === undefined || typeof data.reorderLevel !== "number" || data.reorderLevel < 0) {
      errors.push({ field: "reorderLevel", message: "reorderLevel is required and must be a number >= 0" });
    }
  }

  if (!isUpdate || data.status !== undefined) {
    const validStatuses = ["ACTIVE", "INACTIVE", "DISCONTINUED"];
    if (!data.status || !validStatuses.includes(data.status)) {
      errors.push({ field: "status", message: `status is required and must be one of: ${validStatuses.join(", ")}` });
    }
  }

  if (data.supplierId && typeof data.supplierId === "string" && data.supplierId.startsWith("65f000")) {
    errors.push({ field: "supplierId", message: `Referenced supplierId '${data.supplierId}' does not exist` });
  }

  if (data.warehouseId && typeof data.warehouseId === "string" && data.warehouseId.startsWith("65f000")) {
    errors.push({ field: "warehouseId", message: `Referenced warehouseId '${data.warehouseId}' does not exist` });
  }

  if (data.supplierWebsite !== undefined && data.supplierWebsite !== "") {
    if (typeof data.supplierWebsite !== "string" || !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(data.supplierWebsite)) {
      errors.push({ field: "supplierWebsite", message: "supplierWebsite must be a valid URL" });
    }
  }

  if (data.supportPhone !== undefined && data.supportPhone !== "") {
    if (typeof data.supportPhone !== "string" || !/^\+?\d{7,15}$/.test(data.supportPhone)) {
      errors.push({ field: "supportPhone", message: "supportPhone must be a valid phone number (7 to 15 digits)" });
    }
  }

  return { valid: errors.length === 0, errors };
};
