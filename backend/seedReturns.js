const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');
const ReturnRequest = require('./models/ReturnRequest');
const User = require('./models/User');

dotenv.config();

const seedReturns = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Clear existing returns for a fresh seed
        await ReturnRequest.deleteMany();

        // Find orders to attach returns to
        const orders = await Order.find({}).limit(3);

        if (orders.length < 1) {
            console.log('No orders found to seed returns for.');
            process.exit();
        }

        const returnData = [
            {
                type: 'Return',
                reason: 'The product has persistent stains on the fabric that won\'t come out.',
                status: 'Requested',
            },
            {
                type: 'Return',
                reason: 'The items were delivered with visible tears in the packaging.',
                status: 'Approved',
            },
            {
                type: 'Return',
                reason: 'Defective unit. The electronics are not powering on as expected.',
                status: 'Completed',
                isProcessed: true,
                processedAt: new Date(),
            }
        ];

        for (let i = 0; i < Math.min(orders.length, returnData.length); i++) {
            const order = orders[i];
            const data = returnData[i];

            // Mark order as delivered to make return realistic
            order.isDelivered = true;
            order.deliveredAt = new Date();
            order.status = 'Delivered';

            const returnRequest = new ReturnRequest({
                user: order.user,
                order: order._id,
                type: data.type,
                reason: data.reason,
                status: data.status,
                isProcessed: data.isProcessed || false,
                processedAt: data.processedAt,
            });

            await returnRequest.save();

            // Sync with order
            order.returnRequest = {
                isReturned: true,
                type: data.type,
                reason: data.reason,
                status: data.status,
            };

            await order.save();
            console.log(`Created ${data.type} request for order ${order._id}`);
        }

        console.log('Sample returns seeded successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedReturns();
