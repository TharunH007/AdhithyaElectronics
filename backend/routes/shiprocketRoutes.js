const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// @desc    Shiprocket Status Webhook
// @route   POST /api/shiprocket/webhook
// @access  Public (Should be secured with Shiprocket token/secret if available)
router.post('/webhook', async (req, res) => {
    const {
        awb,
        current_status,
        current_status_id,
        shipment_id,
        order_id,
        status_datetime
    } = req.body;

    console.log(`Shiprocket Webhook received for Order ${order_id}: ${current_status}`);

    try {
        // Find order by Shiprocket Order ID or internal Order ID
        const order = await Order.findOne({
            $or: [
                { 'shiprocket.orderId': order_id },
                { '_id': order_id.length === 24 ? order_id : null }
            ]
        });

        if (order) {
            order.shiprocket.shipmentStatus = current_status;
            order.shiprocket.awbCode = awb || order.shiprocket.awbCode;
            order.shiprocket.lastUpdated = status_datetime || new Date();

            // Auto-update internal status
            if (current_status.toLowerCase() === 'delivered') {
                order.isDelivered = true;
                order.deliveredAt = order.shiprocket.lastUpdated;
                order.status = 'Delivered';
            } else if (current_status.toLowerCase() === 'shipped') {
                order.status = 'Shipped';
            }

            await order.save();
            return res.status(200).json({ message: 'Status updated successfully' });
        }

        res.status(404).json({ message: 'Order not found' });
    } catch (error) {
        console.error('Webhook Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
