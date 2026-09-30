import express from "express";
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  getDoctorPublicKey,
  setDoctorPublicKey
} from "../controllers/messageController.js";
import { protectDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectDoctor);

router.get("/conversations", getConversations);
router.get("/conversations/:conversationId", getConversationMessages);
router.get("/keys/:doctorId", getDoctorPublicKey);
router.post("/keys", setDoctorPublicKey);
router.get("/:conversationId", getConversationMessages);
router.post("/", sendMessage);

export default router;
