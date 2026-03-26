const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../db/db');

// POST /api/payments/create-payment-intent
router.post('/create-payment-intent', async (req, res) => {
    const { amount, currency, bookingDetails } = req.body;
    try {
        const { guide_id, user_id, booking_date } = bookingDetails;
        const gId = parseInt(guide_id);

        // 1. Initial double-booking check before taking money
        const [alreadyBooked] = await pool.query(
            'SELECT id FROM bookings WHERE guide_id = ? AND booking_date = ? AND status != "cancelled"',
            [gId, booking_date]
        );

        if (alreadyBooked.length > 0) {
            return res.status(409).json({ message: 'Guide is already booked for this date.' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'npr',
            payment_method_types: ['card'],
            metadata: {
                guide_id: String(gId),
                user_id: String(user_id),
                booking_date: booking_date
            }
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (err) {
        console.error('Stripe PaymentIntent error:', err);
        res.status(500).json({ message: 'Failed to create payment intent.' });
    }
});

// POST /api/payments/confirm
router.post('/confirm', async (req, res) => {
    const { paymentIntentId, bookingDetails } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            console.log('Confirming booking for:', bookingDetails);
            const { guide_id, user_id, booking_date } = bookingDetails;
            
            const gId = parseInt(guide_id);
            const uId = parseInt(user_id);

            // 1. Final double-booking check (safety first)
            const [alreadyBooked] = await pool.query(
                'SELECT id FROM bookings WHERE guide_id = ? AND booking_date = ? AND status != "cancelled"',
                [gId, booking_date]
            );

            if (alreadyBooked.length > 0) {
                 // The payment succeeded but someone else just finished booking! 
                 // In real app we'd refund here, but for now we block.
                 return res.status(409).json({ message: 'Guide was just booked by someone else.' });
            }

            // Check if this specific payment intent was already processed
            const [existing] = await pool.query('SELECT id FROM bookings WHERE stripe_payment_intent_id = ?', [paymentIntentId]);
            if (existing.length > 0) {
                return res.status(200).json({ message: 'Payment already processed.', bookingId: existing[0].id });
            }

            const amount = paymentIntent.amount / 100; // back to main currency unit

            // 1. Create booking
            const [result] = await pool.query(
                'INSERT INTO bookings (guide_id, user_id, booking_date, status, payment_status, amount, currency, stripe_payment_intent_id) VALUES (?, ?, ?, "confirmed", "paid", ?, ?, ?)',
                [gId, uId, booking_date, amount, paymentIntent.currency.toUpperCase(), paymentIntentId]
            );

            // 2. Update guide earnings
            await pool.query(
                'UPDATE users SET earnings = earnings + ? WHERE id = ?',
                [amount, gId]
            );

            res.status(200).json({ message: 'Booking confirmed and payment successful.', bookingId: result.insertId });
        } else {
            res.status(400).json({ message: 'Payment not successful.' });
        }
    } catch (err) {

        console.error('Payment confirmation error:', err);
        res.status(500).json({ message: 'Server error during payment confirmation.' });
    }
});

module.exports = router;
