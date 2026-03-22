import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import guideRoutes from "./routes/guideRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import pool from "./config/database.js";
import setupSocket from "./socket/socket.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.json({ message: "ParyatanNepal API is running." });
});

setupSocket(server);

server.listen(PORT, async () => {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL Database connected successfully");
    connection.release();
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }

  console.log(`Server running on http://localhost:${PORT}`);
});