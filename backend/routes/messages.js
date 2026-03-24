const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// POST /api/messages - Send a message
router.post('/', async (req, res) => {
    const { sender_id, receiver_id, content } = req.body;

    if (!sender_id || !receiver_id || !content) {
        return res.status(400).json({ message: 'Missing required message fields.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
            [sender_id, receiver_id, content]
        );
        res.status(201).json({ id: result.insertId, sender_id, receiver_id, content, created_at: new Date() });
    } catch (err) {
        console.error('Send message error:', err);
        res.status(500).json({ message: 'Server error sending message.' });
    }
});

// GET /api/messages/inbox/:userId - Get list of conversations for a user
router.get('/inbox/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    console.log('Fetching inbox for userId:', userId);
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.id, 
                u.username, 
                u.full_name, 
                u.profile_picture, 
                u.role,
                m.content as last_message,
                m.created_at as last_message_time,
                (SELECT COUNT(*) FROM messages m2 
                 WHERE m2.sender_id = u.id AND m2.receiver_id = ? AND m2.is_read = FALSE) as unread_count
            FROM (
                SELECT MAX(id) as last_msg_id
                FROM messages
                WHERE sender_id = ? OR receiver_id = ?
                GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
            ) as last_msgs
            JOIN messages m ON m.id = last_msgs.last_msg_id
            JOIN users u ON u.id = IF(m.sender_id = ?, m.receiver_id, m.sender_id)
            ORDER BY m.created_at DESC
        `, [userId, userId, userId, userId]);
        console.log('Inbox rows found:', rows.length);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Fetch inbox error:', err);
        res.status(500).json({ message: 'Server error fetching inbox.' });
    }
});

// GET /api/messages/:userA/:userB - Get conversation between two users
router.get('/:userA/:userB', async (req, res) => {
    const { userA, userB } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT * FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?) 
               OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC
        `, [userA, userB, userB, userA]);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Fetch conversation error:', err);
        res.status(500).json({ message: 'Server error fetching conversation.' });
    }
});

// PUT /api/messages/read-all - Mark all messages in a conversation as read
router.put('/read-all', async (req, res) => {
    const { userId, otherId } = req.body;
    try {
        await pool.query(`
            UPDATE messages 
            SET is_read = TRUE 
            WHERE receiver_id = ? AND sender_id = ? AND is_read = FALSE
        `, [userId, otherId]);
        res.status(200).json({ message: 'Conversation marked as read' });
    } catch (err) {
        console.error('Mark as read error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/messages/unread-count/:userId - Get total unread count for navbar
router.get('/unread-count/:userId', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as unread_count FROM messages WHERE receiver_id = ? AND is_read = FALSE', [req.params.userId]);
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error('Fetch unread count error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
