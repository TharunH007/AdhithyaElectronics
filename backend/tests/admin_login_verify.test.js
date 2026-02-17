const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

describe('Admin Login Response', () => {
    beforeAll(async () => {
        await User.create({
            name: 'Regular User',
            email: 'reg@example.com',
            password: 'password123',
            isAdmin: false,
            isEmailVerified: true
        });
        await User.create({
            name: 'Admin User',
            email: 'adm@example.com',
            password: 'password123',
            isAdmin: true,
            isEmailVerified: true
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    test('Login response contains isAdmin flag', async () => {
        const res = await request(app).post('/api/users/login').send({
            email: 'reg@example.com',
            password: 'password123'
        });
        expect(res.status).toBe(200);
        expect(res.body.isAdmin).toBe(false);

        const resAdmin = await request(app).post('/api/users/login').send({
            email: 'adm@example.com',
            password: 'password123'
        });
        expect(resAdmin.status).toBe(200);
        expect(resAdmin.body.isAdmin).toBe(true);
    });
});
