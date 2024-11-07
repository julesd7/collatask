const { pool } = require('../db');

const roleMiddleware = (requiredRoles = [], forbiddenRoles = []) => {
    return async (req, res, next) => {
        const userId = req.user.id;
        const { project_id } = req.params;

        const roleCheck = await pool.query(
            'SELECT role FROM project_assignments WHERE user_id = $1 AND project_id = $2',
            [userId, project_id]
        );

        if (roleCheck.rowCount === 0) {
            return res.status(403).json({ role: 'Forbidden access.' });
        }

        const userRole = roleCheck.rows[0].role;

        if (forbiddenRoles.includes(userRole)) {
            return res.status(403).json({ role: 'Forbidden access.' });
        }

        if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
            return res.status(403).json({ role: 'Forbidden access.' });
        }

        next();
    };
};

module.exports = { roleMiddleware };
