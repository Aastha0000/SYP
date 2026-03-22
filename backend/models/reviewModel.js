import pool from "../config/database.js";

export const createReview = async (userId, guideId, rating, feedback) => {
  const [result] = await pool.query(
    "INSERT INTO reviews (user_id, guide_id, rating, feedback) VALUES (?, ?, ?, ?)",
    [userId, guideId, rating, feedback]
  );
  return result;
};

export const getReviewsByGuide = async (guideId) => {
  const [rows] = await pool.query(
    `SELECT r.*, u.username AS user_name
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.guide_id = ?
     ORDER BY r.created_at DESC`,
    [guideId]
  );
  return rows;
};