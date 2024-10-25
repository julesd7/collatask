// project.js
const express = require('express');
const { pool } = require('../db');
const router = express.Router();

const { authenticateJWT } = require('../middleware/authMiddleware');

// Route to create a new project
router.post('/', authenticateJWT, async (req, res) => {
    const { name, description } = req.body;
    const ownerId = req.user.id;

    if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING id',
            [name, description, ownerId]
        );

        const newProjectId = result.rows[0].id;

        await pool.query(
            'INSERT INTO project_assignments (user_id, project_id, role) VALUES ($1, $2, $3)',
            [ownerId, newProjectId, 'owner']
        );

        res.status(201).json({ message: 'Project created successfully', project_id: newProjectId });
    } catch (error) {
        console.error('Error creating project', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to edit a project
router.put('/:project_id', authenticateJWT, async (req, res) => {
    const { project_id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    try {
        const roleCheck = await pool.query(
            'SELECT role FROM project_assignments WHERE user_id = $1 AND project_id = $2',
            [userId, project_id]
        );

        if (roleCheck.rowCount === 0) {
            return res.status(403).json({ error: 'Forbidden access.' });
        }

        const userRole = roleCheck.rows[0].role;
        if (userRole !== 'owner' && userRole !== 'admin') {
            return res.status(403).json({ error: 'Forbidden access.' });
        }

        const updates = [];
        const values = [];

        if (name) {
            updates.push(`name = $${updates.length + 1}`);
            values.push(name);
        }
        if (description) {
            updates.push(`description = $${updates.length + 1}`);
            values.push(description);
        }

        if (updates.length === 0) {
            return res.status(204).send();
        }

        values.push(project_id);

        const query = `UPDATE projects SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`;
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const updatedProject = result.rows[0];
        res.status(200).json(updatedProject);
    } catch (error) {
        console.error('Error updating project', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route pour delete a project
router.delete('/:project_id', authenticateJWT, async (req, res) => {
    const { project_id } = req.params;
    const userId = req.user.id;

    try {

        const projectCheck = await pool.query(
            'SELECT * FROM projects WHERE id = $1',
            [project_id]
        );

        if (projectCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const roleCheck = await pool.query(
            'SELECT owner_id FROM projects WHERE id = $1',
            [project_id]
        );
        
        const userRole = roleCheck.rows[0].role;
        if (roleCheck.rows[0].owner_id !== userId) {
            return res.status(403).json({ error: 'Forbidden access.' });
        }

        const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);

        const deletedProject = result.rows[0];
        res.status(200).json({ message: 'Project deleted successfully', project: deletedProject });
    } catch (error) {
        console.error('Error deleting project', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
