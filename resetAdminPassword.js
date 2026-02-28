const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./backend/models/User');

dotenv.config({ path: './backend/.env' });

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ email: 'admin@example.com' });
        if (admin) {
            admin.password = 'Admin@Bombay#2026!';
            await admin.save();
            console.log('Admin password reset successfully');
        } else {
            console.log('Admin user not found');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetAdmin();
