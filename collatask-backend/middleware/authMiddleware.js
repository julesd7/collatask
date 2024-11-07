const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const authenticateJWT = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ token: 'Unauthorized access.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        const user = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
        req.user = { ...req.user, ...user.rows[0] };

        next();
    } catch (err) {
        return res.status(403).json({ token: 'Forbidden access.' });
    }
};

module.exports = { authenticateJWT };
