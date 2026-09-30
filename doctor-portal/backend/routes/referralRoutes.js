import express from "express";
import {
  getReferrals,
  createReferral,
  updateReferralStatus
} from "../controllers/referralController.js";
import { protectDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectDoctor);

router.get("/", getReferrals);
router.post("/", createReferral);
router.patch("/:id/status", updateReferralStatus);

export default router;
