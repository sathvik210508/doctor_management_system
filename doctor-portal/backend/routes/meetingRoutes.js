import express from "express";
import { getMeetings, getMeetingICS } from "../controllers/meetingController.js";
import { protectDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectDoctor);

router.get("/", getMeetings);
router.get("/:id/calendar", getMeetingICS);

export default router;
