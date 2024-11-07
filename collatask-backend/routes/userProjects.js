// userProjects.js
const express = require('express');
const { pool } = require('../db');
const { authenticateJWT } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all projects assigned to the authenticated user
router.get('/', authenticateJWT, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(`
            SELECT p.id AS project_id, p.title, p.description
            FROM projects p
            INNER JOIN project_assignments pa ON pa.project_id = p.id
            WHERE pa.user_id = $1
        `, [userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'No projects found for this user' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching projects for user', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
