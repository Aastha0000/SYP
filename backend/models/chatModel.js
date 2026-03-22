import pool from "../config/database.js";

export const createConversationModel = async (userId, guideId) => {
  const [existing] = await pool.query(
    "SELECT * FROM conversations WHERE user_id = ? AND guide_id = ?",
    [userId, guideId]
  );

  if (existing.length > 0) {
    return existing[0];
  }

  const [result] = await pool.query(
    "INSERT INTO conversations (user_id, guide_id) VALUES (?, ?)",
    [userId, guideId]
  );

  const [rows] = await pool.query(
    "SELECT * FROM conversations WHERE id = ?",
    [result.insertId]
  );

  return rows[0];
};

// Get one conversation by id
export const getConversationById = async (conversationId) => {
  const [rows] = await pool.query(
    "SELECT * FROM conversations WHERE id = ?",
    [conversationId]
  );

  return rows[0];
};

// Check whether a user is part of a conversation
export const userCanAccessConversation = async (conversationId, userId) => {
  const [rows] = await pool.query(
    `SELECT * FROM conversations
     WHERE id = ? AND (user_id = ? OR guide_id = ?)`,
    [conversationId, userId, userId]
  );

  return rows[0];
};

// Create message
export const createMessageModel = async (conversationId, senderId, message) => {
  const [result] = await pool.query(
    "INSERT INTO messages (conversation_id, sender_id, message) VALUES (?, ?, ?)",
    [conversationId, senderId, message]
  );

  const [rows] = await pool.query(
    `SELECT m.*, u.username AS sender_name
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.id = ?`,
    [result.insertId]
  );

  return rows[0];
};

// Get all messages of a conversation
export const getMessagesByConversation = async (conversationId) => {
  const [rows] = await pool.query(
    `SELECT m.*, u.username AS sender_name
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.conversation_id = ?
     ORDER BY m.created_at ASC, m.id ASC`,
    [conversationId]
  );

  return rows;
};