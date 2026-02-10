const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

// Mock email service
jest.mock('../utils/emailService', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
}));

describe('Auth Endpoints', () => {
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!', // Valid according to requirements
        phone: '1234567890'
    };

    beforeEach(async () => {
        await User.deleteMany({});
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/users')
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toContain('Registration successful');

        const user = await User.findOne({ email: testUser.email });
        expect(user).toBeTruthy();
        expect(user.isEmailVerified).toBe(false);
    });

    it('should not register user with existing email (and verified)', async () => {
        // Create a verified user
        const user = await User.create({
            ...testUser,
            isEmailVerified: true
        });

        const res = await request(app)
            .post('/api/users')
            .send(testUser);

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('User already exists');
    });

    it('should login an existing verified user', async () => {
        // Create a verified user
        await User.create({
            ...testUser,
            isEmailVerified: true
        });

        const res = await request(app)
            .post('/api/users/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.email).toEqual(testUser.email);
    });

    it('should not login unverified user', async () => {
        // Create an unverified user
        await User.create({
            ...testUser,
            isEmailVerified: false
        });

        const res = await request(app)
            .post('/api/users/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toContain('verify your email');
    });

    it('should not login with wrong password', async () => {
        await User.create({
            ...testUser,
            isEmailVerified: true
        });

        const res = await request(app)
            .post('/api/users/login')
            .send({
                email: testUser.email,
                password: 'WrongPassword123!'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toEqual('Invalid email or password');
    });
});
