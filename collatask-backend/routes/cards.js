//cards.js
const express = require('express');
const { pool } = require('../db');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const router = express.Router();

// Endpoint to get all cards
router.get('/:project_id/:board_id', authenticateJWT, roleMiddleware([],[]), async (req, res) => {
    const { project_id, board_id } = req.params;

    if (!project_id || !board_id) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    const projectCheck = await pool.query(
        'SELECT * FROM projects WHERE id = $1',
        [project_id]
    );

    if (projectCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Project or board not found.' });
    }

    const boardCheck = await pool.query(
        'SELECT * FROM boards WHERE id = $1 AND project_id = $2',
        [board_id, project_id]
    );

    if (boardCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Project or board not found.' });
    }

    try {
        const cards = await pool.query('SELECT * FROM cards WHERE project_id = $1 AND board_id = $2', [project_id, board_id]);

        if (cards.rowCount === 0) {
            return res.status(404).json({ error: 'No cards found for this project and board.' });
        }
        res.status(200).json(cards.rows);
    } catch (error) {
        console.error('Error fetching cards', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to create a new card
router.post('/:project_id/:board_id', authenticateJWT, roleMiddleware([],['viewer']), async (req, res) => {
    const { project_id, board_id } = req.params;
    const { title, description, start_date, end_date } = req.body;
    const user_id = req.user.id;

    if (!project_id || !board_id || !title) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    const projectCheck = await pool.query(
        'SELECT * FROM projects WHERE id = $1',
        [project_id]
    );

    if (projectCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Project or board not found.' });
    }

    const existingAssignment = await pool.query(
        'SELECT * FROM project_assignments WHERE user_id = $1 AND project_id = $2',
        [user_id, project_id]
    );

    if (existingAssignment.rowCount === 0) {
        return res.status(403).json({ error: 'User not assigned to this project.' });
    }

    const boardCheck = await pool.query(
        'SELECT * FROM boards WHERE id = $1 AND project_id = $2',
        [board_id, project_id]
    );

    if (boardCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Project or board not found.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO cards (project_id, board_id, title, description, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [project_id, board_id, title, description, start_date, end_date]
        );

        res.status(201).json({ message: 'Card created successfully.', card_id: result.rows[0].id });
    } catch (error) {
        console.error('Error creating card', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to update a card
router.put('/:project_id/:board_id/:card_id', authenticateJWT, roleMiddleware([],['viewer']), async (req, res) => {
    const { project_id, board_id, card_id } = req.params;
    const { title, description, start_date, end_date } = req.body;
    const user_id = req.user.id;

    if (!project_id || !board_id || !card_id) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    const projectCheck = await pool.query(
        'SELECT * FROM projects WHERE id = $1',
        [project_id]
    );

    if (projectCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Project, board, or card not found.' });
    }

    const existingAssignment = await pool.query(
        'SELECT * FROM project_assignments WHERE user_id = $1 AND project_id = $2',
        [user_id, project_id]
    );

    if (existingAssignment.rowCount === 0) {
        return res.status(404).json({ error: 'User not assigned to this project.' });
    }

    const boardCheck = await pool.query(
        'SELECT * FROM boards WHERE id = $1 AND project_id = $2',
        [board_id, project_id]
    );

    if (boardCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Project, board, or card not found.' });
    }

    const cardCheck = await pool.query(
        'SELECT * FROM cards WHERE id = $1 AND project_id = $2 AND board_id = $3',
        [card_id, project_id, board_id]
    );

    if (cardCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Project, board, or card not found.' });
    }

    if (!title && !description && !start_date && !end_date) {
        return res.status(204).send();
    }

    try {
        await pool.query(
            'UPDATE cards SET title = $1, description = $2, start_date = $3, end_date = $4 WHERE id = $5',
            [title, description, start_date, end_date, card_id]
        );

        res.status(200).json({ message: 'Card updated successfully.' });
    } catch (error) {
        console.error('Error updating card', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to delete a card
router.delete('/:project_id/:board_id/:card_id', authenticateJWT, roleMiddleware([],['viewer']), async (req, res) => {
    const { project_id, board_id, card_id } = req.params;
    const user_id = req.user.id;

    if (!project_id || !board_id || !card_id) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    const projectCheck = await pool.query(
        'SELECT * FROM projects WHERE id = $1',
        [project_id]
    );

    if (projectCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Project, board, or card not found.' });
    }

    const existingAssignment = await pool.query(
        'SELECT * FROM project_assignments WHERE user_id = $1 AND project_id = $2',
        [user_id, project_id]
    );

    if (existingAssignment.rowCount === 0) {
        return res.status(404).json({ error: 'User not assigned to this project.' });
    }

    const boardCheck = await pool.query(
        'SELECT * FROM boards WHERE id = $1 AND project_id = $2',
        [board_id, project_id]
    );

    if (boardCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Project, board, or card not found.' });
    }

    const cardCheck = await pool.query(
        'SELECT * FROM cards WHERE id = $1 AND project_id = $2 AND board_id = $3',
        [card_id, project_id, board_id]
    );

    if (cardCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Project, board, or card not found.' });
    }

    try {
        await pool.query(
            'DELETE FROM cards WHERE id = $1',
            [card_id]
        );

        res.status(200).json({ message: 'Card deleted successfully.' });
    } catch (error) {
        console.error('Error deleting card', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;