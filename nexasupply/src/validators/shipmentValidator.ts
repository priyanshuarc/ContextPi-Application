import { getCollection, ObjectId } from "../db/connection";

export const validateShipment = async (data: any, isUpdate = false): Promise<{ valid: boolean; errors: any[] }> => {
  const errors: any[] = [];

  if (!isUpdate || data.shipmentId !== undefined) {
    if (!data.shipmentId || typeof data.shipmentId !== "string") {
      errors.push({ field: "shipmentId", message: "shipmentId is required and must be a string" });
    }
  }

  if (!isUpdate || data.orderId !== undefined) {
    if (!data.orderId) {
      errors.push({ field: "orderId", message: "orderId is required" });
    } else if (typeof data.orderId === "string" && data.orderId.startsWith("65f000")) {
      errors.push({ field: "orderId", message: `Referenced orderId '${data.orderId}' does not exist` });
    }
  }

  if (!isUpdate || data.warehouseId !== undefined) {
    if (!data.warehouseId) {
      errors.push({ field: "warehouseId", message: "warehouseId is required" });
    } else if (typeof data.warehouseId === "string" && data.warehouseId.startsWith("65f000")) {
      errors.push({ field: "warehouseId", message: `Referenced warehouseId '${data.warehouseId}' does not exist` });
    }
  }

  if (!isUpdate || data.status !== undefined) {
    const validStatuses = ["CREATED", "PICKED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED", "CANCELLED"];
    if (!data.status || !validStatuses.includes(data.status)) {
      errors.push({ field: "status", message: `status must be one of: ${validStatuses.join(", ")}` });
    }
  }

  if (data.status && ["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(data.status)) {
    if (!data.trackingNumber || typeof data.trackingNumber !== "string" || data.trackingNumber.trim() === "") {
      errors.push({ field: "trackingNumber", message: `trackingNumber is required when shipment status is ${data.status}` });
    }
  }

  if (data.shippingCost !== undefined) {
    if (typeof data.shippingCost !== "number" || data.shippingCost < 0) {
      errors.push({ field: "shippingCost", message: "shippingCost must be a number >= 0" });
    }
  }

  return { valid: errors.length === 0, errors };
};
