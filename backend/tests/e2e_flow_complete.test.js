const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const ReturnRequest = require('../models/ReturnRequest');
const generateToken = require('../utils/generateToken');

// Mock email service to avoid sending real emails during tests
jest.mock('../utils/emailService', () => ({
    sendOrderConfirmationEmail: jest.fn().mockResolvedValue(true),
    sendShipmentEmail: jest.fn().mockResolvedValue(true),
    sendReturnStatusEmail: jest.fn().mockResolvedValue(true)
}));

describe('Complete E2E Order & Return Lifecycle', () => {
    let userToken, adminToken;
    let userId, adminId;
    let product1Id, product2Id;

    beforeAll(async () => {
        // Clear database
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await ReturnRequest.deleteMany({});

        // Create Regular User
        const user = await User.create({
            name: 'Test Customer',
            email: 'customer@test.com',
            password: 'Password123!',
            isEmailVerified: true
        });
        userId = user._id;
        userToken = generateToken(user._id);

        // Create Admin User
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'Password123!',
            isAdmin: true,
            isEmailVerified: true
        });
        adminId = admin._id;
        adminToken = generateToken(admin._id);

        // Create Products
        const p1 = await Product.create({
            name: 'Pillow Case',
            price: 400,
            user: adminId,
            image: '/images/pillow.jpg',
            brand: 'Bombay Dyeing',
            category: 'Bedding',
            countInStock: 20,
            description: 'Soft cotton pillow case',
            taxPercent: 12
        });
        product1Id = p1._id;

        const p2 = await Product.create({
            name: 'Luxury Bedding Set',
            price: 5000,
            user: adminId,
            image: '/images/bedding.jpg',
            brand: 'Bombay Dyeing',
            category: 'Bedding',
            countInStock: 10,
            description: 'Premium luxury bedding set',
            taxPercent: 18
        });
        product2Id = p2._id;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    /**
     * SCENARIO 1: Order < 1000 (Shipping applied) -> Denied Return
     */
    test('Scenario 1: Low-value order with shipping and rejected return', async () => {
        // 1. Calculate Shipping Rates
        const rateRes = await request(app)
            .post('/api/orders/rates')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                orderItems: [{ product: product1Id, qty: 1, price: 400 }]
            });
        
        expect(rateRes.body.rate).toBe(50); // Threshold is 1000

        // 2. Place Order
        const orderData = {
            orderItems: [{
                name: 'Pillow Case',
                qty: 1,
                image: '/images/pillow.jpg',
                price: 400,
                product: product1Id
            }],
            shippingAddress: {
                address: '123 Test St',
                city: 'Mumbai',
                state: 'Maharashtra',
                postalCode: '400001',
                country: 'India'
            },
            paymentMethod: 'Razorpay',
            itemsPrice: 400,
            shippingPrice: 50,
            totalPrice: 450 // Simplified total for test
        };

        const createRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${userToken}`)
            .send(orderData);

        expect(createRes.statusCode).toBe(201);
        const orderId = createRes.body._id;

        // 3. Admin: Mark as Paid
        const payRes = await request(app)
            .put(`/api/orders/${orderId}/pay`)
            .set('Authorization', `Bearer ${userToken}`) // User can usually trigger payment success from UI
            .send({ id: 'pay_test_123', status: 'captured' });
        
        expect(payRes.body.isPaid).toBe(true);

        // 4. Admin: Ship Order
        const shipRes = await request(app)
            .put(`/api/orders/${orderId}/shipped`)
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(shipRes.body.status).toBe('Shipped');

        // 5. Admin: Deliver Order
        const deliverRes = await request(app)
            .put(`/api/orders/${orderId}/deliver`)
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(deliverRes.body.status).toBe('Delivered');
        expect(deliverRes.body.isDelivered).toBe(true);

        // 6. User: Request Return
        const returnRes = await request(app)
            .post('/api/returns')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                orderId: orderId,
                type: 'Return',
                reason: 'No longer needed'
            });
        
        expect(returnRes.statusCode).toBe(201);
        expect(returnRes.body.status).toBe('Requested');
        const returnId = returnRes.body._id;

        // 7. Admin: Reject Return
        const rejectRes = await request(app)
            .put(`/api/returns/${returnId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'Rejected' });
        
        expect(rejectRes.body.status).toBe('Rejected');

        // Verify Sync with Order
        const finalOrder = await Order.findById(orderId);
        expect(finalOrder.returnRequest.status).toBe('Rejected');
    });

    /**
     * SCENARIO 2: Order > 1000 (Free shipping) -> Approved Replacement -> Completed
     */
    test('Scenario 2: High-value order with free shipping and completed replacement', async () => {
        // 1. Calculate Shipping Rates
        const rateRes = await request(app)
            .post('/api/orders/rates')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                orderItems: [{ product: product2Id, qty: 2, price: 5000 }]
            });
        
        expect(rateRes.body.rate).toBe(0); // Above 1000 threshold

        // 2. Place Order
        const orderData = {
            orderItems: [{
                name: 'Luxury Bedding Set',
                qty: 2,
                image: '/images/bedding.jpg',
                price: 5000,
                product: product2Id
            }],
            shippingAddress: {
                address: '456 Royal Lane',
                city: 'Delhi',
                state: 'Delhi',
                postalCode: '110001',
                country: 'India'
            },
            paymentMethod: 'Razorpay',
            itemsPrice: 10000,
            shippingPrice: 0,
            totalPrice: 11800 // Mocked with 18% tax for verification
        };

        const createRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${userToken}`)
            .send(orderData);

        expect(createRes.statusCode).toBe(201);
        const orderId = createRes.body._id;

        // 3. Mark as Paid (Stock Check)
        const initialProduct = await Product.findById(product2Id);
        const initialStock = initialProduct.countInStock;

        await request(app)
            .put(`/api/orders/${orderId}/pay`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ id: 'pay_test_456', status: 'captured' });

        const updatedProduct = await Product.findById(product2Id);
        expect(updatedProduct.countInStock).toBe(initialStock - 2);

        // 4. Admin: Process to Delivery
        await request(app).put(`/api/orders/${orderId}/shipped`).set('Authorization', `Bearer ${adminToken}`);
        await request(app).put(`/api/orders/${orderId}/deliver`).set('Authorization', `Bearer ${adminToken}`);

        // 5. User: Request Replacement
        const returnRes = await request(app)
            .post('/api/returns')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                orderId: orderId,
                type: 'Replace',
                reason: 'Item received in defective condition'
            });
        
        const returnId = returnRes.body._id;

        // 6. Admin: Approve Replacement
        const approveRes = await request(app)
            .put(`/api/returns/${returnId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'Approved' });
        
        expect(approveRes.body.status).toBe('Approved');

        // 7. Admin: Complete/Close Replacement
        const completeRes = await request(app)
            .put(`/api/returns/${returnId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'Completed' });
        
        expect(completeRes.body.status).toBe('Completed');
        expect(completeRes.body.isProcessed).toBe(true);

        // Final Sync Verification
        const finalOrder = await Order.findById(orderId);
        expect(finalOrder.returnRequest.status).toBe('Completed');
    });
});
