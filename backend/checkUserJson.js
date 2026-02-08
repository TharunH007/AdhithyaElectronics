const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find().sort({ createdAt: -1 }).limit(10);

        const data = users.map(u => ({
            email: u.email,
            verified: u.isEmailVerified,
            token: u.emailVerificationToken,
            expires: u.emailVerificationExpires
        }));

        console.log(JSON.stringify(data, null, 2));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkStatus();
