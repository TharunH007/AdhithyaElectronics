const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find().select('email isEmailVerified password emailVerificationToken emailVerificationExpires');

        let output = 'USERS LIST:\n';
        users.forEach(u => {
            output += `Email: ${u.email}\n`;
            output += `Verified: ${u.isEmailVerified}\n`;
            output += `Password (raw): ${u.password}\n`;
            output += `Token: ${u.emailVerificationToken}\n`;
            output += `Expires: ${u.emailVerificationExpires}\n`;
            output += '--------------------\n';
        });

        require('fs').writeFileSync('users_clean.txt', output);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkStatus();
