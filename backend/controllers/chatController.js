import {
  createConversationModel,
  createMessageModel,
  getMessagesByConversation
} from "../models/chatModel.js";

export const createConversation = async (req, res) => {
  try {
    const { guideId } = req.body;
    const userId = req.user.id;

    if (!guideId) {
      return res.status(400).json({ message: "guideId is required" });
    }

    const conversation = await createConversationModel(userId, guideId);

    res.status(201).json({
      message: "Conversation ready",
      conversation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    const senderId = req.user.id;

    if (!conversationId || !message) {
      return res.status(400).json({ message: "conversationId and message are required" });
    }

    const result = await createMessageModel(conversationId, senderId, message);

    res.status(201).json({
      message: "Message sent successfully",
      messageId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await getMessagesByConversation(conversationId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};