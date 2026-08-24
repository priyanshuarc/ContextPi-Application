import { ObjectId } from "mongodb";

export interface Supplier {
  _id?: ObjectId;
  supplierCode: string;
  supplierName: string;
  contactName?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  rating?: number;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface Warehouse {
  _id?: ObjectId;
  warehouseCode: string;
  warehouseName: string;
  managerName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  capacity: number;
  currentUtilization: number;
  status: "ACTIVE" | "INACTIVE" | "FULL";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Customer {
  _id?: ObjectId;
  customerCode: string;
  customerName: string;
  email: string;
  phone?: string;
  customerType: "REGULAR" | "PREMIUM" | "WHOLESALE";
  creditLimit: number;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  address?: string;
  city?: string;
  country?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface Item {
  _id?: ObjectId;
  itemCode: string;
  itemName: string;
  description?: string;
  category: "electronics" | "industrial" | "office" | "safety" | "packaging";
  subCategory?: string;
  brand?: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  supplierId?: ObjectId;
  warehouseId?: ObjectId;
  sku?: string;
  barcode?: string;
  unit?: string;
  status: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
  tags?: string[];
  supplierWebsite?: string;
  supportPhone?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface Inventory {
  _id?: ObjectId;
  itemId: ObjectId;
  warehouseId: ObjectId;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel: number;
  batchNumber?: string;
  lotNumber?: string;
  expiryDate?: Date;
  status: "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK" | "BLOCKED";
  updatedAt?: Date;
}

export interface Order {
  _id?: ObjectId;
  orderId: string;
  customerId?: ObjectId;
  itemId: ObjectId;
  warehouseId?: ObjectId;
  quantity: number;
  unitPrice?: number;
  totalAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  finalAmount?: number;
  customerEmail: string;
  orderDate: Date;
  requiredDeliveryDate?: Date;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  shippingAddress?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface Shipment {
  _id?: ObjectId;
  shipmentId: string;
  orderId: ObjectId;
  warehouseId: ObjectId;
  carrier?: string;
  trackingNumber?: string;
  shipmentDate?: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  status: "CREATED" | "PICKED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "RETURNED" | "CANCELLED";
  shippingCost?: number;
  destination?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FormSchemaField {
  name: string;
  fieldName?: string;
  dataType: string;
  mandatory?: boolean;
  required?: boolean;
  inputType?: string;
  defaultValue?: any;
  unique?: boolean;
  constraints?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    exactLength?: number;
    pattern?: string;
  };
  enumValues?: string[];
  mappedTableRef?: string;
  referencedSchema?: string;
  referencedField?: string;
  relationshipType?: string;
}

export interface FormSchemaRelationship {
  sourceField: string;
  referencedSchema: string;
  referencedField: string;
  relationshipType: string;
}

export interface FormSchema {
  _id?: ObjectId;
  schemaName: string;
  active: boolean;
  fields: FormSchemaField[];
  relationships?: FormSchemaRelationship[];
  sampleData?: any[];
}

export interface FunctionParameter {
  name: string;
  type: string;
  required?: boolean;
  enumValues?: string[];
  description?: string;
}

export interface FunctionResponseField {
  name: string;
  type: string;
  description?: string;
}

export interface FunctionRegistry {
  _id?: ObjectId;
  name: string;
  active: boolean;
  description: string;
  parameters: FunctionParameter[];
  responseFields: FunctionResponseField[];
}
