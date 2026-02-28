const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Address = require('../models/Address');
const { sendOrderConfirmationEmail, sendShipmentEmail } = require('../utils/emailService');
const easyinvoice = require('easyinvoice');
const fs = require('fs');
const path = require('path');

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
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = req.body;

        console.log('Order Data Received:', {
            itemsCount: orderItems?.length,
            user: req.user?._id,
            itemsPrice,
            totalPrice
        });

        if (!orderItems || orderItems.length === 0) {
            res.status(400);
            throw new Error('No order items');
        }

        if (!req.user) {
            res.status(401);
            throw new Error('User not found in request');
        }

        // Calculate tax breakdown on server side for data integrity
        let calculatedTax = 0;
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                const taxRate = product.taxPercent || 18; // Default to 18 if missing
                // Item price is inclusive. Tax = Price - (Price / (1 + taxPercent/100))
                const itemTax = (item.price * item.qty) - (item.price * item.qty) / (1 + (taxRate / 100));
                calculatedTax += itemTax;
                console.log(`Item: ${item.name}, TaxRate: ${taxRate}, ItemTax: ${itemTax}`);
            } else {
                console.warn(`Product not found for item: ${item.name}`);
            }
        }

        const taxBreakdown = Number(calculatedTax.toFixed(2));
        console.log('Final Tax Breakdown:', taxBreakdown);

        const orderData = {
            orderItems: orderItems.map(item => ({
                ...item,
                price: Number(item.price),
                qty: Number(item.qty),
                product: item.product // Ensure it's a valid ID
            })),
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice: Number(itemsPrice),
            taxPrice: isNaN(taxBreakdown) ? 0 : taxBreakdown,
            shippingPrice: Number(shippingPrice) || 0,
            totalPrice: Number(totalPrice),
        };

        console.log('Final Order Data to Save:', JSON.stringify(orderData, null, 2));

        const order = new Order(orderData);

        console.log('Attempting to save order to MongoDB...');
        const createdOrder = await order.save();
        console.log('Order created successfully:', createdOrder._id);

        // Save address to saved addresses if it doesn't exist
        const existingAddress = await Address.findOne({
            user: req.user._id,
            address: shippingAddress.address,
            city: shippingAddress.city,
            postalCode: shippingAddress.postalCode
        });

        if (!existingAddress) {
            console.log('Saving new address for user...');
            await Address.create({
                user: req.user._id,
                name: req.user.name,
                address: shippingAddress.address,
                city: shippingAddress.city,
                state: shippingAddress.state || 'N/A',
                postalCode: shippingAddress.postalCode,
                country: shippingAddress.country || 'India',
                phone: shippingAddress.phone || 'N/A'
            });
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Order Creation Error:', error);
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
            message: error.message || 'Error creating order',
            stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
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

        // Stock subtraction logic (Only after payment)
        for (const item of updatedOrder.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.countInStock -= item.qty;
                await product.save();
            }
        }

        // Send order confirmation email (Only after payment)
        try {
            const user = await User.findById(req.user._id);
            if (user) {
                await sendOrderConfirmationEmail(updatedOrder, user);
            }
        } catch (emailError) {
            console.error('Email sending failed after payment status update:', emailError.message);
        }

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
        const populatedOrder = await Order.findById(updatedOrder._id).populate('user', 'name email');

        // Send email notification
        const user = await User.findById(order.user);
        if (user) {
            await sendShipmentEmail(updatedOrder, user);
        }

        res.json(populatedOrder);
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
        const populatedOrder = await Order.findById(updatedOrder._id).populate('user', 'name email');
        res.json(populatedOrder);
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

// @desc    Get order invoice as PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
const getOrderInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is owner or admin
        if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (!order.isPaid) {
            return res.status(400).json({ message: 'Invoice available only for paid orders' });
        }

        const data = {
            "customize": {},
            "images": {
                // "logo": "https://public.easyinvoice.cloud/img/logo_en_72x72.png" 
            },
            "sender": {
                "company": "Bombay Dyeing - NKM Trading Company",
                "address": "Sample Street 123",
                "zip": "1234 AB",
                "city": "Sampletown",
                "country": "India"
            },
            "client": {
                "company": order.user.name,
                "address": order.shippingAddress.address,
                "zip": order.shippingAddress.postalCode,
                "city": order.shippingAddress.city,
                "country": order.shippingAddress.country
            },
            "information": {
                "number": order._id.toString(),
                "date": new Date(order.paidAt).toLocaleDateString(),
                "due-date": new Date(order.paidAt).toLocaleDateString()
            },
            "products": order.orderItems.map(item => ({
                "quantity": item.qty,
                "description": item.name,
                "tax-rate": 18, // Simplified for now
                "price": item.price
            })),
            "bottom-notice": "Thank you for your business!",
            "settings": {
                "currency": "INR",
                "tax-notation": "GST"
            }
        };

        const result = await easyinvoice.createInvoice(data);
        const pdfBuffer = Buffer.from(result.pdf, 'base64');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${order._id}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Invoice Generation Error:', error);
        res.status(500).json({ message: 'Error generating invoice', error: error.message });
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
    getOrderInvoice,
};
