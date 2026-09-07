# Contextπ — Business-Context-Aware Dynamic API Test Generation Engine

[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](tsconfig.json)
[![Playwright API](https://img.shields.io/badge/Playwright-HTTP%20API-green.svg)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Contextπ (T31 — SixthSense) is an application-agnostic, business-context-aware API test generation and self-healing execution platform.

It discovers application context from MongoDB and the target API contract, including schemas, fields, data types, enums, relationships, validation rules, business rules, and registered functions. It then builds a traceable test catalogue, generates Playwright TypeScript API tests, executes those tests against a real target server or a self-contained synthetic adapter, explains failures, and can perform safe AI-assisted repair of eligible failures.

---

# 1. Fresh Setup — Start Here

This section is written for a manager/evaluator who has **just cloned this repository** and is running it for the first time.

## Prerequisites

Install:

- **Node.js LTS**
- **npm** (included with Node.js)
- **MongoDB** for Live Mode

MongoDB is required only for the bundled NexaSupply Live Mode demonstration. Adapter Mode is self-contained and does not require MongoDB.

The project uses:

| Service | URL | Port | Purpose |
|---|---|---:|---|
| Contextπ Web Client | http://localhost:5173 | 5173 | React + Vite dashboard |
| Contextπ Backend | http://localhost:3001 | 3001 | Contextπ API, generation, execution and reporting |
| NexaSupply Target | http://localhost:3000 | 3000 | Demo target REST API |
| MongoDB | mongodb://127.0.0.1:27017 | 27017 | Live target database |

## Step 1 — Clone the Repository

```bash
git clone <GITHUB_REPOSITORY_URL>
cd "ContextPi Application"
```

All root commands in this README are run from:

```text
ContextPi Application/
```

## Step 2 — Install All Dependencies

```bash
npm run setup
```

This installs dependencies for:

- Contextπ backend
- Contextπ web client
- NexaSupply target application

## Step 3 — Build the Complete Project

```bash
npm run build
```

This builds:

1. NexaSupply
2. Contextπ backend
3. Contextπ frontend

Do not continue if the build fails.

---

# 2. MongoDB Setup

MongoDB is required for **Live Mode**.

The expected local address is:

```text
mongodb://127.0.0.1:27017
```

The bundled NexaSupply database is:

```text
nexasupply_db
```

## Windows — Check MongoDB Service

Open **PowerShell**.

Check the service:

```powershell
Get-Service MongoDB
```

You should see:

```text
Status   Name      DisplayName
------   ----      -----------
Running  MongoDB   MongoDB Server (MongoDB)
```

You can also use:

```cmd
sc query MongoDB
```

## Windows — Start MongoDB

If the service is installed and stopped, open **PowerShell as Administrator** and run:

```powershell
Start-Service MongoDB
```

Then verify:

```powershell
Get-Service MongoDB
```

and:

```powershell
Get-NetTCPConnection -LocalPort 27017 -State Listen
```

Port `27017` should be listening.

### If `Start-Service MongoDB` fails

If Windows reports an error such as:

```text
Cannot open MongoDB service on computer '.'
```

or:

```text
Access is denied
```

first make sure PowerShell is running **as Administrator**.

Then inspect the installed MongoDB service configuration:

```powershell
sc.exe qc MongoDB
```

Also inspect the MongoDB configuration file:

```powershell
Get-Content "C:\Program Files\MongoDB\Server\8.3\bin\mongod.cfg"
```

The exact installation path may differ depending on the MongoDB version.

### If `mongod` / `mongosh` is not recognized

This does **not necessarily mean MongoDB is missing**. Windows may simply not have MongoDB's `bin` directory in `PATH`.

Check the installation directory, for example:

```cmd
dir "C:\Program Files\MongoDB\Server" /ad
```

Then:

```cmd
dir "C:\Program Files\MongoDB\Server\8.3\bin"
```

A typical installation contains:

```text
mongod.exe
mongos.exe
mongod.cfg
```

The MongoDB server can be started using the installed Windows service or the full path to `mongod.exe`.

### Recommended approach

For evaluator machines, the preferred approach is:

1. Install MongoDB as a Windows service.
2. Start the `MongoDB` service as Administrator.
3. Verify that port `27017` is listening.
4. Run:

```bash
npm run seed
```

Do not place MongoDB binaries or ZIP archives inside this GitHub repository.

---

# 3. Seed the Live Demo Target

After MongoDB is running:

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

The seed creates valid relationships between dependent records.

---

# 4. Verify the Environment

Before starting the full application:

```bash
npm run verify
```

A fully running environment should report:

```text
MongoDB (27017):          OK
NexaSupply Target (3000): OK
Contextπ Backend (3001):  OK
Contextπ Frontend (5173): OK
Environment Templates:    OK
Build Artifacts:          OK
```

If you run `npm run verify` before `npm run start`, the frontend and backend may show `NOT STARTED`. That is expected.

---

# 5. Start the Complete System

Start all application services from the repository root:

```bash
npm run start
```

The launcher starts:

```text
NexaSupply        → http://localhost:3000
Contextπ Backend  → http://localhost:3001
Contextπ Frontend → http://localhost:5173
```

Open:

**http://localhost:5173**

## Quick Health Checks

NexaSupply:

```text
http://localhost:3000/health
```

Contextπ backend:

```text
http://localhost:3001/api/health
```

Contextπ frontend:

```text
http://localhost:5173/
```

---

# 6. What Contextπ Does

Contextπ changes API testing from manually writing test cases to **understanding the target application's context first**.

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

The core principle is:

> **Contextπ determines what should be tested from discovered application context, then proves those tests through execution.**

---

# 7. Repository Structure

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
│   ├── tests/                  # Target integration tests
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

# 8. Main Demo Flow

Once the system is running at **http://localhost:5173**:

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

---

# 9. Step 1 — Connect to the Target

For the bundled Live Mode demonstration, use NexaSupply:

```text
MongoDB URI:
mongodb://127.0.0.1:27017

Database:
nexasupply_db

Target API:
http://localhost:3000
```

Contextπ remains application-agnostic; NexaSupply is the included validation target.

---

# 10. Step 2 — Load Application Context

Contextπ discovers information such as:

- schemas / collections
- fields
- data types
- mandatory fields
- enums
- validation constraints
- relationships / references
- business rules
- registered functions
- API endpoint contract
- sample data where available

This discovered context drives the test catalogue.

---

# 11. Step 3 — Explore the Context

Use **Context Explorer** to inspect the application's discovered structure.

The bundled target includes:

```text
suppliers
warehouses
customers
items
inventory
orders
shipments
```

Example relationships:

```text
items.supplierId       → suppliers
items.warehouseId      → warehouses
orders.customerId      → customers
orders.itemId          → items
orders.warehouseId     → warehouses
shipments.orderId      → orders
shipments.warehouseId  → warehouses
```

Field types, required/optional state, constraints, enums and function metadata are also available.

---

# 12. Step 4 — Generate the Test Catalogue

Open **Test Generator** and generate the test catalogue.

The catalogue contains traceable test intentions rather than immediately producing opaque code.

Typical test categories:

- CRUD
- FIELD_VALIDATION
- BULK_UPLOAD
- RELATIONSHIP
- BUSINESS_RULE
- CUSTOM_FUNCTION
- REGISTRY

Catalogue entries can contain:

- Test ID
- Category
- Priority
- Target Entity
- Source
- Source Reference
- Reasoning
- Dependencies
- HTTP method
- Target route
- Expected result
- Payload template

---

# 13. Step 5 — Review and Approve

Open **Test Catalogue**.

Review the generated tests and approve the selected catalogue.

Only approved entries proceed to executable Playwright generation.

---

# 14. Step 6 — Generate Playwright Tests

Open **Generated Tests** and generate the Playwright TypeScript specifications.

Generated tests include:

- HTTP request
- resolved route
- payload
- expected status
- response assertions
- dependency lifecycle
- traceability metadata

Contextπ uses Playwright's HTTP API capabilities for API testing.

---

# 15. Step 7 — Run the Test Suite

Open **Test Runs** and execute the generated Playwright API suite.

Results include:

```text
Executed Tests
Passed Tests
Failed Tests
Pass Rate
Duration
```

For Live Mode, execution is against:

```text
http://localhost:3000
```

Pass/fail results are derived from actual execution.

---

# 16. Step 8 — Understand a Test

Every test provides a **Description / Explain** action.

Use it to see:

- what the test checks
- why the test exists
- target entity
- category
- priority
- source/reference
- dependencies
- HTTP method
- endpoint
- payload
- expected result
- discovered schema information

This is intended to make individual tests understandable without reading the generated TypeScript.

---

# 17. Step 9 — Investigate Failures

For failed tests, use **Trace**.

The Failure Trace includes:

- human-readable summary
- what happened
- expected result
- actual result
- API response
- request information
- failed assertion
- location
- likely root cause
- suggested next action
- traceability
- raw Playwright error

The technical error remains available for debugging.

---

# 18. Step 10 — AI-Assisted Analysis and Repair

When AI assistance is enabled, Contextπ can use the hackathon-provided Qwen3 Coder model for eligible failure diagnosis and safe repair.

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

A repair is successful only when the patched test is genuinely re-executed and passes against the target API.

If a failure cannot be safely repaired, Contextπ preserves the authentic failure.

---

# 19. Step 11 — Reports

Open **Reports** after execution.

Reports provide:

- total tests
- passed tests
- failed tests
- skipped tests
- pass rate
- execution duration
- category breakdown
- priority breakdown
- failure details
- repair information where applicable

JSON and HTML report outputs are generated by the execution pipeline.

---

# 20. Demo Mode 1 — Synthetic Adapter Mode

Adapter Mode is a self-contained way to demonstrate Contextπ without relying on NexaSupply or external application data.

Start:

```bash
npm run start
```

Open:

```text
http://localhost:5173
```

Then:

1. Select **Load Adapter Context**.
2. Explore **Context Explorer**.
3. Generate the **Test Catalogue**.
4. Approve the selected catalogue.
5. Generate Playwright specifications.
6. Run the test suite.
7. Inspect results.
8. Use **Explain** and **Trace**.
9. Inspect AI analysis / repair when available.
10. Open Reports.

Adapter Mode validates the Contextπ pipeline in a deterministic synthetic environment.

---

# 21. Demo Mode 2 — Live NexaSupply Mode

Live Mode demonstrates Contextπ against a real local target.

Prepare MongoDB, then:

```bash
npm run seed
npm run start
```

Open:

```text
http://localhost:5173
```

Load the live context using:

```text
MongoDB:
mongodb://127.0.0.1:27017

Database:
nexasupply_db

Target API:
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

# 22. Recommended Hackathon Demonstration

For a short evaluator presentation:

```text
1. Show the architecture.
2. Open Context Explorer.
3. Show schemas, fields, relationships and functions.
4. Generate the test catalogue.
5. Show traceability and dependencies.
6. Approve the catalogue.
7. Generate Playwright .spec.ts files.
8. Run the test suite.
9. Open Description on a test.
10. Open Trace on a failure.
11. Show AI analysis / safe repair when available.
12. Show final results.
13. Open Reports.
```

---

# 23. Root Commands

Run all commands from:

```text
ContextPi Application/
```

Install:

```bash
npm run setup
```

Build:

```bash
npm run build
```

Seed:

```bash
npm run seed
```

Verify:

```bash
npm run verify
```

Start:

```bash
npm run start
```

---

# 24. Stopping the System

To stop the application services, stop the terminal running:

```bash
npm run start
```

If you need to clear application ports on Windows before a fresh run, PowerShell can be used:

```powershell
$ports = 3000,3001,5173

foreach ($port in $ports) {
    Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique |
        ForEach-Object {
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        }
}
```

MongoDB can be stopped separately if required:

```powershell
Stop-Service MongoDB
```

To start it again:

```powershell
Start-Service MongoDB
```

Use an **Administrator PowerShell** for Windows service operations.

---

# 25. Troubleshooting

## MongoDB service will not start

First check:

```powershell
Get-Service MongoDB
```

If stopped, open PowerShell as Administrator and try:

```powershell
Start-Service MongoDB
```

If Windows reports:

```text
Cannot open MongoDB service on computer '.'
```

or:

```text
Access is denied
```

inspect the service:

```powershell
sc.exe qc MongoDB
```

and inspect the MongoDB configuration:

```powershell
Get-Content "C:\Program Files\MongoDB\Server\8.3\bin\mongod.cfg"
```

The installation directory may differ by MongoDB version.

If `mongod --version` or `mongosh --version` is not recognized, the MongoDB `bin` directory may not be in the Windows `PATH`. The MongoDB server can still be installed correctly as a Windows service.

Verify the installation files with:

```cmd
dir "C:\Program Files\MongoDB\Server" /ad
dir "C:\Program Files\MongoDB\Server\8.3\bin"
```

Do not place MongoDB binaries or ZIP files in this repository.

## MongoDB connection error during seed

Make sure MongoDB is running and port 27017 is listening:

```powershell
Get-NetTCPConnection -LocalPort 27017 -State Listen
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

## Frontend loads but buttons do not work

Make sure the Contextπ backend is running on:

```text
http://localhost:3001
```

The Vite development client on port 5173 uses the configured `/api` proxy to communicate with the Contextπ backend.

## Port already in use

Find processes using the application ports:

```powershell
Get-NetTCPConnection -State Listen |
    Where-Object { $_.LocalPort -in 3000,3001,5173,27017 } |
    Select-Object LocalAddress,LocalPort,OwningProcess
```

Stop only the process you intend to stop, then restart the application.

---

# 26. Verification Checklist

A complete setup should satisfy:

```text
[ ] Node.js installed
[ ] MongoDB available for Live Mode
[ ] npm run setup succeeds
[ ] npm run build succeeds
[ ] npm run seed succeeds
[ ] npm run verify reports required services
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

# 27. Separation of Responsibilities

## Contextπ

**Contextπ is the main hackathon solution.**

Its engine is designed to remain application-agnostic and to derive testing behavior from the discovered target context.

## NexaSupply

**NexaSupply is the bundled validation target.**

It provides a realistic supply-chain API and MongoDB environment for Live Mode.

NexaSupply-specific entities and business logic are not supposed to be hardcoded into the generic Contextπ engine.

---

# 28. Key Features

### Dynamic Context Extraction
Loads schemas, fields, data types, enums, relationships, constraints, business rules, functions and API contract information.

### Traceable Test Catalogue
Creates structured test intentions with IDs, categories, priorities, reasoning and dependencies.

### Playwright HTTP API Testing
Generates and executes TypeScript Playwright API tests.

### Safety Validation
Validates generated specs and proposed repairs before execution.

### AI-Assisted Self-Healing
Uses Qwen3 Coder or safe deterministic fallbacks for eligible failure diagnosis and repair.

### Truthful Reporting
Execution metrics originate from actual test execution.

### Human-Readable Diagnostics
Provides Description and Trace views so technical and non-technical users can understand individual tests and failures.

---

# 29. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.


