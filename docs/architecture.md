# Contextπ Architecture & System Design

Contextπ is an **Application-Agnostic, Business-Context-Aware Dynamic API Test Generation & Self-Healing Execution Engine**.

---

## 1. End-to-End Execution Pipeline

```
┌────────────────────────────────────────────────────────┐
│                   MongoDB Database                     │
│  (Form Schemas, Custom Fields, Function Registries)    │
└───────────────────────────┬────────────────────────────┘
                            │ Dynamic Discovery
                            ▼
┌────────────────────────────────────────────────────────┐
│               Context Extraction Engine                │
│    (Schemas, Fields, Enums, Foreign Keys, Rules)       │
└───────────────────────────┬────────────────────────────┘
                            │ ProjectContext
                            ▼
┌────────────────────────────────────────────────────────┐
│            Rule Engine & Intent Analyzer               │
│  (CRUD Rules, Field Constraints, Functions, Rules)     │
└───────────────────────────┬────────────────────────────┘
                            │ TestIntents
                            ▼
┌────────────────────────────────────────────────────────┐
│               Test Catalogue & Approval                │
│   (Topological Dependency Ordering & Selection)        │
└───────────────────────────┬────────────────────────────┘
                            │ Approved TestCatalog
                            ▼
┌────────────────────────────────────────────────────────┐
│        Playwright Spec Code Generation Engine          │
│   (16-Point Safety Validated .spec.ts Files)           │
└───────────────────────────┬────────────────────────────┘
                            │ Playwright Specs
                            ▼
┌────────────────────────────────────────────────────────┐
│          Real HTTP / Synthetic Adapter Runner          │
│     (Authentic Status Codes, Timings, & Errors)        │
└───────────────────────────┬────────────────────────────┘
                            │ Failures (if any)
                            ▼
┌────────────────────────────────────────────────────────┐
│             AI Self-Healing Repair Engine              │
│ (Qwen3 Coder / Deterministic Fallback 13-Point Loop)   │
└───────────────────────────┬────────────────────────────┘
                            │ Authoritative Final Results
                            ▼
┌────────────────────────────────────────────────────────┐
│         HTML/JSON Authentic Execution Reports          │
└────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Separation

- **`contextpi` (The Solution)**:
  - Application-agnostic test generation engine. Contains **zero hardcoded application domain schemas or NexaSupply branches**.
  - Operates dynamically on whichever `ProjectContext` is loaded from MongoDB or synthetic inputs.
  - Supports **Adapter Mode** (100% self-contained in-memory HTTP API server) and **Live Mode** (real target application testing).

- **`nexasupply` (Validation Target Application)**:
  - Independent target application used strictly for live testing, validation, and demo verification.
  - Exposes REST API endpoints on `http://localhost:3000`.
