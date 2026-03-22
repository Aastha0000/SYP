import pool from "../config/database.js";

export const verifyGuide = async (req, res) => {
  try {
    const { guideId, verified } = req.body;

    if (!guideId || typeof verified !== "boolean") {
      return res.status(400).json({ message: "guideId and verified are required" });
    }

    await pool.query(
      "UPDATE guide_portfolio SET verified = ? WHERE guide_id = ?",
      [verified, guideId]
    );

    res.json({
      message: verified ? "Guide verified successfully" : "Guide unverified successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const allUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const allGuides = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.email, u.created_at, gp.bio, gp.languages, gp.experience, gp.verified
       FROM users u
       LEFT JOIN guide_portfolio gp ON u.id = gp.guide_id
       WHERE u.role = 'guide'
       ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const allBookings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM bookings ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const allPayments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM payments ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};