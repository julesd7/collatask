const { eq, and } = require('drizzle-orm');
const { projectAssignments } = require('../models');
const { db } = require('../db');

const roleMiddleware = (requiredRoles = [], forbiddenRoles = []) => {
    return async (req, res, next) => {
        const userId = req.user.id;
        const { project_id } = req.params;

        const roleCheck = await db.select({role: projectAssignments.role}).from(projectAssignments).where(
            and(
                eq(projectAssignments.user_id, userId),
                eq(projectAssignments.project_id, project_id)
            )
        );

        if (roleCheck.length === 0) {
            return res.status(403).json({ role: 'Forbidden access.' });
        }

        const userRole = roleCheck[0].role;

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
