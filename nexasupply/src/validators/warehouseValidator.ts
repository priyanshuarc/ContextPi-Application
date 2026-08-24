import { getCollection } from "../db/connection";
import { Warehouse } from "../types";

export const validateWarehouse = async (data: any, isUpdate = false): Promise<{ valid: boolean; errors: any[] }> => {
  const errors: any[] = [];

  if (!isUpdate || data.warehouseCode !== undefined) {
    if (!data.warehouseCode || typeof data.warehouseCode !== "string") {
      errors.push({ field: "warehouseCode", message: "warehouseCode is required and must be a string" });
    }
  }

  if (!isUpdate || data.warehouseName !== undefined) {
    if (!data.warehouseName || typeof data.warehouseName !== "string" || data.warehouseName.trim() === "") {
      errors.push({ field: "warehouseName", message: "warehouseName is required and cannot be empty" });
    }
  }

  if (!isUpdate || data.capacity !== undefined) {
    if (typeof data.capacity !== "number" || data.capacity <= 0) {
      errors.push({ field: "capacity", message: "capacity must be a number > 0" });
    }
  }

  if (!isUpdate || data.currentUtilization !== undefined) {
    if (typeof data.currentUtilization !== "number" || data.currentUtilization < 0) {
      errors.push({ field: "currentUtilization", message: "currentUtilization must be a number >= 0" });
    } else if (data.capacity !== undefined && data.currentUtilization > data.capacity) {
      errors.push({ field: "currentUtilization", message: "currentUtilization cannot exceed capacity" });
    }
  }

  if (!isUpdate || data.status !== undefined) {
    const validStatuses = ["ACTIVE", "INACTIVE", "FULL"];
    if (!data.status || !validStatuses.includes(data.status)) {
      errors.push({ field: "status", message: `status must be one of: ${validStatuses.join(", ")}` });
    }
  }

  if (data.email !== undefined && data.email !== "") {
    if (typeof data.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({ field: "email", message: "email must be a valid email address" });
    }
  }

  return { valid: errors.length === 0, errors };
};
