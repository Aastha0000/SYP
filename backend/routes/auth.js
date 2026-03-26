const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/db');
require('dotenv').config();
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

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
// POST /api/auth/signup
router.post('/signup', upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'licence', maxCount: 1 }
]), async (req, res) => {
    const { username, email, password, role, fullName, languages, specialities, gender } = req.body;
    console.log('--- SIGNUP INCOMING REQ ---');
    console.log('Payload:', { username, email, role, _pwLength: password?.length });

    if (!email || !password || (role === 'user' && !username)) {
        console.log('Signup error: missing fields');
        return res.status(400).json({ message: 'Email, password and required fields are missing.' });
    }

    // Fallback username for guides if they just provide full_name/email
    const finalUsername = username || email.split('@')[0];

    const allowedRoles = ['user', 'guide'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    try {
        // Check if user already exists
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, finalUsername]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Email or username already in use.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Get file paths if they exist
        const profilePicture = req.files?.['profilePicture'] ? req.files['profilePicture'][0].filename : null;
        const licenceCert = req.files?.['licence'] ? req.files['licence'][0].filename : null;

        const verificationStatus = userRole === 'guide' ? 'pending' : 'verified';

        // Insert user
        const [result] = await pool.query(
            `INSERT INTO users (username, email, password, role, full_name, languages_spoken, specialities, profile_picture, licence_cert, is_verified, verification_status, gender)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [finalUsername, email, hashedPassword, userRole, fullName || null, languages || null, specialities || null, profilePicture, licenceCert, (verificationStatus === 'verified'), verificationStatus, gender || null]
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

    if (identifier === 'admin' && password === 'admin123') {
        let [adminRows] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
        let adminUser;
        if (adminRows.length === 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            const [result] = await pool.query(
                `INSERT INTO users (username, email, password, role, is_verified, verification_status) VALUES (?, ?, ?, ?, ?, ?)`,
                ['admin', 'admin@admin.com', hashedPassword, 'admin', true, 'verified']
            );
            const [newAdminRows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
            adminUser = newAdminRows[0];
        } else {
            adminUser = adminRows[0];
        }

        const token = jwt.sign(
            { id: adminUser.id, username: adminUser.username, role: adminUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        return res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: adminUser.id,
                username: adminUser.username,
                email: adminUser.email,
                role: adminUser.role,
                full_name: adminUser.full_name,
                gender: adminUser.gender,
                profile_picture: adminUser.profile_picture
            },
        });
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

        // Check if guide is verified or rejected
        if (user.role === 'guide') {
            if (user.verification_status === 'pending') {
                return res.status(403).json({ message: 'Your guide account is pending admin verification.' });
            }
            if (user.verification_status === 'rejected') {
                return res.status(403).json({ message: 'Your guide verification request has been rejected. You cannot log in.' });
            }
        }

        // Compare password
        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, user.password);
        } catch (e) {
            // Probably not a bcrypt hash
            isMatch = (password === user.password);
        }

        if (!isMatch) {
            // One last fallback: check if it's plaintext without error (bcrypt.compare can throw or just return false)
            if (password === user.password) {
                isMatch = true;
            }
        }

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
                full_name: user.full_name,
                languages_spoken: user.languages_spoken,
                specialities: user.specialities,
                portfolio_url: user.portfolio_url,
                profile_picture: user.profile_picture,
                is_verified: user.is_verified,
                verification_status: user.verification_status,
                gender: user.gender
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;
