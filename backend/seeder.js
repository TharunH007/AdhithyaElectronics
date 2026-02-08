const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users');
const products = require('./data/products');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Category = require('./models/Category');
const Cart = require('./models/Cart');

dotenv.config();

const categories = [
    { name: 'Bed Linen', slug: 'bed-linen' },
    { name: 'Towels', slug: 'towels' },
    { name: 'Pillows', slug: 'pillows' },
    { name: 'Blankets', slug: 'blankets' },
    { name: 'Home Decor', slug: 'home-decor' },
];

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();
        await Category.deleteMany();
        await Cart.deleteMany();

        const createdUsers = [];
        for (const user of users) {
            const newUser = await User.create(user);
            createdUsers.push(newUser);
        }
        const adminUser = createdUsers[0]._id;

        await Category.insertMany(categories);
        console.log('Categories Imported!');

        const sampleProducts = products.map((product) => {
            return { ...product, user: adminUser };
        });

        await Product.insertMany(sampleProducts);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();
        await Category.deleteMany();
        await Cart.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
