# Contextπ — Requirements Traceability Matrix (Updated & Refined)
**Project:** Contextπ  
**Problem Statement:** PS10 — Business-Context API Test Generation  
**Team:** T31 — SixthSense  

---

## 1. Traceability Matrix Overview

This matrix maps each requirement to its target module, deterministic rule logic, generated test category, and verification strategy, including all 10 architectural refinements.

---

## 2. Updated Traceability Matrix Table

| Req ID / Refinement | Requirement Description | Target Module | Rule / Processing Logic | Generated Spec Category / Output | Verification Strategy |
|---|---|---|---|---|---|
| **REQ-STRICT-TS** | Strict TypeScript (No broad `any`, JsonValue/JsonObject) | `src/types/*.ts` | Mandatory `JsonValue` / `JsonObject` types across all interfaces | Clean strict compilation (`tsc --strict`) | `tsc --noEmit` build check |
| **REQ-FN-STRUCT** | Structured function params & response fields | `src/types/context.ts`, `rules/functionRules.ts` | Structured `FunctionParameter` & `FunctionResponseField` evaluation | `CUSTOM_FUNCTION` (Schema-driven response assertions) | Unit test + spec assertion check |
| **REQ-DYN-TYPES** | Extensible dynamic string types & safe fallback | `src/context/contextNormalizer.ts`, `rules/fieldRules.ts` | Extensible normalized strings; safe fallback without hallucinated tests | `FIELD_VALIDATION` (Safe type handling) | Field rules unit test |
| **REQ-ROUTE-STRAT**| Configurable `TargetApiContract` (`/forms/*`, `/function/*`) | `src/contract/TargetApiContract.ts` | Route resolution for `formGet`, `formCreate`, `formUpdate`, `formDelete`, `formBulkupload`, `query`, `function/:name`, `createfunction`, `getAllfunction` | Route-decoupled Playwright specs | TargetApiContract unit test |
| **REQ-CAT-WORKFLOW**| 5-step Catalogue Preview & Approval Workflow | `src/catalogue/approval/` | Ingest $\rightarrow$ Build $\rightarrow$ Preview $\rightarrow$ Select/Deselect $\rightarrow$ Approve Gate | Spec generator only processes `APPROVED` & `selected: true` entries | Catalogue state engine test |
| **REQ-BIZ-ABSTRACT**| `IBusinessRuleAnalyzer` Provider Abstraction | `src/rules/analyzers/` | Structured `BusinessRuleConstraint[]` (Phase 1: Deterministic, Future: LLM structured rules only; NO raw spec code from LLM) | `BUSINESS_RULE` test entries | Analyzer unit test |
| **REQ-REAL-INTEG** | Real NexaSupply MongoDB / API integration | `src/context/contextLoader.ts` | Dynamic Mongo client connection + NexaSupply target server integration | Live E2E test execution against NexaSupply server | Integration pipeline test |
| **REQ-REAL-RESULTS**| Genuine results mandate (No fake/hardcoded UI metrics) | `src/runner/reportService.ts` | Aggregate metrics strictly from Playwright `APIRequestContext` output streams | `summary.json` & `report.html` with real counts | Report service test |
| **REQ-1.1** | Accept `projectName` parameter | `src/context/contextLoader.ts` | Filter MongoDB queries by `projectName` | `ProjectContext.projectName` | Unit test |
| **REQ-1.2** | Accept optional `businessRequirement` | `src/rules/analyzers/` | Ingest plain text into `IBusinessRuleAnalyzer` | `BusinessRuleConstraint[]` | Unit test |
| **REQ-1.3** | Accept target API base URL | `src/contract/TargetApiContract.ts` | Configure baseURL in `TargetApiContract` | `playwright.config.ts` baseURL | Contract unit test |
| **REQ-2.1** | Load active form schemas | `src/context/contextLoader.ts` | Query `schemas` collection (`active: true`) | `SchemaContext[]` | Context loader unit test |
| **REQ-2.2** | Load field metadata | `src/context/contextNormalizer.ts` | Extract fields, types, mandatory, refs, enums | `FieldMetadata[]` | Normalizer unit test |
| **REQ-2.3** | Load sample records | `src/context/contextNormalizer.ts` | Extract sample record map (`JsonObject`) | `SchemaContext.sampleRecord` | Data builder test |
| **REQ-2.4** | Load custom-function definitions | `src/context/contextLoader.ts` | Query `functions` collection (`isActive: true`) | `FunctionContext[]` | Context loader unit test |
| **REQ-4.1** | `mandatoryField = true` | `src/rules/fieldRules.ts` | Omit mandatory field from valid payload | `FIELD_VALIDATION` (Missing Mandatory) $\rightarrow 400$ | Spec assertion check |
| **REQ-4.2** | `dataType = Number` | `src/rules/fieldRules.ts` | Send string for numeric field | `FIELD_VALIDATION` (Wrong Type) $\rightarrow 400$ | Spec assertion check |
| **REQ-4.3** | `inputType = url` | `src/rules/fieldRules.ts` | Send malformed URL string | `FIELD_VALIDATION` (Malformed URL) $\rightarrow 400$ | Spec assertion check |
| **REQ-4.4** | `inputType = phone` | `src/rules/fieldRules.ts` | Send valid phone (+) vs malformed phone (-) | `FIELD_VALIDATION` (Valid / Invalid Phone) | Spec assertion check |
| **REQ-4.5** | `mappedTableRef` relationship | `src/rules/relationshipRules.ts` | Valid foreign key vs non-existent foreign ID | `RELATIONSHIP` (FK Join Test) $\rightarrow 200 / 400$ | Spec assertion check |
| **REQ-4.6** | `multipleSelect = true` | `src/rules/fieldRules.ts` | Array payload (+) vs scalar payload (-) | `FIELD_VALIDATION` (Multi-Select) $\rightarrow 200 / 400$ | Spec assertion check |
| **REQ-4.7** | `defaultValue` verification | `src/rules/fieldRules.ts` | Omit field, assert response matches default | `FIELD_VALIDATION` (Default Value Assert) | Spec assertion check |
| **REQ-4.8** | `enum` constraint testing | `src/rules/fieldRules.ts` | Allowed enum (+) vs unlisted enum (-) | `FIELD_VALIDATION` (Invalid Enum) $\rightarrow 200 / 400$ | Spec assertion check |
| **REQ-5.1-5.7**| Schema Form CRUD Operations | `src/rules/crudRules.ts` | Map to `/forms/formCreate`, `/forms/formGet`, `/forms/formUpdate`, `/forms/formDelete` | `CRUD` operations via `TargetApiContract` | Playwright test execution |
| **REQ-6.1-6.6**| Custom Function & Registry Lifecycle | `src/rules/functionRules.ts` | Map to `/function/:name`, `/function/createfunction`, `/function/getAllfunction` | `CUSTOM_FUNCTION` & `REGISTRY` tests | Playwright test execution |
