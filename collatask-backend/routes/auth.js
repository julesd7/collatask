// auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const router = express.Router();

// Function to generate a refresh token
const generateRefreshToken = (userId, rememberMe) => {
    const refreshTokenExpiry = rememberMe ? '30d' : '7d';  
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: refreshTokenExpiry });
};

// Route for registration (register)
router.post('/register', async (req, res) => {
    const { username, email, password, rememberMe } = req.body;

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
        const expiresIn = rememberMe ? '7d' : '1d';  // Access token expiry
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });

        const refreshToken = generateRefreshToken(userId, rememberMe);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  // Use HTTPS in production
            maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 30 days or 7 days
        });

        res.status(201).json({
            message: 'User registered successfully.',
            user_id: userId,
            token: token,
        });
    } catch (error) {
        console.error('Error registering user', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { identifier, password, rememberMe } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
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

        const expiresIn = rememberMe ? '7d' : '1d';  // Access token expiry
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn });

        const refreshToken = generateRefreshToken(user.id, rememberMe);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
            maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 30 days or 7 days
        });

        res.status(200).json({
            token: token,
        });
    } catch (error) {
        console.error('Error logging in user', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for refreshing the access token
router.post('/refresh-token', (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    try {
        jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid refresh token' });
            }

            const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

            res.status(200).json({ token: newAccessToken });
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for logging out
router.post('/logout', (req, res) => {
    try {
        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
