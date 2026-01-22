const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const debugAuth = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const email = 'admin@example.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User NOT FOUND');
            process.exit();
        }

        console.log(`User Found: ${user.name}`);
        console.log(`Is Admin: ${user.isAdmin}`);
        console.log(`Stored Hash: ${user.password}`);

        const isMatch = await bcrypt.compare('password123', user.password);
        console.log(`Password 'password123' Match Result: ${isMatch}`);

        // Double check manual hashing
        const testSalt = await bcrypt.genSalt(10);
        const testHash = await bcrypt.hash('password123', testSalt);
        console.log(`Test generated hash for 'password123': ${testHash}`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugAuth();
