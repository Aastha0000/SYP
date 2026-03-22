import pool from "../config/database.js";

export const createPaymentRecord = async (bookingId, userId, guideId, amount, transactionUuid) => {
  const [result] = await pool.query(
    `INSERT INTO payments (booking_id, user_id, guide_id, amount, status)
     VALUES (?, ?, ?, ?, 'pending')
     ON DUPLICATE KEY UPDATE amount = VALUES(amount), status = 'pending'`,
    [bookingId, userId, guideId, amount]
  );

  return result;
};

export const getPaymentByBookingId = async (bookingId) => {
  const [rows] = await pool.query(
    "SELECT * FROM payments WHERE booking_id = ?",
    [bookingId]
  );
  return rows[0];
};

export const updatePaymentStatus = async (bookingId, status) => {
  const [result] = await pool.query(
    "UPDATE payments SET status = ? WHERE booking_id = ?",
    [status, bookingId]
  );
  return result;
};