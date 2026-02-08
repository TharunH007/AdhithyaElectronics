const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ email: /thatisit/ }).select('email isEmailVerified emailVerificationToken emailVerificationExpires');
        console.log(JSON.stringify(users, null, 2));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkStatus();
