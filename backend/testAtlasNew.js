const mongoose = require('mongoose');
require('dotenv').config();

const uri = "mongodb+srv://tharun:zgp03oZe5VuYASeH@testdb.plhxb5g.mongodb.net/?appName=TestDB";

console.log('Testing New Atlas URI...');
mongoose.connect(uri)
    .then(() => {
        console.log('SUCCESS: Connected to NEW Atlas!');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE: NEW Atlas connection failed.');
        console.error(err);
        process.exit(1);
    });
