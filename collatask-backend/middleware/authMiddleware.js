const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const authenticateJWT = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.sendStatus(401).json({ error: 'Unauthorized access.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        const user = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
        req.user = { ...req.user, ...user.rows[0] };

        next();
    } catch (err) {
        return res.sendStatus(403).json({ error: 'Forbidden access.' });
    }
};

module.exports = { authenticateJWT };
