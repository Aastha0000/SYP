const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// POST /api/bookings - Create a new booking
router.post('/', async (req, res) => {
    const { guide_id, user_id, booking_date } = req.body;

    if (!guide_id || !user_id || !booking_date) {
        return res.status(400).json({ message: 'Missing required booking fields.' });
    }

    try {
        // Check if the guide is already booked on that date
        const [existing] = await pool.query(
            'SELECT id FROM bookings WHERE guide_id = ? AND booking_date = ? AND status != "cancelled"',
            [guide_id, booking_date]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Guide is already booked on this date.' });
        }

        const [result] = await pool.query(
            'INSERT INTO bookings (guide_id, user_id, booking_date, status, payment_status) VALUES (?, ?, ?, "confirmed", "paid")',
            [guide_id, user_id, booking_date]
        );

        // Update guide earnings (using a fixed amount for now as per frontend)
        await pool.query(
            'UPDATE users SET earnings = earnings + 2000 WHERE id = ?',
            [guide_id]
        );

        res.status(201).json({ message: 'Booking confirmed successfully!', bookingId: result.insertId });
    } catch (err) {
        console.error('Booking error:', err);
        res.status(500).json({ message: 'Server error during booking.' });
    }
});

// GET /api/bookings/user/:id - Get bookings for a specific user
router.get('/user/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT b.id, b.booking_date, b.status, b.payment_status, u.full_name as guide_name, u.username as guide_username, u.email as guide_email
            FROM bookings b
            JOIN users u ON b.guide_id = u.id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC
        `, [req.params.id]);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Fetch user bookings error:', err);
        res.status(500).json({ message: 'Server error fetching bookings.' });
    }
});

// GET /api/bookings/guide/:id - Get bookings for a specific guide
router.get('/guide/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT b.id, b.booking_date, b.status, b.payment_status, u.full_name as user_name, u.username as user_username, u.email as user_email
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE b.guide_id = ?
            ORDER BY b.booking_date DESC
        `, [req.params.id]);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Fetch guide bookings error:', err);
        res.status(500).json({ message: 'Server error fetching bookings.' });
    }
});

// GET /api/bookings - Get all bookings (for admin)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT b.id, b.booking_date, b.status, b.payment_status, 
                   g.full_name as guide_name, u.full_name as user_name
            FROM bookings b
            JOIN users g ON b.guide_id = g.id
            JOIN users u ON b.user_id = u.id
            ORDER BY b.booking_date DESC
        `);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Fetch all bookings error:', err);
        res.status(500).json({ message: 'Server error fetching bookings.' });
    }
});

module.exports = router;
