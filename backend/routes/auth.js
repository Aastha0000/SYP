const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/db');
require('dotenv').config();

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    const { username, email, password, role } = req.body;
    console.log('--- SIGNUP INCOMING REQ ---');
    console.log('Payload:', { username, email, role, _pwLength: password?.length });

    if (!username || !email || !password) {
        console.log('Signup error: missing fields');
        return res.status(400).json({ message: 'Username, email and password are required.' });
    }

    const allowedRoles = ['user', 'guide'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    try {
        // Check if user already exists
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Email or username already in use.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, userRole]
        );

        return res.status(201).json({
            message: 'Account created successfully.',
            userId: result.insertId,
        });
    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ message: 'Server error during signup: ' + err.message });
    }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body; // identifier = email or username

    if (!identifier || !password) {
        return res.status(400).json({ message: 'Identifier and password are required.' });
    }

    try {
        // Find user by email OR username
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [identifier, identifier]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = rows[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;
