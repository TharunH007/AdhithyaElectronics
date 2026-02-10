const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

dotenv.config();

const createTestData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // 1. Create Test User
        const email = 'test_customer@example.com';
        await User.deleteMany({ email });

        const user = await User.create({
            name: 'Test Customer',
            email,
            password: 'Password123!',
            phone: '9876543210',
            isEmailVerified: true
        });

        console.log('User created: test_customer@example.com / Password123!');

        // 2. Get 2 Products
        const products = await Product.find({}).limit(2);
        if (products.length < 2) {
            console.error('Not enough products in DB to create orders');
            process.exit(1);
        }

        const product1 = products[0];
        const product2 = products[1];

        // 3. Create Order 1 (Delivered 10 days ago -> Jan 31, 2026)
        const date1 = new Date('2026-01-31T10:00:00Z');
        const order1 = await Order.create({
            user: user._id,
            orderItems: [{
                name: product1.name,
                qty: 1,
                image: product1.image,
                price: product1.price,
                product: product1._id,
            }],
            shippingAddress: {
                address: '123 Test St',
                city: 'Chennai',
                postalCode: '600001',
                country: 'India',
            },
            paymentMethod: 'Razorpay',
            paymentResult: { id: 'test_pay_1', status: 'Payment Successful', update_time: date1 },
            itemsPrice: product1.price,
            shippingPrice: 0,
            taxPrice: 0,
            totalPrice: product1.price,
            isPaid: true,
            paidAt: date1,
            isDelivered: true,
            deliveredAt: date1,
            createdAt: date1
        });

        console.log(`Order 1 created (Jan 31): ${order1._id}`);

        // 4. Create Order 2 (Delivered 2 days ago -> Feb 8, 2026)
        const date2 = new Date('2026-02-08T10:00:00Z');
        const order2 = await Order.create({
            user: user._id,
            orderItems: [{
                name: product2.name,
                qty: 1,
                image: product2.image,
                price: product2.price,
                product: product2._id,
            }],
            shippingAddress: {
                address: '123 Test St',
                city: 'Chennai',
                postalCode: '600001',
                country: 'India',
            },
            paymentMethod: 'Razorpay',
            paymentResult: { id: 'test_pay_2', status: 'Payment Successful', update_time: date2 },
            itemsPrice: product2.price,
            shippingPrice: 0,
            taxPrice: 0,
            totalPrice: product2.price,
            isPaid: true,
            paidAt: date2,
            isDelivered: true,
            deliveredAt: date2,
            createdAt: date2
        });

        console.log(`Order 2 created (Feb 8): ${order2._id}`);

        console.log('Test data creation complete!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createTestData();
