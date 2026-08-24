import app from "./app";
import { connectDB } from "./db/connection";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB().then(async () => {
      if (process.env.MOCK_DB === "true") {
        console.log("MOCK_DB is true, seeding database in memory...");
        try {
          const { seed } = await import("../seed/seed");
          await seed();
        } catch (e) {
          console.log("Error loading seed module:", e);
        }
      }
    });
    app.listen(port, () => {
      console.log(`NexaSupply Target API is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
