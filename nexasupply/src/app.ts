import express from "express";
import cors from "cors";
import healthRouter from "./routes/health";
import formsRouter from "./routes/forms";
import functionsRouter from "./routes/functions";

const app = express();

app.use(cors());
app.use(express.json());

// TargetApiContract mapping
app.use("/", healthRouter);
app.use("/forms", formsRouter);
app.use("/function", functionsRouter);

export default app;
