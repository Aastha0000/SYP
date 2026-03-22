import pool from "../config/database.js";

export const createBooking = async (userId, guideId, destination, dateFrom, dateTo) => {
  const [result] = await pool.query(
    `INSERT INTO bookings 
     (user_id, guide_id, destination, date_from, date_to, status, payment_status)
     VALUES (?, ?, ?, ?, ?, 'pending', 'pending')`,
    [userId, guideId, destination, dateFrom, dateTo]
  );
  return result;
};

export const getUserBookings = async (userId) => {
  const [rows] = await pool.query(
    `SELECT b.*, u.username AS guide_name
     FROM bookings b
     JOIN users u ON b.guide_id = u.id
     WHERE b.user_id = ?
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return rows;
};

export const getGuideBookings = async (guideId) => {
  const [rows] = await pool.query(
    `SELECT b.*, u.username AS user_name
     FROM bookings b
     JOIN users u ON b.user_id = u.id
     WHERE b.guide_id = ?
     ORDER BY b.created_at DESC`,
    [guideId]
  );
  return rows;
};

export const getBookingById = async (bookingId) => {
  const [rows] = await pool.query(
    "SELECT * FROM bookings WHERE id = ?",
    [bookingId]
  );
  return rows[0];
};

export const updateBookingStatus = async (bookingId, status) => {
  const [result] = await pool.query(
    "UPDATE bookings SET status = ? WHERE id = ?",
    [status, bookingId]
  );
  return result;
};

export const updateBookingPaymentStatus = async (bookingId, paymentStatus) => {
  const [result] = await pool.query(
    "UPDATE bookings SET payment_status = ? WHERE id = ?",
    [paymentStatus, bookingId]
  );
  return result;
};

export const isGuideVerified = async (guideId) => {
  const [rows] = await pool.query(
    "SELECT verified FROM guide_portfolio WHERE guide_id = ?",
    [guideId]
  );
  return rows[0];
};