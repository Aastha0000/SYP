const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// GET /api/guides
router.get('/', async (req, res) => {
    try {
        const [guides] = await pool.query(`
            SELECT 
                u.id, 
                u.username, 
                u.full_name, 
                u.profile_picture, 
                u.languages_spoken, 
                u.specialities, 
                u.portfolio_url,
                COALESCE(AVG(r.rating), 0) as avg_rating,
                COUNT(r.id) as review_count
            FROM users u
            LEFT JOIN guide_reviews r ON u.id = r.guide_id
            WHERE u.role = "guide" AND u.is_verified = TRUE
            GROUP BY u.id
        `);
        res.status(200).json(guides);
    } catch (err) {
        console.error('Fetch public guides error:', err);
        res.status(500).json({ message: 'Server error while fetching guides' });
    }
});

// GET /api/guides/:id - Get a specific guide's details, booked dates, stats
router.get('/:id', async (req, res) => {
    try {
        const guideId = req.params.id;
        const [guides] = await pool.query(`
            SELECT 
                u.id, 
                u.username, 
                u.full_name, 
                u.email,
                u.gender,
                u.licence_cert,
                u.verification_status,
                u.is_verified,
                u.profile_picture, 
                u.languages_spoken, 
                u.specialities, 
                u.portfolio_url,
                u.earnings,
                COALESCE(AVG(r.rating), 0) as avg_rating,
                COUNT(r.id) as review_count
            FROM users u
            LEFT JOIN guide_reviews r ON u.id = r.guide_id
            WHERE u.id = ? AND u.role = "guide"
            GROUP BY u.id
        `, [guideId]);

        if (guides.length === 0) {
            return res.status(404).json({ message: 'Guide not found' });
        }

        // Fetch booked dates
        const [bookings] = await pool.query(`
            SELECT booking_date, user_id FROM bookings WHERE guide_id = ? AND status != "cancelled"
        `, [guideId]);

        const bookedDates = bookings.map(b => {
             // For DATE columns, b.booking_date is a Date object.
             // We MUST extract the year/month/day components correctly.
             const d = b.booking_date;
             const dateStr = d.getFullYear() + '-' + 
                           String(d.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(d.getDate()).padStart(2, '0');
             return {
                 date: dateStr,
                 user_id: b.user_id
             };
        });

        res.status(200).json({ ...guides[0], bookedDates });
    } catch (err) {
        console.error('Fetch guide details error:', err);
        res.status(500).json({ message: 'Server error while fetching guide details' });
    }
});

// GET /api/guides/:id/reviews - Get reviews for a guide
router.get('/:id/reviews', async (req, res) => {
    try {
        const [reviews] = await pool.query(`
            SELECT r.*, u.username as reviewer_name, u.profile_picture as reviewer_avatar
            FROM guide_reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.guide_id = ?
            ORDER BY r.created_at DESC
        `, [req.params.id]);
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});

// POST /api/guides/:id/reviews - Post a review
router.post('/:id/reviews', async (req, res) => {
    const { user_id, rating, comment } = req.body;
    try {
        await pool.query(`
            INSERT INTO guide_reviews (guide_id, user_id, rating, comment)
            VALUES (?, ?, ?, ?)
        `, [req.params.id, user_id, rating, comment]);
        res.status(201).json({ message: 'Review added successfully' });
    } catch (err) {
        console.error('Add review error:', err);
        res.status(500).json({ message: 'Failed to add review' });
    }
});

module.exports = router;
