export const calculateOrderTotal = (parameters: any): { valid: boolean; result?: any; errors?: any[] } => {
  const errors = [];

  if (parameters?.quantity === undefined || typeof parameters.quantity !== "number" || parameters.quantity <= 0) {
    errors.push({ field: "quantity", message: "quantity is required and must be a number > 0" });
  }

  if (parameters?.unitPrice === undefined || typeof parameters.unitPrice !== "number" || parameters.unitPrice < 0) {
    errors.push({ field: "unitPrice", message: "unitPrice is required and must be a number >= 0" });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const totalAmount = parameters.quantity * parameters.unitPrice;

  return {
    valid: true,
    result: {
      totalAmount
    }
  };
};
