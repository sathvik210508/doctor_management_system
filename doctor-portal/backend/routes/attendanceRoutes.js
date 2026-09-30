import express from "express";
import {
  getTodayAttendance,
  markAttendance,
  getAttendanceHistory
} from "../controllers/attendanceController.js";
import { protectDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectDoctor);

router.get("/today", getTodayAttendance);
router.post("/", markAttendance);
router.get("/history", getAttendanceHistory);

export default router;
