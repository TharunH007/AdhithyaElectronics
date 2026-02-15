const ReturnRequest = require('../models/ReturnRequest');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendReturnStatusEmail } = require('../utils/emailService');

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

            // Send email notification
            const user = await User.findById(returnRequest.user);
            if (user) {
                await sendReturnStatusEmail(updatedRequest, user);
            }

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
