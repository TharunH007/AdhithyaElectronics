const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const restoreAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = 'admin@example.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log('Admin user found. Resetting password...');
            // We set it to something else first to ensure 'isModified' is true if needed,
            // but simply re-setting it is enough.
            user.password = 'password123';
            await user.save(); // Triggers hashing
            console.log('Admin password hashed and saved.');
        } else {
            console.log('Admin user not found. Creating...');
            await User.create({
                name: 'Admin User',
                email: email,
                password: 'password123',
                isAdmin: true,
            });
            console.log('Admin user created.');
        }

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

restoreAdmin();
