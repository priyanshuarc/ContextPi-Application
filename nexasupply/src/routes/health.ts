import { Router, Request, Response } from "express";
import { getDb } from "../db/connection";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  let dbStatus = "disconnected";
  try {
    const db = getDb();
    if (db) dbStatus = "connected";
  } catch (e) {
    dbStatus = "disconnected";
  }

  res.status(200).json({
    status: "ok",
    service: "NexaSupply",
    db: dbStatus
  });
});

export default router;
