const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// Root health check
app.get('/', (req, res) => {
    res.json({ message: 'ParyatanNepal API is running.' });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
