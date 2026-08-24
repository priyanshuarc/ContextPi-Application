import { getCollection } from "../db/connection";
import { Supplier } from "../types";

export const validateSupplier = async (data: any, isUpdate = false): Promise<{ valid: boolean; errors: any[] }> => {
  const errors: any[] = [];

  if (!isUpdate || data.supplierCode !== undefined) {
    if (!data.supplierCode || typeof data.supplierCode !== "string") {
      errors.push({ field: "supplierCode", message: "supplierCode is required and must be a string" });
    } else if (!/^SUP-\d{4}$/.test(data.supplierCode)) {
      errors.push({ field: "supplierCode", message: "supplierCode must follow format SUP-XXXX (e.g. SUP-0001)" });
    }
  }

  if (!isUpdate || data.supplierName !== undefined) {
    if (!data.supplierName || typeof data.supplierName !== "string" || data.supplierName.trim().length < 2) {
      errors.push({ field: "supplierName", message: "supplierName is required and must be at least 2 characters" });
    }
  }

  if (!isUpdate || data.email !== undefined) {
    if (!data.email || typeof data.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({ field: "email", message: "email is required and must be a valid email address" });
    }
  }

  if (data.rating !== undefined) {
    if (typeof data.rating !== "number" || data.rating < 0 || data.rating > 5) {
      errors.push({ field: "rating", message: "rating must be a number between 0 and 5" });
    }
  }

  if (!isUpdate || data.status !== undefined) {
    const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED"];
    if (!data.status || !validStatuses.includes(data.status)) {
      errors.push({ field: "status", message: `status must be one of: ${validStatuses.join(", ")}` });
    }
  }

  if (data.website !== undefined && data.website !== "") {
    if (typeof data.website !== "string" || !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(data.website)) {
      errors.push({ field: "website", message: "website must be a valid URL" });
    }
  }

  return { valid: errors.length === 0, errors };
};
