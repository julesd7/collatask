// cardAssignments.js
const express = require('express');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const router = express.Router();

// drizzle
const { eq, sql } = require('drizzle-orm');
const { cards, projects, users } = require('../models');
const { db } = require('../db');

// Endpoint to get all card assignments
router.get('/:card_id', authenticateJWT, async (req, res) => {
    const { card_id } = req.params;

    if (!card_id) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    const cardCheck = await db.select().from(cards).where(eq(cards.id, card_id));

    if (cardCheck.length === 0) {
        return res.status(404).json({ error: 'Card not found.' });
    }

    try {
        const cardAssignments = await db.select({ assignees_ids: cards.assignees_ids }).from(cards).where(eq(cards.id, card_id));

        if (cardAssignments[0].assignees_ids === null) {
            return res.status(404).json({ error: 'No card assignments found for this card.' });
        }

        res.status(200).json(cardAssignments);
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

    const cardCheck = await db.select().from(cards).where(eq(cards.id, card_id));

    if (cardCheck.length === 0) {
        return res.status(404).json({ error: 'Project or card not found.' });
    }

    const projectCheck = await db.select().from(projects).where(eq(projects.id, project_id));

    if (projectCheck.length === 0) {
        return res.status(404).json({ error: 'Project or card not found.' });
    }

    const userCheck = await db.select().from(users).where(eq(users.id, user_id));

    if (userCheck.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
    }

    const existingAssignment = await db.select({ assignees_ids: cards.assignees_ids }).from(cards).where(eq(cards.id, card_id));

    if (existingAssignment[0].assignees_ids !== null) {
        for (let i = 0; i < existingAssignment[0].assignees_ids.length; i++) {
            if (existingAssignment[0].assignees_ids[i] === user_id) {
                return res.status(409).json({ error: 'User already assigned to card.' });
            }
        }
    }

    try {
        await db.update(cards).set({ assignees_ids: sql` array_append(assignees_ids, ${user_id})` }).where(eq(cards.id, card_id));
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

    const cardCheck = await db.select().from(cards).where(eq(cards.id, card_id));

    if (cardCheck.length === 0) {
        return res.status(404).json({ error: 'Project or card not found.' });
    }

    const projectCheck = await db.select().from(projects).where(eq(projects.id, project_id));

    if (projectCheck.length === 0) {
        return res.status(404).json({ error: 'Project or card not found.' });
    }

    const userCheck = await db.select().from(users).where(eq(users.id, user_id));

    if (userCheck.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
    }

    try {
        await db.update(cards).set({ assignees_ids: sql` array_remove(assignees_ids, ${user_id})` }).where(eq(cards.id, card_id));
        res.status(200).json({ message: 'User unassigned from card successfully.' });
    } catch (error) {
        console.error('Error unassigning user from card', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
