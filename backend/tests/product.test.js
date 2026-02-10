const request = require('supertest');
const app = require('../app');
const Product = require('../models/Product');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

describe('Product Endpoints', () => {
    let adminToken;
    let userId;

    beforeAll(async () => {
        await User.deleteMany({});
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'Password123!',
            isAdmin: true,
            isEmailVerified: true
        });
        userId = adminUser._id;
        adminToken = generateToken(adminUser._id);
    });

    beforeEach(async () => {
        await Product.deleteMany({});
    });

    it('should fetch all products', async () => {
        await Product.create({
            name: 'Product 1',
            price: 100,
            user: userId,
            image: '/images/test.jpg',
            brand: 'Brand 1',
            category: 'Category 1',
            countInStock: 10,
            description: 'Description 1'
        });

        const res = await request(app).get('/api/products');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toEqual(1);
    });

    it('should search products by keyword', async () => {
        await Product.create({
            name: 'iPhone 13',
            price: 1000,
            user: userId,
            image: '/images/iphone.jpg',
            brand: 'Apple',
            category: 'Electronics',
            countInStock: 5,
            description: 'A phone'
        });

        const res = await request(app).get('/api/products?keyword=iPhone');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toEqual(1);
        expect(res.body[0].name).toEqual('iPhone 13');
    });

    it('should get product by id', async () => {
        const product = await Product.create({
            name: 'Test Product',
            price: 50,
            user: userId,
            image: '/images/test.jpg',
            brand: 'Test Brand',
            category: 'Test Category',
            countInStock: 20,
            description: 'Test Description'
        });

        const res = await request(app).get(`/api/products/${product._id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toEqual('Test Product');
    });

    it('should create a product as admin', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({}); // createProduct controller creates a sample product and ignores body

        expect(res.statusCode).toEqual(201);
        expect(res.body.name).toEqual('Sample name');
    });

    it('should not create a product as non-admin', async () => {
        const user = await User.create({
            name: 'Normal User',
            email: 'user@example.com',
            password: 'Password123!',
            isAdmin: false,
            isEmailVerified: true
        });
        const userToken = generateToken(user._id);

        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${userToken}`)
            .send({});

        expect(res.statusCode).toEqual(401); // admin middleware returns 401
    });
});
