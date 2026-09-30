import express from "express";
import {
  getTodayAppointments,
  getAllAppointments,
  updateAppointmentStatus
} from "../controllers/appointmentController.js";
import { protectDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectDoctor);

router.get("/today", getTodayAppointments);
router.get("/", getAllAppointments);
router.patch("/:id/status", updateAppointmentStatus);

export default router;
