// projectAssignments.js
const express = require('express');
const { pool } = require('../db');
const { authenticateJWT } = require('../middleware/authMiddleware');
const router = express.Router();

// Assign project to user
router.post('/assign/:project_id', authenticateJWT, async (req, res) => {
    const { project_id } = req.params;
    const { email, role } = req.body;
    const requesterId = req.user.id;

    const projectCheck = await pool.query(
        'SELECT * FROM projects WHERE id = $1',
        [project_id]
    );

    if (projectCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Project not found' });
    }

    if (!email || !project_id) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    try {
        const userCheck = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (userCheck.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user_id = userCheck.rows[0].id;

        const roleCheck = await pool.query(
            'SELECT role FROM project_assignments WHERE user_id = $1 AND project_id = $2',
            [requesterId, project_id]
        );

        if (roleCheck.rowCount === 0) {
            return res.status(403).json({ error: 'You are not assigned to this project' });
        }

        const requesterRole = roleCheck.rows[0].role;
        if (requesterRole !== 'owner' && requesterRole !== 'admin') {
            return res.status(403).json({ error: 'Only the project owner or administrator can assign users' });
        }

        const existingAssignment = await pool.query(
            'SELECT * FROM project_assignments WHERE user_id = $1 AND project_id = $2',
            [user_id, project_id]
        );

        if (existingAssignment.rowCount > 0) {
            return res.status(409).json({ error: 'User already assigned to this project' });
        }

        const userRole = role || 'viewer';

        const result = await pool.query(
            'INSERT INTO project_assignments (user_id, project_id, role) VALUES ($1, $2, $3) RETURNING *',
            [user_id, project_id, userRole]
        );

        res.status(201).json({ message: 'Project assigned successfully', assignment: result.rows[0] });
    } catch (error) {
        console.error('Error assigning project', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Change user role in project
router.put('/role/:project_id', authenticateJWT, async (req, res) => {
    const { project_id } = req.params;
    const { user_id, role } = req.body;
    const requesterId = req.user.id;

    if (!user_id || !project_id || !role) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    try {
        const projectCheck = await pool.query(
            'SELECT * FROM projects WHERE id = $1',
            [project_id]
        );

        if (projectCheck.rowCount === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
    
        const roleCheck = await pool.query(
            'SELECT role FROM project_assignments WHERE user_id = $1 AND project_id = $2',
            [requesterId, project_id]
        );

        if (roleCheck.rowCount === 0) {
            return res.status(403).json({ error: 'Forbidden access.' });
        };

        const requesterRole = roleCheck.rows[0].role;
        if (requesterRole !== 'owner' && requesterRole !== 'admin') {
            return res.status(403).json({ error: 'Forbidden access.' });
        };

        if (role === 'owner' && requesterRole !== 'owner') {
            return res.status(403).json({ error: 'Forbidden access.' });
        };

        const existingAssignment = await pool.query(
            'SELECT * FROM project_assignments WHERE user_id = $1 AND project_id = $2',
            [user_id, project_id]
        );

        if (existingAssignment.rowCount === 0) {
            return res.status(404).json({ error: 'User not assigned to this project.' });
        };

        if (role === 'admin' && requesterRole !== 'owner') {
            return res.status(403).json({ error: 'Forbidden access.' });
        };

        const ownerCheck = await pool.query(
            'SELECT role FROM project_assignments WHERE user_id = $1 AND project_id = $2',
            [user_id, project_id]
        );

        if ((ownerCheck.rows[0].role === 'owner' || ownerCheck.rows[0].role === 'admin') && requesterRole !== 'owner') {
            return res.status(403).json({ error: 'You cannot change the role of the project administrators' });
        };

        if (role === 'owner' && requesterRole === 'owner') {
            await pool.query(
               'UPDATE project_assignments SET role = $1 WHERE user_id = $2 AND project_id = $3',
                ['admin', requesterId, project_id]
            );
            await pool.query(
                'UPDATE projects SET owner_id = $1 WHERE id = $2',
                [user_id, project_id]
            );
        }

        await pool.query(
            'UPDATE project_assignments SET role = $1 WHERE user_id = $2 AND project_id = $3',
            [role, user_id, project_id]
        );


        res.status(200).json({ message: 'User role updated successfully.' });
    } catch (error) {
        console.error('Error updating user role', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Remove user from project
router.delete('/remove/:project_id', authenticateJWT, async (req, res) => {
    const { project_id } = req.params;
    const { user_id } = req.body;
    const requesterId = req.user.id;

    if (!user_id || !project_id) {
        return res.status(400).json({ error: 'Missing parameter.' });
    }

    try {
        const projectCheck = await pool.query(
            'SELECT * FROM projects WHERE id = $1',
            [project_id]
        );

        if (projectCheck.rowCount === 0) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        const roleCheck = await pool.query(
            'SELECT role FROM project_assignments WHERE user_id = $1 AND project_id = $2',
            [requesterId, project_id]
        );

        if (roleCheck.rowCount === 0) {
            return res.status(403).json({ error: 'Forbidden access.' });
        }

        const requesterRole = roleCheck.rows[0].role;
        if (requesterRole !== 'owner' && requesterRole !== 'admin') {
            return res.status(403).json({ error: 'Forbidden access.' });
        }

        const existingAssignment = await pool.query(
            'SELECT * FROM project_assignments WHERE user_id = $1 AND project_id = $2',
            [user_id, project_id]
        );

        if (existingAssignment.rowCount === 0) {
            return res.status(404).json({ error: 'User not assigned to this project.' });
        }

        const ownerCheck = await pool.query(
            'SELECT role FROM project_assignments WHERE user_id = $1 AND project_id = $2',
            [user_id, project_id]
        );

        if (ownerCheck.rows[0].role === 'owner') {
            return res.status(403).json({ error: 'Forbidden access.' });
        }

        await pool.query(
            'DELETE FROM project_assignments WHERE user_id = $1 AND project_id = $2',
            [user_id, project_id]
        );

        res.status(200).json({ message: 'User removed successfully.' });
    } catch (error) {
        console.error('Error removing user from project', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
