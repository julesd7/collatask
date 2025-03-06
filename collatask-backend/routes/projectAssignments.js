// projectAssignments.js
const express = require('express');
const { authenticateJWT } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const router = express.Router();

// drizzle
const { eq, and, sql } = require('drizzle-orm');
const { projects, users, projectAssignments, invitations } = require('../models');
const { db } = require('../db');

// Get all users assigned to a project
router.get('/:project_id', authenticateJWT, async (req, res) => {
    const { project_id } = req.params;
    const userId = req.user.id;

    try {
        const projectCheck = await db.select().from(projects).where(eq(projects.id, project_id));
        if (projectCheck.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const roleCheck = await db.select({role: projectAssignments.role}).from(projectAssignments).where(and(eq(projectAssignments.user_id, userId), eq(projectAssignments.project_id, project_id)));
        if (roleCheck.length === 0) {
            return res.status(403).json({ error: 'Forbidden access.' });
        }

        const result = await db.select({ email: users.email, role: projectAssignments.role }).from(users).innerJoin(projectAssignments, and(eq(users.id, projectAssignments.user_id), eq(projectAssignments.project_id, project_id)));
        res.status(200).json({ users: result });

    } catch (error) {
        console.error('Error getting project users', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Assign project to user
router.post('/assign/:project_id', authenticateJWT, async (req, res) => {
    const { project_id } = req.params;
    const { email, role } = req.body;
    const requesterId = req.user.id;

    if (!email || !project_id) return res.status(400).json({ error: 'Missing information.' });

    const project = await db.select({ name: projects.title }).from(projects).where(eq(projects.id, project_id));
    if (project.length === 0) return res.status(404).json({ error: 'Project not found' });

    const projectName = project[0].name;
    const requesterRole = await db.select({ role: projectAssignments.role })
        .from(projectAssignments)
        .where(and(eq(projectAssignments.user_id, requesterId), eq(projectAssignments.project_id, project_id)));

    if (requesterRole.length === 0 || !['owner', 'admin'].includes(requesterRole[0].role)) {
        return res.status(403).json({ error: 'Unauthorized action.' });
    }

    const user = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    
    if (user.length === 0) {
        const inviteToken = generateInviteToken(email);
        const inviteLink = `${process.env.FRONTEND_URL}/signup?email=${encodeURIComponent(email)}&token=${inviteToken}`;

        await sendInvitationEmail(email, projectName, inviteLink);

        const existingInvitation = await db.select().from(invitations).where(eq(invitations.email, email));
        if (existingInvitation.length === 0) {
            await db.insert(invitations).values({
                email: email,
                projectId: project_id,
                role: role || 'viewer'
            });
        }

        return res.status(200).json({ message: 'Invitation email sent successfully' });
    }

    const user_id = user[0].id;
    const existingAssignment = await db.select().from(projectAssignments)
        .where(and(eq(projectAssignments.user_id, user_id), eq(projectAssignments.project_id, project_id)));

    if (existingAssignment.length > 0) {
        return res.status(409).json({ error: 'User already assigned to this project' });
    }

    const result = await db.insert(projectAssignments).values({
        user_id,
        project_id,
        role: role || 'viewer',
    }).returning();

    await db.update(projects).set({ updated_at: sql`NOW()` }).where(eq(projects.id, project_id));

    res.status(201).json({ message: 'Project assigned successfully', assignment: result[0] });
});

function generateInviteToken(email) {
    return crypto.createHash('sha256').update(email + process.env.SECRET_KEY).digest('hex');
}

async function sendInvitationEmail(email, projectName, inviteLink) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        connectionTimeout: 15000,
        tls: { rejectUnauthorized: false }
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Invitation to join the project ${projectName}`,
        text: `You have been invited to join the project "${projectName}".\n\nPlease signup to join: ${inviteLink}\n`
    };

    return transporter.sendMail(mailOptions);
}

// Change user role in project
router.put('/role/:project_id', authenticateJWT, async (req, res) => {
    const { project_id } = req.params;
    const { email, role } = req.body;
    const requesterId = req.user.id;

    if (!email || !project_id || !role) {
        return res.status(400).json({ error: 'Missing information.' });
    }

    try {
        const projectCheck = await db.select().from(projects).where(eq(projects.id, project_id));
        if (projectCheck.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const roleCheck = await db.select({role: projectAssignments.role}).from(projectAssignments).where(and(eq(projectAssignments.user_id, requesterId), eq(projectAssignments.project_id, project_id)));
        if (roleCheck.length === 0) {
            return res.status(403).json({ error: 'Forbidden access.' });
        }

        const requesterRole = roleCheck[0].role;
        if (requesterRole !== 'owner' && requesterRole !== 'admin') {
            return res.status(403).json({ error: 'Forbidden access.' });
        }

        const userCheck = await db.select({id: users.id}).from(users).where(eq(users.email, email));
        if (userCheck.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user_id = userCheck[0].id;

        if (user_id === requesterId) {
            return res.status(403).json({ error: 'You cannot change your own role.' });
        }

        const existingAssignment = await db.select().from(projectAssignments).where(and(eq(projectAssignments.user_id, user_id), eq(projectAssignments.project_id, project_id)));
        if (existingAssignment.length === 0) {
            return res.status(404).json({ error: 'User not assigned to this project.' });
        }

        if (role === 'owner' && requesterRole !== 'owner') {
            return res.status(403).json({ error: 'Forbidden access.' });
        }

        const ownerCheck = await db.select({role: projectAssignments.role}).from(projectAssignments).where(and(eq(projectAssignments.user_id, user_id), eq(projectAssignments.project_id, project_id)));
        if ((ownerCheck[0].role === 'owner' || ownerCheck[0].role === 'admin') && requesterRole !== 'owner') {
            return res.status(403).json({ error: 'You cannot change the role of the project administrators' });
        }

        if (role === 'owner' && requesterRole === 'owner') {
            await db.update(projectAssignments).set({role: 'admin'}).where(and(eq(projectAssignments.user_id, requesterId), eq(projectAssignments.project_id, project_id)));
            await db.update(projects).set({owner_id: user_id, updated_at: sql`NOW()`}).where(eq(projects.id, project_id));
        }

        await db.update(projectAssignments).set({role: role}).where(and(eq(projectAssignments.user_id, user_id), eq(projectAssignments.project_id, project_id)));
        await db.update(projects).set({updated_at: sql`NOW()`}).where(eq(projects.id, project_id));
        res.status(200).json({ message: 'User role updated successfully.' });
    } catch (error) {
        console.error('Error updating user role', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Remove user from project
router.delete('/remove/:project_id', authenticateJWT, async (req, res) => {
    const { project_id } = req.params;
    const { email } = req.body;
    const requesterId = req.user.id;

    if (!email || !project_id) {
        return res.status(400).json({ error: 'Missing parameter.' });
    }

    try {
        const projectCheck = await db.select().from(projects).where(eq(projects.id, project_id));
        if (projectCheck.length === 0) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        const roleCheck = await db.select({role: projectAssignments.role}).from(projectAssignments).where(and(eq(projectAssignments.user_id, requesterId), eq(projectAssignments.project_id, project_id)));
        if (roleCheck.length === 0) {
            return res.status(403).json({ error: 'Forbidden access.' });
        }

        const requesterRole = roleCheck[0].role;
        if (requesterRole !== 'owner' && requesterRole !== 'admin') {
            return res.status(403).json({ error: 'Forbidden access.' });
        }

        const userCheck = await db.select({id: users.id}).from(users).where(eq(users.email, email));
        if (userCheck.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user_id = userCheck[0].id;

        const existingAssignment = await db.select().from(projectAssignments).where(and(eq(projectAssignments.user_id, user_id), eq(projectAssignments.project_id, project_id)));
        if (existingAssignment.length === 0) {
            return res.status(404).json({ error: 'User not assigned to this project.' });
        }

        const ownerCheck = await db.select({role: projectAssignments.role}).from(projectAssignments).where(and(eq(projectAssignments.user_id, user_id), eq(projectAssignments.project_id, project_id)));
        if (ownerCheck[0].role === 'owner') {
            return res.status(403).json({ error: 'Forbidden access.' });
        }

        await db.delete(projectAssignments).where(and(eq(projectAssignments.user_id, user_id), eq(projectAssignments.project_id, project_id)));
        await db.update(projects).set({updated_at: sql`NOW()`}).where(eq(projects.id, project_id));
        res.status(200).json({ message: 'User removed successfully.' });
    } catch (error) {
        console.error('Error removing user from project', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
