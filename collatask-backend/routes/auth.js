// auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const nodemailer = require('nodemailer');
const router = express.Router();

// Function to generate a refresh token
const generateRefreshToken = (userId, rememberMe) => {
    const refreshTokenExpiry = rememberMe ? '30d' : '7d';  
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: refreshTokenExpiry });
};

// Register route
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
        const verificationToken = jwt.sign({ email }, process.env.EMAIL_JWT_SECRET, { expiresIn: '1h' });

        const result = await pool.query(
            'INSERT INTO users (username, email, password, verified, verification_token) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [username, email, hashedPassword, false, verificationToken]
        );

        const userId = result.rows[0].id;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Please verify your email address',
            text: `Click on the link to verify your email: ${process.env.APP_URL}/api/auth/verify-email?token=${verificationToken}`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending verification email', err);
                return res.status(500).json({ error: 'Error sending email' });
            }
            return res.status(201).json({
                message: 'User registered successfully. Please check your email to verify your account.',
                user_id: userId,
            });
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

        if (!user.verified) {
            console.error('User has not verified their email:', user.username);
            return res.status(403).json({ error: 'Please verify your email before logging in.' });
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

// Route for verifying email
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.EMAIL_JWT_SECRET);

        const user = await pool.query('SELECT * FROM users WHERE email = $1 AND verification_token = $2', 
            [decoded.email, token]);

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired verification token.' });
        }

        await pool.query('UPDATE users SET verified = $1, verification_token = $2 WHERE email = $3', 
            [true, null, decoded.email]);

        return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (err) {
        return res.status(400).json({ error: 'Invalid or expired verification token.' });
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
