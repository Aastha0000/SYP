import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createConversation,
  addMessage,
  getMessages
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/conversation", authMiddleware, createConversation);
router.post("/message", authMiddleware, addMessage);
router.get("/messages/:conversationId", authMiddleware, getMessages);

export default router;