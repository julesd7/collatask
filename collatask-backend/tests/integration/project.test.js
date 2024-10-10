const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../server');
const { pool } = require('../../db');

describe('Project Routes', () => {
    beforeAll(async () => {
        await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
            ['testuser3', 'testuser3@collatask.test', await bcrypt.hash('testpassword', 10)]
        );

        await pool.query(
            'INSERT INTO projects (name, description) VALUES ($1, $2)',
            ['Test Project3@collatask.test', 'Test description']
        );

        const userId = await pool.query('SELECT id FROM users WHERE email = $1', ['testuser3@collatask.test']);
        const projectId = await pool.query('SELECT id FROM projects WHERE name = $1', ['Test Project3@collatask.test']);

        await pool.query(
            'INSERT INTO project_assignments (user_id, project_id, role) VALUES ($1, $2, $3)',
            [userId.rows[0].id, projectId.rows[0].id, 'owner']
        );
    });

    afterAll(async () => {
        await pool.query('DELETE FROM users WHERE email = $1', ['testuser3@collatask.test']);
        await pool.query('DELETE FROM projects WHERE name = $1', ['Test Project@collatask.test']);
        await pool.end();
    });

    it('should create a new project', async () => {
        const response = await request(app).post('/api/projects').send({
            name: 'Test Project@collatask.test',
            description: 'Test description'
        });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
    });

    it('should return 400 if project name is missing', async () => {
        const response = await request(app).post('/api/projects').send({
            description: 'Test description'
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Project name is required');
    });

    it('should edit a project', async () => {
        const userId = await pool.query('SELECT id FROM users WHERE email = $1', ['testuser3@collatask.test']);
        const projectId = await pool.query('SELECT id FROM projects WHERE name = $1', ['Test Project3@collatask.test']);
        const response = await request(app).put('/api/projects/' + projectId.rows[0].id).send({
            user_id: userId.rows[0].id,
            name: 'Project3@collatask.test',
            description: 'Updated description'
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');

        const updatedProject = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId.rows[0].id]);
        expect(updatedProject.rows[0].name).toBe('Project3@collatask.test');
        expect(updatedProject.rows[0].description).toBe('Updated description');
    });

    it('should return 400 if user ID is missing', async () => {
        const projectId = await pool.query('SELECT id FROM projects WHERE name = $1', ['Project3@collatask.test']);
        const response = await request(app).put('/api/projects/' + projectId.rows[0].id).send({
            name: 'Project3@collatask.test',
            description: 'Updated description'
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'User ID is required');
    });

    it('should delete a project', async () => {
        const userId = await pool.query('SELECT id FROM users WHERE email = $1', ['testuser3@collatask.test']);
        const projectId = await pool.query('SELECT id FROM projects WHERE name = $1', ['Project3@collatask.test']);
        const response = await request(app).delete('/api/projects/' + projectId.rows[0].id).send({
            user_id: userId.rows[0].id
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Project deleted successfully');

        const deletedProject = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId.rows[0].id]);
        expect(deletedProject.rowCount).toBe(0);
    });

    it('should return 400 if user ID is missing', async () => {
        const projectId = await pool.query('SELECT id FROM projects WHERE name = $1', ['Test Project@collatask.test']);
        const response = await request(app).delete('/api/projects/' + projectId.rows[0].id).send({
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'User ID is required');
    });
});
