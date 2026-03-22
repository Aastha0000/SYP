import pool from "../config/database.js";

const createTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conversation_id INT NOT NULL,
      sender_id INT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_messages_conversation_created (conversation_id, created_at),
      INDEX idx_messages_sender (sender_id)
    )
  `;

  await pool.query(sql);
  console.log("messages table ready");
};

createTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("failed to create messages table:", error.message);
    process.exit(1);
  });
