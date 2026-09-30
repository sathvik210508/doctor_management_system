import express from "express";
import { getAllPatients, getPatientById } from "../controllers/patientController.js";
import { protectDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectDoctor);

router.get("/", getAllPatients);
router.get("/:id", getPatientById);

export default router;
