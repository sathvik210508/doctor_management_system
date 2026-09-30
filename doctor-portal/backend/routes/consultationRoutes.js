import express from "express";
import {
  getConsultations,
  getPatientConsultations,
  createConsultation
} from "../controllers/consultationController.js";
import { protectDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectDoctor);

router.get("/", getConsultations);
router.get("/patient/:id", getPatientConsultations);
router.post("/", createConsultation);

export default router;
