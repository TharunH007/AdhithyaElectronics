const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/rates').post(protect, calculateOrderShippingRates);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/shipped').put(protect, admin, updateOrderToShipped);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/return').put(protect, createReturnRequest);
router.route('/:id/invoice').get(protect, getOrderInvoice);

module.exports = router;
