import 'dotenv/config';
import request from 'supertest';
import app from '../src/app';
import { db } from '../src/db';
import { users } from '../src/db/schema';

describe('Authentication Endpoints', () => {
    beforeAll(async () => {
        // Clean up database before tests
        await db.delete(users);
    });

    afterAll(async () => {
        // cleanup if needed, better-sqlite3 closes automatically on process exit usually
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'User registered successfully');
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('email', 'test@example.com');
            expect(res.body.user).not.toHaveProperty('password'); // Password should not be returned
        });

        it('should fail if email is already registered', async () => {
            // First registration
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'duplicate@example.com',
                    password: 'password123',
                });

            // Second registration with same email
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'duplicate@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error', 'Email already in use');
        });

        it('should fail with invalid input', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: '123', // Too short
                });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeAll(async () => {
            // Create a user for login
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'login@example.com',
                    password: 'password123',
                });
        });

        it('should login successfully with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Login successful');
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('email', 'login@example.com');
        });

        it('should fail with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword',
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('error', 'Invalid credentials');
        });

        it('should fail with non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('error', 'Invalid credentials');
        });
    });
});
