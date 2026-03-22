import pool from "../config/database.js";

export const createUser = async (username, email, password, role) => {
  const [result] = await pool.query(
    "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
    [username, email, password, role]
  );
  return result;
};

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
};

export const findUserById = async (id) => {
  const [rows] = await pool.query(
    "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
    [id]
  );
  return rows[0];
};