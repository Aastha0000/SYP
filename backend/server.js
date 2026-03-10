import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ───── Middleware ───── */
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());

/* ───── Routes ───── */
app.use("/api/auth", authRoutes);

/* ───── Health Check ───── */
app.get("/", (req, res) => {
  res.json({ message: "ParyatanNepal API is running." });
});

/* ───── Start Server ───── */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});