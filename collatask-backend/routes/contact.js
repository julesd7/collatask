const express = require('express');
const { authenticateJWT } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');

const router = express.Router();

router.post('/', authenticateJWT, async (req, res) => {
    const { name, email, message } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!name || !email || !message) {
        return res.status(400).send('Name, email, and message are required.');
    }

    const emailContent = `
        Name: ${name}
        Email: ${email}
        User ID: ${userId}
        Associated Email: ${userEmail}
        Message: \n\n${message}\n\n
        End of message.
    `;

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
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
        from: process.env.EMAIL_FROM,
        to: process.env.CONTACT_EMAIL,
        subject: `Message from ${name} | Contact`,
        text: emailContent,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send('Email sent successfully.');
    } catch (error) {
        res.status(500).send('Error sending email: ' + error.message);
    }
});

module.exports = router;