// project.js
const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// Route to create a new project
router.post('/', async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );

        const newProject = result.rows[0];
        res.status(201).json(newProject);
    } catch (error) {
        console.error('Error creating project', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to get edit a project
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id, name, description } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const roleCheck = await pool.query(
            'SELECT role FROM project_assignments WHERE user_id = $1 AND project_id = $2',
            [user_id, id]
        );

        if (roleCheck.rowCount === 0) {
            return res.status(403).json({ error: 'User is not assigned to this project' });
        }

        const userRole = roleCheck.rows[0].role;
        if (userRole !== 'owner') {
            return res.status(403).json({ error: 'Only the project owner can modify this project' });
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
            return res.status(400).json({ error: 'At least one field (name or description) is required to update' });
        }

        values.push(id);

        const query = `UPDATE projects SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`;
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const updatedProject = result.rows[0];
        res.json(updatedProject);
    } catch (error) {
        console.error('Error updating project', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route pour delete a project
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const roleCheck = await pool.query(
            'SELECT role FROM project_assignments WHERE user_id = $1 AND project_id = $2',
            [user_id, id]
        );

        if (roleCheck.rowCount === 0) {
            return res.status(403).json({ error: 'User is not assigned to this project' });
        }

        const userRole = roleCheck.rows[0].role;
        if (userRole !== 'owner') {
            return res.status(403).json({ error: 'Only the project owner can delete this project' });
        }

        const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const deletedProject = result.rows[0];
        res.status(200).json({ message: 'Project deleted successfully', project: deletedProject });
    } catch (error) {
        console.error('Error deleting project', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
