const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
}, {
    timestamps: true,
});

const productSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // Created by
    name: { type: String, required: true },
    image: { type: String, required: true }, // Main image
    images: [{ type: String }], // Gallery
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    mrp: { type: Number, required: true, default: 0 },
    discountPercent: { type: Number, required: true, default: 0 },
    taxPercent: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    weight: { type: Number, default: 0.5 }, // in kg
    length: { type: Number, default: 10 }, // in cm
    width: { type: Number, default: 10 }, // in cm
    height: { type: Number, default: 10 }, // in cm
    specs: { type: Map, of: String }, // e.g. { "RAM": "8GB", "Storage": "256GB" }
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
