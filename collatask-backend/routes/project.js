// project.js
const express = require('express');
const router = express.Router();

// drizzle
const { eq, and } = require('drizzle-orm');
const { projects, projectAssignments } = require('../models');
const { db } = require('../db');

const { authenticateJWT } = require('../middleware/authMiddleware');

// Route to create a new project
router.post('/', authenticateJWT, async (req, res) => {
    const { title, description } = req.body;
    const ownerId = req.user.id;

    if (!title) {
        return res.status(400).json({ error: 'Project title is required' });
    }

    try {
        const result = await db.insert(projects).values({
            title,
            description,
            owner_id: ownerId,
        }).returning({ id: projects.id });

        const newProjectId = result[0].id;

        await db.insert(projectAssignments).values({
            user_id: ownerId,
            project_id: newProjectId,
            role: 'owner',
        });

        res.status(201).json({ message: 'Project created successfully', project_id: newProjectId });
    } catch (error) {
        console.error('Error creating project', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to get project details
router.get('/:project_id', authenticateJWT, async (req, res) => {
    const { project_id } = req.params;
    const userId = req.user.id;

    try {
        const projectResult = await db.select().from(projects).where(eq(projects.id, project_id));

        if (projectResult.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const roleResult = await db.select({role: projectAssignments.role}).from(projectAssignments).where(and(eq(projectAssignments.project_id, project_id), eq(projectAssignments.user_id, userId)));
        
        res.status(200).json({
            project: projectResult[0],
            role: roleResult[0].role,
        });
    } catch (error) {
        console.error('Error fetching project details', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to edit a project
router.put('/:project_id', authenticateJWT, async (req, res) => {
    const { project_id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;

    try {
        const roleCheck = await db.select({ role: projectAssignments.role }).from(projectAssignments).where(and(eq(projectAssignments.project_id, project_id), eq(projectAssignments.user_id, userId)));

        if (roleCheck.length === 0) {
            return res.status(403).json({ error: 'Forbidden access.' });
        }

        if (roleCheck[0].role !== 'owner' && roleCheck[0].role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden access.' });
        }

        const result = await db.update(projects).set({title: title, description: description}).where(eq(projects.id, project_id)).returning();

        if (result.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json(result[0]);
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
        const projectCheck = await db.select().from(projects).where(eq(projects.id, project_id));
        if (projectCheck.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const ownerCheck = await db.select({ owner_id: projects.owner_id }).from(projects).where(eq(projects.id, project_id));
        if (ownerCheck[0].owner_id !== userId) {
            return res.status(403).json({ error: 'Forbidden access.' });
        }

        console.log('deleting project');
        await db.delete(projects).where(eq(projects.id, project_id));

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
