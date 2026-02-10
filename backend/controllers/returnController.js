const ReturnRequest = require('../models/ReturnRequest');
const Order = require('../models/Order');
const { createReturnOrder } = require('../utils/shiprocket');

// @desc    Create new return request
// @route   POST /api/returns
// @access  Private
const createReturnRequest = async (req, res) => {
    try {
        const { orderId, type, reason } = req.body;

        const order = await Order.findById(orderId);

        if (order) {
            if (order.user.toString() !== req.user._id.toString()) {
                res.status(401);
                throw new Error('User not authorized');
            }

            // Check if already requested
            const existingRequest = await ReturnRequest.findOne({ order: orderId });
            if (existingRequest) {
                res.status(400);
                throw new Error('Return/Replacement already requested for this order');
            }

            // Auto-approve if within 7 days
            const deliveredAt = new Date(order.deliveredAt);
            const now = new Date();
            const diffTime = Math.abs(now - deliveredAt);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let status = 'Requested';
            if (diffDays <= 7) {
                status = 'Approved';
            }

            const returnRequest = new ReturnRequest({
                user: req.user._id,
                order: orderId,
                type,
                reason,
                status,
            });

            const createdRequest = await returnRequest.save();

            // Notify Shiprocket if approved
            if (status === 'Approved') {
                try {
                    await createReturnOrder({
                        order_id: order._id.toString(),
                        order_date: order.createdAt.toISOString().slice(0, 10),
                        pickup_customer_name: order.shippingAddress.name,
                        pickup_address: order.shippingAddress.address,
                        pickup_city: order.shippingAddress.city,
                        pickup_pincode: order.shippingAddress.postalCode,
                        pickup_phone: order.shippingAddress.phone,
                        order_items: order.orderItems.map(item => ({
                            name: item.name,
                            sku: item.product.toString(),
                            units: item.qty,
                            selling_price: item.price
                        })),
                        shipping_customer_name: 'NKM Trading Company',
                        shipping_address: 'Primary Warehouse Address', // Should be from ENV
                        shipping_city: 'Erode',
                        shipping_pincode: '638011',
                        shipping_phone: '9876543210'
                    });
                } catch (error) {
                    console.error('Shiprocket Return Sync Failed:', error.message);
                }
            }

            // Update order status reference
            order.returnRequest = {
                isReturned: true,
                type,
                reason,
                status,
            };
            await order.save();

            res.status(201).json(createdRequest);
        } else {
            res.status(404);
            throw new Error('Order not found');
        }
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
    }
};

// @desc    Get logged in user returns
// @route   GET /api/returns/myreturns
// @access  Private
const getMyReturns = async (req, res) => {
    try {
        const returns = await ReturnRequest.find({ user: req.user._id }).populate('order', 'totalPrice');
        res.json(returns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all return requests
// @route   GET /api/returns
// @access  Private/Admin
const getReturnRequests = async (req, res) => {
    try {
        const returns = await ReturnRequest.find({})
            .populate('user', 'id name email')
            .populate('order', 'id totalPrice');
        res.json(returns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update return status
// @route   PUT /api/returns/:id/status
// @access  Private/Admin
const updateReturnStatus = async (req, res) => {
    try {
        const returnRequest = await ReturnRequest.findById(req.params.id);

        if (returnRequest) {
            returnRequest.status = req.body.status || returnRequest.status;

            if (req.body.status === 'Completed') {
                returnRequest.isProcessed = true;
                returnRequest.processedAt = Date.now();
            }

            const updatedRequest = await returnRequest.save();

            // Sync with order status
            const order = await Order.findById(returnRequest.order);
            if (order) {
                order.returnRequest.status = updatedRequest.status;
                await order.save();
            }

            res.json(updatedRequest);
        } else {
            res.status(404);
            throw new Error('Return request not found');
        }
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
    }
};

module.exports = {
    createReturnRequest,
    getMyReturns,
    getReturnRequests,
    updateReturnStatus,
};
