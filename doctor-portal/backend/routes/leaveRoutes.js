import express from "express";
import { getLeaves, applyLeave } from "../controllers/leaveController.js";
import { protectDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectDoctor);

router.get("/", getLeaves);
router.post("/", applyLeave);

export default router;
