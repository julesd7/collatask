const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../server');
const { pool } = require('../../db');

describe('Auth Routes', () => {
    beforeAll(async () => {
        await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
            ['testuser', 'testuser@collatask.test', await bcrypt.hash('testpassword', 10)]
        );
    });

    afterAll(async () => {
        await pool.query('DELETE FROM users WHERE email = $1', ['testuser@collatask.test']);
        await pool.query('DELETE FROM users WHERE email = $1', ['newuser@collatask.test']);

        await pool.end();
    });

    it('should register a new user', async () => {
        const response = await request(app).post('/api/auth/register').send({
            username: 'newuser',
            email: 'newuser@collatask.test',
            password: 'newpassword'
        });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
    });

    it('should login an existing user', async () => {
        const response = await request(app).post('/api/auth/login').send({
            identifier: 'testuser',
            password: 'testpassword'
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    it('should return 400 for missing fields', async () => {
        const response = await request(app).post('/api/auth/register').send({
            username: '',
            email: '',
            password: ''
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'All fields are required');
    });

    it('should return 400 for invalid credentials', async () => {
        const response = await request(app).post('/api/auth/login').send({
            identifier: 'nonexistent',
            password: 'wrongpassword'
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
});
