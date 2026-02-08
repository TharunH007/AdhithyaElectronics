const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
require('dotenv').config();

const clearUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('Clearing Users, Orders, and Carts...');

        await Order.deleteMany();
        await Cart.deleteMany();
        await User.deleteMany();

        console.log('SUCCESS: All user-related data has been cleared.');
        process.exit();
    } catch (err) {
        console.error('FAILURE: Error clearing data');
        console.error(err);
        process.exit(1);
    }
};

clearUsers();
