import { getCollection } from "../db/connection";
import { Customer } from "../types";

export const validateCustomer = async (data: any, isUpdate = false): Promise<{ valid: boolean; errors: any[] }> => {
  const errors: any[] = [];

  if (!isUpdate || data.customerCode !== undefined) {
    if (!data.customerCode || typeof data.customerCode !== "string") {
      errors.push({ field: "customerCode", message: "customerCode is required and must be a string" });
    }
  }

  if (!isUpdate || data.customerName !== undefined) {
    if (!data.customerName || typeof data.customerName !== "string" || data.customerName.trim() === "") {
      errors.push({ field: "customerName", message: "customerName is required and cannot be empty" });
    }
  }

  if (!isUpdate || data.email !== undefined) {
    if (!data.email || typeof data.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({ field: "email", message: "email is required and must be a valid email address" });
    }
  }

  if (!isUpdate || data.customerType !== undefined) {
    const validTypes = ["REGULAR", "PREMIUM", "WHOLESALE"];
    if (!data.customerType || !validTypes.includes(data.customerType)) {
      errors.push({ field: "customerType", message: `customerType must be one of: ${validTypes.join(", ")}` });
    }
  }

  if (!isUpdate || data.creditLimit !== undefined) {
    if (typeof data.creditLimit !== "number" || data.creditLimit < 0) {
      errors.push({ field: "creditLimit", message: "creditLimit must be a number >= 0" });
    }
  }

  if (!isUpdate || data.status !== undefined) {
    const validStatuses = ["ACTIVE", "INACTIVE", "BLOCKED"];
    if (!data.status || !validStatuses.includes(data.status)) {
      errors.push({ field: "status", message: `status must be one of: ${validStatuses.join(", ")}` });
    }
  }

  return { valid: errors.length === 0, errors };
};
