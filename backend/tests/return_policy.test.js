const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const ReturnRequest = require('../models/ReturnRequest');

describe('Return Policy and GST Logic', () => {
    let token;
    let adminToken;
    let userId;
    let productId;
    let orderId;

    beforeAll(async () => {
        // Setup users and product
        const admin = await User.create({
            name: 'Admin',
            email: 'admin_test@example.com',
            password: 'password123',
            isAdmin: true,
            isEmailVerified: true
        });
        const user = await User.create({
            name: 'User',
            email: 'user_test@example.com',
            password: 'password123',
            isAdmin: false,
            isEmailVerified: true
        });
        userId = user._id;

        if (!userId) {
            throw new Error('User creation failed');
        }

        const product = await Product.create({
            name: 'Test Product',
            user: admin._id,
            price: 1000,
            mrp: 1200,
            image: '/image.jpg',
            brand: 'Test',
            category: 'Test',
            countInStock: 10,
            numReviews: 0,
            description: 'Test'
        });
        productId = product._id;

        const loginRes = await request(app).post('/api/users/login').send({
            email: 'user_test@example.com',
            password: 'password123'
        });
        token = loginRes.body.token;

        const adminLoginRes = await request(app).post('/api/users/login').send({
            email: 'admin_test@example.com',
            password: 'password123'
        });
        adminToken = adminLoginRes.body.token;
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await ReturnRequest.deleteMany({});
    });

    test('Return request fails after 7 days', async () => {
        // Create an order delivered 8 days ago
        const eightDaysAgo = new Date();
        eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

        const order = await Order.create({
            user: userId,
            orderItems: [{ name: 'Test', qty: 1, image: '/test.jpg', price: 1000, product: productId }],
            shippingAddress: { address: '123', city: 'Test', state: 'TS', postalCode: '123456', country: 'IN' },
            paymentMethod: 'Razorpay',
            itemsPrice: 1000,
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: 1000,
            isPaid: true,
            paidAt: new Date(),
            isDelivered: true,
            deliveredAt: eightDaysAgo
        });

        const res = await request(app)
            .post('/api/returns')
            .set('Authorization', `Bearer ${token}`)
            .send({ orderId: order._id, type: 'Return', reason: 'Old' });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/within 7 days/);
    });

    test('Return request succeeds within 7 days and is not auto-approved', async () => {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const order = await Order.create({
            user: userId,
            orderItems: [{ name: 'Test', qty: 1, image: '/test.jpg', price: 1000, product: productId }],
            shippingAddress: { address: '123', city: 'Test', state: 'TS', postalCode: '123456', country: 'IN' },
            paymentMethod: 'Razorpay',
            itemsPrice: 1000,
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: 1000,
            isPaid: true,
            paidAt: new Date(),
            isDelivered: true,
            deliveredAt: twoDaysAgo
        });

        const res = await request(app)
            .post('/api/returns')
            .set('Authorization', `Bearer ${token}`)
            .send({ orderId: order._id, type: 'Return', reason: 'Defected' });

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('Requested'); // NO auto-approval
    });

    test('Admin can change return type and approve', async () => {
        const returnRequest = await ReturnRequest.findOne({ reason: 'Defected' });

        const res = await request(app)
            .put(`/api/returns/${returnRequest._id}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'Approved', type: 'Replace' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('Approved');
        expect(res.body.type).toBe('Replace');

        // Verify sync with order
        const order = await Order.findById(returnRequest.order);
        expect(order.returnRequest.status).toBe('Approved');
        expect(order.returnRequest.type).toBe('Replace');
    });
});
