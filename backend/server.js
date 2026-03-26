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
app.use('/api/location', require('./routes/location'));
app.use('/api/payments', require('./routes/payments'));

// Root health check
app.get('/', (req, res) => {
    res.json({ message: 'ParyatanNepal API is running.' });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_location', (userId) => {
        socket.join(`location_${userId}`);
        console.log(`User ${userId} joined location room`);
    });

    socket.on('update_location', (data) => {
        const { userId, latitude, longitude } = data;
        // Broadcast to rooms tracking this user
        io.to(`location_room_${userId}`).emit('location_update', { userId, latitude, longitude });
        // Also save to DB if needed, but the current UI already calls PUT /users/:id
    });

    socket.on('track_user', (userId) => {
        socket.join(`location_room_${userId}`);
        console.log(`Socket ${socket.id} is tracking user ${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
