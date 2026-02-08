const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find().sort({ createdAt: -1 }).limit(5);

        console.log('Recent Users:');
        users.forEach(u => {
            console.log(`Email: ${u.email}`);
            console.log(`Verified: ${u.isEmailVerified}`);
            console.log(`Token: ${u.emailVerificationToken}`);
            console.log(`Expires: ${u.emailVerificationExpires}`);
            console.log('---');
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkStatus();
