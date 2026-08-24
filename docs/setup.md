# Contextπ Setup & Evaluator Guide

## Prerequisites

1. **Node.js**: `v18.0.0` or higher (`node -v`)
2. **npm**: `v9.0.0` or higher (`npm -v`)
3. **MongoDB**: (Optional for Live Mode, default port `27017`)

---

## Single Command Quick Start

### 1. Install Dependencies
```bash
npm run setup
```

### 2. Build Monorepo Bundles
```bash
npm run build
```

### 3. Seed Target Application Database (Optional for Live Mode)
```bash
npm run seed
```

### 4. Verify System Readiness
```bash
npm run verify
```

### 5. Launch All Services Concurrently
```bash
npm run start
```

---

## Service Endpoints

| Component | URL | Port |
| :--- | :--- | :--- |
| **Contextπ Web Client** | `http://localhost:5173` | 5173 |
| **Contextπ Backend API** | `http://localhost:3001` | 3001 |
| **NexaSupply Target Application** | `http://localhost:3000` | 3000 |
| **MongoDB Service** | `mongodb://127.0.0.1:27017` | 27017 |
