const jwt = require('jsonwebtoken');
const { users } = require('../models');
const { eq } = require('drizzle-orm');
const { db } = require('../db');

const authenticateJWT = async (req, res, next) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ token: 'Unauthorized access.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        const user = await db.select().from(users).where(eq(users.id, decoded.id));
        req.user = { ...req.user, ...user[0] };

        next();
    } catch (err) {
        return res.status(403).json({ token: 'Forbidden access.' });
    }
};

module.exports = { authenticateJWT };
