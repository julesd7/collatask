// auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');

// drizzle
const { eq, or, and } = require('drizzle-orm');
const { users } = require('../models');
const { db } = require('../db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Function to generate a refresh token
const generateRefreshToken = (userId, rememberMe) => {
    const refreshTokenExpiry = rememberMe ? '30d' : '7d';  
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: refreshTokenExpiry });
};

// Register route
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ error: 'Username can only contain letters and numbers.' });
    }
    const usernameLower = username.toLowerCase();

    try {
        const userCheck = await db.select().from(users).where(
            or(
                eq(users.username, usernameLower),
                eq(users.email, email)
            )
        );

        if (userCheck.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = jwt.sign({ email }, process.env.EMAIL_JWT_SECRET, { expiresIn: '1h' });

        const result = await db.insert(users).values({
            username: usernameLower,
            email: email,
            password: hashedPassword,
            verification_token: verificationToken
        }).returning({id: users.id});

        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.eu',
            port: 587,
            secure: false, // STARTTLS → `secure: false`
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            connectionTimeout: 15000,
            tls: {
                rejectUnauthorized: false,
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Please verify your email address',
            text: `Click on the link to verify your email: ${process.env.FRONTEND_URL}/login?token=${verificationToken}`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending verification email', err);
                return res.status(500).json({ error: 'Error sending email' });
            }
            return res.status(201).json({
                message: 'User registered successfully. Please check your email to verify your account.',
                user_id: result[0].id,
            });
        });

    } catch (error) {
        console.error('Error registering user', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


// Login route
router.post('/login', async (req, res) => {
    const { identifier, password, rememberMe } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const identifierLower = isEmail ? identifier : identifier.toLowerCase();

    try {
        const result = await db.select().from(users).where(
            or(
                eq(users.username, identifierLower),
                eq(users.email, identifierLower)
            )
        );
        const user = result[0];

        if (!user) {
            console.error('User not found with identifier:', identifierLower);
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        if (!user.verified) {
            console.error('User has not verified their email:', user.username);
            return res.status(403).json({ error: 'Please verify your email before logging in.' });
        }

        if (user.password === null) {
            console.error('User registered via Google:', user.username);
            return res.status(401).json({ error: 'Please log in via Google.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error('Password does not match for user:', user.username);
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const expiresIn = rememberMe ? '7d' : '1d';  // Access token expiry
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'HTTPS', // Use HTTPS in production
            maxAge: 1 * 24 * 60 * 60 * 1000,
        });

        const refreshToken = generateRefreshToken(user.id, rememberMe);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'HTTPS', // Use HTTPS in production
            maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 30 days or 7 days
        });

        await db.update(users).set({ last_connection: new Date() }).where(eq(users.id, user.id));

        res.status(200).json({
            message: 'Logged in successfully',
        });
    } catch (error) {
        console.error('Error logging in user', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for Google login
router.post('/google', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Google token is required' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload.email;
        const username = payload.name;

        const existingUser = await db.select().from(users).where(eq(users.email, email));

        let finalUsername = username.toLowerCase();
        let existingUsername = await db.select().from(users).where(eq(users.username, finalUsername));

        while (existingUsername.length > 0 && existingUser.length === 0) {
            finalUsername = `${username.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
            existingUsername = await db.select().from(users).where(eq(users.username, finalUsername));
        }

        let user;

        if (existingUser.length > 0) {
            user = existingUser[0];
        } else {
            user = await db.insert(users).values({
                username: finalUsername.toLowerCase(),
                email: email,
                password: null,
                verified: true,
            }).returning({ id: users.id });

            user = user[0];
        }

        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const refreshToken = generateRefreshToken(user.id, true);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'HTTPS',
            maxAge: 1 * 24 * 60 * 60 * 1000,
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'HTTPS',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        db.update(users).set({ last_connection: new Date() }).where(eq(users.id, user.id));

        res.status(200).json({
            message: 'Logged in successfully via Google',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Error logging in with Google:', error);
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
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid refresh token' });
            }

            const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'HTTPS', // Use HTTPS in production
                maxAge: 1 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json({ message: 'Access token refreshed successfully' });
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for password reset
router.post('/reset', async (req, res) => {
    const { identifier } = req.body;

    if (!identifier) {
        return res.status(400).json({ error: 'Identifier (email or username) is required.' });
    }

    try {
        const result = await db.select().from(users).where(
            or(
                eq(users.username, identifier),
                eq(users.email, identifier)
            )
        );

        const user = result[0];

        if (!user) {
            console.error('No user found with identifier:', identifier);
            return res.status(404).json({ error: 'No user found with the provided identifier.' });
        }

        if (!user.verified) {
            console.error('User has not verified their email:', user.username);
            return res.status(403).json({ error: 'Please verify your email before requesting a password reset.' });
        }

        const resetToken = jwt.sign({ id: user.id, email: user.email }, process.env.RESET_JWT_SECRET, { expiresIn: '1h' });

        await db.update(users).set({ reset_token: resetToken }).where(eq(users.id, user.id));

        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.eu',
            port: 587,
            secure: false, // STARTTLS → `secure: false`
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            connectionTimeout: 15000,
            tls: {
                rejectUnauthorized: false,
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request',
            text: `Click on the link to reset your password: ${process.env.FRONTEND_URL}/reset?token=${resetToken}`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending password reset email:', err);
                return res.status(500).json({ error: 'Error sending reset email.' });
            }
            return res.status(200).json({ message: 'Password reset email sent successfully.' });
        });

    } catch (error) {
        console.error('Error processing password reset request:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Route to handle resetting the password after the email link is clicked
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.RESET_JWT_SECRET);

        const result = await db.select().from(users).where(
            and(
                eq(users.id, decoded.id),
                eq(users.reset_token, token)
            )
        );
        
        const user = result[0];

        if (!user) {
            console.error('Invalid or expired reset token:', token);
            return res.status(401).json({ error: 'Invalid or expired reset token.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.update(users).set({ password: hashedPassword, reset_token: null }).where(eq(users.id, user.id));

        return res.status(200).json({ message: 'Password reset successfully.' });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Reset token has expired.' });
        }
        console.error('Error resetting password:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// Route for verifying email
router.post('/verify-email', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Verification token is required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.EMAIL_JWT_SECRET);
        
        const user = await db.select().from(users).where(
            and(
                eq(users.email, decoded.email),
                eq(users.verification_token, token)
            )
        );

        if (user.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired verification token.' });
        }

        await db.update(users).set({ verified: true, verification_token: null }).where(eq(users.email, decoded.email));

        return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (err) {
        return res.status(400).json({ error: 'Invalid or expired verification token.' });
    }
});

// Route for logging out
router.post('/logout', (req, res) => {
    try {
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
