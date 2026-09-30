import express from "express";
import { getMe, updateProfile, getAllDoctors } from "../controllers/doctorController.js";
import { protectDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectDoctor);

router.get("/me", getMe);
router.put("/profile", updateProfile);
router.get("/", getAllDoctors);

export default router;
