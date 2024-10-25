// auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const router = express.Router();

// Route to register a new user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const userCheck = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (userCheck.rows.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
            [username, email, hashedPassword]
        );

        const userId = result.rows[0].id;
        res.status(201).json({ message: 'User registered successfully.', user_id: userId });
    } catch (error) {
        console.error('Error registering user', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to log in a user
router.post('/login', async (req, res) => {

    const { identifier, password, rememberMe } = req.body;

    if (!identifier) {
        return res.status(400).json({ error: 'All fields are required..' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [identifier, identifier]
        );
        const user = result.rows[0];

        if (!user) {
            console.error('User not found with identifier:', identifier);
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error('Password does not match for user:', user.username);
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const expiresIn = rememberMe ? '14d' : '1h';
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn });

        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in user', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
