/**
 * Contextπ AI Failure Repair Prompt Builder
 * Assembles structured failure context for Qwen3 Coder LLM diagnosis.
 * Completely application-agnostic: relies only on passed metadata objects.
 */

import { FailureContext } from '../types/repair.js';

export function buildRepairPrompt(context: FailureContext): string {
  const schemaFields = context.schema?.fields?.map(f => ({
    name: f.name,
    dataType: f.dataType,
    mandatory: f.mandatoryField,
    enumValues: f.enum || [],
    mappedTableRef: f.mappedTableRef
  })) || [];

  const relationships = context.schema?.fields
    ?.filter(f => f.mappedTableRef)
    .map(f => ({
      field: f.name,
      referencedSchema: f.mappedTableRef
    })) || [];

  const catalogEntrySummary = {
    testId: context.catalogEntry.testId,
    category: context.catalogEntry.category,
    targetEntity: context.catalogEntry.targetEntity,
    httpMethod: context.catalogEntry.httpMethod,
    targetRouteKey: context.catalogEntry.targetRouteKey,
    expectedResult: context.catalogEntry.expectedResult,
    dependencies: context.catalogEntry.dependencies
  };

  return `You are Contextπ's AI Test Repair Diagnostic Engine powered by Qwen3 Coder.
Your task is to analyze an authentic Playwright API execution failure and propose a MINIMAL, SAFE structural repair.

==================================================
TARGET CONTEXT & METADATA
==================================================
- Project Name: ${context.projectContext.projectName}
- Target Entity: ${context.targetEntity}
- Schema Fields: ${JSON.stringify(schemaFields, null, 2)}
- Schema Relationships: ${JSON.stringify(relationships, null, 2)}

==================================================
CATALOGUE ENTRY METADATA
==================================================
${JSON.stringify(catalogEntrySummary, null, 2)}

==================================================
PLAYWRIGHT EXECUTION FAILURE DETAILS
==================================================
- Test ID: ${context.testId}
- HTTP Method: ${context.httpMethod}
- Request URL: ${context.url}
- Expected HTTP Status: ${context.expectedStatus}
- Actual HTTP Status: ${context.actualStatus !== undefined ? context.actualStatus : 'N/A (Network / Runtime Error)'}

Request Payload:
${JSON.stringify(context.requestPayload || {}, null, 2)}

Request Headers:
${JSON.stringify(context.requestHeaders || {}, null, 2)}

Actual Response Body:
${typeof context.actualResponseBody === 'object' ? JSON.stringify(context.actualResponseBody, null, 2) : String(context.actualResponseBody || 'None')}

Execution Error / Stack Trace:
${context.executionError}

==================================================
SAFE REPAIR RULES & BOUNDARIES
==================================================
1. Allowed Repair Types:
   - ROUTE: Path or endpoint modification according to TargetApiContract
   - METHOD: Correcting HTTP verb (GET, POST, PUT, DELETE, PATCH)
   - PAYLOAD: Fixing payload field names, data types, required fields, or enum values
   - HEADERS: Adding missing required content-type or custom headers
   - RELATIONSHIP_DATA: Correcting foreign key / referenced entity record IDs
   - DEPENDENCY_LIFECYCLE: Fixing dependency variable binding or order
   - NO_SAFE_REPAIR: Use when failure is a genuine target bug or cannot be safely fixed

2. STRICT FORBIDDEN ACTIONS:
   - DO NOT change expectedStatus merely to make a failing test pass
   - DO NOT delete tests or remove assertions
   - DO NOT return arbitrary executable code
   - DO NOT modify business logic or catalogue rules

==================================================
RESPONSE FORMAT REQUIREMENT
==================================================
You MUST respond with a single, valid JSON object strictly matching this TypeScript schema:

{
  "diagnosis": "Detailed explanation of why the test failed",
  "confidence": 0.95,
  "repairType": "PAYLOAD",
  "reason": "Specific rationale for the proposed repair",
  "proposedChange": {
    "route": "/forms/formCreate/items",
    "httpMethod": "POST",
    "payload": { ... },
    "headers": { ... },
    "relationshipId": "...",
    "dependencyValue": "..."
  }
}

Do NOT wrap the JSON in markdown code fences if possible, or use standard JSON block. Output ONLY valid JSON.`;
}
