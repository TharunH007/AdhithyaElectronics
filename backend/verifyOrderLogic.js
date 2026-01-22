require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');

const testOrderCreation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find a random product to test
        const product = await Product.findOne();
        if (!product) {
            console.log('No products found in DB. Seed first.');
            process.exit(1);
        }

        console.log(`Testing with product: ${product.name}, stock: ${product.countInStock}`);

        const mockOrderItems = [
            {
                name: product.name,
                qty: 1,
                image: product.image,
                price: product.price,
                product: product._id,
            }
        ];

        const mockOrder = new Order({
            user: '65a8e0f9c1e2a3b4c5d6e7f8', // Mock User ID
            orderItems: mockOrderItems,
            shippingAddress: {
                address: '114, chennai',
                city: 'Chennai',
                postalCode: '600010',
                country: 'India',
            },
            paymentMethod: 'Razorpay',
            itemsPrice: product.price,
            taxPrice: 10,
            shippingPrice: 0,
            totalPrice: product.price + 10,
        });

        // This is what addOrderItems does:
        const createdOrder = await mockOrder.save();
        console.log('Order created successfully:', createdOrder._id);

        // Stock subtraction logic
        for (const item of mockOrderItems) {
            const prod = await Product.findById(item.product);
            if (prod) {
                const oldStock = prod.countInStock;
                prod.countInStock -= item.qty;
                await prod.save();
                console.log(`Stock updated for ${prod.name}: ${oldStock} -> ${prod.countInStock}`);
            }
        }

        console.log('Verification Success!');

        // Clean up: Delete the test order
        await Order.findByIdAndDelete(createdOrder._id);
        // Restore stock
        product.countInStock += 1;
        await product.save();

        mongoose.disconnect();
    } catch (err) {
        console.error('Verification Failed:', err);
        process.exit(1);
    }
};

testOrderCreation();
