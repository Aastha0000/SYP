const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// GET /api/destinations - Get all destinations
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM destinations ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (err) {
        console.error('Error fetching destinations:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/destinations/:id - Get destination details
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM destinations WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Destination not found' });
        }
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error('Error fetching destination details:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
