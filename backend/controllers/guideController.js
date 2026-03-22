import pool from "../config/database.js";

export const updatePortfolio = async (req, res) => {
  try {
    const guideId = req.user.id;
    const { bio, languages, experience } = req.body;

    const [existing] = await pool.query(
      "SELECT * FROM guide_portfolio WHERE guide_id = ?",
      [guideId]
    );

    if (existing.length > 0) {
      await pool.query(
        "UPDATE guide_portfolio SET bio = ?, languages = ?, experience = ? WHERE guide_id = ?",
        [bio || "", languages || "", experience || 0, guideId]
      );

      return res.json({ message: "Portfolio updated successfully" });
    }

    await pool.query(
      "INSERT INTO guide_portfolio (guide_id, bio, languages, experience) VALUES (?, ?, ?, ?)",
      [guideId, bio || "", languages || "", experience || 0]
    );

    res.json({ message: "Portfolio created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPortfolio = async (req, res) => {
  try {
    const { guideId } = req.params;

    const [rows] = await pool.query(
      `SELECT gp.*, u.username, u.email
       FROM guide_portfolio gp
       JOIN users u ON gp.guide_id = u.id
       WHERE gp.guide_id = ?`,
      [guideId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const earningsDashboard = async (req, res) => {
  try {
    const guideId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
          COUNT(b.id) AS totalBookings,
          SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completedBookings,
          SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END) AS totalEarnings
       FROM bookings b
       LEFT JOIN payments p ON b.id = p.booking_id
       WHERE b.guide_id = ?`,
      [guideId]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const guideBookings = async (req, res) => {
  try {
    const guideId = req.user.id;

    const [rows] = await pool.query(
      `SELECT b.*, u.username AS user_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.guide_id = ?
       ORDER BY b.created_at DESC`,
      [guideId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};