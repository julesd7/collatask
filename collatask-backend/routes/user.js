const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const router = express.Router();

const { authenticateJWT } = require('../middleware/authMiddleware');

router.get('/me', authenticateJWT, (req, res) => {
    res.json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        created_at: req.user.created_at,
    });
});

// Endpoint to update user information
router.put('/update', authenticateJWT, async (req, res) => {
    const { username, email, password } = req.body;
    const userId = req.user.id;

    try {
        if (username || email) {
            const existingUserCheck = await pool.query(
                'SELECT * FROM users WHERE (username = $1 OR email = $2) AND id != $3',
                [username, email, userId]
            );

            if (existingUserCheck.rows.length > 0) {
                return res.status(400).json({ error: 'Username or email already exists.' });
            }
        }

        const updates = [];
        const values = [];

        if (username) {
            updates.push(`username = $${updates.length + 1}`);
            values.push(username);
        }

        if (email) {
            updates.push(`email = $${updates.length + 1}`);
            values.push(email);
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push(`password = $${updates.length + 1}`);
            values.push(hashedPassword);
        }

        if (updates.length > 0) {
            const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${updates.length + 1}`;
            values.push(userId);

            await pool.query(query, values);
            return res.status(200).json({ message: 'User information updated successfully.' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error updating user information', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Endpoint pour supprimer l'utilisateur
router.delete('/delete', authenticateJWT, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
