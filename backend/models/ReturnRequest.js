const mongoose = require('mongoose');

const returnRequestSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Order',
        },
        type: {
            type: String,
            required: true,
            enum: ['Return'],
        },
        reason: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['Requested', 'Approved', 'Picked up', 'Completed', 'Rejected'],
            default: 'Requested',
        },
        isProcessed: {
            type: Boolean,
            default: false,
        },
        processedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);

module.exports = ReturnRequest;
