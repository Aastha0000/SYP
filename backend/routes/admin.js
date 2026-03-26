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
        cb(null, 'dest_' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// GET /api/admin/data
router.get('/data', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, username, email, role, full_name, profile_picture FROM users WHERE role = "user"');
        const [guides] = await pool.query('SELECT id, username, email, role, full_name, profile_picture, languages_spoken, specialities, licence_cert, is_verified, verification_status, earnings FROM users WHERE role = "guide"');
        
        res.status(200).json({ users, guides });
    } catch (err) {
        console.error('Admin fetch error:', err);
        res.status(500).json({ message: 'Server error while fetching admin data' });
    }
});

// PUT /api/admin/verify-guide/:id
router.put('/verify-guide/:id', async (req, res) => {
    try {
        const guideId = req.params.id;
        await pool.query('UPDATE users SET is_verified = TRUE, verification_status = "verified" WHERE id = ? AND role = "guide"', [guideId]);
        res.status(200).json({ message: 'Guide verified successfully.' });
    } catch (err) {
        console.error('Admin verify error:', err);
        res.status(500).json({ message: 'Server error while verifying guide' });
    }
});

// PUT /api/admin/reject-guide/:id
router.put('/reject-guide/:id', async (req, res) => {
    try {
        const guideId = req.params.id;
        await pool.query('UPDATE users SET is_verified = FALSE, verification_status = "rejected" WHERE id = ? AND role = "guide"', [guideId]);
        res.status(200).json({ message: 'Guide request rejected.' });
    } catch (err) {
        console.error('Admin reject error:', err);
        res.status(500).json({ message: 'Server error while rejecting guide' });
    }
});

// POST /api/admin/destinations
router.post('/destinations', upload.single('image'), async (req, res) => {
    try {
        const { name, altitude_range, trekking_complexity, duration, price_range, region, description } = req.body;
        const imageUrl = req.file ? req.file.filename : null;

        if (!name) {
            return res.status(400).json({ message: 'Destination name is required.' });
        }

        const [result] = await pool.query(
            `INSERT INTO destinations (name, altitude_range, trekking_complexity, duration, price_range, region, description, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, altitude_range || null, trekking_complexity || null, duration || null, price_range || null, region || null, description || null, imageUrl]
        );

        res.status(201).json({ message: 'Destination created successfully.', id: result.insertId });
    } catch (err) {
        console.error('Admin destination upload error:', err);
        res.status(500).json({ message: 'Server error while uploading destination' });
    }
});

// GET /api/admin/destinations
router.get('/destinations', async (req, res) => {
    try {
        const [destinations] = await pool.query('SELECT * FROM destinations ORDER BY created_at DESC');
        res.status(200).json(destinations);
    } catch (err) {
        console.error('Admin fetch destinations error:', err);
        res.status(500).json({ message: 'Server error while fetching destinations' });
    }
});

// DELETE /api/admin/destinations/:id
router.delete('/destinations/:id', async (req, res) => {
    try {
        const destId = req.params.id;
        await pool.query('DELETE FROM destinations WHERE id = ?', [destId]);
        res.status(200).json({ message: 'Destination deleted successfully.' });
    } catch (err) {
        console.error('Admin delete destination error:', err);
        res.status(500).json({ message: 'Server error while deleting destination' });
    }
});

// PUT /api/admin/destinations/:id
router.put('/destinations/:id', upload.single('image'), async (req, res) => {
    try {
        const destId = req.params.id;
        const { name, altitude_range, trekking_complexity, duration, price_range, region, description } = req.body;
        const imageUrl = req.file ? req.file.filename : null;

        let query = `UPDATE destinations SET 
            name = ?, 
            altitude_range = ?, 
            trekking_complexity = ?, 
            duration = ?, 
            price_range = ?, 
            region = ?, 
            description = ?`;
        let params = [name, altitude_range, trekking_complexity, duration, price_range, region, description];

        if (imageUrl) {
            query += `, image_url = ?`;
            params.push(imageUrl);
        }

        query += ` WHERE id = ?`;
        params.push(destId);

        await pool.query(query, params);
        res.status(200).json({ message: 'Destination updated successfully!' });
    } catch (err) {
        console.error('Admin update destination error:', err);
        res.status(500).json({ message: 'Server error while updating destination' });
    }
});

module.exports = router;
