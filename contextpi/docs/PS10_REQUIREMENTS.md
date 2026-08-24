# Contextπ — PS10 Requirement Specification (Updated & Refined)
**Project:** Contextπ  
**Problem Statement:** PS10 — Business-Context API Test Generation  
**Team:** T31 — SixthSense  

---

## 1. Executive Summary & Purpose

Contextπ is an automated, business-context-driven API test generation and execution system designed for modern Node.js/MongoDB applications. 

Contextπ dynamically extracts rich application metadata—including active form schemas, field metadata, data relationships, sample records, custom business rules, and function registries—directly from MongoDB. Using a deterministic rule engine, Contextπ builds a previewable **Test Catalogue**, supports user selection/approval, synthesizes runnable **Playwright TypeScript API test suites** (`.spec.ts`), executes those tests programmatically against the target application server via a configurable **Target API Routing Contract**, and delivers comprehensive HTML and JSON test reports with real execution metrics.

> **Key Principle:** NexaSupply is built independently by team members Abhay and Prince. Contextπ is application-agnostic: it discovers application domain logic dynamically from MongoDB and uses a configurable `TargetApiContract` (supporting `/forms/*`, `/function/*`, etc.) to interact with the target API server without hardcoded endpoints.

---

## 2. Core Functional & Data Model Requirements

### REQ-1: Core Input & Strict Type Safety
- **1.1** Must accept `projectName` (string) as a mandatory parameter to load the corresponding project context.
- **1.2** Must accept an optional `businessRequirement` (plain text string or structured object).
- **1.3** Must accept a target API base URL and connection parameters via a configurable `TargetApiContract`.
- **1.4** **Strict TypeScript Requirement:** Broad `any` types are strictly prohibited in core domain models. JSON payloads, default values, and dynamic structures must use strict types (`JsonPrimitive`, `JsonValue`, `JsonObject`).

### REQ-2: Dynamic Context Extraction & Safe Extensible Field Metadata
- **2.1 Mongo Schema Extractor:** Fetch active form schemas from MongoDB.
- **2.2 Safe Extensible Field Metadata:** Field `dataType` and `inputType` are treated as normalized string values rather than closed hardcoded unions. Supported types trigger specific rules; unknown or custom metadata is safely preserved without hallucinating or inventing invalid test cases.
- **2.3 Sample Record Extractor:** Fetch sample records as safe `JsonObject` maps when available.
- **2.4 Structured Custom Function Extractor:** Extract active custom function definitions with structured parameter and response models (see REQ-3).

### REQ-3: Core Domain Models (Strict TypeScript)

```typescript
// Strict JSON Types
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface JsonObject { [key: string]: JsonValue; }
export type JsonArray = JsonValue[];

// Project Context
export interface ProjectContext {
  projectName: string;
  schemas: SchemaContext[];
  functions: FunctionContext[];
  requirement?: string;
  sampleData?: Record<string, JsonObject[]>;
}

// Schema Context
export interface SchemaContext {
  schemaName: string;
  active: boolean;
  fields: FieldMetadata[];
  sampleRecord?: JsonObject;
}

// Dynamic Field Metadata
export interface FieldMetadata {
  name: string;
  dataType: string;          // Normalized string (e.g. 'String', 'Number', 'Boolean', 'Array', 'Object', 'Date', 'ObjectId', etc.)
  mandatoryField: boolean;
  inputType: string;         // Normalized string (e.g. 'text', 'number', 'email', 'url', 'phone', 'select', 'multiselect', 'date', etc.)
  mappedTableRef?: string;   // Optional foreign key / table reference
  multipleSelect?: boolean;
  defaultValue?: JsonValue;
  enum?: JsonValue[];
}

// Structured Function Parameter
export interface FunctionParameter {
  name: string;
  type: string;
  isActive: boolean;
  required: boolean;
}

// Structured Function Response Field
export interface FunctionResponseField {
  name: string;
  type: string;
  required: boolean;
}

// Structured Function Context
export interface FunctionContext {
  name: string;
  isActive: boolean;
  parameters: FunctionParameter[];
  expectedResponseFields: FunctionResponseField[];
}
```

---

## 3. Configurable Target API Routing Contract

### REQ-4: Target API Contract (`TargetApiContract`)
Contextπ must not assume generic REST endpoints (e.g., `GET /products`, `PUT /products`). Target API routing is governed by a configurable `TargetApiContract` strategy supporting PS10 specific API conventions:

- **Form Operations (`/forms/*`):**
  - `formGet`: Fetch schema/data (`POST /forms/formGet` or `GET /forms/formGet`)
  - `formCreate`: Create entity record (`POST /forms/formCreate`)
  - `formUpdate`: Update entity record (`POST /forms/formUpdate`)
  - `formDelete`: Delete entity record (`POST /forms/formDelete`)
  - `formBulkupload`: Bulk upload records (`POST /forms/formBulkupload`)
  - `query`: Execute queries (`POST /forms/query` or `/query`)
- **Function Operations (`/function/*`):**
  - `executeFunction`: Execute custom function (`POST /function/:name` or `/functions/execute/:name`)
  - `createFunction`: Register custom function (`POST /function/createfunction`)
  - `getAllFunction`: List custom functions (`GET /function/getAllfunction`)

The generator must load routing definitions from `TargetApiContract` rather than hardcoding endpoint URLs into Playwright test templates.

---

## 4. Deterministic Decision Rules & Business Rule Provider Architecture

### REQ-5: Field-Level & CRUD Decision Rules
- **5.1 Mandatory Field (`mandatoryField = true`):** Missing-field negative test payload $\rightarrow$ expect 400.
- **5.2 Data Type (`dataType = 'Number'` or normalized numeric):** Wrong-type test payload $\rightarrow$ expect 400.
- **5.3 Input Type (`inputType = 'url'`):** Malformed URL string $\rightarrow$ expect 400.
- **5.4 Input Type (`inputType = 'phone'`):** Valid phone format (+) vs malformed phone (-).
- **5.5 Relationship (`mappedTableRef`):** Foreign key join validation test (valid ID vs invalid ID).
- **5.6 Multi-Select (`multipleSelect = true`):** Array payload (+) vs scalar payload (-).
- **5.7 Default Value (`defaultValue` present):** Omit field, assert response matches `defaultValue`.
- **5.8 Enum (`enum` array present):** Allowed enum value (+) vs unlisted enum value (-).
- **5.9 Unknown Types:** Safely fallback without inventing false assertions.

### REQ-6: Structured Custom Function Rules
For each active custom function:
- **6.1 Happy Path:** Construct valid payload from active parameters $\rightarrow$ expect 200/201.
- **6.2 Response Field Assertions:** Assert each structured response field (`FunctionResponseField`) is present and matches specified `type`.
- **6.3 Missing Parameter Test:** Omit mandatory parameter (`required: true`) $\rightarrow$ expect 400.
- **6.4 Unknown Function Test:** Call non-existent function $\rightarrow$ expect 404/400.
- **6.5 Project Mismatch Test:** Call function with invalid project header/payload $\rightarrow$ expect 403/404.
- **6.6 Function Registry Lifecycle:** Test `createFunction` $\rightarrow$ duplicate rejection $\rightarrow$ `getAllFunction` $\rightarrow$ `executeFunction`.

### REQ-7: Business Rule Provider Abstraction (`IBusinessRuleAnalyzer`)
To support Phase 1 deterministic rule parsing while allowing future AI extensions:
- **Architecture Abstraction:** Define `IBusinessRuleAnalyzer` interface.
- **Phase 1 Implementation:** `DeterministicBusinessRuleAnalyzer` parses plain text requirements using deterministic patterns (digits, non-empty, range limits, email/URL, non-negative numbers).
- **Future Phase:** `LLMBusinessRuleAnalyzer` plugs into LLM APIs to output structured rule objects (`BusinessRuleConstraint[]`).
- **CRITICAL CONSTRAINT:** An LLM must NEVER directly synthesize executable Playwright source code. The spec generator exclusively synthesizes test code from approved catalogue entries.

---

## 5. Catalogue Lifecycle & Approval Workflow

### REQ-8: 5-Step Catalogue Approval Workflow
Code generation must strictly follow an explicit 5-step lifecycle:

```
[1. Context Load] ──► [2. Catalogue Build] ──► [3. Catalogue Preview]
                                                         │
[6. Spec Generation] ◄── [5. Catalogue Approval] ◄── [4. Select/Deselect]
```

1. **Context Load:** Ingest MongoDB context & requirements.
2. **Catalogue Build:** Construct raw `TestCatalog` with 10-point traceability metadata.
3. **Catalogue Preview:** Expose catalogue via API & Dashboard UI for visual inspection.
4. **Select / Deselect:** Allow users to toggle individual test cases (`selected: boolean`).
5. **Catalogue Approval:** User submits approval gate (`status: 'APPROVED'`).
6. **Spec Generation:** Synthesize `.spec.ts` files **ONLY** for approved & selected catalogue entries. Unapproved or deselected items are excluded from generated spec files.

---

## 6. Playwright Spec Generation, Execution & Genuine Results

### REQ-9: Playwright Spec Generation
- Synthesize valid TypeScript Playwright API test files (`.spec.ts`) using `APIRequestContext` (`request.newContext()`).
- Map target endpoints strictly through `TargetApiContract`.
- Embed 10-point traceability comments in test headers.
- Compile cleanly under TypeScript strict mode (`tsc --noEmit`).

### REQ-10: Test Execution Engine & Genuine Results Mandate
- Execute Playwright test runner programmatically against the target Node.js API (e.g. NexaSupply API).
- **GENUINE RESULTS MANDATE:** Hardcoded, fake, or pre-canned execution counts/pass-fail metrics in the UI or report generator are STRICTLY PROHIBITED. All counts, timings, status codes, and error traces must originate strictly from actual Playwright test execution results.

### REQ-11: Reporting Engine
- Render `reports/report.html` and write `reports/summary.json` containing authentic execution metrics, pass rates, and traceability links.

---

## 7. Real Integration Target (NexaSupply Integration)

### REQ-12: NexaSupply Demo Integration Architecture
- Mock/synthetic MongoDB contexts are used strictly for local unit tests and developer scaffolding.
- The integration layer must be configured to connect directly to the real NexaSupply MongoDB database and real NexaSupply Node.js API server (developed by Abhay and Prince) for final validation and live demonstration.
