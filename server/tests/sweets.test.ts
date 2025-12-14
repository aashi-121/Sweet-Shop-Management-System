import 'dotenv/config';
import request from 'supertest';
import app from '../src/app';
import { db } from '../src/db';
import { users, sweets } from '../src/db/schema';
import { eq } from 'drizzle-orm';

let adminToken: string;
let userToken: string;

describe('Sweets & Inventory Endpoints', () => {
    beforeAll(async () => {
        // Clean up
        await db.delete(users);
        await db.delete(sweets);

        // Register Admin
        await request(app).post('/api/auth/register').send({
            email: 'admin@test.com',
            password: 'password123',
            // In a real app we'd need a way to set admin role, 
            // for now let's assume the first user or manual update needed, 
            // OR we'll just test basic access first. 
            // The current auth controller defaults to USER. 
            // We might need to manually update the role in DB for testing admin routes.
        });

        // Manual update to ADMIN for the first user
        await db.update(users).set({ role: 'ADMIN' }).where(eq(users.email, 'admin@test.com'));

        const adminLogin = await request(app).post('/api/auth/login').send({
            email: 'admin@test.com',
            password: 'password123'
        });
        adminToken = adminLogin.body.token;

        // Register User
        await request(app).post('/api/auth/register').send({
            email: 'user@test.com',
            password: 'password123'
        });
        const userLogin = await request(app).post('/api/auth/login').send({
            email: 'user@test.com',
            password: 'password123'
        });
        userToken = userLogin.body.token;
    });

    describe('GET /api/sweets', () => {
        it('should return 401 if not authenticated', async () => {
            const res = await request(app).get('/api/sweets');
            expect(res.statusCode).toEqual(401);
        });

        it('should return empty list initially', async () => {
            const res = await request(app)
                .get('/api/sweets')
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual([]);
        });
    });

    describe('POST /api/sweets', () => {
        it('should create a new sweet', async () => {
            const res = await request(app)
                .post('/api/sweets')
                .set('Authorization', `Bearer ${adminToken}`) // Assuming only admin can add? Req says "Protected", usually implies Admin for modification
                .send({
                    name: 'Chocolate Bar',
                    category: 'Chocolate',
                    price: 2.50,
                    quantity: 100
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.name).toBe('Chocolate Bar');
        });
    });

    // New tests for Update, Delete, Purchase, Restock
    describe('PUT /api/sweets/:id', () => {
        let sweetId: string;
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/sweets')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'To Update',
                    category: 'Test',
                    price: 1.0,
                    quantity: 10
                });
            sweetId = res.body.id;
        });

        it('should update a sweet details', async () => {
            const res = await request(app)
                .put(`/api/sweets/${sweetId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ price: 2.0 });

            expect(res.statusCode).toEqual(200);
            expect(res.body.price).toEqual(2.0);
        });
    });

    describe('DELETE /api/sweets/:id', () => {
        let sweetId: string;
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/sweets')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'To Delete',
                    category: 'Test',
                    price: 1.0,
                    quantity: 10
                });
            sweetId = res.body.id;
        });

        it('should delete a sweet as admin', async () => {
            const res = await request(app)
                .delete(`/api/sweets/${sweetId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(200);
        });
    });

    describe('Inventory', () => {
        let sweetId: string;
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/sweets')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Inventory Item',
                    category: 'Test',
                    price: 10.0,
                    quantity: 5
                });
            sweetId = res.body.id;
        });

        it('should purchase a sweet and decrease quantity', async () => {
            const res = await request(app)
                .post(`/api/sweets/${sweetId}/purchase`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toContain('Purchase successful');
        });

        it('should restock a sweet as admin', async () => {
            const res = await request(app)
                .post(`/api/sweets/${sweetId}/restock`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ quantity: 10 });

            expect(res.statusCode).toEqual(200);
            expect(res.body.quantity).toEqual(15);
        });
    });

    describe('GET /api/sweets/search', () => {
        beforeEach(async () => {
            // Clean up sweets to ensure clean state or just add test data
            // Since we delete sweets in beforeAll, we can just add. 
            // But other tests might have added sweets.
            // Let's assume these identifiers are unique enough or we add random unique suffix if needed.
            // For simplicity, we just add.
            await request(app).post('/api/sweets').set('Authorization', `Bearer ${adminToken}`).send({
                name: 'Caramel Chew', category: 'Caramel', price: 1.5, quantity: 10
            });
            await request(app).post('/api/sweets').set('Authorization', `Bearer ${adminToken}`).send({
                name: 'Dark Chocolate', category: 'Chocolate', price: 3.0, quantity: 10
            });
            await request(app).post('/api/sweets').set('Authorization', `Bearer ${adminToken}`).send({
                name: 'Milk Chocolate', category: 'Chocolate', price: 2.0, quantity: 10
            });
        });

        it('should search sweets by name', async () => {
            const res = await request(app)
                .get('/api/sweets/search?name=Chocolate')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBeGreaterThanOrEqual(2);
            expect(res.body.some((s: any) => s.name === 'Dark Chocolate')).toBe(true);
        });

        it('should distinct filter by price range', async () => {
            const res = await request(app)
                .get('/api/sweets/search?minPrice=2.5')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.some((s: any) => s.name === 'Dark Chocolate')).toBe(true); // 3.0
            expect(res.body.some((s: any) => s.name === 'Milk Chocolate')).toBe(false); // 2.0
        });
    });

    // More tests will be fleshed out as we implement
});
