import express from "express";
import { login, changePassword } from "../controllers/authController.js";
import { protectDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.put("/change-password", protectDoctor, changePassword);

export default router;
