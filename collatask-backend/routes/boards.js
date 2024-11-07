// boards.js
const express = require('express');
const { pool } = require('../db');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const router = express.Router();

// Endpoint to get all boards from a project
router.get('/:project_id', authenticateJWT, async (req, res) => {
    const { project_id } = req.params;

    if (!project_id) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    const projectCheck = await pool.query(
        'SELECT * FROM projects WHERE id = $1',
        [project_id]
    );

    if (projectCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Project not found.' });
    }

    try {
        const boards = await pool.query('SELECT * FROM boards WHERE project_id = $1', [project_id]);

        if (boards.rowCount === 0) {
            return res.status(404).json({ error: 'No boards found for this project.' });
        }
        res.status(200).json(boards.rows);
    } catch (error) {
        console.error('Error fetching boards', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to create a new board
router.post('/:project_id', authenticateJWT, roleMiddleware(['owner', 'admin']), async (req, res) => {
    const { project_id } = req.params;
    const { title } = req.body;

    if (!project_id || !title) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    const projectCheck = await pool.query(
        'SELECT * FROM projects WHERE id = $1',
        [project_id]
    );

    if (projectCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Project not found.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO boards (title, project_id) VALUES ($1, $2) RETURNING id',
            [title, project_id]
        );

        const newBoardId = result.rows[0].id;

        res.status(201).json({ message: 'Board created successfully', board_id: newBoardId });
    } catch (error) {
        console.error('Error creating board', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to edit a board
router.put('/:project_id/:board_id', authenticateJWT, roleMiddleware(['owner', 'admin']), async (req, res) => {
    const { board_id } = req.params;
    const { title } = req.body;

    if (!board_id || !title) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    try {
        const result = await pool.query(
            'UPDATE boards SET title = $1 WHERE id = $2 RETURNING *',
            [title, board_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Board not found.' });
        }

        res.status(200).json({ message: 'Board updated successfully', board: result.rows[0] });
    } catch (error) {
        console.error('Error updating board', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to delete a board
router.delete('/:project_id/:board_id', authenticateJWT, roleMiddleware(['owner', 'admin']), async (req, res) => {
    const { board_id } = req.params;

    if (!board_id) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM boards WHERE id = $1 RETURNING *',
            [board_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Board not found.' });
        }

        res.status(200).json({ message: 'Board deleted successfully' });
    } catch (error) {
        console.error('Error deleting board', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
