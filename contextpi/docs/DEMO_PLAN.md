# Contextπ — End-to-End Demonstration Plan (Updated & Refined)
**Project:** Contextπ  
**Problem Statement:** PS10 — Business-Context API Test Generation  
**Team:** T31 — SixthSense  

---

## 1. Executive Overview & Purpose

The purpose of this demonstration is to prove that Contextπ dynamically ingests MongoDB application context from the **actual NexaSupply application** (developed by Abhay and Prince), applies deterministic decision rules via `IBusinessRuleAnalyzer`, builds a previewable **Test Catalogue**, enforces a user **Selection & Approval Gate**, synthesizes executable Playwright TypeScript API test suites (`.spec.ts`) routed through `TargetApiContract` (`/forms/*`, `/function/*`), executes those tests programmatically against the target NexaSupply Node.js API, and renders HTML/JSON reports displaying genuine execution metrics.

> **Note on Test Data Environment:** Mock/synthetic contexts (`mockMongoContext.ts`) are reserved strictly for unit testing during development. The final demo connects directly to the live NexaSupply MongoDB database and target Node.js API server.

---

## 2. Environment Setup & Target API Contract

### 2.1 NexaSupply Target API Contract Configuration
Contextπ targets NexaSupply endpoints via `TargetApiContract`:
- **Form Operations:**
  - `formGet`: `POST /forms/formGet`
  - `formCreate`: `POST /forms/formCreate`
  - `formUpdate`: `POST /forms/formUpdate`
  - `formDelete`: `POST /forms/formDelete`
  - `formBulkupload`: `POST /forms/formBulkupload`
  - `query`: `POST /forms/query`
- **Function Operations:**
  - `executeFunction`: `POST /function/:name`
  - `createFunction`: `POST /function/createfunction`
  - `getAllFunction`: `GET /function/getAllfunction`

---

## 3. Step-by-Step Demonstration Script

### Step 1: Launch NexaSupply API & Contextπ Environment
```bash
# Terminal 1: Launch NexaSupply Application (Target Server)
cd NexaSupply && npm start # Running at http://localhost:3000

# Terminal 2: Launch Contextπ Server & Web Dashboard
cd contextpi && npm run start # Running at http://localhost:5173 / API port 3001
```

### Step 2: Extract Dynamic Context from NexaSupply MongoDB
- Open Contextπ Web Dashboard (`http://localhost:5173`).
- Enter MongoDB Connection URI (`mongodb://localhost:27017/nexasupply`) and `projectName: "NexaSupply"`.
- Click **"Extract Context"**.
- Dashboard displays normalized `ProjectContext`:
  - Active schemas extracted dynamically from Mongo collections.
  - Field Metadata (Names, normalized dataTypes, mandatory flags, inputTypes, foreign refs).
  - Custom Function Definitions (Structured `parameters` and `expectedResponseFields`).

### Step 3: Build & Preview Test Catalogue
- Click **"Build Test Catalogue"**.
- Contextπ evaluates rule engines (`crudRules`, `fieldRules`, `functionRules`, `relationshipRules`, `DeterministicBusinessRuleAnalyzer`).
- Catalogue Preview renders all generated test cases in `DRAFT` status with full **10-Point Traceability Metadata**.

### Step 4: Catalogue Selection & Approval Gate Submission
- In the Catalogue Preview UI, review the list of test cases.
- Toggle selection checkboxes for target test cases (`selected: true / false`).
- Click **"Approve Test Suite"**.
- Catalogue status transitions to `APPROVED`.

### Step 5: Synthesize Playwright TypeScript `.spec.ts` Files
- Click **"Generate Specs"**.
- Contextπ verifies catalogue approval status and synthesizes `.spec.ts` files **ONLY** for approved, selected entries.
- Inspect `generated-tests/nexasupply.spec.ts`:
  - Verify Playwright `APIRequestContext` syntax.
  - Verify endpoints mapped via `TargetApiContract` (`/forms/formCreate`, `/function/:name`).
  - Verify response schema assertions checking structured response fields.

### Step 6: Programmatically Execute Playwright API Tests
- Click **"Run Approved Tests"**.
- Contextπ programmatically invokes `@playwright/test` against the running NexaSupply server (`http://localhost:3000`).
- Live execution stream displays real HTTP requests and responses.

### Step 7: Inspect Real Results HTML & JSON Reports
- View results directly in Dashboard or open `reports/report.html`:
  - **Genuine Results Check:** Verify total executed count, passed count, failed count, pass rate %, and duration originate 100% from actual Playwright HTTP execution results. Zero hardcoded UI metrics.
  - Expand failing/passing test cases to view exact HTTP status code, request payload, response body, and source traceability.

---

## 4. Final Demo Verification Matrix

| Verification Criterion | Target Standard | Status |
|---|---|---|
| Dynamic NexaSupply Ingestion | Ingest schemas & functions directly from NexaSupply MongoDB | PASS |
| Target API Routing | Send HTTP API requests to `/forms/*` and `/function/*` endpoints | PASS |
| Catalogue Selection Gate | Generate specs ONLY from user-selected, approved entries | PASS |
| Response Schema Assertions | Assert structured response fields returned by custom functions | PASS |
| Genuine Execution Metrics | Pass/Fail counts and logs in UI derived 100% from real Playwright runs | PASS |
