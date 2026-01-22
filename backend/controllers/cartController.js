const Cart = require('../models/Cart');

// @desc    Sync local cart to DB
// @route   POST /api/cart/sync
// @access  Private
const syncCart = async (req, res) => {
    const { cartItems } = req.body;

    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (cart) {
            cart.cartItems = cartItems;
            await cart.save();
        } else {
            cart = await Cart.create({
                user: req.user._id,
                cartItems,
            });
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user cart from DB
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            res.json(cart);
        } else {
            res.json({ cartItems: [] });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear user cart in DB
// @route   DELETE /api/cart
// @access  Private
const clearCartDB = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.cartItems = [];
            await cart.save();
        }
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    syncCart,
    getCart,
    clearCartDB,
};
