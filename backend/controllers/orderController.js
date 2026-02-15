const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderConfirmationEmail, sendShipmentEmail } = require('../utils/emailService');

// @desc    Calculate shipping rates
// @route   POST /api/orders/rates
// @access  Private
const calculateOrderShippingRates = async (req, res) => {
    const { orderItems, shippingAddress } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: 'No items in order' });
    }

    try {
        const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);

        // Simplified Logic: Flat ₹50 if < ₹1000, else ₹0
        const shippingPrice = itemsPrice >= 1000 ? 0 : 50;

        console.log(`Calculating rates for ItemsPrice: ${itemsPrice}. Result: ${shippingPrice}`);
        res.json({ rate: shippingPrice });
    } catch (error) {
        res.status(500).json({ message: 'Error calculating shipping rates', error: error.message });
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice: Number(shippingPrice) || 0,
            totalPrice: Number(totalPrice),
        });

        const createdOrder = await order.save();

        // Stock subtraction logic
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.countInStock -= item.qty;
                await product.save();
            }
        }

        // Send order confirmation email
        const user = await User.findById(req.user._id);
        if (user) {
            await sendOrderConfirmationEmail(createdOrder, user);
        }

        res.status(201).json(createdOrder);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name email');
    res.json(orders);
};

// @desc    Update order to shipped
// @route   PUT /api/orders/:id/shipped
// @access  Private/Admin
const updateOrderToShipped = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = 'Shipped';
        const updatedOrder = await order.save();

        // Send email notification
        const user = await User.findById(order.user);
        if (user) {
            await sendShipmentEmail(updatedOrder, user);
        }

        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.status = 'Delivered';

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Update order to returned/replaced
// @route   PUT /api/orders/:id/return
// @access  Private
const createReturnRequest = async (req, res) => {
    const { reason, type } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        if (!order.isDelivered) {
            res.status(400).json({ message: 'Order must be delivered to request return' });
            return;
        }

        const deliveredAt = new Date(order.deliveredAt);
        const now = new Date();
        const diffTime = Math.abs(now - deliveredAt);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 7) {
            res.status(400).json({ message: 'Return window (7 days) has expired' });
            return;
        }

        order.returnRequest = {
            isReturned: true,
            returnedAt: Date.now(),
            reason,
            status: 'Requested',
            type,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

module.exports = {
    addOrderItems,
    calculateOrderShippingRates,
    getOrderById,
    updateOrderToPaid,
    updateOrderToShipped,
    updateOrderToDelivered,
    createReturnRequest,
    getMyOrders,
    getOrders,
};
