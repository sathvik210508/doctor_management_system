import express from "express";
import {
  getPrescriptions,
  getPatientPrescriptions,
  createPrescription
} from "../controllers/prescriptionController.js";
import { protectDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectDoctor);

router.get("/", getPrescriptions);
router.get("/patient/:id", getPatientPrescriptions);
router.post("/", createPrescription);

export default router;
