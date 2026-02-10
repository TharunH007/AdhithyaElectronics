const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

beforeAll(async () => {
    // Use a different database for testing
    const url = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/bombay_dyeing_test';
    await mongoose.connect(url);
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});
