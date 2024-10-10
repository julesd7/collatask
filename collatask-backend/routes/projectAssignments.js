// routes/projectAssignments.js

const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// Assign project to user
router.post('/assign-project', async (req, res) => {
    const { user_id, project_id, role } = req.body;

    if (!user_id || !project_id) {
        return res.status(400).json({ error: 'User ID and Project ID are required' });
    }

    try {
        const existingAssignment = await pool.query(
            'SELECT * FROM project_assignments WHERE user_id = $1 AND project_id = $2',
            [user_id, project_id]
        );

        if (existingAssignment.rowCount > 0) {
            return res.status(400).json({ error: 'User already assigned to this project' });
        }

        const result = await pool.query(
            'INSERT INTO project_assignments (user_id, project_id, role) VALUES ($1, $2, $3) RETURNING *',
            [user_id, project_id, role || 'member']
        );

        res.status(201).json({ message: 'Project assigned successfully', assignment: result.rows[0] });
    } catch (error) {
        console.error('Error assigning project', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
