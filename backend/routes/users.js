const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// GET /api/users/search?q=... - Search for users/guides
router.get('/search', async (req, res) => {
    const { q, role } = req.query;
    if (!q) return res.status(200).json([]);

    try {
        let query = `
            SELECT id, username, full_name, profile_picture, role, specialities 
            FROM users 
            WHERE (username LIKE ? OR full_name LIKE ?)
        `;
        const params = [`%${q}%`, `%${q}%` ];

        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }

        const [rows] = await pool.query(query, params);
        res.status(200).json(rows);
    } catch (err) {
        console.error('User search error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/users/:id - Update profile
router.put('/:id', upload.single('profilePicture'), async (req, res) => {
    const userId = req.params.id;
    const { full_name, languages_spoken, specialities, bio, portfolio_url, gender } = req.body;
    const profilePicture = req.file ? req.file.filename : null;

    try {
        let updates = [];
        let params = [];

        if (full_name !== undefined) { updates.push("full_name = ?"); params.push(full_name); }
        if (languages_spoken !== undefined) { updates.push("languages_spoken = ?"); params.push(languages_spoken); }
        if (specialities !== undefined) { updates.push("specialities = ?"); params.push(specialities); }
        if (bio !== undefined) { updates.push("bio = ?"); params.push(bio); }
        if (portfolio_url !== undefined) { updates.push("portfolio_url = ?"); params.push(portfolio_url); }
        if (gender !== undefined) { updates.push("gender = ?"); params.push(gender); }
        if (req.body.latitude !== undefined) { updates.push("latitude = ?"); params.push(req.body.latitude); }
        if (req.body.longitude !== undefined) { updates.push("longitude = ?"); params.push(req.body.longitude); }
        if (profilePicture) { updates.push("profile_picture = ?"); params.push(profilePicture); }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields provided for update' });
        }

        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        params.push(userId);

        const [result] = await pool.query(query, params);
        
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found after update' });
        }
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

// Favorites endpoints
router.post('/:userId/favorites/:destId', async (req, res) => {
    try {
        await pool.query('INSERT IGNORE INTO favorites (user_id, destination_id) VALUES (?, ?)', [req.params.userId, req.params.destId]);
        res.status(200).json({ message: 'Added to favorites' });
    } catch (err) {
        console.error('Add favorite error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:userId/favorites/:destId', async (req, res) => {
    try {
        await pool.query('DELETE FROM favorites WHERE user_id = ? AND destination_id = ?', [req.params.userId, req.params.destId]);
        res.status(200).json({ message: 'Removed from favorites' });
    } catch (err) {
        console.error('Remove favorite error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:userId/favorites', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT d.* FROM destinations d JOIN favorites f ON d.id = f.destination_id WHERE f.user_id = ?',
            [req.params.userId]
        );
        res.status(200).json(rows);
    } catch (err) {
        console.error('Get favorites error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
