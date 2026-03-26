const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// POST /api/location/request - Send tracking request
router.post('/request', async (req, res) => {
    const { requester_id, target_id } = req.body;
    try {
        // Check if request already exists
        const [existing] = await pool.query(
            'SELECT * FROM location_requests WHERE requester_id = ? AND target_id = ?',
            [requester_id, target_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Request already exists', request: existing[0] });
        }

        const [result] = await pool.query(
            'INSERT INTO location_requests (requester_id, target_id, status) VALUES (?, ?, "pending")',
            [requester_id, target_id]
        );
        res.status(201).json({ id: result.insertId, requester_id, target_id, status: 'pending' });
    } catch (err) {
        console.error('Request error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/location/requests/:userId - Get all incoming and outgoing requests
router.get('/requests/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const [incoming] = await pool.query(`
            SELECT lr.*, u.username, u.full_name, u.role
            FROM location_requests lr
            JOIN users u ON lr.requester_id = u.id
            WHERE lr.target_id = ?
        `, [userId]);

        const [outgoing] = await pool.query(`
            SELECT lr.*, u.username, u.full_name, u.role
            FROM location_requests lr
            JOIN users u ON lr.target_id = u.id
            WHERE lr.requester_id = ?
        `, [userId]);

        res.status(200).json({ incoming, outgoing });
    } catch (err) {
        console.error('Fetch requests error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/location/request/:id - Accept or decline
router.put('/request/:id', async (req, res) => {
    const { status } = req.body; // 'accepted' or 'declined'
    try {
        await pool.query('UPDATE location_requests SET status = ? WHERE id = ?', [status, req.params.id]);
        res.status(200).json({ message: 'Status updated successfully' });
    } catch (err) {
        console.error('Update status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/location/:id/track?requester_id=xyz - Track specific user securely
router.get('/:id/track', async (req, res) => {
    const targetId = req.params.id;
    const requesterId = req.query.requester_id;
    
    if (!requesterId) return res.status(400).json({ message: 'Requester ID missing' });
    
    // User tracking themselves
    if (String(targetId) === String(requesterId)) {
        const [rows] = await pool.query('SELECT latitude, longitude, location_updated_at FROM users WHERE id = ?', [targetId]);
        return res.status(200).json(rows[0] || {});
    }

    try {
        // Check if there's an accepted request in either direction
        const [auth] = await pool.query(`
            SELECT id FROM location_requests 
            WHERE ((requester_id = ? AND target_id = ?) OR (requester_id = ? AND target_id = ?)) AND status = 'accepted'
        `, [requesterId, targetId, targetId, requesterId]);

        if (auth.length === 0) {
            return res.status(403).json({ message: 'Tracking access denied. Requires accepted request.' });
        }

        const [rows] = await pool.query('SELECT latitude, longitude, location_updated_at FROM users WHERE id = ?', [targetId]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error('Track error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
