import express from "express";
import { getAnnouncements, markAnnouncementRead } from "../controllers/announcementController.js";
import { protectDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectDoctor);

router.get("/", getAnnouncements);
router.patch("/:id/read", markAnnouncementRead);

export default router;
