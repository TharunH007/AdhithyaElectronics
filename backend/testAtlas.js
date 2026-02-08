const mongoose = require('mongoose');

const uri = "mongodb+srv://tharun2112_db_user:DoB7vgInNsoSyzEq@testdb.plhxb5g.mongodb.net/TestDB?retryWrites=true&w=majority";

console.log('Testing hardcoded Atlas URI...');
mongoose.connect(uri)
    .then(() => {
        console.log('SUCCESS: Connected to Atlas!');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE: Atlas connection failed.');
        console.error(err);
        process.exit(1);
    });
