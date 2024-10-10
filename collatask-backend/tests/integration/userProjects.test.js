const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../server');
const { pool } = require('../../db');

describe('User Projects Routes', () => {

    beforeAll(async () => {
        await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
            ['testuser2', 'testuser2@collatask.test', await bcrypt.hash('testpassword', 10)]
        );

        await pool.query(
            'INSERT INTO projects (name, description) VALUES ($1, $2)',
            ['Test Project2@collatask.test', 'Test description']
        );

        const userId = await pool.query('SELECT id FROM users WHERE email = $1', ['testuser2@collatask.test']);
        const projectId = await pool.query('SELECT id FROM projects WHERE name = $1', ['Test Project2@collatask.test']);

        await pool.query(
            'INSERT INTO project_assignments (user_id, project_id, role) VALUES ($1, $2, $3)',
            [userId.rows[0].id, projectId.rows[0].id, 'member']
        );
    });

    afterAll(async () => {
        const userId = await pool.query('SELECT id FROM users WHERE email = $1', ['testuser2@collatask.test']);
        const projectId = await pool.query('SELECT id FROM projects WHERE name = $1', ['Test Project2@collatask.test']);

        await pool.query('DELETE FROM project_assignments WHERE user_id = $1 AND project_id = $2', [userId.rows[0].id, projectId.rows[0].id]);
        await pool.query('DELETE FROM projects WHERE name = $1', ['Test Project2@collatask.test']);
        await pool.query('DELETE FROM users WHERE email = $1', ['testuser2@collatask.test']);
        await pool.end();
    });

    it('should get all projects assigned to a user', async () => {
        const userId = await pool.query('SELECT id FROM users WHERE email = $1', ['testuser2@collatask.test']);
        const response = await request(app).get('/api/user-projects/user-projects/' + userId.rows[0].id + '');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    it('should return 404 if no projects found', async () => {
        const response = await request(app).get('/api/user-projects/user-projects/0');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'No projects found for this user');
    });
});
