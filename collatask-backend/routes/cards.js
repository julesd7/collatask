//cards.js
const express = require('express');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const router = express.Router();

// drizzle
const { eq, and, sql } = require('drizzle-orm');
const { cards, projects, boards, projectAssignments } = require('../models');
const { db } = require('../db');

// Endpoint to get all cards
router.get('/:project_id/:board_id', authenticateJWT, async (req, res) => {
    const { project_id, board_id } = req.params;

    if (!project_id || !board_id) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    const projectCheck = await db.select().from(projects).where(eq(projects.id, project_id));

    if (projectCheck.length === 0) {
        return res.status(404).json({ error: 'Project not found.' });
    }

    const boardCheck = await db.select().from(boards).where(and(eq(boards.id, board_id), eq(boards.project_id, project_id)));

    if (boardCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Board not found.' });
    }

    try {
        const cardsResult = await db.select().from(cards).where(and(eq(cards.project_id, project_id), eq(cards.board_id, board_id)));

        if (cardsResult.length === 0) {
            return res.status(204).send();
        }
        res.status(200).json(cardsResult);
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

    const projectCheck = await db.select().from(projects).where(eq(projects.id, project_id));

    if (projectCheck.length === 0) {
        return res.status(404).json({ error: 'Project or board not found.' });
    }

    const existingAssignment = await db.select().from(projectAssignments).where(and(eq(projectAssignments.user_id, user_id), eq(projectAssignments.project_id, project_id)));

    if (existingAssignment.length === 0) {
        return res.status(403).json({ error: 'User not assigned to this project.' });
    }

    const boardCheck = await db.select().from(boards).where(and(eq(boards.id, board_id), eq(boards.project_id, project_id)));

    if (boardCheck.length === 0) {
        return res.status(404).json({ error: 'Project or board not found.' });
    }

    try {
        const result = await db.insert(cards).values({
                project_id: project_id,
                board_id: board_id,
                title: title,
                description: description,
                start_date: start_date,
                end_date: end_date
            }
        ).returning({ id: cards.id });    

        res.status(201).json({ message: 'Card created successfully.', card_id: result[0].id });
    } catch (error) {
        console.error('Error creating card', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to change the card associated board
router.put('/move/:project_id/:board_id/:card_id', authenticateJWT, roleMiddleware([],['viewer']), async (req, res) => {
    const { project_id, board_id, card_id } = req.params;
    const { new_board_id } = req.body;
    const user_id = req.user.id;

    if (!project_id || !board_id || !card_id || !new_board_id) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    const projectCheck = await db.select().from(projects).where(eq(projects.id, project_id));

    if (projectCheck.length === 0) {
        return res.status(404).json({ error: 'Project, board, or card not found.' });
    }

    const existingAssignment = await db.select().from(projectAssignments).where(and(eq(projectAssignments.user_id, user_id), eq(projectAssignments.project_id, project_id)));
    
    if (existingAssignment.length === 0) {
        return res.status(404).json({ error: 'User not assigned to this project.' });
    }

    const boardCheck = await db.select().from(boards).where(and(eq(boards.id, board_id), eq(boards.project_id, project_id)));

    if (boardCheck.length === 0) {
        return res.status(404).json({ error: 'Project, board, or card not found.' });
    }

    const newBoardCheck = await db.select({id: boards.id}).from(boards).where(and(eq(boards.id, new_board_id), eq(boards.project_id, project_id)));

    if (newBoardCheck.length === 0) {
        return res.status(404).json({ error: 'Project, board, or card not found.' });
    }

    const newBoardUUID = newBoardCheck[0].id;

    const cardCheck = await db.select().from(cards).where(and(eq(cards.id, card_id), eq(cards.project_id, project_id), eq(cards.board_id, board_id)));

    if (cardCheck.length === 0) {
        return res.status(404).json({ error: 'Project, board, or card not found.' });
    }

    try {
        await db.update(cards).set({ board_id: newBoardUUID }).where(eq(cards.id, card_id));
        await db.update(projects).set({updated_at: sql`NOW()`}).where(eq(projects.id, project_id));
        res.status(200).json({ message: 'Card moved successfully.' });
    } catch (error) {
        console.error('Error moving card', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to update a card
router.put('/:project_id/:card_id', authenticateJWT, roleMiddleware([],['viewer']), async (req, res) => {
    const { project_id, card_id } = req.params;
    const { title, description, start_date, end_date } = req.body;
    const user_id = req.user.id;

    if (!project_id || !card_id) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    if (!title && !description && !start_date && !end_date) {
        return res.status(204).send();
    }

    const projectCheck = await db.select().from(projects).where(eq(projects.id, project_id));

    if (projectCheck.length === 0) {
        return res.status(404).json({ error: 'Project, or card not found.' });
    }

    const existingAssignment = await db.select().from(projectAssignments).where(and(eq(projectAssignments.user_id, user_id), eq(projectAssignments.project_id, project_id)));

    if (existingAssignment.length === 0) {
        return res.status(404).json({ error: 'User not assigned to this project.' });
    }

    const cardCheck = await db.select().from(cards).where(and(eq(cards.id, card_id), eq(cards.project_id, project_id)));

    if (cardCheck.length === 0) {
        return res.status(404).json({ error: 'Project, or card not found.' });
    }

    try {
        await db.update(cards).set({
                title: title,
                description: description,
                start_date: start_date,
                end_date: end_date
            }
        ).where(eq(cards.id, card_id));

        res.status(200).json({ message: 'Card updated successfully.' });
    } catch (error) {
        console.error('Error updating card', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to delete a card
router.delete('/:project_id/:card_id', authenticateJWT, roleMiddleware([],['viewer']), async (req, res) => {
    const { project_id, card_id } = req.params;
    const user_id = req.user.id;

    if (!project_id || !card_id) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    const projectCheck = await db.select().from(projects).where(eq(projects.id, project_id));
    if (projectCheck.length === 0) {
        return res.status(404).json({ error: 'Project, board, or card not found.' });
    }

    const existingAssignment = await db.select().from(projectAssignments).where(and(eq(projectAssignments.user_id, user_id), eq(projectAssignments.project_id, project_id)));
    if (existingAssignment.length === 0) {
        return res.status(404).json({ error: 'User not assigned to this project.' });
    }

    const cardCheck = await db.select().from(cards).where(and(eq(cards.id, card_id), eq(cards.project_id, project_id)));
    if (cardCheck.length === 0) {
        return res.status(404).json({ error: 'Project, board, or card not found.' });
    }

    try {
        await db.delete(cards).where(eq(cards.id, card_id));
        res.status(200).json({ message: 'Card deleted successfully.' });
    } catch (error) {
        console.error('Error deleting card', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
