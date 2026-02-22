const User = require('../models/User');

const bootstrapAdmin = async () => {
    try {
        const adminExists = await User.findOne({ isAdmin: true });

        if (!adminExists) {
            console.log('No admin user found. Bootstrapping default admin...');

            await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'Admin@Bombay#2026!', // Strong password as requested
                isAdmin: true,
                isEmailVerified: true,
            });

            console.log('Default admin user created successfully.');
        } else {
            console.log('Admin user(s) already exist. Skipping bootstrap.');
        }
    } catch (error) {
        console.error('Error bootstrapping admin user:', error.message);
    }
};

module.exports = bootstrapAdmin;
