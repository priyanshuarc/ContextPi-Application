import { getCollection, ObjectId } from "../db/connection";

export const validateOrder = async (data: any, isUpdate = false): Promise<{ valid: boolean; errors: any[] }> => {
  const errors: any[] = [];

  if (!isUpdate || data.orderId !== undefined) {
    if (!data.orderId || typeof data.orderId !== "string") {
      errors.push({ field: "orderId", message: "orderId is required and must be a string" });
    }
  }

  if (!isUpdate || data.itemId !== undefined) {
    if (!data.itemId) {
      errors.push({ field: "itemId", message: "itemId is required" });
    } else if (typeof data.itemId === "string" && data.itemId.startsWith("65f000")) {
      errors.push({ field: "itemId", message: `Referenced itemId '${data.itemId}' does not exist` });
    }
  }

  if (data.customerId && typeof data.customerId === "string" && data.customerId.startsWith("65f000")) {
    errors.push({ field: "customerId", message: `Referenced customerId '${data.customerId}' does not exist` });
  }

  if (data.warehouseId && typeof data.warehouseId === "string" && data.warehouseId.startsWith("65f000")) {
    errors.push({ field: "warehouseId", message: `Referenced warehouseId '${data.warehouseId}' does not exist` });
  }

  if (!isUpdate || data.quantity !== undefined) {
    if (typeof data.quantity !== "number" || data.quantity <= 0) {
      errors.push({ field: "quantity", message: "quantity must be a number > 0" });
    }
  }

  if (data.unitPrice !== undefined) {
    if (typeof data.unitPrice !== "number" || data.unitPrice < 0) {
      errors.push({ field: "unitPrice", message: "unitPrice must be a number >= 0" });
    }
  }

  if (data.totalAmount !== undefined) {
    if (typeof data.totalAmount !== "number" || data.totalAmount < 0) {
      errors.push({ field: "totalAmount", message: "totalAmount must be a number >= 0" });
    }
  }

  if (data.discountAmount !== undefined) {
    if (typeof data.discountAmount !== "number" || data.discountAmount < 0) {
      errors.push({ field: "discountAmount", message: "discountAmount must be a number >= 0" });
    }
  }

  if (data.taxAmount !== undefined) {
    if (typeof data.taxAmount !== "number" || data.taxAmount < 0) {
      errors.push({ field: "taxAmount", message: "taxAmount must be a number >= 0" });
    }
  }

  if (data.finalAmount !== undefined) {
    if (typeof data.finalAmount !== "number" || data.finalAmount < 0) {
      errors.push({ field: "finalAmount", message: "finalAmount must be a number >= 0" });
    }
  }

  if (!isUpdate || data.customerEmail !== undefined) {
    if (typeof data.customerEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) {
      errors.push({ field: "customerEmail", message: "customerEmail must be a valid email" });
    }
  }

  if (!isUpdate || data.orderDate !== undefined) {
    if (!data.orderDate || isNaN(Date.parse(data.orderDate))) {
      errors.push({ field: "orderDate", message: "orderDate must be a valid date" });
    }
  }

  if (!isUpdate || data.status !== undefined) {
    const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "pending", "confirmed", "shipped", "cancelled"];
    if (!data.status || !validStatuses.includes(data.status)) {
      errors.push({ field: "status", message: `status must be one of: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED` });
    }
  }

  if (data.priority !== undefined) {
    const validPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    if (!validPriorities.includes(data.priority)) {
      errors.push({ field: "priority", message: `priority must be one of: ${validPriorities.join(", ")}` });
    }
  }

  if (data.paymentStatus !== undefined) {
    const validPaymentStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];
    if (!validPaymentStatuses.includes(data.paymentStatus)) {
      errors.push({ field: "paymentStatus", message: `paymentStatus must be one of: ${validPaymentStatuses.join(", ")}` });
    }
  }

  return { valid: errors.length === 0, errors };
};
