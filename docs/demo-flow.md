# Contextπ Evaluator End-to-End Demo Flow

Follow these exact steps to evaluate Contextπ in both **Adapter Mode** and **Live Mode**.

---

## Scenario A: Adapter Mode Demo (100% Self-Contained, No MongoDB Required)

1. Run `npm run setup` and `npm run build`.
2. Open `http://localhost:5173` in any modern web browser.
3. Click **"Load Adapter Context"** on the Dashboard or Projects page.
4. **Inspect Context**: Open **Context Explorer** to view discovered schemas (`suppliers`, `items`, `orders`), custom fields, data types, and custom functions.
5. **Generate Catalogue**: Click **"Test Generator"** $\rightarrow$ **"Generate Test Catalogue"**.
6. **Approve Catalogue**: Navigate to **Test Catalogue** and click **"Approve Selected Catalogue"**.
7. **Generate Specs**: Click **"Generate Playwright Specs"**. View synthesized TypeScript `.spec.ts` files under **Generated Tests**.
8. **Execute Test Suite**: Click **"Run Test Suite"**.
9. **Observe Results**:
   - Initial Run $\rightarrow$ Failure detection.
   - AI Self-Healing Loop $\rightarrow$ Safe payload/schema repair.
   - Final Run $\rightarrow$ **100.0% PASS RATE**.
10. **Inspect Trace & Explanation**:
    - Click **"Trace"** on any test result to view human-readable error breakdown, expected vs actual, request payload, and repair diagnostics.
    - Click **"Explain"** on any test result to view structured test objective, HTTP method, schema requirements, and AI LLM insights.
11. **View Reports**: Navigate to **Reports** to view HTML/JSON report summaries.

---

## Scenario B: Live Mode Demo (Real NexaSupply Application & MongoDB)

1. Start local MongoDB instance on port `27017`.
2. Execute `npm run seed` to populate NexaSupply database schemas and sample data.
3. Launch services: `npm run start`.
4. Open `http://localhost:5173`.
5. Under **Projects**, click **"Load Live MongoDB Context"** (URI: `mongodb://127.0.0.1:27017/nexasupply_db`).
6. Execute the test generation, approval, Playwright execution, and AI self-healing loop against the live target application running on `http://localhost:3000`.
