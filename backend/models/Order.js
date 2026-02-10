const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product',
            },
        },
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String },
    },
    paymentMethod: { type: String, required: true },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    status: { type: String, default: 'Pending' }, // Pending, Processing, Shipped, Delivered, Cancelled
    returnRequest: {
        isReturned: { type: Boolean, default: false },
        returnedAt: { type: Date },
        reason: { type: String },
        status: { type: String }, // Requested, Approved, Rejected, Refunded, Replaced
        type: { type: String }, // Return, Replace
    },
    shiprocket: {
        shipmentId: { type: String },
        orderId: { type: String },
        awbCode: { type: String },
        trackingLink: { type: String },
        courierName: { type: String },
        shipmentStatus: { type: String },
        lastUpdated: { type: Date },
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
