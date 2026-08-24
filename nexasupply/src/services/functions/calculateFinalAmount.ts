export const calculateFinalAmount = (parameters: any): { valid: boolean; result?: any; errors?: any[] } => {
  const errors = [];

  const totalAmount = parameters?.totalAmount;
  const discountAmount = parameters?.discountAmount ?? 0;
  const taxAmount = parameters?.taxAmount ?? 0;

  if (totalAmount === undefined || typeof totalAmount !== "number" || totalAmount < 0) {
    errors.push({ field: "totalAmount", message: "totalAmount is required and must be a number >= 0" });
  }

  if (typeof discountAmount !== "number" || discountAmount < 0) {
    errors.push({ field: "discountAmount", message: "discountAmount must be a number >= 0" });
  }

  if (typeof taxAmount !== "number" || taxAmount < 0) {
    errors.push({ field: "taxAmount", message: "taxAmount must be a number >= 0" });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const finalAmount = Math.max(0, totalAmount - discountAmount + taxAmount);

  return {
    valid: true,
    result: {
      finalAmount
    }
  };
};
