export const calculateShippingCost = (parameters: any): { valid: boolean; result?: any; errors?: any[] } => {
  const errors = [];

  const weight = parameters?.weight ?? 1;
  const distance = parameters?.distance ?? 10;
  const priority = parameters?.priority ? parameters.priority.toUpperCase() : "MEDIUM";

  if (typeof weight !== "number" || weight < 0) {
    errors.push({ field: "weight", message: "weight must be a number >= 0" });
  }

  if (typeof distance !== "number" || distance < 0) {
    errors.push({ field: "distance", message: "distance must be a number >= 0" });
  }

  const validPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  if (!validPriorities.includes(priority)) {
    errors.push({ field: "priority", message: `priority must be one of: ${validPriorities.join(", ")}` });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const multipliers: { [key: string]: number } = {
    LOW: 1.0,
    MEDIUM: 1.2,
    HIGH: 1.5,
    CRITICAL: 2.0
  };

  const baseCost = weight * 0.5 + distance * 0.1;
  const shippingCost = Number((baseCost * (multipliers[priority] || 1.2)).toFixed(2));

  return {
    valid: true,
    result: {
      shippingCost,
      weight,
      distance,
      priority
    }
  };
};
