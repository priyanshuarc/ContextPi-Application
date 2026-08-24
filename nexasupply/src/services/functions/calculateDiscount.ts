export const calculateDiscount = (parameters: any): { valid: boolean; result?: any; errors?: any[] } => {
  const errors = [];

  const price = parameters?.price !== undefined ? parameters.price : parameters?.amount;

  if (price === undefined) {
    errors.push({ field: "price", message: "price or amount is required" });
  } else if (typeof price !== "number") {
    errors.push({ field: "price", message: "price or amount must be a number" });
  } else if (price < 0) {
    errors.push({ field: "price", message: "price or amount must be >= 0" });
  }

  const validTypes = ["regular", "premium", "wholesale", "vip", "REGULAR", "PREMIUM", "WHOLESALE", "VIP"];
  if (!parameters?.customerType) {
    errors.push({ field: "customerType", message: "customerType is required" });
  } else if (!validTypes.includes(parameters.customerType)) {
    errors.push({ field: "customerType", message: `customerType must be one of: REGULAR, PREMIUM, WHOLESALE, VIP` });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const type = parameters.customerType.toUpperCase();
  let discountPercent = 0;
  if (type === "PREMIUM") discountPercent = 0.10;
  else if (type === "WHOLESALE" || type === "VIP") discountPercent = 0.15;
  else if (type === "REGULAR") discountPercent = 0.0;

  const discount = price * discountPercent;
  const discountedPrice = price - discount;

  return {
    valid: true,
    result: {
      discountedPrice,
      discount
    }
  };
};
