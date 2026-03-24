const express = require('express');
const cors = require('cors');
require('dotenv').config();

const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guides', require('./routes/guides'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));
app.use('/api/destinations', require('./routes/destinations'));

// Root health check
app.get('/', (req, res) => {
    res.json({ message: 'ParyatanNepal API is running.' });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
