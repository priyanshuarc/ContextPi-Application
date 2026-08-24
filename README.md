# Contextπ — Business-Context-Aware Dynamic API Test Generation Engine

[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](tsconfig.json)
[![Playwright API](https://img.shields.io/badge/Playwright-HTTP%20API-green.svg)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Contextπ (T31 — SixthSense)** is an application-agnostic, business-context-aware API test generation and self-healing execution platform. It dynamically discovers database schemas, field rules, data types, enums, foreign keys, and custom function registries from MongoDB, evaluates rule engines to generate structured test catalogues, synthesizes 100% syntactically valid Playwright TypeScript test suites (`.spec.ts`), executes tests against real target servers or self-contained synthetic adapters, and applies AI self-healing repair loops to fix failures.

---

## Quick Start (For Hackathon Evaluator)

```bash
# 1. Clone Repository & Navigate to Folder
cd "ContextPi Application"

# 2. One-Command Setup (Installs all dependencies across monorepo)
npm run setup

# 3. Build All Projects (Compiles NexaSupply target, Contextπ engine, and Web UI)
npm run build

# 4. Seed Target Application Database (Optional for Live Mode)
npm run seed

# 5. Verify Monorepo Readiness
npm run verify

# 6. Launch Complete System Concurrently
npm run start
```

Open **`http://localhost:5173`** in your browser to access the Contextπ Web Dashboard!

---

## System Services & Port Allocations

| Service Component | URL / Endpoint | Port | Description |
| :--- | :--- | :--- | :--- |
| **Contextπ Web Client** | `http://localhost:5173` | **5173** | React + Vite UI Dashboard |
| **Contextπ Backend Engine** | `http://localhost:3001` | **3001** | REST API Test Generator & Runner |
| **NexaSupply Target Server** | `http://localhost:3000` | **3000** | Demo Target Application API |
| **MongoDB Service** | `mongodb://127.0.0.1:27017` | **27017** | Document Database |

---

## Monorepo Architecture

```
ContextPi Application/
├── README.md                 # Master Evaluator Guide & Overview
├── LICENSE                   # Open Source MIT License
├── package.json              # Monorepo Orchestration Commands
├── .env.example              # Environment Configuration Template
├── .gitignore                # Root Git Exclusion Rules
│
├── contextpi/                # Contextπ Engine (The Solution)
│   ├── src/                  # Context Extraction, Rule Engine, Catalogue, Generator, Runner, AI Repair
│   ├── client/               # React + Vite Web Client UI
│   ├── scripts/              # Internal Maintenance Scripts
│   ├── docs/                 # Engine Technical Documentation
│   ├── generated-tests/      # Output Directory for Generated Playwright Specs
│   ├── reports/              # Output Directory for Authentic Reports
│   ├── package.json          # Contextπ Backend Dependencies
│   └── tsconfig.json         # Strict Mode TypeScript Configuration
│
├── nexasupply/               # NexaSupply (Validation Target Application)
│   ├── src/                  # Target REST API (Suppliers, Items, Orders, Inventory, Functions)
│   ├── seed/                 # Database Seeding Script
│   ├── tests/                # Target Integration Tests
│   └── package.json          # Target Dependencies
│
├── scripts/                  # Cross-Platform Automation & Verification
│   ├── install-all.js        # Evaluator 'npm run setup' script
│   ├── build-all.js          # Evaluator 'npm run build' script
│   ├── seed.js               # Evaluator 'npm run seed' script
│   ├── start-all.js          # Evaluator 'npm run start' launcher
│   ├── verify.js             # Evaluator 'npm run verify' checklist
│   └── *.ps1                 # Windows PowerShell Companion Scripts
│
└── docs/                     # Detailed Project Documentation
    ├── architecture.md       # Architecture & Pipeline Breakdown
    ├── setup.md              # Detailed Setup & Installation Guide
    ├── demo-flow.md          # Evaluator Walkthrough Script (Adapter & Live Modes)
    └── ps10-mapping.md       # PS10 Requirement Compliance Matrix
```

---

## Evaluator Walkthrough (Demo Modes)

### Mode 1: Synthetic Adapter Mode (Zero Setup, No MongoDB Required)
1. Launch app via `npm run start` and open `http://localhost:5173`.
2. Click **"Load Adapter Context"**.
3. Explore discovered context in **Context Explorer**.
4. Click **"Test Generator"** $\rightarrow$ **"Generate Test Catalogue"**.
5. Navigate to **Test Catalogue** and click **"Approve Selected Catalogue"**.
6. Click **"Generate Playwright Specs"** and review generated TypeScript files under **Generated Tests**.
7. Click **"Run Test Suite"**.
8. Observe initial run failures $\rightarrow$ AI Self-Healing Repair Loop $\rightarrow$ Authoritative **100.0% PASS RATE**.
9. Click **"Trace"** and **"Explain"** on any test item to inspect full human-readable error breakdowns, request payloads, and AI insights.

### Mode 2: Live Mode (NexaSupply + Real MongoDB)
1. Ensure local MongoDB is running on port `27017`.
2. Run `npm run seed`.
3. Launch app via `npm run start` and open `http://localhost:5173`.
4. Click **"Load Live MongoDB Context"** (`mongodb://127.0.0.1:27017/nexasupply_db`).
5. Execute end-to-end catalogue approval, Playwright generation, and live execution against `http://localhost:3000`.

---

## Key Features & Highlights

- **Dynamic Context Extraction**: Loads arbitrary form schemas, fields, enums, foreign keys, and function registries without application hardcoding.
- **Topological Catalogue Graph**: Deduplicates intent overlaps, respects dependency ordering, and enforces strict draft/approval safeguards.
- **Playwright HTTP-Only**: Uses Playwright's `APIRequestContext` for pure, fast HTTP testing without browser UI DOM overhead.
- **16-Point Spec Safety Validation**: Validates generated code against strict structural and security policies prior to execution.
- **AI Self-Healing Repair Loop**: Safe payload/schema repair engine using Bedrock Qwen3 Coder or safe deterministic metadata fallbacks.
- **Truthful Metric Reporting**: 100% of PASS/FAIL status codes, response times, and assertion results derived directly from Playwright execution.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
