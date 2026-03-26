const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const axios = require('axios'); // added for eSewa verification

const ESEWA_BASE = process.env.ESEWA_ENV === 'prod' ? 'https://esewa.com.np/epay' : 'https://uat.esewa.com.np/epay';
const ESEWA_MERCHANT = process.env.ESEWA_MERCHANT_ID || ''; // set in .env

// POST /api/bookings - Create a new booking (create as pending, return eSewa payment url)
router.post('/', async (req, res) => {
    const { guide_id, user_id, booking_date, amount, currency } = req.body;

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

        // Create booking as pending and payment_status pending — do NOT update earnings yet
        const bookingAmount = Number(amount || 2000);
        const [result] = await pool.query(
            'INSERT INTO bookings (guide_id, user_id, booking_date, status, payment_status, amount, currency) VALUES (?, ?, ?, "pending", "pending", ?, ?)',
            [guide_id, user_id, booking_date, bookingAmount, (currency || 'NPR')]
        );

        // Build eSewa payment URL (frontend should redirect user here)
        if (!ESEWA_MERCHANT) {
            return res.status(201).json({ message: 'Booking created (pending). eSewa not configured.', bookingId: result.insertId });
        }

        const psc = 0;
        const pdc = 0;
        const tAmt = bookingAmount; // total amount
        const su = `${process.env.CLIENT_URL}/esewa-success?bookingId=${result.insertId}`; // frontend handles redirect and can post verification
        const fu = `${process.env.CLIENT_URL}/esewa-fail?bookingId=${result.insertId}`;

        const esewaUrl = `${ESEWA_BASE}/main?amt=${tAmt}&psc=${psc}&pdc=${pdc}&tAmt=${tAmt}&pid=${result.insertId}&scd=${encodeURIComponent(ESEWA_MERCHANT)}&su=${encodeURIComponent(su)}&fu=${encodeURIComponent(fu)}`;

        return res.status(201).json({
            message: 'Booking created (pending). Redirect user to eSewa to pay.',
            bookingId: result.insertId,
            esewaUrl
        });
    } catch (err) {
        console.error('Booking error:', err);
        res.status(500).json({ message: 'Server error during booking.' });
    }
});

// POST /api/bookings/verify-esewa - Verify eSewa transaction and confirm booking
// expected body: { pid, amt, rid }
router.post('/verify-esewa', async (req, res) => {
    const { pid, amt, rid } = req.body;
    if (!pid || !amt || !rid) return res.status(400).json({ message: 'Missing pid/amt/rid' });
    if (!ESEWA_MERCHANT) return res.status(500).json({ message: 'eSewa not configured on server.' });

    try {
        // fetch booking and validate amounts match
        const [bookingRows] = await pool.query('SELECT id, guide_id, amount FROM bookings WHERE id = ?', [pid]);
        if (bookingRows.length === 0) return res.status(404).json({ message: 'Booking not found.' });
        const booking = bookingRows[0];
        const expectedAmt = Number(booking.amount);
        const sentAmt = Number(amt);
        if (Number.isFinite(expectedAmt) && expectedAmt !== sentAmt) {
            return res.status(400).json({ message: 'Amount mismatch', expected: expectedAmt, received: sentAmt });
        }

        const verificationUrl = `${ESEWA_BASE}/transrec`;
        const params = new URLSearchParams();
        params.append('amt', String(amt));
        params.append('pid', String(pid));
        params.append('scd', String(ESEWA_MERCHANT));
        params.append('rid', String(rid));

        const response = await axios.post(verificationUrl, params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 10000,
        });

        // Log full response for debugging
        console.log('eSewa verification response status:', response.status);
        console.log('eSewa verification response data:', response.data);

        const body = (response.data || '').toString().toLowerCase();
        if (body.includes('success')) {
            // update booking and guide earnings
            await pool.query('UPDATE bookings SET status = "confirmed", payment_status = "paid" WHERE id = ?', [pid]);
            await pool.query('UPDATE users SET earnings = earnings + ? WHERE id = ?', [sentAmt, booking.guide_id]);

            return res.status(200).json({ message: 'Payment verified, booking confirmed.' });
        } else {
            return res.status(400).json({ message: 'eSewa verification failed.', detail: response.data });
        }
    } catch (err) {
        console.error('eSewa verify error:', err?.response?.data || err.message || err);
        return res.status(500).json({ message: 'Server error verifying eSewa payment.' });
    }
});

// GET /api/bookings/esewa-callback - eSewa will redirect here with pid/amt/rid
// This route verifies automatically and returns a simple HTML or JSON response.
// Use CLIENT_URL to redirect user after verification as needed.
router.get('/esewa-callback', async (req, res) => {
    const { pid, amt, rid } = req.query;
    if (!pid || !amt || !rid) return res.status(400).send('Missing pid/amt/rid');

    // call same verification logic used by POST route
    try {
        const verificationUrl = `${ESEWA_BASE}/transrec`;
        const params = new URLSearchParams();
        params.append('amt', String(amt));
        params.append('pid', String(pid));
        params.append('scd', String(ESEWA_MERCHANT));
        params.append('rid', String(rid));

        const response = await axios.post(verificationUrl, params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 10000,
        });

        console.log('eSewa callback verification response:', response.data);
        const body = (response.data || '').toString().toLowerCase();
        if (body.includes('success')) {
            // update booking and guide earnings if not already updated
            const [bookingRows] = await pool.query('SELECT id, guide_id, amount, payment_status FROM bookings WHERE id = ?', [pid]);
            if (bookingRows.length === 0) return res.status(404).send('Booking not found.');

            const booking = bookingRows[0];
            if (booking.payment_status !== 'paid') {
                await pool.query('UPDATE bookings SET status = "confirmed", payment_status = "paid" WHERE id = ?', [pid]);
                await pool.query('UPDATE users SET earnings = earnings + ? WHERE id = ?', [Number(amt), booking.guide_id]);
            }

            // redirect user to client success page
            const clientSuccess = `${process.env.CLIENT_URL}/esewa-success?bookingId=${pid}`;
            return res.redirect(clientSuccess);
        } else {
            const clientFail = `${process.env.CLIENT_URL}/esewa-fail?bookingId=${pid}`;
            return res.redirect(clientFail);
        }
    } catch (err) {
        console.error('eSewa callback error:', err?.response?.data || err.message || err);
        return res.status(500).send('Server error verifying eSewa payment.');
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
