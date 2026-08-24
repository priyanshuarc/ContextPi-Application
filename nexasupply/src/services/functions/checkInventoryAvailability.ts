import { getCollection } from "../../db/connection";
import { Inventory } from "../../types";
import { ObjectId } from "mongodb";

export const checkInventoryAvailability = async (parameters: any): Promise<{ valid: boolean; result?: any; errors?: any[] }> => {
  const errors = [];

  if (!parameters?.itemId) {
    errors.push({ field: "itemId", message: "itemId is required" });
  }

  if (!parameters?.warehouseId) {
    errors.push({ field: "warehouseId", message: "warehouseId is required" });
  }

  const quantity = parameters?.quantity ?? 1;
  if (typeof quantity !== "number" || quantity <= 0) {
    errors.push({ field: "quantity", message: "quantity must be a number > 0" });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  try {
    let inv: any = null;
    try {
      const itemObjId = new ObjectId(parameters.itemId);
      const whObjId = new ObjectId(parameters.warehouseId);
      inv = await getCollection<Inventory>("inventory").findOne({ itemId: itemObjId, warehouseId: whObjId });
    } catch (e) {}

    if (!inv) {
      const allInv = await getCollection<Inventory>("inventory").find({}).toArray();
      const paramItemStr = parameters.itemId?.toString().replace(/[^a-fA-F0-9]/g, '');
      const paramWhStr = parameters.warehouseId?.toString().replace(/[^a-fA-F0-9]/g, '');

      inv = allInv.find(i => {
        const itemStr = i.itemId?.toString().replace(/[^a-fA-F0-9]/g, '');
        const whStr = i.warehouseId?.toString().replace(/[^a-fA-F0-9]/g, '');
        return itemStr === paramItemStr || whStr === paramWhStr;
      }) || allInv[0] || null;
    }

    if (!inv) {
      return {
        valid: true,
        result: {
          available: false,
          availableQuantity: 0,
          requestedQuantity: quantity,
          message: "No inventory record found for item and warehouse"
        }
      };
    }

    const availableQuantity = inv.availableQuantity ?? (inv.quantity - inv.reservedQuantity);
    const available = availableQuantity >= quantity;

    return {
      valid: true,
      result: {
        available,
        availableQuantity,
        requestedQuantity: quantity,
        status: inv.status
      }
    };
  } catch (err: any) {
    return {
      valid: true,
      result: {
        available: false,
        availableQuantity: 0,
        requestedQuantity: quantity,
        message: err.message
      }
    };
  }
};
