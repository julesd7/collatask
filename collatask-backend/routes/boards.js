// boards.js
const express = require('express');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const router = express.Router();

// drizzle
const { eq, or, and } = require('drizzle-orm');
const { projects, boards } = require('../models');
const { db } = require('../db');

// Endpoint to get all boards from a project
router.get('/:project_id', authenticateJWT, async (req, res) => {
    const { project_id } = req.params;

    if (!project_id) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    const projectCheck = await db.select().from(projects).where(eq(projects.id, project_id));

    if (projectCheck.length === 0) {
        return res.status(404).json({ error: 'Project not found.' });
    }

    try {
        const boardsResults = await db.select().from(boards).where(eq(boards.project_id, project_id)).orderBy(boards.created_at, 'asc');

        if (boardsResults.length === 0) {
            return res.status(204).send();
        }
        res.status(200).json(boardsResults);
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

    const projectCheck = await db.select().from(projects).where(eq(projects.id, project_id));

    if (projectCheck.length === 0) {
        return res.status(404).json({ error: 'Project not found.' });
    }

    try {
        const result = await db.insert(boards).values({ 
                title: title, 
                project_id: project_id
            }
        ).returning({ id: boards.id });

        res.status(201).json({ message: 'Board created successfully', board_id: result[0].id });
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
        const result = await db.update(boards).set({ title: title }).where(eq(boards.id, board_id)).returning();

        if (result.length === 0) {
            return res.status(404).json({ error: 'Board not found.' });
        }
        res.status(200).json({ message: 'Board updated successfully', board: result });
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
        const result = await db.delete(boards).where(eq(boards.id, board_id));

        if (result.length === 0) {
            return res.status(404).json({ error: 'Board not found.' });
        }

        res.status(200).json({ message: 'Board deleted successfully' });
    } catch (error) {
        console.error('Error deleting board', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
