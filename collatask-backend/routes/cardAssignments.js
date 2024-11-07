// cardAssignments.js
const express = require('express');
const { pool } = require('../db');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const router = express.Router();

// Endpoint to get all card assignments
router.get('/:card_id', authenticateJWT, async (req, res) => {
    const { card_id } = req.params;

    if (!card_id) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    const cardCheck = await pool.query(
        'SELECT * FROM cards WHERE id = $1',
        [card_id]
    );

    if (cardCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Card not found.' });
    }

    try {
        const cardAssignments = await pool.query('SELECT assignees_ids FROM cards WHERE id = $1', [card_id]);

        if (cardAssignments.rows[0].assignees_ids === null) {
            return res.status(404).json({ error: 'No card assignments found for this card.' });
        }

        res.status(200).json(cardAssignments.rows);
    } catch (error) {
        console.error('Error fetching card assignments', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to assign a user to a card
router.post('/:project_id/:card_id', authenticateJWT, roleMiddleware(['owner', 'admin']), async (req, res) => {
    const { project_id, card_id } = req.params;
    const { user_id } = req.body;

    if (!card_id || !user_id) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    const cardCheck = await pool.query(
        'SELECT * FROM cards WHERE id = $1',
        [card_id]
    );

    if (cardCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Project or card not found.' });
    }

    const projectCheck = await pool.query(
        'SELECT * FROM projects WHERE id = $1',
        [project_id]
    );

    if (projectCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Project or card not found.' });
    }

    const userCheck = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [user_id]
    );

    if (userCheck.rowCount === 0) {
        return res.status(404).json({ error: 'User not found.' });
    }

    const existingAssignment = await pool.query(
        'SELECT assignees_ids FROM cards WHERE id = $1 AND $2 = ANY(assignees_ids)',
        [card_id, user_id]
    );

    if (existingAssignment.rowCount > 0) {
        return res.status(409).json({ error: 'User already assigned to card.' });
    }

    try {
        await pool.query('UPDATE cards SET assignees_ids = array_append(assignees_ids, $1) WHERE id = $2', [user_id, card_id]);
        res.status(200).json({ message: 'User assigned to card successfully.' });
    } catch (error) {
        console.error('Error assigning user to card', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to unassign a user from a Card
router.delete('/:project_id/:card_id', authenticateJWT, roleMiddleware(['owner', 'admin']), async (req, res) => {
    const { project_id, card_id } = req.params;
    const user_id = req.body.user_id;

    if (!card_id || !user_id) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    const cardCheck = await pool.query(
        'SELECT * FROM cards WHERE id = $1',
        [card_id]
    );

    if (cardCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Project or card not found.' });
    }

    const projectCheck = await pool.query(
        'SELECT * FROM projects WHERE id = $1',
        [project_id]
    );

    if (projectCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Project or card not found.' });
    }

    const userCheck = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [user_id]
    );

    if (userCheck.rowCount === 0) {
        return res.status(404).json({ error: 'User not found.' });
    }

    const existingAssignment = await pool.query(
        'SELECT assignees_ids FROM cards WHERE id = $1 AND $2 = ANY(assignees_ids)',
        [card_id, user_id]
    );

    if (existingAssignment.rowCount === 0) {
        return res.status(404).json({ error: 'User not assigned to card.' });
    }

    try {
        await pool.query('UPDATE cards SET assignees_ids = array_remove(assignees_ids, $1) WHERE id = $2', [user_id, card_id]);
        res.status(200).json({ message: 'User unassigned from card successfully.' });
    } catch (error) {
        console.error('Error unassigning user from card', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
