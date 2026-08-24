# NexaSupply

NexaSupply is a target application designed for testing Contextπ.

## Prerequisites

- Node.js (v18+)
- MongoDB running locally at `mongodb://localhost:27017`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Seed the database (ensures items and orders are populated):
   ```bash
   npm run seed
   ```

## Running the Server

Start the application:
```bash
npm run dev
# or
npm start
```
The API will run on `http://localhost:3000`.

## Testing

Run the integration tests (requires MongoDB to be running):
```bash
npm test
```

## Contextπ Integration

1. Start NexaSupply using `npm run start`.
2. Connect Contextπ to the Target API at `http://localhost:3000`.
3. In Contextπ, select MongoDB as `mongodb://localhost:27017` and database `nexasupply_db`.
4. Run Discovery and Context generation. Contextπ will find `items`, `orders`, and `calculateDiscount` automatically.
