# Contextπ — Business-Context-Aware Dynamic API Test Generation Engine

[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](tsconfig.json)
[![Playwright API](https://img.shields.io/badge/Playwright-HTTP%20API-green.svg)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Contextπ (T31 — SixthSense)** is an application-agnostic, business-context-aware API test generation and self-healing execution platform.

It discovers application context from MongoDB and the target API contract, including schemas, fields, data types, enums, relationships, validation rules, business rules, and registered functions. It then builds a traceable test catalogue, generates Playwright TypeScript API tests, executes those tests against a real target server or a self-contained synthetic adapter, explains failures, and can perform safe AI-assisted repair of eligible failures.

---

# 1. Fresh Setup — Start Here

This section is for a manager or evaluator who has **just cloned the GitHub repository** and has never run the project before.

## Prerequisites

Install these on the machine before starting:

- **Node.js** (LTS recommended)
- **npm** (included with Node.js)
- **MongoDB** for Live Mode

MongoDB is required only for the Live NexaSupply demonstration. Adapter Mode is self-contained and does not require MongoDB.

The project uses these ports:

| Service | URL | Port | Purpose |
|---|---|---:|---|
| Contextπ Web Client | http://localhost:5173 | 5173 | React + Vite dashboard |
| Contextπ Backend | http://localhost:3001 | 3001 | Contextπ API, generation, execution and reporting |
| NexaSupply Target | http://localhost:3000 | 3000 | Demo target REST API |
| MongoDB | mongodb://127.0.0.1:27017 | 27017 | Live target database |

## Step 1 — Clone the Repository

Clone this repository and enter the repository root:

```bash
git clone <GITHUB_REPOSITORY_URL>
cd "ContextPi Application"
```

All root commands in this README are run from:

```text
ContextPi Application/
```

## Step 2 — Install All Dependencies

Run:

```bash
npm run setup
```

This installs dependencies for:

- Contextπ backend
- Contextπ web client
- NexaSupply target application

## Step 3 — Build the Complete Project

Run:

```bash
npm run build
```

This builds:

1. NexaSupply
2. Contextπ backend
3. Contextπ frontend

Do not continue if the build fails.

## Step 4 — Start MongoDB

For Live Mode, make sure MongoDB is running on:

```text
mongodb://127.0.0.1:27017
```

On Windows, a MongoDB service installation can be checked with:

```powershell
Get-Service MongoDB
```

or:

```cmd
sc query MongoDB
```

## Step 5 — Seed the Demo Target

Run:

```bash
npm run seed
```

This creates the NexaSupply demonstration environment, including:

- suppliers
- warehouses
- customers
- items
- inventory
- orders
- shipments
- formSchemas
- functionRegistry

The seed establishes valid relationships between dependent records.

## Step 6 — Check System Readiness

Run:

```bash
npm run verify
```

A ready environment should report:

```text
MongoDB (27017):          OK
NexaSupply Target (3000): OK
Contextπ Backend (3001):  OK
Contextπ Frontend (5173): OK
Environment Templates:    OK
Build Artifacts:          OK
```

If the frontend is not started yet, `5173` may show `NOT STARTED`; this is expected before Step 7.

## Step 7 — Start the Complete System

Run:

```bash
npm run start
```

The root launcher starts all three application services:

```text
NexaSupply        → http://localhost:3000
Contextπ Backend  → http://localhost:3001
Contextπ Frontend → http://localhost:5173
```

Then open:

**http://localhost:5173**

## Quick Health Checks

You can independently verify:

```text
NexaSupply:
http://localhost:3000/health

Contextπ Backend:
http://localhost:3001/api/health

Contextπ Frontend:
http://localhost:5173/
```

At this point the complete project is ready to use.

---

# 2. What Contextπ Does

Contextπ changes API testing from manually writing test cases to **understanding the target application's context first**.

The overall process is:

```text
Target Application
       ↓
MongoDB Context + API Contract
       ↓
Contextπ Context Engine
       ↓
Schemas / Fields / Rules / Relationships / Functions
       ↓
Test Catalogue
       ↓
Catalogue Review & Approval
       ↓
Playwright .spec.ts Generation
       ↓
Real or Synthetic Execution
       ↓
PASS / FAIL
       ↓
Trace / Explain
       ↓
Optional AI Diagnosis & Safe Repair
       ↓
Re-execution
       ↓
Final Results & Reports
```

The important principle is:

> **Contextπ decides what should be tested from the application's discovered context, then proves those tests by executing them.**

---

# 3. Repository Structure

```text
ContextPi Application/
│
├── README.md
├── LICENSE
├── package.json
├── .env.example
├── .gitignore
│
├── contextpi/                  # Main Contextπ solution
│   ├── src/                    # Context engine, catalogue, generator, runner, AI
│   ├── client/                 # React + Vite web dashboard
│   ├── docs/                   # Contextπ technical documentation
│   ├── generated-tests/        # Generated Playwright specs (runtime output)
│   ├── reports/                # Generated reports (runtime output)
│   ├── package.json
│   └── tsconfig.json
│
├── nexasupply/                 # Demo / validation target application
│   ├── src/                    # REST API
│   ├── seed/                   # Database seeding
│   ├── tests/                  # Target application integration tests
│   └── package.json
│
├── scripts/                    # Repository automation
│   ├── install-all.js
│   ├── build-all.js
│   ├── seed.js
│   ├── start-all.js
│   └── verify.js
│
└── docs/
    ├── architecture.md
    ├── setup.md
    ├── demo-flow.md
    └── ps10-mapping.md
```

---

# 4. Main Demo Flow

Once the system is running at **http://localhost:5173**, the recommended demonstration is:

```text
1. Connect Target
        ↓
2. Load Application Context
        ↓
3. Explore Context
        ↓
4. Generate Test Catalogue
        ↓
5. Review / Approve Tests
        ↓
6. Generate Playwright Specs
        ↓
7. Run Test Suite
        ↓
8. Inspect Results
        ↓
9. Explain / Trace Tests
        ↓
10. Inspect AI Analysis / Repair
        ↓
11. Open Reports
```

The sections below explain each stage.

---

# 5. Step 1 — Connect to a Target

Contextπ can operate against a target application's discovered context.

For the bundled Live Mode demonstration, the target is NexaSupply:

```text
MongoDB:
mongodb://127.0.0.1:27017

Database:
nexasupply_db

Target API:
http://localhost:3000
```

Contextπ should remain application-agnostic; NexaSupply is only the bundled validation target.

---

# 6. Step 2 — Load Application Context

When Contextπ loads the target context, it discovers information such as:

- collections / schemas
- fields
- data types
- mandatory fields
- enums
- validation constraints
- relationships / references
- business rules
- registered functions
- API contract information
- sample data where available

This is the foundation for all downstream test generation.

---

# 7. Step 3 — Explore the Context

Use **Context Explorer** to inspect what Contextπ learned about the application.

For example, the target may expose:

```text
suppliers
warehouses
customers
items
inventory
orders
shipments
```

with relationships such as:

```text
items.supplierId    → suppliers
items.warehouseId   → warehouses
orders.customerId   → customers
orders.itemId       → items
orders.warehouseId  → warehouses
shipments.orderId   → orders
shipments.warehouseId → warehouses
```

The UI should also show field-level types, required/optional status, constraints, enums, and related metadata.

---

# 8. Step 4 — Generate the Test Catalogue

Open the **Test Generator** and generate the catalogue.

Contextπ creates a structured, traceable catalogue of test intentions instead of immediately producing opaque code.

Typical categories include:

- CRUD
- FIELD_VALIDATION
- BULK_UPLOAD
- RELATIONSHIP
- BUSINESS_RULE
- CUSTOM_FUNCTION
- REGISTRY

Each catalogue entry can contain:

- Test ID
- Category
- Priority
- Target Entity
- Source
- Source Reference
- Reasoning
- Dependencies
- HTTP method
- target route
- expected result
- payload template

---

# 9. Step 5 — Review and Approve

Open **Test Catalogue**.

Review the generated tests and approve the selected catalogue.

This creates an explicit review boundary before code generation and execution.

Only approved catalogue entries proceed to Playwright generation.

---

# 10. Step 6 — Generate Playwright Tests

Open **Generated Tests** and generate the Playwright specifications.

Contextπ produces TypeScript `.spec.ts` files containing the executable API tests.

The generated tests include the information needed to:

- construct the request
- resolve the target route
- build the payload
- maintain dependencies
- assert HTTP status
- perform response assertions
- preserve traceability

The generated tests use Playwright's HTTP API capabilities rather than browser DOM testing.

---

# 11. Step 7 — Run the Test Suite

Open **Test Runs** and run the generated Playwright API suite.

The initial run reports genuine execution results:

```text
Executed Tests
Passed Tests
Failed Tests
Pass Rate
Duration
```

The tests are executed against the configured target API.

For Live Mode with NexaSupply:

```text
http://localhost:3000
```

---

# 12. Step 8 — Understand Any Test

Every test provides a **Description / Explain** action.

Use it to understand:

- what the test checks
- why it exists
- target entity
- category
- priority
- source and source reference
- dependencies
- HTTP method
- endpoint
- payload
- expected result
- related schema fields

The explanation view is designed to make a test understandable without reading the generated TypeScript code.

---

# 13. Step 9 — Investigate Failures

For failed tests, use **Trace**.

The Failure Trace view presents a structured explanation including:

- human-readable summary
- what happened
- expected result
- actual result
- API response
- request information
- failed assertion
- location
- root cause
- suggested next action
- traceability
- raw Playwright error

This keeps both a judge-friendly explanation and the underlying technical evidence.

---

# 14. Step 10 — AI-Assisted Analysis and Repair

When AI assistance is enabled, Contextπ can use the hackathon-provided Qwen3 Coder model for eligible failure analysis and repair.

The repair lifecycle is:

```text
Real Playwright Failure
        ↓
Structured Failure Context
        ↓
Qwen3 Coder Diagnosis
        ↓
Strict Repair Validation
        ↓
Safe Patch
        ↓
Re-execute Failed Test
        ↓
Merge Final Result
```

The repair engine is constrained by discovered metadata and safety validation.

A repaired test is considered successful only when the patched test is **actually re-executed** and passes.

If a failure cannot be safely repaired, Contextπ preserves the genuine failure instead of fabricating a pass.

---

# 15. Step 11 — Reports

Open **Reports** after execution.

Reports provide:

- total tests
- passed tests
- failed tests
- skipped tests
- pass rate
- duration
- category breakdown
- priority breakdown
- detailed failures
- repair information where applicable

JSON and HTML report outputs are also produced by the execution pipeline.

---

# 16. Demo Mode 1 — Synthetic Adapter Mode

Adapter Mode is a self-contained way to demonstrate the Contextπ engine without relying on NexaSupply or external application data.

### Start

```bash
npm run start
```

Open:

```text
http://localhost:5173
```

Then:

1. Select **Load Adapter Context**.
2. Open **Context Explorer**.
3. Generate the **Test Catalogue**.
4. Approve the selected catalogue.
5. Generate Playwright specifications.
6. Run the test suite.
7. Inspect results.
8. Use **Explain** and **Trace**.
9. Inspect AI analysis / repair when available.
10. Open Reports.

Adapter Mode is intended to validate the Contextπ pipeline in a deterministic synthetic environment.

---

# 17. Demo Mode 2 — Live NexaSupply Mode

Live Mode demonstrates Contextπ against a real local target application.

### Prepare the target

Make sure MongoDB is running.

Run:

```bash
npm run seed
```

Start the full system:

```bash
npm run start
```

Open:

```text
http://localhost:5173
```

Load the live MongoDB context using:

```text
mongodb://127.0.0.1:27017
```

Database:

```text
nexasupply_db
```

Target API:

```text
http://localhost:3000
```

Then follow:

```text
Context
→ Catalogue
→ Approval
→ Playwright Generation
→ Real API Execution
→ Trace / Explain
→ Optional AI Repair
→ Reports
```

---

# 18. Important Separation of Responsibilities

This repository contains two applications with different purposes.

## Contextπ

**Contextπ is the hackathon solution.**

Its engine is designed to be application-agnostic and derives test behavior from the discovered target context.

## NexaSupply

**NexaSupply is the bundled validation target.**

It provides a realistic supply-chain API and MongoDB environment for demonstrating Contextπ in Live Mode.

NexaSupply-specific entity names, seed data, and business logic should not be required by the Contextπ engine itself.

---

# 19. Root Commands

All commands are run from:

```text
ContextPi Application/
```

### Install dependencies

```bash
npm run setup
```

### Build everything

```bash
npm run build
```

### Seed NexaSupply

```bash
npm run seed
```

### Check readiness

```bash
npm run verify
```

### Start the complete system

```bash
npm run start
```

---

# 20. Troubleshooting

## MongoDB is not available

Make sure MongoDB is running on:

```text
mongodb://127.0.0.1:27017
```

Then retry:

```bash
npm run seed
```

## NexaSupply is unavailable

Check:

```text
http://localhost:3000/health
```

Then restart:

```bash
npm run start
```

## Contextπ backend is unavailable

Check:

```text
http://localhost:3001/api/health
```

Then restart:

```bash
npm run start
```

## Frontend opens but buttons do not work

Make sure the Contextπ backend is running on:

```text
http://localhost:3001
```

The Vite development client on port `5173` uses the configured `/api` proxy to communicate with the Contextπ backend.

---

# 21. Verification Checklist

A complete local setup should satisfy:

```text
[ ] Node.js installed
[ ] MongoDB available for Live Mode
[ ] npm run setup succeeds
[ ] npm run build succeeds
[ ] npm run seed succeeds
[ ] npm run verify reports all required services
[ ] npm run start launches all services
[ ] http://localhost:5173 loads
[ ] Target context can be loaded
[ ] Test catalogue can be generated
[ ] Catalogue can be approved
[ ] Playwright specs can be generated
[ ] Test suite can be executed
[ ] Test Description works
[ ] Failure Trace works
[ ] Reports open
[ ] AI analysis/repair reflects actual runtime availability
```

---

# 22. Recommended Hackathon Demonstration

For a short evaluator demonstration:

```text
1. Show the architecture.
2. Open Context Explorer.
3. Show discovered schemas, fields, relationships and functions.
4. Generate the test catalogue.
5. Show traceability and dependencies.
6. Approve the catalogue.
7. Generate Playwright .spec.ts files.
8. Run the real test suite.
9. Open Description on a test to explain its purpose.
10. Open Trace on a failure to show the readable diagnosis.
11. Show AI analysis / safe repair when available.
12. Re-execute and show the final result.
13. Open Reports.
```

---

# 23. What Makes Contextπ Different

### Context-Driven

Testing begins from discovered application context rather than manually written test cases.

### Application-Agnostic

The core engine does not depend on NexaSupply-specific entity logic.

### Traceable

Every generated test can be traced back to its source metadata, reasoning, priority, and dependencies.

### Playwright-Based

The generated tests are executable TypeScript Playwright API tests.

### Real Execution

Test status comes from actual API execution rather than simulated pass/fail values.

### Safe AI Assistance

AI can analyze and repair eligible failures, while validation rules prevent unsafe or unsupported changes.

### Human-Readable Diagnostics

Failures can be understood through structured explanations while retaining the raw technical error for debugging.

---

# 24. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
