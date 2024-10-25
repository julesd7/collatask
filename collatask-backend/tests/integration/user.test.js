const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../../db');
const accountRoutes = require('../../routes/user');

const app = express();
app.use(express.json());
app.use('/api/user', accountRoutes);

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

describe('Account Routes', () => {
    let token;
    let userId;

    beforeAll(async () => {
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
            ['testuser', 'test@collatask.test', 'password']
        );
        userId = result.rows[0].id;

        token = jwt.sign({ id: userId }, JWT_SECRET);
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('GET /me', () => {
        it('should return user information', async () => {
            const response = await request(app)
                .get('/api/user/me')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', userId);
            expect(response.body).toHaveProperty('username', 'testuser');
            expect(response.body).toHaveProperty('email', 'test@collatask.test');
        });

        it('should return 401 if no token is provided', async () => {
            const response = await request(app).get('/api/user/me');
            expect(response.status).toBe(401);
        });
    });

    describe('PUT /update', () => {
        it('should update user information', async () => {
            const response = await request(app)
                .put('/api/user/update')
                .set('Authorization', `Bearer ${token}`)
                .send({ username: 'newusername', email: 'newemail@collatask.test' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'User information updated successfully.' });

            const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
            expect(user.rows[0].username).toBe('newusername');
            expect(user.rows[0].email).toBe('newemail@collatask.test');
        });

        it('should return 204 if no information is provided', async () => {
            const response = await request(app)
                .put('/api/user/update')
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(response.status).toBe(204);
        });

        it('should return 400 if username already exists', async () => {
            await pool.query(
                'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
                ['anotheruser', 'another@collatask.test', 'password']
            );

            const response = await request(app)
                .put('/api/user/update')
                .set('Authorization', `Bearer ${token}`)
                .send({ username: 'anotheruser' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Username or email already exists.' });
            await pool.query('DELETE FROM users WHERE email = $1', ['another@collatask.test']);
        });

        it('should return 401 if token is invalid', async () => {
            const response = await request(app)
                .put('/api/user/update')
                .set('Authorization', 'Bearer invalidtoken')
                .send({ username: 'newusername' });

            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /delete', () => {
        it('should delete the user', async () => {
            const response = await request(app)
                .delete('/api/user/delete')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'User deleted successfully' });

            const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
            expect(user.rows.length).toBe(0);
        });

        it('should return 401 if no token is provided', async () => {
            const response = await request(app).delete('/api/user/delete');
            expect(response.status).toBe(401);
        });
    });
});
