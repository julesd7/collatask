const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../server');
const { pool } = require('../../db');

describe('Project Assignments Routes', () => {
    beforeAll(async () => {
        await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
            ['testuser1', 'testuser1@collatask.test', await bcrypt.hash('testpassword', 10)]
        );
        await request(app).post('/api/projects').send({
            name: 'Test Project1@collatask.test',
            description: 'Test description'
        });
    });

    afterAll(async () => {
        await pool.query('DELETE FROM project_assignments WHERE user_id = $1 AND project_id = $2', [1, 1]);
        await pool.query('DELETE FROM projects WHERE name = $1', ['Test Project1@collatask.test']);
        await pool.query('DELETE FROM users WHERE email = $1', ['testuser1@collatask.test']);
        await pool.end();
    });

    it('should assign project to user', async () => {
        const userId = await pool.query('SELECT id FROM users WHERE email = $1', ['testuser1@collatask.test']);
        const projectId = await pool.query('SELECT id FROM projects WHERE name = $1', ['Test Project1@collatask.test']);
        const response = await request(app).post('/api/project-assignments/assign-project').send({
            user_id: userId.rows[0].id,
            project_id: projectId.rows[0].id,
            role: 'member'
        });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('assignment');
    });

    it('should return 400 if user ID or project ID is missing', async () => {
        const response = await request(app).post('/api/project-assignments/assign-project').send({
            role: 'member'
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'User ID and Project ID are required');
    });
});
