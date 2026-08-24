/**
 * Deterministic Test Explanation Generator
 * Generates 14-point structured explanation metadata instantly for any test catalog entry or execution result
 * without invoking external LLMs.
 */

import type { CatalogEntry, ProjectContext, FieldMetadata } from '../types/api';

export interface TestExplanationData {
  testId: string;
  whatTestDoes: string;
  whyTestExists: string;
  category: string;
  priority: string;
  targetEntity: string;
  source: string;
  sourceRef: string;
  businessRule: string;
  dependencies: string[];
  httpMethod: string;
  route: string;
  headers: Record<string, string>;
  payload: Record<string, any>;
  expectedStatus: number;
  expectedAssertions: string[];
  relatedFields: Array<{
    name: string;
    dataType: string;
    mandatoryField: boolean;
    rules: string;
  }>;
  traceabilityMatrix: string;
}

export function generateTestExplanation(
  entry: CatalogEntry,
  context?: ProjectContext | null
): TestExplanationData {
  const targetEntity = entry.targetEntity || 'Entity';
  const category = entry.category || 'CRUD';
  const priority = entry.priority || 'HIGH';
  const httpMethod = entry.httpMethod || 'POST';
  const expectedStatus = entry.expectedResult?.statusCode || (httpMethod === 'POST' ? 201 : 200);

  // 1. Derive "What This Test Does"
  let whatTestDoes = `Executes Playwright HTTP ${httpMethod} request against endpoint target '${targetEntity}'. `;
  if (category === 'CRUD') {
    whatTestDoes += `Validates core creation, retrieval, or lifecycle operation for entity '${targetEntity}' and asserts HTTP ${expectedStatus} response.`;
  } else if (category === 'FIELD_VALIDATION') {
    whatTestDoes += `Validates field constraints, mandatory requirements, data types, and enums for entity '${targetEntity}' expecting status ${expectedStatus}.`;
  } else if (category === 'RELATIONSHIP') {
    whatTestDoes += `Verifies foreign key references, dependency lifecycles, and relational constraints between '${targetEntity}' and parent entities.`;
  } else if (category === 'CUSTOM_FUNCTION') {
    whatTestDoes += `Executes custom function API endpoint '${targetEntity}' and asserts structured response payload parameters.`;
  } else if (category === 'BUSINESS_RULE') {
    whatTestDoes += `Tests specific business logic boundary conditions and target application rules for '${targetEntity}'.`;
  } else if (category === 'REGISTRY') {
    whatTestDoes += `Queries function registry metadata to verify active status and registered endpoint contracts.`;
  } else {
    whatTestDoes += entry.description || `Validates ${category} behavior on ${targetEntity}.`;
  }

  // 2. Derive "Why This Test Exists"
  let whyTestExists = `Discovered dynamically from target MongoDB metadata. `;
  if (entry.source === 'MONGO_SCHEMA') {
    whyTestExists += `Extracted from active schema context '${entry.sourceRef}' to ensure API payload structural integrity and contract adherence.`;
  } else if (entry.source === 'RULE_ENGINE') {
    whyTestExists += `Synthesized by Contextπ Rule Engine (${entry.sourceRef}) to enforce strict business policies and validation logic.`;
  } else if (entry.source === 'FUNCTION_REGISTRY') {
    whyTestExists += `Extracted from dynamic MongoDB Function Registry (${entry.sourceRef}) to guarantee callable service availability.`;
  } else {
    whyTestExists += `Generated based on contract specification reference '${entry.sourceRef}'.`;
  }

  // 3. Derive Business Rule Description
  const businessRule = entry.reasoning || `${category} specification rule for ${targetEntity}`;

  // 4. Derive Route Expression
  let route = `/api/forms/${targetEntity.toLowerCase()}`;
  if (category === 'CUSTOM_FUNCTION') {
    route = `/api/functions/${targetEntity}`;
  } else if (category === 'REGISTRY') {
    route = `/api/functions/registry`;
  }

  // 5. Derive Expected Assertions
  const expectedAssertions: string[] = [
    `HTTP Status Code === ${expectedStatus}`
  ];

  if (expectedStatus >= 200 && expectedStatus < 300) {
    expectedAssertions.push('Response body is a valid non-null JSON object');
    if (httpMethod === 'POST' || entry.targetRouteKey === 'formCreate') {
      expectedAssertions.push('Response contains created record ID (`_id`, `id`, or `data.id`)');
    }
  } else {
    expectedAssertions.push('Response body contains valid error diagnostic message');
  }

  if (entry.expectedResult?.errorMessagePattern) {
    expectedAssertions.push(`Response error message contains string matching '${entry.expectedResult.errorMessagePattern}'`);
  }

  // 6. Resolve Related Fields & Schema Metadata
  const relatedFields: Array<{ name: string; dataType: string; mandatoryField: boolean; rules: string }> = [];
  const schema = context?.schemas?.find(s => s.schemaName.toLowerCase() === targetEntity.toLowerCase());

  if (schema && schema.fields) {
    schema.fields.forEach((f: FieldMetadata) => {
      let ruleStr = f.inputType || 'text';
      if (f.mandatoryField || f.required) ruleStr += ', required';
      if (f.unique) ruleStr += ', unique';
      if (f.enum && f.enum.length > 0) ruleStr += `, enum: [${f.enum.join(', ')}]`;
      if (f.foreignKey) ruleStr += `, ref: ${f.foreignKey.targetEntity}`;

      relatedFields.push({
        name: f.name,
        dataType: f.dataType || 'String',
        mandatoryField: !!(f.mandatoryField || f.required),
        rules: ruleStr
      });
    });
  } else if (entry.payloadTemplate) {
    Object.keys(entry.payloadTemplate).forEach(key => {
      const val = entry.payloadTemplate[key];
      relatedFields.push({
        name: key,
        dataType: typeof val === 'number' ? 'Number' : typeof val === 'boolean' ? 'Boolean' : 'String',
        mandatoryField: true,
        rules: 'Payload Field'
      });
    });
  }

  const traceabilityMatrix = `[Test: ${entry.testId}] ➔ [Category: ${category}] ➔ [Entity: ${targetEntity}] ➔ [Source: ${entry.source} / ${entry.sourceRef}]`;

  return {
    testId: entry.testId,
    whatTestDoes,
    whyTestExists,
    category,
    priority,
    targetEntity,
    source: entry.source || 'MONGO_SCHEMA',
    sourceRef: entry.sourceRef || 'schema',
    businessRule,
    dependencies: entry.dependencies || [],
    httpMethod,
    route,
    headers: {
      'Content-Type': 'application/json',
      'x-project-name': context?.projectName || 'ContextPi'
    },
    payload: entry.payloadTemplate || {},
    expectedStatus,
    expectedAssertions,
    relatedFields,
    traceabilityMatrix
  };
}
