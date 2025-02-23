// user.js
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// drizzle
const { eq, or } = require('drizzle-orm');
const { users } = require('../models');
const { db } = require('../db');

const { authenticateJWT } = require('../middleware/authMiddleware');

// Endpoint to get user information
router.get('/me', authenticateJWT, (req, res) => {
    res.status(200).json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        verified: req.user.verified,
        created_at: req.user.created_at,
    });
});

// Endpoint to update user information
router.put('/update', authenticateJWT, async (req, res) => {
    const { username, email, oldPass, newPass } = req.body;
    const userId = req.user.id;
    let hashedPassword = req.user.password;

    try {
        if (username || email) {
            const existingUserCheck = await db.select().from(users).where(or(eq(users.username, username), eq(users.email, email)), eq(users.id, userId));
            if (existingUserCheck.length > 0) {
                return res.status(409).json({ error: 'Username or email already exists.' });
            }
        }

        if (oldPass && newPass) {
            const validPassword = await bcrypt.compare(oldPass, hashedPassword);
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid password' });
            }
            hashedPassword = await bcrypt.hash(newPass, 10);
        }
        const updateData = {};
        if (username) updateData.username = username;
        if (oldPass && newPass) updateData.password = hashedPassword;

        if (email) {
            updateData.email = email;
            updateData.verified = false

            const verificationToken = jwt.sign({ email }, process.env.EMAIL_JWT_SECRET, { expiresIn: '1h' });
            updateData.verification_token = verificationToken;

            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: false,
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
                from: process.env.EMAIL_FROM,
                to: email,
                subject: 'Please verify your email address',
                text: `Click on the link to verify your email: ${process.env.FRONTEND_URL}/login?token=${verificationToken}`,
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Error sending verification email', err);
                    return res.status(500).json({ error: 'Error sending email' });
                }
            });
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(204).json({ error: 'No information provided to update.' });
        }
        await db.update(users).set(updateData).where(eq(users.id, userId));
        return res.status(200).json({ message: 'User information updated successfully.' });

    } catch (error) {
        console.error('Error updating user information', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Endpoint to delete user
router.delete('/delete', authenticateJWT, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await db.delete(users).where(eq(users.id, userId));
        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
