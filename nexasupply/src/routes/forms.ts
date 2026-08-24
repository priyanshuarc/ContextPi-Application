import { Router } from "express";
import { formCreate, formGet, formUpdate, formDelete, query, formBulkupload } from "../controllers/formController";

const router = Router();

router.post("/formCreate/:schema", formCreate);
router.post("/formGet/:schema", formGet);
router.post("/formUpdate/:schema", formUpdate);
router.post("/formDelete/:schema", formDelete);
router.post("/query", query);
router.post("/formBulkupload/:schema", formBulkupload);

export default router;
