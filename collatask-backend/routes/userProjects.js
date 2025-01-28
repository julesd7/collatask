// userProjects.js
const express = require('express');
const { authenticateJWT } = require('../middleware/authMiddleware');
const router = express.Router();

// drizzle
const { eq, or, and, sql } = require('drizzle-orm');
const { cards, projects, users, projectAssignments } = require('../models');
const { db } = require('../db');

// Get all projects assigned to the authenticated user
router.get('/', authenticateJWT, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await db.select({id: projects.id, title: projects.title, description: projects.description}).from(projects).innerJoin(
            projectAssignments, eq(projectAssignments.project_id, projects.id)).where(eq(projectAssignments.user_id, userId)).orderBy(sql`${projects.updated_at} DESC`);
        if (result.length === 0) {
            return res.status(404).json({ error: 'No projects found for this user' });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching projects for user', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to get the projects assigned to the authenticated user ordered by last updated
router.get('/recent', authenticateJWT, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await db.select({id: projects.id, title: projects.title, description: projects.description, updated_at: projects.updated_at}).from(projects).innerJoin(
            projectAssignments, eq(projectAssignments.project_id, projects.id)).where(eq(projectAssignments.user_id, userId)).orderBy(sql`${projects.updated_at} DESC`);
        if (result.length === 0) {
            return res.status(404).json({ error: 'No projects found for this user' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching recent projects for user', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
