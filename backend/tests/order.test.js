const request = require('supertest');
const app = require('../app');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Mock email service
jest.mock('../utils/emailService', () => ({
    sendOrderConfirmationEmail: jest.fn().mockResolvedValue(true)
}));

describe('Order Endpoints', () => {
    let token;
    let userId;
    let productId;

    beforeAll(async () => {
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});

        const user = await User.create({
            name: 'Order User',
            email: 'order@example.com',
            password: 'Password123!',
            isEmailVerified: true
        });
        userId = user._id;
        token = generateToken(user._id);

        const product = await Product.create({
            name: 'Order Product',
            price: 100,
            user: userId,
            image: '/images/test.jpg',
            brand: 'Brand',
            category: 'Category',
            countInStock: 10,
            description: 'Description'
        });
        productId = product._id;
    });

    it('should create a new order', async () => {
        const orderData = {
            orderItems: [{
                name: 'Order Product',
                qty: 2,
                image: '/images/test.jpg',
                price: 100,
                product: productId
            }],
            shippingAddress: {
                address: '123 Test St',
                city: 'Test City',
                postalCode: '12345',
                country: 'Test Country'
            },
            paymentMethod: 'PayPal',
            itemsPrice: 200,
            taxPrice: 20,
            shippingPrice: 0,
            totalPrice: 220
        };

        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send(orderData);

        expect(res.statusCode).toEqual(201);
        expect(res.body.orderItems.length).toEqual(1);
        expect(res.body.totalPrice).toBeGreaterThan(0);

        // Check stock subtraction
        const product = await Product.findById(productId);
        expect(product.countInStock).toEqual(8);
    });

    it('should get logged in user orders', async () => {
        const res = await request(app)
            .get('/api/orders/myorders')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get order by id', async () => {
        const order = await Order.findOne({ user: userId });
        const res = await request(app)
            .get(`/api/orders/${order._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body._id).toEqual(order._id.toString());
    });
});
