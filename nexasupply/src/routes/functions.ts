import { Router } from "express";
import { executeFunction, createFunction, getAllFunction, getFunction } from "../controllers/functionController";

const router = Router();

router.post("/executeFunction", executeFunction);
router.post("/createFunction", createFunction);
router.post("/getAllFunction", getAllFunction);
router.post("/getFunction", getFunction);

export default router;
