require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const bootstrapAdmin = require('./utils/bootstrapAdmin');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('MongoDB Connected');
            bootstrapAdmin(); // Safe bootstrap
            app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        })
        .catch(err => console.error('MongoDB Connection Error:', err));
} else {
    console.log('No MONGO_URI found. Server NOT started.');
}
