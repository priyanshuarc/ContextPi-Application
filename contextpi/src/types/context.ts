/**
 * Dynamic Context Models (MongoDB Ingestion)
 * Supports dynamic form schemas, safe extensible field metadata,
 * structured custom functions, and project metadata.
 */

import { JsonObject, JsonValue } from './json.js';

/**
 * Dynamic Field Metadata extracted from MongoDB.
 * `dataType` and `inputType` are normalized strings to safely handle unknown types.
 */
export interface FieldMetadata {
  name: string;
  dataType: string;
  mandatoryField: boolean;
  inputType: string;
  mappedTableRef?: string;
  multipleSelect?: boolean;
  defaultValue?: JsonValue;
  enum?: JsonValue[];
}

export interface SchemaContext {
  schemaName: string;
  active: boolean;
  fields: FieldMetadata[];
  sampleRecord?: JsonObject;
}

/**
 * Structured Function Parameter
 */
export interface FunctionParameter {
  name: string;
  type: string;
  isActive: boolean;
  required: boolean;
}

/**
 * Structured Function Response Field
 */
export interface FunctionResponseField {
  name: string;
  type: string;
  required: boolean;
}

/**
 * Structured Custom Function Definition from Function Registry
 */
export interface FunctionContext {
  name: string;
  isActive: boolean;
  parameters: FunctionParameter[];
  expectedResponseFields: FunctionResponseField[];
}

/**
 * Complete Project Context extracted from MongoDB
 */
export interface ProjectContext {
  projectName: string;
  schemas: SchemaContext[];
  functions: FunctionContext[];
  requirement?: string;
  sampleData?: Record<string, JsonObject[]>;
  useMock?: boolean;
  isAdapterMode?: boolean;
}
