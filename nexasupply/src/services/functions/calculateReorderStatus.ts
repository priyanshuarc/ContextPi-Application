export const calculateReorderStatus = (parameters: any): { valid: boolean; result?: any; errors?: any[] } => {
  const errors = [];

  const stockQuantity = parameters?.stockQuantity;
  const reorderLevel = parameters?.reorderLevel;

  if (stockQuantity === undefined || typeof stockQuantity !== "number" || stockQuantity < 0) {
    errors.push({ field: "stockQuantity", message: "stockQuantity is required and must be a number >= 0" });
  }

  if (reorderLevel === undefined || typeof reorderLevel !== "number" || reorderLevel < 0) {
    errors.push({ field: "reorderLevel", message: "reorderLevel is required and must be a number >= 0" });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const needsReorder = stockQuantity <= reorderLevel;
  const reorderQuantity = needsReorder ? (reorderLevel * 2) - stockQuantity : 0;

  let stockStatus = "HEALTHY";
  if (stockQuantity === 0) stockStatus = "OUT_OF_STOCK";
  else if (needsReorder) stockStatus = "LOW_STOCK";

  return {
    valid: true,
    result: {
      needsReorder,
      reorderQuantity,
      stockStatus
    }
  };
};
