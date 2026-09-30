import express from "express";
import { getAvailability, updateAvailability } from "../controllers/availabilityController.js";
import { protectDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectDoctor);

router.get("/", getAvailability);
router.put("/", updateAvailability);

export default router;
